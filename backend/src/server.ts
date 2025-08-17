import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';

import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { serveProtectedFile, servePublicFile } from './middleware/fileServer';
import { fileStorageService } from './services/fileStorage';
import { workerManager } from './workers';

// Middleware de seguridad
import {
  generalRateLimit,
  authRateLimit,
  securityHeaders,
  sanitizeInput,
  validateRequestSize,
  attackProtection,
  securityEventLogger,
  corsOptions,
} from './middleware/security';

import {
  monitoringMiddleware,
  errorMetricsMiddleware,
  getMetrics,
  cleanupMetrics,
} from './middleware/monitoring';

// Importar rutas
import authRoutes from './routes/auth';
import templateRoutes from './routes/templates';
import documentRoutes from './routes/documents';
import hubspotRoutes from './routes/hubspot';
import queueRoutes from './routes/queue';
import workflowActionsRoutes from './routes/workflowActions';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// Puerto del servidor
const PORT = process.env.APP_PORT || 3001;

// ========================================
// MIDDLEWARE DE SEGURIDAD Y CONFIGURACIÓN
// ========================================

// Trust proxy para obtener IPs reales detrás de proxies
app.set('trust proxy', 1);

// Headers de seguridad avanzados
app.use(securityHeaders);

// CORS configurado por entorno
app.use(cors(corsOptions));

// Protección contra ataques
app.use(attackProtection);

// Validación de tamaño de requests
app.use(validateRequestSize);

// Sanitización de inputs
app.use(sanitizeInput);

// Compresión gzip
app.use(compression());

// Parsers con límites configurables
app.use(express.json({ 
  limit: process.env.MAX_JSON_SIZE || '10mb',
  strict: true,
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_URL_ENCODED_SIZE || '10mb',
}));

// Rate limiting general
app.use(generalRateLimit);

// Monitoreo de requests
app.use(monitoringMiddleware);

// Logging de eventos de seguridad
app.use(securityEventLogger);

// Logging de requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Inicializar servicios
const initializeServices = async () => {
  try {
    await fileStorageService.initializeStorage();
    await workerManager.start();
    
    // Inicializar limpieza de métricas
    cleanupMetrics();
    
    logger.info('Todos los servicios inicializados correctamente');
  } catch (error) {
    logger.error('Error inicializando servicios:', error);
  }
};

initializeServices();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Rutas para servir archivos
app.use('/files/*', authMiddleware, serveProtectedFile);
app.use('/public/*', servePublicFile);

// Rutas de la API con rate limiting específico
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/templates', authMiddleware, templateRoutes);
app.use('/api/documents', authMiddleware, documentRoutes);
app.use('/api/hubspot', authMiddleware, hubspotRoutes);
app.use('/api/queue', queueRoutes);

// Rutas para workflow actions de HubSpot (sin rate limiting estricto)
app.use('/api/hubspot/workflow-actions', workflowActionsRoutes);

// Endpoint de métricas (solo desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/metrics', authMiddleware, getMetrics);
}

// Ruta para manejar endpoints no encontrados
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.originalUrl} no existe en esta API`,
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorMetricsMiddleware);
app.use(errorHandler);

// Iniciar servidor
const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor iniciado en puerto ${PORT}`);
  logger.info(`🌟 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📝 API disponible en http://localhost:${PORT}`);
});

// Manejo graceful de cierre del servidor
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor HTTP...');
  server.close(() => {
    logger.info('Servidor HTTP cerrado.');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor HTTP...');
  server.close(() => {
    logger.info('Servidor HTTP cerrado.');
  });
});

export default app;
