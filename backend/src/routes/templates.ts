import { Router } from 'express';
import { tenantMiddleware } from '../middleware/auth';
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate
} from '../controllers/templates';

const router = Router();

// Aplicar middleware de tenant a todas las rutas
router.use(tenantMiddleware);

/**
 * GET /api/templates
 * Obtener lista de templates del tenant con paginación y filtros
 */
router.get('/', getTemplates);

/**
 * POST /api/templates
 * Crear nuevo template con validación completa
 */
router.post('/', createTemplate);

/**
 * GET /api/templates/:id
 * Obtener template específico con detalles completos
 */
router.get('/:id', getTemplate);

/**
 * PUT /api/templates/:id
 * Actualizar template existente
 */
router.put('/:id', updateTemplate);

/**
 * DELETE /api/templates/:id
 * Eliminar template (solo si no tiene documentos asociados)
 */
router.delete('/:id', deleteTemplate);

/**
 * POST /api/templates/:id/duplicate
 * Duplicar template existente con nuevo nombre
 */
router.post('/:id/duplicate', duplicateTemplate);

export default router;
