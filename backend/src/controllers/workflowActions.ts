import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import prisma from '../config/database';
import { logger } from '../config/logger';
import { queueService } from '../services/queueService';
import { hubspotApiService } from '../services/hubspotApi';
import { createError } from '../middleware/errorHandler';

/**
 * Controladores para custom actions de workflows de HubSpot
 * Maneja la ejecución automática de generación de PDFs desde workflows
 */

interface WorkflowActionRequest {
  // Datos del objeto que disparó el workflow
  object: {
    objectId: string;
    objectType: 'CONTACT' | 'DEAL' | 'COMPANY' | 'TICKET';
    properties: Record<string, any>;
  };
  
  // Configuración de la action (configurada en el iframe)
  inputFields: {
    templateId: string;
    documentName?: string;
    documentFormat?: 'PDF' | 'HTML';
    uploadToFiles?: boolean;
    attachToRecord?: boolean;
    notifyOwner?: boolean;
    additionalEmails?: string;
    documentTags?: string;
    autoSendEmail?: boolean;
    emailSubject?: string;
  };
  
  // Metadatos del workflow
  workflow: {
    id: string;
    name: string;
  };
  
  // Portal info
  portalId: string;
  
  // Action info
  actionId: string;
  executionId: string;
}

interface WorkflowActionResponse {
  outputFields: {
    documentId: string;
    documentUrl?: string;
    fileManagerId?: string;
    documentSize?: number;
    generationStatus: 'completed' | 'processing' | 'failed';
    generatedAt?: string;
    templateUsed?: string;
    variablesProcessed?: number;
    processingTimeMs?: number;
    errorMessage?: string;
  };
  completed: boolean;
  message: string;
}

/**
 * POST /api/hubspot/workflow-actions/generate-pdf
 * Endpoint ejecutado por workflows de HubSpot para generar PDFs automáticamente
 */
export const executeGeneratePdfAction = asyncHandler(async (req: Request, res: Response) => {
  try {
    const actionData: WorkflowActionRequest = req.body;
    
    logger.info('Ejecutando workflow action de PDF:', {
      objectId: actionData.object.objectId,
      objectType: actionData.object.objectType,
      templateId: actionData.inputFields.templateId,
      workflowId: actionData.workflow.id,
      portalId: actionData.portalId,
      executionId: actionData.executionId,
    });

    // 1. Verificar que el portal está conectado (buscar tenant)
    const tenant = await prisma.tenant.findUnique({
      where: { hubspotPortalId: actionData.portalId },
    });

    if (!tenant || !tenant.isActive) {
      logger.error('Portal no encontrado o inactivo:', {
        portalId: actionData.portalId,
        executionId: actionData.executionId,
      });

      return res.status(400).json({
        outputFields: {
          documentId: '',
          generationStatus: 'failed',
        },
        completed: true,
        message: 'Portal no está conectado o configurado correctamente',
      });
    }

    // 2. Verificar que el template existe y pertenece al tenant
    const template = await prisma.template.findFirst({
      where: {
        id: actionData.inputFields.templateId,
        tenantId: tenant.id,
        isActive: true,
      },
    });

    if (!template) {
      logger.error('Template no encontrado:', {
        templateId: actionData.inputFields.templateId,
        tenantId: tenant.id,
        executionId: actionData.executionId,
      });

      return res.status(400).json({
        outputFields: {
          documentId: '',
          generationStatus: 'failed',
        },
        completed: true,
        message: 'Template no encontrado o inactivo',
      });
    }

    // 3. Buscar usuario del sistema para este tenant (usar el primero disponible)
    const systemUser = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        isActive: true,
      },
    });

    if (!systemUser) {
      logger.error('No hay usuarios activos para el tenant:', {
        tenantId: tenant.id,
        portalId: actionData.portalId,
      });

      return res.status(500).json({
        outputFields: {
          documentId: '',
          generationStatus: 'failed',
        },
        completed: true,
        message: 'Error de configuración: no hay usuarios activos',
      });
    }

    // 4. Procesar nombre del documento con variables
    const documentName = await processDocumentName(
      actionData.inputFields.documentName,
      actionData.object
    );

    // 5. Crear documento en la base de datos
    const document = await prisma.document.create({
      data: {
        name: documentName,
        templateId: template.id,
        variables: actionData.object.properties, // Usar propiedades del objeto
        hubspotObjectId: actionData.object.objectId,
        hubspotObjectType: actionData.object.objectType,
        status: 'PENDING',
        tenantId: tenant.id,
        createdById: systemUser.id,
      },
    });

    logger.info('Documento creado desde workflow:', {
      documentId: document.id,
      documentName: document.name,
      templateName: template.name,
      objectId: actionData.object.objectId,
      workflowId: actionData.workflow.id,
      executionId: actionData.executionId,
    });

    // 6. Agregar a cola de procesamiento
    const job = await queueService.addDocumentGenerationJob({
      documentId: document.id,
      templateId: template.id,
      variables: actionData.object.properties,
      tenantId: tenant.id,
      userId: systemUser.id,
    });

    // 7. Si se debe adjuntar al objeto, agregar también job de subida
    if (actionData.inputFields.attachToObject) {
      // La subida se programará automáticamente desde el documentWorker
      logger.info('Auto-attachment programado para:', {
        documentId: document.id,
        objectId: actionData.object.objectId,
        objectType: actionData.object.objectType,
      });
    }

    // 8. Log de auditoría para workflow
    await prisma.auditLog.create({
      data: {
        action: 'WORKFLOW_GENERATE_PDF',
        entityType: 'document',
        entityId: document.id,
        newValues: {
          documentName: document.name,
          templateId: template.id,
          templateName: template.name,
          workflowId: actionData.workflow.id,
          workflowName: actionData.workflow.name,
          objectId: actionData.object.objectId,
          objectType: actionData.object.objectType,
          executionId: actionData.executionId,
          jobId: job.id,
        },
        userId: systemUser.id,
        userEmail: systemUser.email,
        tenantId: tenant.id,
      },
    });

    // 9. Respuesta exitosa para HubSpot
    const response: WorkflowActionResponse = {
      outputFields: {
        documentId: document.id,
        generationStatus: 'queued',
        // pdfUrl y hubspotFileId se llenarán cuando se complete el procesamiento
      },
      completed: false, // false porque el procesamiento es asíncrono
      message: `Documento "${documentName}" agregado a cola de procesamiento`,
    };

    logger.info('Workflow action ejecutada exitosamente:', {
      documentId: document.id,
      jobId: job.id,
      executionId: actionData.executionId,
    });

    res.json(response);

  } catch (error: any) {
    logger.error('Error ejecutando workflow action:', {
      error: error.message,
      stack: error.stack,
      executionId: req.body?.executionId,
      objectId: req.body?.object?.objectId,
    });

    // Respuesta de error para HubSpot
    res.status(500).json({
      outputFields: {
        documentId: '',
        generationStatus: 'failed',
      },
      completed: true,
      message: `Error generando documento: ${error.message}`,
    });
  }
});

/**
 * GET /api/hubspot/workflow-actions/status/:executionId
 * Endpoint para verificar el estado de una ejecución de workflow action
 */
export const getWorkflowActionStatus = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { executionId } = req.params;
    
    logger.debug('Consultando estado de workflow action:', { executionId });

    // Buscar document por execution ID en los logs de auditoría
    const auditLog = await prisma.auditLog.findFirst({
      where: {
        action: 'WORKFLOW_GENERATE_PDF',
        newValues: {
          path: ['executionId'],
          equals: executionId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!auditLog) {
      return res.status(404).json({
        success: false,
        message: 'Ejecución de workflow no encontrada',
      });
    }

    const documentId = auditLog.entityId;
    
    // Obtener estado actual del documento
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        name: true,
        status: true,
        fileUrl: true,
        hubspotFileId: true,
        errorMessage: true,
        createdAt: true,
        processingCompletedAt: true,
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado',
      });
    }

    // Mapear estado del documento a respuesta de workflow
    let generationStatus: 'queued' | 'completed' | 'failed';
    let completed = false;

    switch (document.status) {
      case 'PENDING':
      case 'PROCESSING':
        generationStatus = 'queued';
        completed = false;
        break;
      case 'COMPLETED':
      case 'UPLOADED':
        generationStatus = 'completed';
        completed = true;
        break;
      case 'FAILED':
        generationStatus = 'failed';
        completed = true;
        break;
      default:
        generationStatus = 'queued';
        completed = false;
    }

    const response = {
      success: true,
      data: {
        executionId,
        documentId: document.id,
        documentName: document.name,
        status: document.status,
        generationStatus,
        completed,
        pdfUrl: document.fileUrl,
        hubspotFileId: document.hubspotFileId,
        errorMessage: document.errorMessage,
        createdAt: document.createdAt,
        completedAt: document.processingCompletedAt,
      },
      message: 'Estado de ejecución obtenido exitosamente',
    };

    res.json(response);

  } catch (error: any) {
    logger.error('Error consultando estado de workflow action:', {
      error: error.message,
      executionId: req.params.executionId,
    });

    res.status(500).json({
      success: false,
      message: 'Error consultando estado de workflow action',
    });
  }
});

/**
 * Procesar nombre del documento reemplazando variables básicas
 */
async function processDocumentName(
  nameTemplate: string,
  objectData: { objectId: string; objectType: string; properties: Record<string, any> }
): Promise<string> {
  let processedName = nameTemplate;

  try {
    // Reemplazar variables comunes basadas en el tipo de objeto
    const properties = objectData.properties;

    if (objectData.objectType === 'CONTACT') {
      processedName = processedName
        .replace(/\{\{contact\.firstname\}\}/g, properties.firstname || '')
        .replace(/\{\{contact\.lastname\}\}/g, properties.lastname || '')
        .replace(/\{\{contact\.email\}\}/g, properties.email || '')
        .replace(/\{\{contact\.company\}\}/g, properties.company || '');
    } else if (objectData.objectType === 'DEAL') {
      processedName = processedName
        .replace(/\{\{deal\.dealname\}\}/g, properties.dealname || '')
        .replace(/\{\{deal\.amount\}\}/g, properties.amount || '')
        .replace(/\{\{deal\.pipeline\}\}/g, properties.pipeline || '');
    } else if (objectData.objectType === 'COMPANY') {
      processedName = processedName
        .replace(/\{\{company\.name\}\}/g, properties.name || '')
        .replace(/\{\{company\.domain\}\}/g, properties.domain || '');
    }

    // Reemplazar variables de fecha
    processedName = processedName
      .replace(/\{\{current_date\}\}/g, new Date().toLocaleDateString('es-MX'))
      .replace(/\{\{current_year\}\}/g, new Date().getFullYear().toString());

    // Limpiar variables no reemplazadas
    processedName = processedName.replace(/\{\{[^}]+\}\}/g, '').trim();

    // Si el nombre queda vacío, usar uno por defecto
    if (!processedName) {
      processedName = `Documento ${objectData.objectType} ${objectData.objectId}`;
    }

    return processedName;

  } catch (error) {
    logger.error('Error procesando nombre de documento:', {
      error: (error as Error).message,
      nameTemplate,
      objectType: objectData.objectType,
    });

    // Fallback a nombre básico
    return `Documento ${objectData.objectType} ${objectData.objectId}`;
  }
}

/**
 * POST /api/hubspot/workflow-actions/validate-config
 * Endpoint para validar configuración de la custom action
 */
export const validateActionConfig = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { templateId, documentName, portalId } = req.body;

    logger.info('Validando configuración de workflow action:', {
      templateId,
      documentName,
      portalId,
    });

    // Verificar tenant
    const tenant = await prisma.tenant.findUnique({
      where: { hubspotPortalId: portalId },
    });

    if (!tenant) {
      return res.status(400).json({
        valid: false,
        errors: ['Portal no está registrado en el sistema'],
      });
    }

    const errors: string[] = [];

    // Verificar template
    if (!templateId) {
      errors.push('Template ID es requerido');
    } else {
      const template = await prisma.template.findFirst({
        where: {
          id: templateId,
          tenantId: tenant.id,
          isActive: true,
        },
      });

      if (!template) {
        errors.push('Template no encontrado o inactivo');
      }
    }

    // Verificar nombre del documento
    if (!documentName || !documentName.trim()) {
      errors.push('Nombre del documento es requerido');
    }

    const isValid = errors.length === 0;

    logger.info('Validación de configuración completada:', {
      isValid,
      errorsCount: errors.length,
      templateId,
      portalId,
    });

    res.json({
      valid: isValid,
      errors,
      message: isValid ? 'Configuración válida' : 'Hay errores en la configuración',
    });

  } catch (error: any) {
    logger.error('Error validando configuración:', {
      error: error.message,
      templateId: req.body?.templateId,
      portalId: req.body?.portalId,
    });

    res.status(500).json({
      valid: false,
      errors: ['Error interno validando configuración'],
      message: 'Error interno del servidor',
    });
  }
});

/**
 * GET /api/hubspot/workflow-actions/templates/:portalId
 * Endpoint para obtener templates disponibles para un portal específico
 */
export const getTemplatesForPortal = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { portalId } = req.params;

    logger.info('Obteniendo templates para portal:', { portalId });

    // Buscar tenant por portal ID
    const tenant = await prisma.tenant.findUnique({
      where: { hubspotPortalId: portalId },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Portal no encontrado',
        data: [],
      });
    }

    // Obtener templates activos del tenant
    const templates = await prisma.template.findMany({
      where: {
        tenantId: tenant.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        variables: true,
        updatedAt: true,
        _count: {
          select: {
            documents: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    logger.info('Templates obtenidos para portal:', {
      portalId,
      templatesCount: templates.length,
    });

    res.json({
      success: true,
      data: templates,
      message: 'Templates obtenidos exitosamente',
    });

  } catch (error: any) {
    logger.error('Error obteniendo templates para portal:', {
      error: error.message,
      portalId: req.params.portalId,
    });

    res.status(500).json({
      success: false,
      message: 'Error obteniendo templates',
      data: [],
    });
  }
});

/**
 * POST /api/hubspot/workflow-actions/test
 * Endpoint para probar configuración desde el iframe de configuración
 */
export const testWorkflowAction = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { templateId, documentName, testObjectData } = req.body;
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    logger.info('Probando configuración de workflow action:', {
      templateId,
      documentName,
      tenantId,
      userId,
    });

    // Verificar template
    const template = await prisma.template.findFirst({
      where: {
        id: templateId,
        tenantId,
        isActive: true,
      },
    });

    if (!template) {
      return res.status(400).json({
        success: false,
        message: 'Template no encontrado o inactivo',
      });
    }

    // Simular procesamiento (sin crear documento real)
    const processedName = await processDocumentName(
      documentName,
      testObjectData || {
        objectId: 'test-123',
        objectType: 'CONTACT',
        properties: {
          firstname: 'Juan',
          lastname: 'Pérez',
          email: 'juan.perez@ejemplo.com',
        },
      }
    );

    res.json({
      success: true,
      data: {
        templateName: template.name,
        processedDocumentName: processedName,
        variablesCount: (template.variables as any[]).length,
        wouldAttach: req.body.attachToObject || false,
      },
      message: 'Configuración válida - la action funcionará correctamente',
    });

  } catch (error: any) {
    logger.error('Error probando workflow action:', {
      error: error.message,
      templateId: req.body?.templateId,
      tenantId: req.user?.tenantId,
    });

    res.status(500).json({
      success: false,
      message: 'Error probando configuración',
    });
  }
});
