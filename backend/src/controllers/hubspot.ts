import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { hubspotApiService } from '../services/hubspotApi';
import { logger } from '../config/logger';
import { validateQuery, hubspotValidation, validateData } from '../utils/validation';

/**
 * Controladores para interacciones con HubSpot API
 * Maneja obtención de propiedades, objetos y archivos
 */

/**
 * GET /api/hubspot/properties
 * Obtener propiedades disponibles de HubSpot
 */
export const getProperties = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { object } = validateData(hubspotValidation.properties, req.query);
    const tenantId = req.user!.tenantId;

    logger.info('Obteniendo propiedades de HubSpot:', { 
      object, 
      tenantId,
      userId: req.user!.id 
    });

    const properties = await hubspotApiService.getProperties(
      tenantId, 
      object as 'contacts' | 'deals' | 'companies'
    );

    res.json({
      success: true,
      data: properties,
      message: `Propiedades de ${object} obtenidas exitosamente`,
    });
  } catch (error: any) {
    logger.error('Error obteniendo propiedades:', {
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error obteniendo propiedades de HubSpot',
    });
  }
});

/**
 * GET /api/hubspot/contacts/:id
 * Obtener contacto específico de HubSpot
 */
export const getContact = asyncHandler(async (req: Request, res: Response) => {
  try {
    const contactId = validateData(hubspotValidation.objectId, req.params.id);
    const tenantId = req.user!.tenantId;
    const { properties } = req.query;

    logger.info('Obteniendo contacto de HubSpot:', { 
      contactId, 
      tenantId,
      userId: req.user!.id 
    });

    // Parsear propiedades si están especificadas
    const requestedProperties = properties ? 
      (properties as string).split(',').map(p => p.trim()) : 
      undefined;

    const contact = await hubspotApiService.getContact(
      tenantId, 
      contactId, 
      requestedProperties
    );

    res.json({
      success: true,
      data: contact,
      message: 'Contacto obtenido exitosamente',
    });
  } catch (error: any) {
    logger.error('Error obteniendo contacto:', {
      contactId: req.params.id,
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error obteniendo contacto de HubSpot',
    });
  }
});

/**
 * GET /api/hubspot/contacts
 * Buscar contactos con filtros
 */
export const searchContacts = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { page, limit } = validateQuery(req.query);
    const { search, properties } = req.query;
    const tenantId = req.user!.tenantId;

    logger.info('Buscando contactos en HubSpot:', { 
      search, 
      page, 
      limit,
      tenantId,
      userId: req.user!.id 
    });

    // Construir filtros si hay término de búsqueda
    const filters = search ? [
      {
        propertyName: 'email',
        operator: 'CONTAINS_TOKEN',
        value: search,
      },
      {
        propertyName: 'firstname',
        operator: 'CONTAINS_TOKEN',
        value: search,
      },
      {
        propertyName: 'lastname',
        operator: 'CONTAINS_TOKEN',
        value: search,
      },
    ] : undefined;

    // Parsear propiedades solicitadas
    const requestedProperties = properties ? 
      (properties as string).split(',').map(p => p.trim()) : 
      ['firstname', 'lastname', 'email', 'phone', 'company'];

    const result = await hubspotApiService.searchContacts(
      tenantId,
      filters,
      requestedProperties,
      limit
    );

    res.json({
      success: true,
      data: result.results,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
      message: 'Contactos obtenidos exitosamente',
    });
  } catch (error: any) {
    logger.error('Error buscando contactos:', {
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error buscando contactos en HubSpot',
    });
  }
});

/**
 * GET /api/hubspot/deals/:id
 * Obtener deal específico de HubSpot
 */
export const getDeal = asyncHandler(async (req: Request, res: Response) => {
  try {
    const dealId = validateData(hubspotValidation.objectId, req.params.id);
    const tenantId = req.user!.tenantId;
    const { properties } = req.query;

    logger.info('Obteniendo deal de HubSpot:', { 
      dealId, 
      tenantId,
      userId: req.user!.id 
    });

    // Parsear propiedades si están especificadas
    const requestedProperties = properties ? 
      (properties as string).split(',').map(p => p.trim()) : 
      undefined;

    const deal = await hubspotApiService.getDeal(
      tenantId, 
      dealId, 
      requestedProperties
    );

    res.json({
      success: true,
      data: deal,
      message: 'Deal obtenido exitosamente',
    });
  } catch (error: any) {
    logger.error('Error obteniendo deal:', {
      dealId: req.params.id,
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error obteniendo deal de HubSpot',
    });
  }
});

/**
 * GET /api/hubspot/companies/:id
 * Obtener company específica de HubSpot
 */
export const getCompany = asyncHandler(async (req: Request, res: Response) => {
  try {
    const companyId = validateData(hubspotValidation.objectId, req.params.id);
    const tenantId = req.user!.tenantId;
    const { properties } = req.query;

    logger.info('Obteniendo company de HubSpot:', { 
      companyId, 
      tenantId,
      userId: req.user!.id 
    });

    // Parsear propiedades si están especificadas
    const requestedProperties = properties ? 
      (properties as string).split(',').map(p => p.trim()) : 
      undefined;

    const company = await hubspotApiService.getCompany(
      tenantId, 
      companyId, 
      requestedProperties
    );

    res.json({
      success: true,
      data: company,
      message: 'Company obtenida exitosamente',
    });
  } catch (error: any) {
    logger.error('Error obteniendo company:', {
      companyId: req.params.id,
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error obteniendo company de HubSpot',
    });
  }
});

/**
 * POST /api/hubspot/files/upload
 * Subir archivo a HubSpot Files
 */
export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  try {
    // TODO: Implementar upload de archivos con multer
    const tenantId = req.user!.tenantId;

    logger.info('Subiendo archivo a HubSpot:', { 
      tenantId,
      userId: req.user!.id 
    });

    res.status(501).json({
      success: false,
      message: 'Upload de archivos en desarrollo',
      todo: 'Implementar middleware multer y procesamiento de archivos',
    });
  } catch (error: any) {
    logger.error('Error subiendo archivo:', {
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error subiendo archivo a HubSpot',
    });
  }
});

/**
 * POST /api/hubspot/attachments/:objectType/:objectId
 * Attachar archivo a objeto de HubSpot
 */
export const attachFileToObject = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { objectType, objectId } = req.params;
    const { fileId } = req.body;
    const tenantId = req.user!.tenantId;

    // Validar parámetros
    validateData(hubspotValidation.objectType, objectType);
    validateData(hubspotValidation.objectId, objectId);
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'fileId es requerido en el body',
      });
    }

    logger.info('Attachando archivo a objeto HubSpot:', { 
      fileId,
      objectType,
      objectId,
      tenantId,
      userId: req.user!.id 
    });

    await hubspotApiService.attachFileToObject(
      tenantId,
      fileId,
      objectType.toLowerCase() as 'contact' | 'deal' | 'company',
      objectId
    );

    res.json({
      success: true,
      message: `Archivo attachado exitosamente al ${objectType}`,
    });
  } catch (error: any) {
    logger.error('Error attachando archivo:', {
      objectType: req.params.objectType,
      objectId: req.params.objectId,
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error attachando archivo en HubSpot',
    });
  }
});
