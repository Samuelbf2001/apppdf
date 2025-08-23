import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de seguridad simplificado y robusto
 * Solo incluye funcionalidades esenciales que funcionan en producción
 */

// Configuración CORS simplificada
export const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // En desarrollo, permitir todos los orígenes
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // En producción, permitir solo dominios específicos
    const allowedOrigins = [
      'https://automaticpdfhub.cloud',
      'https://www.automaticpdfhub.cloud',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Headers de seguridad básicos
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Headers básicos de seguridad
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Headers adicionales para producción
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  
  next();
};

// Middleware de validación de tamaño de archivo
export const validateFileSize = (maxSizeMB: number = 25) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        error: 'Archivo demasiado grande',
        message: `El archivo excede el tamaño máximo de ${maxSizeMB}MB`
      });
    }
    
    next();
  };
};

// Middleware de rate limiting simple
export const simpleRateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Limpiar entradas expiradas
    for (const [key, value] of requests.entries()) {
      if (now > value.resetTime) {
        requests.delete(key);
      }
    }
    
    const userRequests = requests.get(ip);
    
    if (!userRequests || now > userRequests.resetTime) {
      // Nueva ventana de tiempo
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (userRequests.count >= maxRequests) {
      return res.status(429).json({
        error: 'Demasiadas solicitudes',
        message: 'Has excedido el límite de solicitudes. Intenta de nuevo más tarde.'
      });
    }
    
    userRequests.count++;
    next();
  };
};
