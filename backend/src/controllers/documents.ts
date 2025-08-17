import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import prisma from '../config/database';
import { logger } from '../config/logger';
import { validateData, documentValidation, validateId, validateQuery } from '../utils/validation';
import { queueService } from '../services/queueService';
import { createError } from '../middleware/errorHandler';

/**
 * Controladores para gestión de documentos
 * Maneja generación de PDFs desde templates con variables dinámicas
 */

/**
 * GET /api/documents
 * Obtener lista de documentos del tenant con filtros
 */
export const getDocuments = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { page, limit, sortBy, sortOrder } = validateQuery(req.query);
    const { status, templateId, search } = req.query;
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    logger.info('Obteniendo documentos:', { 
      page, 
      limit, 
      status,
      templateId,
      search,
      tenantId, 
      userId 
    });

    // Construir filtros
    const where: any = { tenantId };
    
    if (status) {
      where.status = status;
    }
    
    if (templateId) {
      where.templateId = templateId;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { template: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Configurar ordenamiento
    const orderBy: any = {};
    if (sortBy && ['name', 'status', 'createdAt', 'updatedAt'].includes(sortBy)) {
      orderBy[sortBy] = sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Ejecutar consultas en paralelo
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          template: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    logger.info('Documentos obtenidos exitosamente:', { 
      count: documents.length, 
      total, 
      tenantId 
    });

    res.json({
      success: true,
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      message: 'Documentos obtenidos exitosamente',
    });
  } catch (error: any) {
    logger.error('Error obteniendo documentos:', {
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error obteniendo documentos',
    });
  }
});

/**
 * GET /api/documents/:id
 * Obtener documento específico con detalles completos
 */
export const getDocument = asyncHandler(async (req: Request, res: Response) => {
  try {
    const documentId = validateId(req.params.id, 'documentId');
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    logger.info('Obteniendo documento:', { documentId, tenantId, userId });

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        tenantId, // Asegurar aislamiento de tenant
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            variables: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!document) {
      logger.warn('Documento no encontrado:', { documentId, tenantId });
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado',
      });
    }

    logger.info('Documento obtenido exitosamente:', { 
      documentId, 
      documentName: document.name,
      status: document.status,
      tenantId 
    });

    res.json({
      success: true,
      data: document,
      message: 'Documento obtenido exitosamente',
    });
  } catch (error: any) {
    logger.error('Error obteniendo documento:', {
      documentId: req.params.id,
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error obteniendo documento',
    });
  }
});

/**
 * POST /api/documents/generate
 * Generar nuevo documento PDF desde template
 */
export const generateDocument = asyncHandler(async (req: Request, res: Response) => {
  try {
    const documentData = validateData(documentValidation.generate, req.body);
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    logger.info('Iniciando generación de documento:', { 
      templateId: documentData.templateId,
      documentName: documentData.name,
      tenantId, 
      userId 
    });

    // 1. Verificar que el template existe y pertenece al tenant
    const template = await prisma.template.findFirst({
      where: {
        id: documentData.templateId,
        tenantId,
        isActive: true,
      },
    });

    if (!template) {
      logger.warn('Template no encontrado o inactivo:', { 
        templateId: documentData.templateId,
        tenantId 
      });
      return res.status(404).json({
        success: false,
        message: 'Template no encontrado o inactivo',
      });
    }

    // 2. Crear documento en estado PENDING
    const document = await prisma.document.create({
      data: {
        name: documentData.name,
        templateId: documentData.templateId,
        variables: documentData.variables,
        hubspotObjectId: documentData.hubspotObjectId,
        hubspotObjectType: documentData.hubspotObjectType as any,
        status: 'PENDING',
        tenantId,
        createdById: userId,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            content: true,
            variables: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    logger.info('Documento creado en estado PENDING:', { 
      documentId: document.id,
      templateName: template.name,
      tenantId 
    });

    // 3. Agregar documento a la cola de procesamiento
    const job = await queueService.addDocumentGenerationJob({
      documentId: document.id,
      templateId: documentData.templateId,
      variables: documentData.variables,
      tenantId,
      userId,
    });

    logger.info('Documento agregado a cola de procesamiento:', { 
      documentId: document.id,
      jobId: job.id,
      templateName: template.name,
      tenantId 
    });

    // Log de auditoría para creación en cola
    await prisma.auditLog.create({
      data: {
        action: 'QUEUE_DOCUMENT',
        entityType: 'document',
        entityId: document.id,
        newValues: {
          name: document.name,
          templateId: documentData.templateId,
          templateName: template.name,
          hubspotObjectId: documentData.hubspotObjectId,
          hubspotObjectType: documentData.hubspotObjectType,
          jobId: job.id,
          processingMethod: 'async_queue',
        },
        userId,
        userEmail: req.user!.email,
        tenantId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    res.status(202).json({
      success: true,
      data: document,
      message: 'Documento creado y enviado a procesamiento',
      job: {
        id: job.id,
        status: 'queued',
        estimatedTime: '30-60 segundos',
      },
      links: {
        status: `/api/documents/${document.id}/status`,
        document: `/api/documents/${document.id}`,
      },
    });

  } catch (error: any) {
    logger.error('Error generando documento:', {
      error: error.message,
      validationErrors: error.validationErrors,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error generando documento',
      validationErrors: error.validationErrors,
    });
  }
});

/**
 * GET /api/documents/:id/download
 * Descargar archivo PDF del documento
 */
export const downloadDocument = asyncHandler(async (req: Request, res: Response) => {
  try {
    const documentId = validateId(req.params.id, 'documentId');
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    logger.info('Solicitud de descarga de documento:', { documentId, tenantId, userId });

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        tenantId,
        status: 'COMPLETED', // Solo documentos completados
      },
    });

    if (!document) {
      logger.warn('Documento no encontrado para descarga:', { documentId, tenantId });
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado o aún no está listo para descarga',
      });
    }

    if (!document.filePath) {
      logger.warn('Documento sin archivo asociado:', { documentId, tenantId });
      return res.status(404).json({
        success: false,
        message: 'Archivo no disponible para este documento',
      });
    }

    // Leer archivo desde almacenamiento
    const fileBuffer = await fileStorageService.readFile(document.filePath);
    
    // Configurar headers para descarga de PDF
    const fileName = `${document.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    logger.info('Sirviendo descarga de documento:', { 
      documentId, 
      fileName,
      fileSize: fileBuffer.length,
      tenantId 
    });

    // Enviar archivo
    res.send(fileBuffer);

  } catch (error: any) {
    logger.error('Error descargando documento:', {
      documentId: req.params.id,
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error descargando documento',
    });
  }
});

/**
 * GET /api/documents/:id/status
 * Obtener estado de procesamiento del documento
 */
export const getDocumentStatus = asyncHandler(async (req: Request, res: Response) => {
  try {
    const documentId = validateId(req.params.id, 'documentId');
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    logger.debug('Consultando estado de documento:', { documentId, tenantId, userId });

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        tenantId,
      },
      select: {
        id: true,
        name: true,
        status: true,
        processingStartedAt: true,
        processingCompletedAt: true,
        errorMessage: true,
        fileUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!document) {
      logger.warn('Documento no encontrado para consulta de estado:', { documentId, tenantId });
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado',
      });
    }

    // Calcular tiempo de procesamiento
    let processingTime = null;
    if (document.processingStartedAt && document.processingCompletedAt) {
      processingTime = document.processingCompletedAt.getTime() - document.processingStartedAt.getTime();
    }

    const statusInfo = {
      ...document,
      processingTimeMs: processingTime,
      isCompleted: document.status === 'COMPLETED',
      isFailed: document.status === 'FAILED',
      isProcessing: document.status === 'PROCESSING',
      isPending: document.status === 'PENDING',
      canDownload: document.status === 'COMPLETED' && !!document.fileUrl,
    };

    logger.debug('Estado de documento consultado:', { 
      documentId, 
      status: document.status,
      tenantId 
    });

    res.json({
      success: true,
      data: statusInfo,
      message: 'Estado de documento obtenido exitosamente',
    });

  } catch (error: any) {
    logger.error('Error consultando estado de documento:', {
      documentId: req.params.id,
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error consultando estado de documento',
    });
  }
});
