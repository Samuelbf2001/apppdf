import { Job } from 'bull';
import { logger } from '../config/logger';
import prisma from '../config/database';
import { HubSpotUploadJob } from '../types';
import { hubspotApiService } from '../services/hubspotApi';
import { fileStorageService } from '../services/fileStorage';

/**
 * Worker para subida de archivos a HubSpot
 * Procesa jobs de upload de documentos PDF a HubSpot
 */

/**
 * Procesador principal para jobs de subida a HubSpot
 */
export async function processHubSpotUpload(job: Job<HubSpotUploadJob>): Promise<{
  documentId: string;
  hubspotFileId: string;
  hubspotObjectId: string;
  hubspotObjectType: string;
}> {
  const { documentId, filePath, hubspotObjectId, hubspotObjectType, tenantId, userId } = job.data;
  
  try {
    logger.info('Iniciando subida a HubSpot:', {
      jobId: job.id,
      documentId,
      hubspotObjectId,
      hubspotObjectType,
      tenantId,
    });

    // Actualizar progreso: iniciando
    await job.progress(10);

    // 1. Verificar que el documento existe y está completado
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        tenantId, // Seguridad: verificar tenant
        status: 'COMPLETED', // Solo subir documentos completados
      },
    });

    if (!document) {
      throw new Error(`Documento ${documentId} no encontrado, no pertenece al tenant ${tenantId}, o no está completado`);
    }

    if (!document.filePath) {
      throw new Error(`Documento ${documentId} no tiene archivo asociado`);
    }

    logger.info('Documento verificado:', {
      jobId: job.id,
      documentName: document.name,
      filePath: document.filePath,
    });

    // Actualizar progreso: leyendo archivo
    await job.progress(20);

    // 2. Leer archivo desde almacenamiento
    const fileBuffer = await fileStorageService.readFile(document.filePath);
    
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error(`Archivo no encontrado o vacío: ${document.filePath}`);
    }

    logger.info('Archivo leído exitosamente:', {
      jobId: job.id,
      documentId,
      fileSize: fileBuffer.length,
    });

    // Actualizar progreso: subiendo a HubSpot Files
    await job.progress(40);

    // 3. Subir archivo a HubSpot Files
    const fileName = `${document.name}.pdf`;
    
    const uploadResult = await hubspotApiService.uploadFile(
      tenantId,
      fileName,
      fileBuffer,
      {
        folderPath: `/HubSpot PDF Generator/${new Date().getFullYear()}`,
        overwrite: false,
      }
    );

    logger.info('Archivo subido a HubSpot Files:', {
      jobId: job.id,
      documentId,
      hubspotFileId: uploadResult.id,
      hubspotFileUrl: uploadResult.url,
    });

    // Actualizar progreso: asociando con objeto
    await job.progress(70);

    // 4. Asociar archivo con el objeto de HubSpot
    await hubspotApiService.attachFileToObject(
      tenantId,
      uploadResult.id,
      hubspotObjectType.toLowerCase() as 'contact' | 'deal' | 'company',
      hubspotObjectId
    );

    logger.info('Archivo asociado con objeto de HubSpot:', {
      jobId: job.id,
      documentId,
      hubspotFileId: uploadResult.id,
      hubspotObjectType,
      hubspotObjectId,
    });

    // Actualizar progreso: actualizando base de datos
    await job.progress(90);

    // 5. Actualizar documento en base de datos
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'UPLOADED',
        hubspotFileId: uploadResult.id,
        // Mantener la información original del objeto
        hubspotObjectId: document.hubspotObjectId || hubspotObjectId,
        hubspotObjectType: document.hubspotObjectType || hubspotObjectType as any,
      },
    });

    // 6. Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'UPLOAD_TO_HUBSPOT',
        entityType: 'document',
        entityId: documentId,
        newValues: {
          hubspotFileId: uploadResult.id,
          hubspotFileUrl: uploadResult.url,
          hubspotObjectId,
          hubspotObjectType,
          fileName,
          fileSize: fileBuffer.length,
        },
        userId,
        tenantId,
      },
    });

    // Actualizar progreso: completado
    await job.progress(100);

    logger.info('Subida a HubSpot completada exitosamente:', {
      jobId: job.id,
      documentId,
      documentName: document.name,
      hubspotFileId: uploadResult.id,
      hubspotObjectId,
      hubspotObjectType,
    });

    return {
      documentId,
      hubspotFileId: uploadResult.id,
      hubspotObjectId,
      hubspotObjectType,
    };

  } catch (error: any) {
    logger.error('Error subiendo a HubSpot:', {
      jobId: job.id,
      documentId,
      error: error.message,
      stack: error.stack,
      hubspotObjectId,
      hubspotObjectType,
      tenantId,
    });

    // Log de auditoría para error
    await prisma.auditLog.create({
      data: {
        action: 'UPLOAD_TO_HUBSPOT_FAILED',
        entityType: 'document',
        entityId: documentId,
        oldValues: {
          error: error.message,
          hubspotObjectId,
          hubspotObjectType,
          attempts: job.attemptsMade,
        },
        userId,
        tenantId,
      },
    }).catch(auditError => {
      logger.error('Error creando log de auditoría:', {
        documentId,
        auditError: auditError.message,
      });
    });

    // Re-throw error para que Bull lo maneje
    throw error;
  }
}

/**
 * Handler de errores para jobs de HubSpot fallidos
 */
export async function handleHubSpotJobFailure(job: Job<HubSpotUploadJob>, error: Error): Promise<void> {
  const { documentId, hubspotObjectId, hubspotObjectType, tenantId, userId } = job.data;

  logger.error('Job de HubSpot fallido permanentemente:', {
    jobId: job.id,
    documentId,
    hubspotObjectId,
    hubspotObjectType,
    error: error.message,
    attempts: job.attemptsMade,
    maxAttempts: job.opts.attempts,
  });

  try {
    // Log de auditoría para fallo permanente
    await prisma.auditLog.create({
      data: {
        action: 'UPLOAD_TO_HUBSPOT_FAILED_PERMANENTLY',
        entityType: 'document',
        entityId: documentId,
        oldValues: {
          error: error.message,
          hubspotObjectId,
          hubspotObjectType,
          attempts: job.attemptsMade,
          maxAttempts: job.opts.attempts,
        },
        userId,
        tenantId,
      },
    });

    // Opcional: Marcar documento con estado especial o agregar nota
    await prisma.document.updateMany({
      where: {
        id: documentId,
        tenantId,
      },
      data: {
        // Mantener COMPLETED pero agregar información del error
        errorMessage: `Error subiendo a HubSpot: ${error.message}`,
      },
    });

  } catch (auditError: any) {
    logger.error('Error creando log de auditoría para fallo de HubSpot:', {
      documentId,
      auditError: auditError.message,
    });
  }
}
