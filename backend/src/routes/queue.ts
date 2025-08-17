import { Router } from 'express';
import { authMiddleware, tenantMiddleware } from '../middleware/auth';
import {
  getQueueStats,
  pauseQueue,
  resumeQueue,
  cleanupQueues,
  getJobStatus,
  scheduleCleanup,
  restartWorkers
} from '../controllers/queue';

const router = Router();

// Aplicar middleware de autenticación y tenant a todas las rutas
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * GET /api/queue/stats
 * Obtener estadísticas de las colas
 */
router.get('/stats', getQueueStats);

/**
 * GET /api/queue/jobs/:documentId
 * Obtener estado de job específico de documento
 */
router.get('/jobs/:documentId', getJobStatus);

/**
 * POST /api/queue/schedule-cleanup
 * Programar job de limpieza manual
 */
router.post('/schedule-cleanup', scheduleCleanup);

// === Rutas administrativas ===
// TODO: Agregar middleware de roles de admin cuando se implemente

/**
 * POST /api/queue/pause
 * Pausar una cola específica (requiere permisos de admin)
 */
router.post('/pause', pauseQueue);

/**
 * POST /api/queue/resume
 * Reanudar una cola específica (requiere permisos de admin)
 */
router.post('/resume', resumeQueue);

/**
 * POST /api/queue/cleanup
 * Limpiar jobs completados y fallidos (requiere permisos de admin)
 */
router.post('/cleanup', cleanupQueues);

/**
 * POST /api/queue/workers/restart
 * Reiniciar workers (solo desarrollo)
 */
router.post('/workers/restart', restartWorkers);

export default router;
