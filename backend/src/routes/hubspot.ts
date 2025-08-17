import { Router } from 'express';
import { tenantMiddleware } from '../middleware/auth';
import {
  getProperties,
  getContact,
  searchContacts,
  getDeal,
  getCompany,
  uploadFile,
  attachFileToObject
} from '../controllers/hubspot';

const router = Router();

// Aplicar middleware de tenant a todas las rutas
router.use(tenantMiddleware);

// === Rutas para propiedades ===

/**
 * GET /api/hubspot/properties
 * Obtener propiedades disponibles de HubSpot (contacts, deals, companies)
 */
router.get('/properties', getProperties);

// === Rutas para contactos ===

/**
 * GET /api/hubspot/contacts
 * Buscar contactos con filtros
 */
router.get('/contacts', searchContacts);

/**
 * GET /api/hubspot/contacts/:id
 * Obtener contacto específico de HubSpot
 */
router.get('/contacts/:id', getContact);

// === Rutas para deals ===

/**
 * GET /api/hubspot/deals/:id
 * Obtener deal específico de HubSpot
 */
router.get('/deals/:id', getDeal);

// === Rutas para companies ===

/**
 * GET /api/hubspot/companies/:id
 * Obtener company específica de HubSpot
 */
router.get('/companies/:id', getCompany);

// === Rutas para archivos ===

/**
 * POST /api/hubspot/files/upload
 * Subir archivo a HubSpot Files
 */
router.post('/files/upload', uploadFile);

/**
 * POST /api/hubspot/attachments/:objectType/:objectId
 * Attachar archivo a objeto de HubSpot (contact, deal, company)
 */
router.post('/attachments/:objectType/:objectId', attachFileToObject);

export default router;
