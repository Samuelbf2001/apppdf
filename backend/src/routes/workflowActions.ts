import { Router } from 'express';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import {
  executeGeneratePdfAction,
  getWorkflowActionStatus,
  validateActionConfig,
  getTemplatesForPortal,
  testWorkflowAction
} from '../controllers/workflowActions';

const router = Router();

// ========================================
// ENDPOINTS PÚBLICOS (llamados por HubSpot)
// ========================================

/**
 * POST /api/hubspot/workflow-actions/generate-pdf
 * Endpoint principal ejecutado por workflows de HubSpot
 * NO requiere autenticación de usuario (HubSpot maneja la autenticación)
 */
router.post('/generate-pdf', executeGeneratePdfAction);

/**
 * GET /api/hubspot/workflow-actions/status/:executionId
 * Consultar estado de ejecución de workflow action
 */
router.get('/status/:executionId', getWorkflowActionStatus);

/**
 * POST /api/hubspot/workflow-actions/validate-config
 * Validar configuración de custom action
 */
router.post('/validate-config', validateActionConfig);

/**
 * GET /api/hubspot/workflow-actions/templates/:portalId
 * Obtener templates disponibles para un portal específico
 * Usado por el iframe de configuración
 */
router.get('/templates/:portalId', getTemplatesForPortal);

// ========================================
// ENDPOINTS PROTEGIDOS (requieren autenticación)
// ========================================

/**
 * POST /api/hubspot/workflow-actions/test
 * Probar configuración de workflow action
 * Requiere autenticación del usuario
 */
router.post('/test', authMiddleware, testWorkflowAction);

export default router;
