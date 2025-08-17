import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

// Interface para errores personalizados
export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Middleware para manejo centralizado de errores
 * Procesa todos los errores de la aplicación de manera consistente
 */
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log del error
  logger.error('Error capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Determinar código de estado
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Manejo específico de errores conocidos
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Error de validación en los datos enviados';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Token de autenticación inválido o expirado';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'ID de recurso inválido';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Recurso duplicado, ya existe en la base de datos';
  }

  // Respuesta de error
  const errorResponse: any = {
    error: true,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };

  // En desarrollo, incluir stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Wrapper para funciones async que captura errores automáticamente
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Función para crear errores personalizados
 */
export const createError = (message: string, statusCode: number = 500): CustomError => {
  const error: CustomError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
