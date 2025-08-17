import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { queueService } from '../services/queueService';
import { workerManager } from '../workers';
import { logger } from '../config/logger';
import { createError } from '../middleware/errorHandler';

/**
 * Controladores para monitoreo y gestión de colas
 * API para supervisar el estado de los workers y colas
 */

/**
 * GET /api/queue/stats
 * Obtener estadísticas de las colas
 */
export const getQueueStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    logger.info('Obteniendo estadísticas de colas:', { tenantId, userId });

    const stats = await queueService.getQueueStats();
    const workerStatus = workerManager.getStatus();

    res.json({
      success: true,
      data: {
        workers: workerStatus,
        queues: stats,
        timestamp: new Date().toISOString(),
      },
      message: 'Estadísticas de colas obtenidas exitosamente',
    });

  } catch (error: any) {
    logger.error('Error obteniendo estadísticas de colas:', {
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error obteniendo estadísticas de colas',
    });
  }
});

/**
 * POST /api/queue/pause
 * Pausar una cola específica (solo admin)
 */
export const pauseQueue = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { queueName } = req.body;
    const userId = req.user!.id;

    if (!queueName || !['documents', 'hubspot', 'cleanup'].includes(queueName)) {
      return res.status(400).json({
        success: false,
        message: 'Nombre de cola inválido. Opciones: documents, hubspot, cleanup',
      });
    }

    logger.info('Pausando cola:', { queueName, userId });

    await queueService.pauseQueue(queueName);

    res.json({
      success: true,
      message: `Cola ${queueName} pausada exitosamente`,
    });

  } catch (error: any) {
    logger.error('Error pausando cola:', {
      error: error.message,
      queueName: req.body.queueName,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error pausando cola',
    });
  }
});

/**
 * POST /api/queue/resume
 * Reanudar una cola específica (solo admin)
 */
export const resumeQueue = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { queueName } = req.body;
    const userId = req.user!.id;

    if (!queueName || !['documents', 'hubspot', 'cleanup'].includes(queueName)) {
      return res.status(400).json({
        success: false,
        message: 'Nombre de cola inválido. Opciones: documents, hubspot, cleanup',
      });
    }

    logger.info('Reanudando cola:', { queueName, userId });

    await queueService.resumeQueue(queueName);

    res.json({
      success: true,
      message: `Cola ${queueName} reanudada exitosamente`,
    });

  } catch (error: any) {
    logger.error('Error reanudando cola:', {
      error: error.message,
      queueName: req.body.queueName,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error reanudando cola',
    });
  }
});

/**
 * POST /api/queue/cleanup
 * Limpiar jobs completados y fallidos
 */
export const cleanupQueues = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    logger.info('Iniciando limpieza manual de colas:', { userId });

    await queueService.cleanupJobs();

    res.json({
      success: true,
      message: 'Limpieza de colas completada exitosamente',
    });

  } catch (error: any) {
    logger.error('Error en limpieza de colas:', {
      error: error.message,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error en limpieza de colas',
    });
  }
});

/**
 * GET /api/queue/jobs/:documentId
 * Obtener estado de job específico de documento
 */
export const getJobStatus = asyncHandler(async (req: Request, res: Response) => {
  try {
    const documentId = req.params.documentId;
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: 'ID de documento requerido',
      });
    }

    logger.debug('Obteniendo estado de job:', { documentId, tenantId, userId });

    const jobStatus = await queueService.getDocumentJobStatus(documentId);

    if (!jobStatus) {
      return res.status(404).json({
        success: false,
        message: 'Job no encontrado para este documento',
      });
    }

    res.json({
      success: true,
      data: {
        documentId,
        job: jobStatus,
        timestamp: new Date().toISOString(),
      },
      message: 'Estado de job obtenido exitosamente',
    });

  } catch (error: any) {
    logger.error('Error obteniendo estado de job:', {
      documentId: req.params.documentId,
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error obteniendo estado de job',
    });
  }
});

/**
 * POST /api/queue/schedule-cleanup
 * Programar job de limpieza manual
 */
export const scheduleCleanup = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { type, maxAgeHours } = req.body;
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    const validTypes = ['temp_files', 'old_documents', 'failed_jobs', 'audit_logs'];
    
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Tipo de limpieza inválido. Opciones: ${validTypes.join(', ')}`,
      });
    }

    logger.info('Programando job de limpieza:', { 
      type, 
      maxAgeHours, 
      tenantId, 
      userId 
    });

    const job = await queueService.scheduleCleanup(type, {
      maxAgeHours: maxAgeHours || 24,
      tenantId: type === 'old_documents' || type === 'audit_logs' ? tenantId : undefined,
    });

    res.json({
      success: true,
      data: {
        jobId: job.id,
        type,
        maxAgeHours: maxAgeHours || 24,
      },
      message: 'Job de limpieza programado exitosamente',
    });

  } catch (error: any) {
    logger.error('Error programando limpieza:', {
      error: error.message,
      type: req.body.type,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error programando limpieza',
    });
  }
});

/**
 * POST /api/queue/workers/restart
 * Reiniciar workers (solo para desarrollo)
 */
export const restartWorkers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Operación no permitida en producción',
      });
    }

    logger.info('Reiniciando workers:', { userId });

    await workerManager.restart();

    res.json({
      success: true,
      message: 'Workers reiniciados exitosamente',
    });

  } catch (error: any) {
    logger.error('Error reiniciando workers:', {
      error: error.message,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error reiniciando workers',
    });
  }
});
