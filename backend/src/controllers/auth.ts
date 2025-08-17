import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/errorHandler';
import { hubspotAuthService } from '../services/hubspotAuth';
import { logger } from '../config/logger';
import prisma from '../config/database';

/**
 * Controladores para autenticación
 * Maneja el flujo completo de OAuth2 con HubSpot
 */

/**
 * GET /api/auth/hubspot/authorize
 * Redirige al usuario a HubSpot para autorización OAuth2
 */
export const initiateHubSpotAuth = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Generar state aleatorio para seguridad
    const state = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);

    // Guardar state en sesión/cache (simplificado para este ejemplo)
    // En producción, usar Redis o similar
    
    const authUrl = hubspotAuthService.getAuthorizationUrl(state);
    
    logger.info('Iniciando flujo OAuth2 con HubSpot', {
      state,
      redirectUrl: authUrl,
      ip: req.ip,
    });

    res.json({
      success: true,
      authUrl,
      state,
      message: 'Redirigir al usuario a la URL de autorización',
    });
  } catch (error) {
    logger.error('Error iniciando OAuth2:', error);
    res.status(500).json({
      success: false,
      message: 'Error iniciando proceso de autorización',
    });
  }
});

/**
 * GET /api/auth/hubspot/callback
 * Callback de OAuth2 de HubSpot
 */
export const hubspotCallback = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    // Verificar si hubo error en OAuth2
    if (error) {
      logger.warn('Error en OAuth2 callback:', { error, state });
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=${encodeURIComponent(error as string)}`);
    }

    // Verificar que tenemos el código
    if (!code) {
      logger.warn('No se recibió código de autorización');
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=No authorization code received`);
    }

    logger.info('Procesando callback de HubSpot OAuth2', {
      code: typeof code === 'string' ? code.substring(0, 10) + '...' : 'invalid',
      state,
      ip: req.ip,
    });

    // Procesar OAuth callback
    const result = await hubspotAuthService.handleOAuthCallback(code as string);
    
    logger.info('OAuth callback procesado exitosamente', {
      userId: result.user.id,
      tenantId: result.tenant.id,
      hubspotPortalId: result.tenant.hubspotPortalId,
    });

    // Redirigir al frontend con el token
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/success?token=${result.accessToken}`;
    res.redirect(redirectUrl);

  } catch (error: any) {
    logger.error('Error en callback de OAuth2:', error);
    const errorMessage = encodeURIComponent(error.message || 'Error procesando autenticación');
    res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=${errorMessage}`);
  }
});

/**
 * POST /api/auth/login
 * Login con email/password (para desarrollo o casos especiales)
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Implementar login alternativo si es necesario
  // Por ahora, solo OAuth2 con HubSpot está implementado
  
  res.status(501).json({
    success: false,
    message: 'Login con credenciales no implementado. Use OAuth2 con HubSpot.',
    authUrl: hubspotAuthService.getAuthorizationUrl(),
  });
});

/**
 * POST /api/auth/logout
 * Cerrar sesión del usuario
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  try {
    // En un sistema JWT stateless, el logout se maneja del lado del cliente
    // simplemente eliminando el token
    
    // Log de auditoría si tenemos información del usuario
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          action: 'LOGOUT',
          entityType: 'user',
          entityId: req.user.id,
          userId: req.user.id,
          userEmail: req.user.email,
          tenantId: req.user.tenantId,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });
      
      logger.info('Usuario cerró sesión', {
        userId: req.user.id,
        tenantId: req.user.tenantId,
      });
    }

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });
  } catch (error) {
    logger.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error cerrando sesión',
    });
  }
});

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    // Obtener información completa del usuario y tenant
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            hubspotPortalId: true,
            isActive: true,
            settings: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // No enviar información sensible
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      isActive: user.isActive,
      preferences: user.preferences,
      lastLoginAt: user.lastLoginAt,
      tenant: user.tenant,
      createdAt: user.createdAt,
    };

    logger.debug('Información de usuario solicitada', {
      userId: user.id,
      tenantId: user.tenant.id,
    });

    res.json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    logger.error('Error obteniendo información de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo información de usuario',
    });
  }
});

/**
 * POST /api/auth/refresh-token
 * Refrescar token JWT
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requerido',
      });
    }

    // Verificar refresh token (en este ejemplo simplificado, usamos el mismo JWT)
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
    
    // Verificar que el usuario aún existe y está activo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { tenant: true },
    });

    if (!user || !user.isActive || !user.tenant.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo o no válido',
      });
    }

    // Generar nuevo token
    const newToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        tenantId: user.tenant.id,
        hubspotPortalId: user.tenant.hubspotPortalId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    logger.info('Token refrescado', {
      userId: user.id,
      tenantId: user.tenant.id,
    });

    res.json({
      success: true,
      data: {
        accessToken: newToken,
        expiresIn: '7d',
      },
    });
  } catch (error: any) {
    logger.error('Error refrescando token:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido o expirado',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error refrescando token',
    });
  }
});
