import { Job } from 'bull';
import { logger } from '../config/logger';
import prisma from '../config/database';
import { fileStorageService } from '../services/fileStorage';

/**
 * Worker para tareas de limpieza y mantenimiento
 * Procesa jobs de limpieza de archivos temporales, documentos antiguos, etc.
 */

interface CleanupJobData {
  type: 'temp_files' | 'old_documents' | 'failed_jobs' | 'audit_logs';
  maxAgeHours?: number;
  tenantId?: string;
  dryRun?: boolean;
}

/**
 * Procesador principal para jobs de limpieza
 */
export async function processCleanup(job: Job<CleanupJobData>): Promise<{
  type: string;
  itemsProcessed: number;
  itemsDeleted: number;
  bytesFreed: number;
}> {
  const { type, maxAgeHours = 24, tenantId, dryRun = false } = job.data;
  
  try {
    logger.info('Iniciando job de limpieza:', {
      jobId: job.id,
      type,
      maxAgeHours,
      tenantId,
      dryRun,
    });

    let result = {
      type,
      itemsProcessed: 0,
      itemsDeleted: 0,
      bytesFreed: 0,
    };

    switch (type) {
      case 'temp_files':
        result = await cleanupTempFiles(job, maxAgeHours, dryRun);
        break;
        
      case 'old_documents':
        result = await cleanupOldDocuments(job, maxAgeHours, tenantId, dryRun);
        break;
        
      case 'failed_jobs':
        result = await cleanupFailedJobs(job, maxAgeHours, dryRun);
        break;
        
      case 'audit_logs':
        result = await cleanupAuditLogs(job, maxAgeHours, tenantId, dryRun);
        break;
        
      default:
        throw new Error(`Tipo de limpieza no soportado: ${type}`);
    }

    logger.info('Job de limpieza completado:', {
      jobId: job.id,
      ...result,
    });

    return result;

  } catch (error: any) {
    logger.error('Error en job de limpieza:', {
      jobId: job.id,
      type,
      error: error.message,
      stack: error.stack,
    });

    throw error;
  }
}

/**
 * Limpiar archivos temporales antiguos
 */
async function cleanupTempFiles(
  job: Job<CleanupJobData>,
  maxAgeHours: number,
  dryRun: boolean
): Promise<{ type: string; itemsProcessed: number; itemsDeleted: number; bytesFreed: number }> {
  
  await job.progress(10);
  
  logger.info('Limpiando archivos temporales:', { maxAgeHours, dryRun });
  
  let deletedCount = 0;
  let bytesFreed = 0;

  if (!dryRun) {
    deletedCount = await fileStorageService.cleanupOldFiles(maxAgeHours);
    // Estimación aproximada de bytes liberados (no disponible en la implementación actual)
    bytesFreed = deletedCount * 100000; // ~100KB promedio por archivo temp
  }

  await job.progress(100);

  return {
    type: 'temp_files',
    itemsProcessed: deletedCount,
    itemsDeleted: deletedCount,
    bytesFreed,
  };
}

/**
 * Limpiar documentos antiguos fallidos o no utilizados
 */
async function cleanupOldDocuments(
  job: Job<CleanupJobData>,
  maxAgeHours: number,
  tenantId: string | undefined,
  dryRun: boolean
): Promise<{ type: string; itemsProcessed: number; itemsDeleted: number; bytesFreed: number }> {
  
  await job.progress(10);
  
  const cutoffDate = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
  
  logger.info('Limpiando documentos antiguos:', { 
    maxAgeHours, 
    cutoffDate, 
    tenantId, 
    dryRun 
  });

  // Construir filtros
  const where: any = {
    status: 'FAILED', // Solo limpiar documentos fallidos
    createdAt: {
      lt: cutoffDate,
    },
  };

  if (tenantId) {
    where.tenantId = tenantId;
  }

  await job.progress(30);

  // Obtener documentos a limpiar
  const documentsToDelete = await prisma.document.findMany({
    where,
    select: {
      id: true,
      name: true,
      filePath: true,
      fileSize: true,
      tenantId: true,
    },
  });

  logger.info('Documentos encontrados para limpieza:', {
    count: documentsToDelete.length,
    tenantId,
  });

  let deletedCount = 0;
  let bytesFreed = 0;

  if (!dryRun && documentsToDelete.length > 0) {
    await job.progress(50);

    for (const doc of documentsToDelete) {
      try {
        // Eliminar archivo físico si existe
        if (doc.filePath) {
          await fileStorageService.deleteFile(doc.filePath);
          bytesFreed += doc.fileSize || 0;
        }

        // Eliminar registro de base de datos
        await prisma.document.delete({
          where: { id: doc.id },
        });

        deletedCount++;

        logger.debug('Documento eliminado:', {
          documentId: doc.id,
          documentName: doc.name,
          fileSize: doc.fileSize,
        });

        // Actualizar progreso
        const progress = 50 + (deletedCount / documentsToDelete.length) * 40;
        await job.progress(Math.round(progress));

      } catch (error: any) {
        logger.error('Error eliminando documento:', {
          documentId: doc.id,
          error: error.message,
        });
        // Continuar con el siguiente documento
      }
    }
  }

  await job.progress(100);

  return {
    type: 'old_documents',
    itemsProcessed: documentsToDelete.length,
    itemsDeleted: deletedCount,
    bytesFreed,
  };
}

/**
 * Limpiar jobs fallidos antiguos de las colas
 */
async function cleanupFailedJobs(
  job: Job<CleanupJobData>,
  maxAgeHours: number,
  dryRun: boolean
): Promise<{ type: string; itemsProcessed: number; itemsDeleted: number; bytesFreed: number }> {
  
  await job.progress(10);
  
  logger.info('Limpiando jobs fallidos:', { maxAgeHours, dryRun });

  // Esta funcionalidad se maneja directamente en queueService.cleanupJobs()
  let cleanedCount = 0;

  if (!dryRun) {
    // Importar aquí para evitar dependencias circulares
    const { queueService } = require('../services/queueService');
    await queueService.cleanupJobs();
    cleanedCount = 1; // Indicar que se ejecutó la limpieza
  }

  await job.progress(100);

  return {
    type: 'failed_jobs',
    itemsProcessed: cleanedCount,
    itemsDeleted: cleanedCount,
    bytesFreed: 0,
  };
}

/**
 * Limpiar logs de auditoría antiguos
 */
async function cleanupAuditLogs(
  job: Job<CleanupJobData>,
  maxAgeHours: number,
  tenantId: string | undefined,
  dryRun: boolean
): Promise<{ type: string; itemsProcessed: number; itemsDeleted: number; bytesFreed: number }> {
  
  await job.progress(10);
  
  // Para logs de auditoría, usar un período más largo por defecto (90 días)
  const actualMaxAge = maxAgeHours > 24 ? maxAgeHours : (90 * 24);
  const cutoffDate = new Date(Date.now() - (actualMaxAge * 60 * 60 * 1000));
  
  logger.info('Limpiando logs de auditoría:', { 
    actualMaxAge, 
    cutoffDate, 
    tenantId, 
    dryRun 
  });

  const where: any = {
    createdAt: {
      lt: cutoffDate,
    },
  };

  if (tenantId) {
    where.tenantId = tenantId;
  }

  await job.progress(30);

  // Contar logs a eliminar
  const logsCount = await prisma.auditLog.count({ where });

  logger.info('Logs de auditoría encontrados:', {
    count: logsCount,
    tenantId,
  });

  let deletedCount = 0;

  if (!dryRun && logsCount > 0) {
    await job.progress(50);

    // Eliminar en lotes para mejor rendimiento
    const batchSize = 1000;
    let processed = 0;

    while (processed < logsCount) {
      const deleteResult = await prisma.auditLog.deleteMany({
        where: {
          ...where,
        },
        // Prisma no soporta LIMIT en deleteMany, por lo que eliminamos todos
      });

      deletedCount += deleteResult.count;
      processed += deleteResult.count;

      const progress = 50 + (processed / logsCount) * 40;
      await job.progress(Math.round(progress));

      // Si no se eliminó nada, salir del bucle
      if (deleteResult.count === 0) {
        break;
      }
    }
  }

  await job.progress(100);

  return {
    type: 'audit_logs',
    itemsProcessed: logsCount,
    itemsDeleted: deletedCount,
    bytesFreed: 0,
  };
}

/**
 * Handler de errores para jobs de limpieza fallidos
 */
export async function handleCleanupJobFailure(job: Job<CleanupJobData>, error: Error): Promise<void> {
  const { type, tenantId } = job.data;

  logger.error('Job de limpieza fallido:', {
    jobId: job.id,
    type,
    tenantId,
    error: error.message,
    attempts: job.attemptsMade,
  });

  // Para jobs de limpieza, no necesitamos hacer mucho más que logear
  // ya que son tareas de mantenimiento y se reintentarán según la programación
}
