import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import prisma from '../config/database';
import { logger } from '../config/logger';
import { validateData, templateValidation, validateId, validateQuery } from '../utils/validation';
import { createError } from '../middleware/errorHandler';

/**
 * Controladores para gestión de templates
 * Maneja CRUD completo de templates con variables dinámicas
 */

/**
 * GET /api/templates
 * Obtener lista de templates del tenant con paginación
 */
export const getTemplates = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { page, limit, sortBy, sortOrder } = validateQuery(req.query);
    const { search, isActive } = req.query;
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    logger.info('Obteniendo templates:', { 
      page, 
      limit, 
      search, 
      tenantId, 
      userId 
    });

    // Construir filtros
    const where: any = { tenantId };
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Configurar ordenamiento
    const orderBy: any = {};
    if (sortBy && ['name', 'createdAt', 'updatedAt'].includes(sortBy)) {
      orderBy[sortBy] = sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Ejecutar consultas en paralelo
    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              documents: true,
            },
          },
        },
      }),
      prisma.template.count({ where }),
    ]);

    logger.info('Templates obtenidos exitosamente:', { 
      count: templates.length, 
      total, 
      tenantId 
    });

    res.json({
      success: true,
      data: templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      message: 'Templates obtenidos exitosamente',
    });
  } catch (error: any) {
    logger.error('Error obteniendo templates:', {
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error obteniendo templates',
    });
  }
});

/**
 * GET /api/templates/:id
 * Obtener template específico con detalles completos
 */
export const getTemplate = asyncHandler(async (req: Request, res: Response) => {
  try {
    const templateId = validateId(req.params.id, 'templateId');
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    logger.info('Obteniendo template:', { templateId, tenantId, userId });

    const template = await prisma.template.findFirst({
      where: {
        id: templateId,
        tenantId, // Asegurar aislamiento de tenant
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        documents: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Solo los últimos 5 documentos
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!template) {
      logger.warn('Template no encontrado:', { templateId, tenantId });
      return res.status(404).json({
        success: false,
        message: 'Template no encontrado',
      });
    }

    logger.info('Template obtenido exitosamente:', { 
      templateId, 
      templateName: template.name,
      tenantId 
    });

    res.json({
      success: true,
      data: template,
      message: 'Template obtenido exitosamente',
    });
  } catch (error: any) {
    logger.error('Error obteniendo template:', {
      templateId: req.params.id,
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error obteniendo template',
    });
  }
});

/**
 * POST /api/templates
 * Crear nuevo template con validación completa
 */
export const createTemplate = asyncHandler(async (req: Request, res: Response) => {
  try {
    const templateData = validateData(templateValidation.create, req.body);
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    logger.info('Creando template:', { 
      templateName: templateData.name,
      tenantId, 
      userId 
    });

    // Verificar que el nombre no esté duplicado en el tenant
    const existingTemplate = await prisma.template.findFirst({
      where: {
        name: templateData.name,
        tenantId,
      },
    });

    if (existingTemplate) {
      logger.warn('Template con nombre duplicado:', { 
        templateName: templateData.name,
        tenantId 
      });
      return res.status(409).json({
        success: false,
        message: 'Ya existe un template con ese nombre',
      });
    }

    // Crear template
    const template = await prisma.template.create({
      data: {
        ...templateData,
        tenantId,
        createdById: userId,
      },
      include: {
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

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'template',
        entityId: template.id,
        newValues: {
          name: template.name,
          description: template.description,
          variablesCount: template.variables ? (template.variables as any[]).length : 0,
        },
        userId,
        userEmail: req.user!.email,
        tenantId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    logger.info('Template creado exitosamente:', { 
      templateId: template.id,
      templateName: template.name,
      tenantId 
    });

    res.status(201).json({
      success: true,
      data: template,
      message: 'Template creado exitosamente',
    });
  } catch (error: any) {
    logger.error('Error creando template:', {
      error: error.message,
      validationErrors: error.validationErrors,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error creando template',
      validationErrors: error.validationErrors,
    });
  }
});

/**
 * PUT /api/templates/:id
 * Actualizar template existente
 */
export const updateTemplate = asyncHandler(async (req: Request, res: Response) => {
  try {
    const templateId = validateId(req.params.id, 'templateId');
    const updateData = validateData(templateValidation.update, req.body);
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    logger.info('Actualizando template:', { 
      templateId, 
      tenantId, 
      userId 
    });

    // Verificar que el template existe y pertenece al tenant
    const existingTemplate = await prisma.template.findFirst({
      where: {
        id: templateId,
        tenantId,
      },
    });

    if (!existingTemplate) {
      logger.warn('Template no encontrado para actualización:', { 
        templateId, 
        tenantId 
      });
      return res.status(404).json({
        success: false,
        message: 'Template no encontrado',
      });
    }

    // Verificar duplicado de nombre si se está cambiando
    if (updateData.name && updateData.name !== existingTemplate.name) {
      const duplicateTemplate = await prisma.template.findFirst({
        where: {
          name: updateData.name,
          tenantId,
          NOT: {
            id: templateId,
          },
        },
      });

      if (duplicateTemplate) {
        logger.warn('Nombre de template duplicado en actualización:', { 
          templateName: updateData.name,
          tenantId 
        });
        return res.status(409).json({
          success: false,
          message: 'Ya existe un template con ese nombre',
        });
      }
    }

    // Actualizar template
    const updatedTemplate = await prisma.template.update({
      where: { id: templateId },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'template',
        entityId: templateId,
        oldValues: {
          name: existingTemplate.name,
          description: existingTemplate.description,
          isActive: existingTemplate.isActive,
        },
        newValues: updateData,
        userId,
        userEmail: req.user!.email,
        tenantId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    logger.info('Template actualizado exitosamente:', { 
      templateId,
      templateName: updatedTemplate.name,
      tenantId 
    });

    res.json({
      success: true,
      data: updatedTemplate,
      message: 'Template actualizado exitosamente',
    });
  } catch (error: any) {
    logger.error('Error actualizando template:', {
      templateId: req.params.id,
      error: error.message,
      validationErrors: error.validationErrors,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error actualizando template',
      validationErrors: error.validationErrors,
    });
  }
});

/**
 * DELETE /api/templates/:id
 * Eliminar template (solo si no tiene documentos asociados)
 */
export const deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
  try {
    const templateId = validateId(req.params.id, 'templateId');
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    logger.info('Eliminando template:', { templateId, tenantId, userId });

    // Verificar que el template existe y pertenece al tenant
    const template = await prisma.template.findFirst({
      where: {
        id: templateId,
        tenantId,
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!template) {
      logger.warn('Template no encontrado para eliminación:', { 
        templateId, 
        tenantId 
      });
      return res.status(404).json({
        success: false,
        message: 'Template no encontrado',
      });
    }

    // No permitir eliminación si tiene documentos asociados
    if (template._count.documents > 0) {
      logger.warn('Intento de eliminar template con documentos:', { 
        templateId, 
        documentsCount: template._count.documents,
        tenantId 
      });
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar el template porque tiene ${template._count.documents} documento(s) asociado(s)`,
      });
    }

    // Eliminar template
    await prisma.template.delete({
      where: { id: templateId },
    });

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'template',
        entityId: templateId,
        oldValues: {
          name: template.name,
          description: template.description,
        },
        userId,
        userEmail: req.user!.email,
        tenantId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    logger.info('Template eliminado exitosamente:', { 
      templateId,
      templateName: template.name,
      tenantId 
    });

    res.json({
      success: true,
      message: 'Template eliminado exitosamente',
    });
  } catch (error: any) {
    logger.error('Error eliminando template:', {
      templateId: req.params.id,
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error eliminando template',
    });
  }
});

/**
 * POST /api/templates/:id/duplicate
 * Duplicar template existente
 */
export const duplicateTemplate = asyncHandler(async (req: Request, res: Response) => {
  try {
    const templateId = validateId(req.params.id, 'templateId');
    const { name } = req.body;
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nombre para el template duplicado es requerido',
      });
    }

    logger.info('Duplicando template:', { 
      originalTemplateId: templateId, 
      newName: name,
      tenantId, 
      userId 
    });

    // Verificar que el template original existe
    const originalTemplate = await prisma.template.findFirst({
      where: {
        id: templateId,
        tenantId,
      },
    });

    if (!originalTemplate) {
      logger.warn('Template original no encontrado:', { templateId, tenantId });
      return res.status(404).json({
        success: false,
        message: 'Template original no encontrado',
      });
    }

    // Verificar que el nuevo nombre no existe
    const existingTemplate = await prisma.template.findFirst({
      where: {
        name,
        tenantId,
      },
    });

    if (existingTemplate) {
      logger.warn('Nombre duplicado en duplicación:', { newName: name, tenantId });
      return res.status(409).json({
        success: false,
        message: 'Ya existe un template con ese nombre',
      });
    }

    // Crear template duplicado
    const duplicatedTemplate = await prisma.template.create({
      data: {
        name,
        description: `${originalTemplate.description || ''} (Copia)`.trim(),
        content: originalTemplate.content,
        variables: originalTemplate.variables,
        isActive: false, // Los templates duplicados empiezan inactivos
        tenantId,
        createdById: userId,
      },
      include: {
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

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'DUPLICATE',
        entityType: 'template',
        entityId: duplicatedTemplate.id,
        oldValues: {
          originalTemplateId: templateId,
          originalTemplateName: originalTemplate.name,
        },
        newValues: {
          name: duplicatedTemplate.name,
          description: duplicatedTemplate.description,
        },
        userId,
        userEmail: req.user!.email,
        tenantId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    logger.info('Template duplicado exitosamente:', { 
      originalTemplateId: templateId,
      newTemplateId: duplicatedTemplate.id,
      newTemplateName: duplicatedTemplate.name,
      tenantId 
    });

    res.status(201).json({
      success: true,
      data: duplicatedTemplate,
      message: 'Template duplicado exitosamente',
    });
  } catch (error: any) {
    logger.error('Error duplicando template:', {
      templateId: req.params.id,
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error duplicando template',
    });
  }
});
