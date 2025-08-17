import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

/**
 * Middleware para monitoreo y métricas de la aplicación
 */

interface RequestMetrics {
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  contentLength: number;
  userId?: string;
  tenantId?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
}

// Almacén en memoria para métricas (en producción usar Redis)
const metricsStore = {
  requests: [] as RequestMetrics[],
  errors: [] as any[],
  performance: [] as any[],
};

/**
 * Middleware principal de monitoreo
 */
export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Agregar ID de request para trazabilidad
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);

  // Override del método send para capturar métricas
  const originalSend = res.send;
  
  res.send = function(data) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Capturar métricas
    const metrics: RequestMetrics = {
      method: req.method,
      path: req.route?.path || req.path,
      statusCode: res.statusCode,
      responseTime,
      contentLength: Buffer.byteLength(data || ''),
      userId: req.user?.id,
      tenantId: req.user?.tenantId,
      ip: req.ip,
      userAgent: req.get('User-Agent') || '',
      timestamp: new Date(),
    };

    // Guardar métricas
    saveMetrics(metrics);

    // Logear requests lentos
    if (responseTime > 5000) { // > 5 segundos
      logger.warn('Request lento detectado:', {
        ...metrics,
        requestId,
      });
    }

    // Logear errores
    if (res.statusCode >= 400) {
      logger.warn('Request con error:', {
        ...metrics,
        requestId,
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Guardar métricas en el store
 */
function saveMetrics(metrics: RequestMetrics) {
  // Agregar a store con límite de tamaño
  metricsStore.requests.push(metrics);
  
  // Mantener solo las últimas 1000 requests
  if (metricsStore.requests.length > 1000) {
    metricsStore.requests.shift();
  }

  // En producción, enviar a servicio de métricas
  if (process.env.NODE_ENV === 'production') {
    // TODO: Enviar a New Relic, DataDog, etc.
    sendToMetricsService(metrics).catch(error => {
      logger.error('Error enviando métricas:', error);
    });
  }
}

/**
 * Generar ID único para request
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Enviar métricas a servicio externo
 */
async function sendToMetricsService(metrics: RequestMetrics): Promise<void> {
  // Implementar integración con servicio de métricas
  // Ejemplo: New Relic, DataDog, CloudWatch, etc.
  
  if (process.env.NEW_RELIC_LICENSE_KEY) {
    // Ejemplo de integración con New Relic
    try {
      // const newrelic = require('newrelic');
      // newrelic.recordMetric('Custom/Request/ResponseTime', metrics.responseTime);
      // newrelic.recordMetric('Custom/Request/Count', 1);
    } catch (error) {
      // Ignorar errores de métricas para no afectar la aplicación
    }
  }
}

/**
 * Middleware para capturar errores de aplicación
 */
export const errorMetricsMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorInfo = {
    error: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    method: req.method,
    path: req.path,
    userId: req.user?.id,
    tenantId: req.user?.tenantId,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date(),
    requestId: req.headers['x-request-id'],
  };

  // Guardar error en store
  metricsStore.errors.push(errorInfo);
  
  // Mantener solo los últimos 500 errores
  if (metricsStore.errors.length > 500) {
    metricsStore.errors.shift();
  }

  // Logear error crítico
  if (err.statusCode >= 500) {
    logger.error('Error crítico de aplicación:', errorInfo);
  }

  // En producción, enviar a Sentry o servicio de error tracking
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    try {
      // const Sentry = require('@sentry/node');
      // Sentry.captureException(err, {
      //   user: req.user ? { id: req.user.id, email: req.user.email } : undefined,
      //   tags: { tenantId: req.user?.tenantId },
      //   extra: errorInfo,
      // });
    } catch (sentryError) {
      logger.error('Error enviando a Sentry:', sentryError);
    }
  }

  next(err);
};

/**
 * Endpoint para obtener métricas (solo en desarrollo)
 */
export const getMetrics = (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Endpoint no disponible en producción' });
  }

  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);

  // Filtrar métricas de la última hora
  const recentRequests = metricsStore.requests.filter(
    m => m.timestamp.getTime() > oneHourAgo
  );

  const recentErrors = metricsStore.errors.filter(
    e => e.timestamp.getTime() > oneHourAgo
  );

  // Calcular estadísticas
  const stats = {
    requests: {
      total: recentRequests.length,
      byMethod: groupBy(recentRequests, 'method'),
      byStatus: groupBy(recentRequests, 'statusCode'),
      avgResponseTime: recentRequests.length > 0 
        ? Math.round(recentRequests.reduce((sum, r) => sum + r.responseTime, 0) / recentRequests.length)
        : 0,
      slowRequests: recentRequests.filter(r => r.responseTime > 1000).length,
    },
    errors: {
      total: recentErrors.length,
      byStatusCode: groupBy(recentErrors, 'statusCode'),
      recent: recentErrors.slice(-10),
    },
    performance: {
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      nodeVersion: process.version,
    },
    timestamp: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: stats,
    message: 'Métricas de la última hora',
  });
};

/**
 * Función helper para agrupar arrays
 */
function groupBy(array: any[], key: string): Record<string, number> {
  return array.reduce((groups, item) => {
    const groupKey = item[key]?.toString() || 'unknown';
    groups[groupKey] = (groups[groupKey] || 0) + 1;
    return groups;
  }, {});
}

/**
 * Middleware para limpiar métricas periódicamente
 */
export const cleanupMetrics = () => {
  setInterval(() => {
    const now = Date.now();
    const sixHoursAgo = now - (6 * 60 * 60 * 1000);

    // Limpiar requests antiguos
    metricsStore.requests = metricsStore.requests.filter(
      m => m.timestamp.getTime() > sixHoursAgo
    );

    // Limpiar errores antiguos
    metricsStore.errors = metricsStore.errors.filter(
      e => e.timestamp.getTime() > sixHoursAgo
    );

    logger.debug('Métricas limpiadas', {
      remainingRequests: metricsStore.requests.length,
      remainingErrors: metricsStore.errors.length,
    });
  }, 60 * 60 * 1000); // Cada hora
};
