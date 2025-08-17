import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { logger } from '../config/logger';
import { createError } from './errorHandler';

/**
 * Middleware de seguridad avanzado
 * Implementa múltiples capas de protección
 */

// ========================================
// RATE LIMITING AVANZADO
// ========================================

/**
 * Rate limiting general para toda la API
 */
export const generalRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Demasiadas solicitudes',
    message: 'Has excedido el límite de solicitudes. Intenta de nuevo más tarde.',
    retryAfter: 'Intenta de nuevo en unos minutos',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit excedido:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
    });
    
    res.status(429).json({
      error: 'Demasiadas solicitudes',
      message: 'Has excedido el límite de solicitudes. Intenta de nuevo más tarde.',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000),
    });
  },
});

/**
 * Rate limiting estricto para autenticación
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Solo 5 intentos de login por IP
  message: {
    error: 'Demasiados intentos de autenticación',
    message: 'Has excedido el límite de intentos de login. Intenta de nuevo en 15 minutos.',
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.warn('Rate limit de autenticación excedido:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });
    
    res.status(429).json({
      error: 'Demasiados intentos de autenticación',
      message: 'Has excedido el límite de intentos de login. Intenta de nuevo en 15 minutos.',
      retryAfter: 900, // 15 minutos
    });
  },
});

/**
 * Rate limiting para generación de documentos
 */
export const documentGenerationRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // Máximo 10 documentos por minuto por usuario
  keyGenerator: (req) => {
    // Rate limit por usuario, no por IP
    return req.user?.id || req.ip;
  },
  message: {
    error: 'Demasiadas generaciones de documentos',
    message: 'Has excedido el límite de generación de documentos. Intenta de nuevo en un minuto.',
  },
  handler: (req, res) => {
    logger.warn('Rate limit de generación excedido:', {
      userId: req.user?.id,
      tenantId: req.user?.tenantId,
      ip: req.ip,
    });
    
    res.status(429).json({
      error: 'Demasiadas generaciones de documentos',
      message: 'Has excedido el límite de generación de documentos. Intenta de nuevo en un minuto.',
      retryAfter: 60,
    });
  },
});

// ========================================
// HEADERS DE SEGURIDAD
// ========================================

/**
 * Configuración avanzada de Helmet para headers de seguridad
 */
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.hubapi.com"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
  
  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: { policy: "same-origin" },
  
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: "cross-origin" },
  
  // X-DNS-Prefetch-Control
  dnsPrefetchControl: { allow: false },
  
  // X-Frame-Options
  frameguard: { action: 'deny' },
  
  // Hide X-Powered-By
  hidePoweredBy: true,
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true,
  },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // Origin-Agent-Cluster
  originAgentCluster: true,
  
  // X-Permitted-Cross-Domain-Policies
  permittedCrossDomainPolicies: false,
  
  // Referrer Policy
  referrerPolicy: { policy: "no-referrer" },
  
  // X-XSS-Protection
  xssFilter: true,
});

// ========================================
// VALIDACIÓN Y SANITIZACIÓN
// ========================================

/**
 * Middleware para sanitizar inputs de usuario
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Función helper para sanitizar recursivamente
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remover caracteres peligrosos y scripts
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
        .replace(/javascript:/gi, '') // Remover javascript: URLs
        .replace(/on\w+\s*=/gi, '') // Remover event handlers
        .replace(/&lt;script/gi, '') // Remover scripts encoded
        .trim();
    }
    
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    
    if (value && typeof value === 'object') {
      const sanitized: any = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    
    return value;
  };

  // Sanitizar body
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  // Sanitizar query parameters
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }

  // Sanitizar params
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};

/**
 * Middleware para validar tamaños de request
 */
export const validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.get('content-length') || '0');
  const maxSize = parseInt(process.env.MAX_REQUEST_SIZE || '10485760'); // 10MB por defecto

  if (contentLength > maxSize) {
    logger.warn('Request demasiado grande rechazado:', {
      contentLength,
      maxSize,
      ip: req.ip,
      path: req.path,
    });

    return res.status(413).json({
      error: 'Request demasiado grande',
      message: 'El tamaño del request excede el límite permitido',
      maxSize: `${Math.round(maxSize / 1024 / 1024)}MB`,
    });
  }

  next();
};

// ========================================
// VALIDACIÓN DE PERMISOS AVANZADA
// ========================================

/**
 * Middleware para verificar permisos específicos de recursos
 */
export const resourcePermissionCheck = (resourceType: 'template' | 'document' | 'tenant') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        return next(createError('Usuario no autenticado', 401));
      }

      const resourceId = req.params.id;
      if (!resourceId && req.method !== 'POST') {
        return next(createError('ID de recurso requerido', 400));
      }

      // Para requests POST (crear), solo verificar que el tenant esté activo
      if (req.method === 'POST') {
        // La verificación básica de tenant se hace en tenantMiddleware
        return next();
      }

      // Verificar que el recurso pertenece al tenant del usuario
      let resource;
      
      switch (resourceType) {
        case 'template':
          const { default: prisma } = await import('../config/database');
          resource = await prisma.template.findFirst({
            where: { 
              id: resourceId,
              tenantId: user.tenantId,
            },
          });
          break;
          
        case 'document':
          const { default: prismaDoc } = await import('../config/database');
          resource = await prismaDoc.document.findFirst({
            where: { 
              id: resourceId,
              tenantId: user.tenantId,
            },
          });
          break;
      }

      if (!resource) {
        logger.warn('Intento de acceso a recurso no autorizado:', {
          resourceType,
          resourceId,
          userId: user.id,
          tenantId: user.tenantId,
          method: req.method,
          path: req.path,
        });

        return next(createError('Recurso no encontrado o no autorizado', 404));
      }

      next();
    } catch (error) {
      logger.error('Error verificando permisos de recurso:', {
        error: (error as Error).message,
        resourceType,
        resourceId: req.params.id,
        userId: req.user?.id,
      });
      next(createError('Error verificando permisos', 500));
    }
  };
};

// ========================================
// LOGGING DE SEGURIDAD
// ========================================

/**
 * Middleware para logging de eventos de seguridad
 */
export const securityEventLogger = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const statusCode = res.statusCode;
    
    // Logear eventos de seguridad importantes
    if (statusCode === 401 || statusCode === 403 || statusCode === 429) {
      logger.warn('Evento de seguridad:', {
        statusCode,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        tenantId: req.user?.tenantId,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Logear accesos exitosos a recursos sensibles
    if (statusCode >= 200 && statusCode < 300) {
      const sensitiveEndpoints = ['/api/auth/', '/api/templates/', '/api/documents/'];
      const isSensitive = sensitiveEndpoints.some(endpoint => req.path.startsWith(endpoint));
      
      if (isSensitive) {
        logger.info('Acceso a recurso sensible:', {
          method: req.method,
          path: req.path,
          statusCode,
          userId: req.user?.id,
          tenantId: req.user?.tenantId,
          ip: req.ip,
        });
      }
    }

    return originalSend.call(this, data);
  };

  next();
};

// ========================================
// VALIDACIÓN DE IP
// ========================================

/**
 * Middleware para validar IPs permitidas (opcional)
 */
export const ipWhitelistMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];
  
  // Si no hay IPs configuradas, permitir todo
  if (allowedIPs.length === 0) {
    return next();
  }

  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (!allowedIPs.includes(clientIP)) {
    logger.warn('IP no autorizada bloqueada:', {
      ip: clientIP,
      path: req.path,
      userAgent: req.get('User-Agent'),
    });

    return res.status(403).json({
      error: 'IP no autorizada',
      message: 'Tu IP no está autorizada para acceder a este servicio',
    });
  }

  next();
};

// ========================================
// PROTECCIÓN CONTRA ATAQUES
// ========================================

/**
 * Middleware para detectar y bloquear patrones de ataque comunes
 */
export const attackProtection = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /union.*select/i,           // SQL Injection
    /<script.*>/i,              // XSS
    /javascript:/i,             // JavaScript injection
    /\.\.\/.*\.\.\/.*\.\.\//,   // Path traversal
    /eval\s*\(/i,               // Code injection
    /exec\s*\(/i,               // Command injection
    /system\s*\(/i,             // System command
  ];

  const checkData = (data: any, path: string = '') => {
    if (typeof data === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(data)) {
          logger.error('Patrón de ataque detectado:', {
            pattern: pattern.toString(),
            data: data.substring(0, 100),
            path,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            method: req.method,
            url: req.url,
          });

          throw createError('Contenido sospechoso detectado', 400);
        }
      }
    } else if (Array.isArray(data)) {
      data.forEach((item, index) => checkData(item, `${path}[${index}]`));
    } else if (data && typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => 
        checkData(value, path ? `${path}.${key}` : key)
      );
    }
  };

  try {
    // Verificar body
    if (req.body) {
      checkData(req.body, 'body');
    }

    // Verificar query parameters
    if (req.query) {
      checkData(req.query, 'query');
    }

    // Verificar headers sospechosos
    const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-originating-ip'];
    for (const header of suspiciousHeaders) {
      const headerValue = req.get(header);
      if (headerValue) {
        checkData(headerValue, `header.${header}`);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// ========================================
// PROTECCIÓN DE ARCHIVOS
// ========================================

/**
 * Middleware para validar tipos de archivo permitidos
 */
export const fileTypeValidation = (allowedTypes: string[] = ['pdf', 'html', 'txt']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as any;
    
    if (!files) {
      return next();
    }

    const validateFile = (file: any) => {
      const extension = file.originalname.split('.').pop()?.toLowerCase();
      
      if (!extension || !allowedTypes.includes(extension)) {
        throw createError(
          `Tipo de archivo no permitido: ${extension}. Tipos permitidos: ${allowedTypes.join(', ')}`,
          400
        );
      }

      // Validar tamaño
      const maxSize = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024;
      if (file.size > maxSize) {
        throw createError(
          `Archivo demasiado grande. Tamaño máximo: ${Math.round(maxSize / 1024 / 1024)}MB`,
          400
        );
      }

      // Validar que no sea un ejecutable
      const dangerousExtensions = ['exe', 'bat', 'sh', 'cmd', 'scr', 'jar', 'app'];
      if (dangerousExtensions.includes(extension)) {
        throw createError('Tipo de archivo no permitido por seguridad', 400);
      }
    };

    try {
      if (Array.isArray(files)) {
        files.forEach(validateFile);
      } else {
        Object.values(files).forEach((fileList: any) => {
          if (Array.isArray(fileList)) {
            fileList.forEach(validateFile);
          } else {
            validateFile(fileList);
          }
        });
      }

      next();
    } catch (error) {
      logger.warn('Archivo rechazado por validación:', {
        error: (error as Error).message,
        ip: req.ip,
        userId: req.user?.id,
      });
      next(error);
    }
  };
};

// ========================================
// AUDIT TRAIL AUTOMÁTICO
// ========================================

/**
 * Middleware para crear audit trail automático
 */
export const auditTrail = (action: string, entityType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Solo crear audit si la operación fue exitosa
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Ejecutar de forma asíncrona para no bloquear response
        setImmediate(async () => {
          try {
            const { default: prisma } = await import('../config/database');
            
            if (req.user) {
              await prisma.auditLog.create({
                data: {
                  action,
                  entityType,
                  entityId: req.params.id || 'unknown',
                  newValues: {
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode,
                  },
                  userId: req.user.id,
                  userEmail: req.user.email,
                  tenantId: req.user.tenantId,
                  ipAddress: req.ip,
                  userAgent: req.get('User-Agent'),
                },
              });
            }
          } catch (auditError) {
            logger.error('Error creando audit log automático:', {
              error: (auditError as Error).message,
              action,
              entityType,
            });
          }
        });
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

// ========================================
// CONFIGURACIÓN DE CORS SEGURA
// ========================================

/**
 * Configuración de CORS basada en entorno
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Lista de orígenes permitidos basada en entorno
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ];

    // En desarrollo, permitir localhost
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
    }

    // Permitir requests sin origin (ej: Postman, apps móviles)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS origin bloqueado:', {
        origin,
        allowedOrigins: allowedOrigins.slice(0, 3), // No logear todos por seguridad
      });
      callback(new Error('No permitido por política CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
  maxAge: 86400, // 24 horas
};
