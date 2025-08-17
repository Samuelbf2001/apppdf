import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';
import { createError } from './errorHandler';

// Extender Request para incluir información de usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        tenantId: string;
        hubspotPortalId?: string;
      };
    }
  }
}

/**
 * Middleware de autenticación JWT
 * Verifica que el usuario esté autenticado y extrae información del token
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Token de acceso requerido', 401);
    }

    const token = authHeader.substring(7); // Remover 'Bearer '
    
    if (!token) {
      throw createError('Token de acceso requerido', 401);
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Agregar información del usuario a la request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      tenantId: decoded.tenantId,
      hubspotPortalId: decoded.hubspotPortalId,
    };

    logger.debug('Usuario autenticado:', {
      userId: req.user.id,
      tenantId: req.user.tenantId,
    });

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(createError('Token de acceso inválido', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(createError('Token de acceso expirado', 401));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware opcional de autenticación
 * Extrae información del usuario si el token está presente, pero no falla si no está
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          tenantId: decoded.tenantId,
          hubspotPortalId: decoded.hubspotPortalId,
        };
      }
    }

    next();
  } catch (error) {
    // En auth opcional, ignoramos errores de token y continuamos
    next();
  }
};

/**
 * Middleware para verificar permisos de tenant
 * Asegura que el usuario solo acceda a recursos de su propio tenant
 */
export const tenantMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.tenantId) {
    return next(createError('Información de tenant requerida', 403));
  }

  // Agregar filtro de tenant a queries
  req.query.tenantId = req.user.tenantId;
  
  next();
};
