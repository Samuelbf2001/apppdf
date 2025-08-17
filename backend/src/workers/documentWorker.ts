import { Job } from 'bull';
import { logger } from '../config/logger';
import prisma from '../config/database';
import { DocumentGenerationJob } from '../types';
import { templateProcessorService } from '../services/templateProcessor';
import { pdfGeneratorService } from '../services/pdfGenerator';
import { fileStorageService } from '../services/fileStorage';
import { queueService } from '../services/queueService';

/**
 * Worker para procesamiento de documentos PDF
 * Procesa jobs de generación de documentos de forma asíncrona
 */

/**
 * Procesador principal para jobs de documentos
 */
export async function processDocumentGeneration(job: Job<DocumentGenerationJob>): Promise<{
  documentId: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
}> {
  const { documentId, templateId, variables, tenantId, userId } = job.data;
  
  try {
    logger.info('Iniciando procesamiento de documento:', {
      jobId: job.id,
      documentId,
      templateId,
      tenantId,
      userId,
    });

    // Actualizar progreso: iniciando
    await job.progress(10);

    // 1. Obtener documento y template de la base de datos
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        tenantId, // Seguridad: verificar tenant
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

    if (!document) {
      throw new Error(`Documento ${documentId} no encontrado o no pertenece al tenant ${tenantId}`);
    }

    if (!document.template) {
      throw new Error(`Template ${templateId} no encontrado`);
    }

    logger.info('Documento y template obtenidos:', {
      jobId: job.id,
      documentName: document.name,
      templateName: document.template.name,
    });

    // Actualizar estado a PROCESSING
    await prisma.document.update({
      where: { id: documentId },
      data: { 
        status: 'PROCESSING',
        processingStartedAt: new Date(),
      },
    });

    // Actualizar progreso: procesando template
    await job.progress(30);

    // 2. Procesar template con variables
    const processingContext = {
      tenantId,
      hubspotObjectId: document.hubspotObjectId || undefined,
      hubspotObjectType: document.hubspotObjectType as any,
      variables: variables || document.variables || {},
    };

    const processedTemplate = await templateProcessorService.processTemplate(
      document.template.content,
      document.template.variables as any[],
      processingContext
    );

    logger.info('Template procesado exitosamente:', {
      jobId: job.id,
      documentId,
      variablesResolved: Object.keys(processedTemplate.resolvedVariables).length,
    });

    // Actualizar progreso: generando PDF
    await job.progress(50);

    // 3. Generar PDF usando Gotenberg
    const authorName = document.createdBy.firstName || document.createdBy.lastName ? 
      `${document.createdBy.firstName || ''} ${document.createdBy.lastName || ''}`.trim() : 
      document.createdBy.email;

    const pdfResult = await pdfGeneratorService.generateBusinessDocument(
      processedTemplate.processedContent,
      document.name,
      authorName
    );

    logger.info('PDF generado exitosamente:', {
      jobId: job.id,
      documentId,
      pdfSize: pdfResult.size,
    });

    // Actualizar progreso: guardando archivo
    await job.progress(70);

    // 4. Guardar PDF en almacenamiento
    const fileName = fileStorageService.generateUniqueFileName(document.name);
    
    const savedFile = await fileStorageService.saveFile({
      tenantId,
      documentId,
      fileName,
      buffer: pdfResult.buffer,
      mimeType: pdfResult.mimeType,
    });

    logger.info('PDF guardado exitosamente:', {
      jobId: job.id,
      documentId,
      filePath: savedFile.filePath,
      fileSize: savedFile.size,
    });

    // Actualizar progreso: finalizando
    await job.progress(90);

    // 5. Actualizar documento en base de datos
    const completedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'COMPLETED',
        variables: processedTemplate.resolvedVariables,
        filePath: savedFile.filePath,
        fileUrl: savedFile.fileUrl,
        fileSize: savedFile.size,
        processingCompletedAt: new Date(),
      },
    });

    // 6. Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'GENERATE',
        entityType: 'document',
        entityId: documentId,
        newValues: {
          name: document.name,
          templateId: document.template.id,
          templateName: document.template.name,
          fileSize: savedFile.size,
          variablesCount: Object.keys(processedTemplate.resolvedVariables).length,
          processingMethod: 'async_queue',
        },
        userId,
        userEmail: document.createdBy.email,
        tenantId,
      },
    });

    // 7. Si tiene información de HubSpot, programar subida
    if (document.hubspotObjectId && document.hubspotObjectType) {
      logger.info('Programando subida a HubSpot:', {
        jobId: job.id,
        documentId,
        hubspotObjectId: document.hubspotObjectId,
        hubspotObjectType: document.hubspotObjectType,
      });

      await queueService.addHubSpotUploadJob({
        documentId,
        filePath: savedFile.filePath,
        hubspotObjectId: document.hubspotObjectId,
        hubspotObjectType: document.hubspotObjectType as any,
        tenantId,
        userId,
      });
    }

    // Actualizar progreso: completado
    await job.progress(100);

    logger.info('Documento procesado exitosamente:', {
      jobId: job.id,
      documentId,
      documentName: document.name,
      fileSize: savedFile.size,
      processingTime: completedDocument.processingCompletedAt && completedDocument.processingStartedAt ?
        completedDocument.processingCompletedAt.getTime() - completedDocument.processingStartedAt.getTime() :
        null,
    });

    return {
      documentId,
      filePath: savedFile.filePath,
      fileUrl: savedFile.fileUrl,
      fileSize: savedFile.size,
    };

  } catch (error: any) {
    logger.error('Error procesando documento:', {
      jobId: job.id,
      documentId,
      error: error.message,
      stack: error.stack,
      tenantId,
    });

    // Marcar documento como fallido
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'FAILED',
        errorMessage: error.message,
        processingCompletedAt: new Date(),
      },
    }).catch(dbError => {
      logger.error('Error actualizando documento fallido:', {
        documentId,
        dbError: dbError.message,
      });
    });

    // Re-throw error para que Bull lo maneje
    throw error;
  }
}

/**
 * Handler de errores para jobs fallidos
 */
export async function handleDocumentJobFailure(job: Job<DocumentGenerationJob>, error: Error): Promise<void> {
  const { documentId, tenantId, userId } = job.data;

  logger.error('Job de documento fallido permanentemente:', {
    jobId: job.id,
    documentId,
    error: error.message,
    attempts: job.attemptsMade,
    maxAttempts: job.opts.attempts,
  });

  try {
    // Log de auditoría para fallo
    await prisma.auditLog.create({
      data: {
        action: 'GENERATE_FAILED',
        entityType: 'document',
        entityId: documentId,
        oldValues: {
          attempts: job.attemptsMade,
          maxAttempts: job.opts.attempts,
          error: error.message,
        },
        userId,
        tenantId,
      },
    });

    // Actualizar documento como fallido si no se hizo en el procesador
    await prisma.document.updateMany({
      where: {
        id: documentId,
        status: 'PROCESSING', // Solo si aún está en processing
      },
      data: {
        status: 'FAILED',
        errorMessage: error.message,
        processingCompletedAt: new Date(),
      },
    });

  } catch (auditError: any) {
    logger.error('Error creando log de auditoría para fallo:', {
      documentId,
      auditError: auditError.message,
    });
  }
}
