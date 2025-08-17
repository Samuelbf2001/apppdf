import { Router } from 'express';
import { tenantMiddleware } from '../middleware/auth';
import {
  getDocuments,
  getDocument,
  generateDocument,
  downloadDocument,
  getDocumentStatus
} from '../controllers/documents';

const router = Router();

// Aplicar middleware de tenant a todas las rutas
router.use(tenantMiddleware);

/**
 * GET /api/documents
 * Obtener lista de documentos del tenant con filtros
 */
router.get('/', getDocuments);

/**
 * POST /api/documents/generate
 * Generar nuevo documento PDF desde template
 */
router.post('/generate', generateDocument);

/**
 * GET /api/documents/:id
 * Obtener documento específico con detalles completos
 */
router.get('/:id', getDocument);

/**
 * GET /api/documents/:id/status
 * Obtener estado de procesamiento del documento
 */
router.get('/:id/status', getDocumentStatus);

/**
 * GET /api/documents/:id/download
 * Descargar archivo PDF del documento
 */
router.get('/:id/download', downloadDocument);

/**
 * POST /api/documents/:id/send-to-hubspot
 * Enviar documento generado a HubSpot como attachment
 */
router.post('/:id/send-to-hubspot', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Funcionalidad en desarrollo',
    todo: 'Implementar cuando se complete integración con Gotenberg y subida a HubSpot'
  });
});

export default router;
