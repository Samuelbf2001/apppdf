import IORedis, { RedisOptions } from 'ioredis';
import { logger } from './logger';

/**
 * CONFIGURACIÓN REDIS ROBUSTA para Bull v4
 * SOLUCIÓN COMPLETA: reconexión automática + health checks + manejo de conexiones cerradas
 * LOGGING ROBUSTO: diagnóstico completo de problemas de conexión
 */

// 🔴 CRÍTICO: Logging detallado para diagnóstico
logger.info('🔧 Inicializando configuración Redis ROBUSTA...');

// Configuración Redis ROBUSTA
const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'bot_automaticpdf-redis',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || 'hubspot',
  db: Number(process.env.REDIS_DB || 0),
  
  // 🔴 CRÍTICO: Sobrescribir valores por defecto de ioredis v5
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  
  // 🔴 CRÍTICO: Reconexión automática robusta
  retryDelayOnFailover: 100,
  lazyConnect: false,
  
  // 🔴 CRÍTICO: Manejo de conexiones cerradas
  enableOfflineQueue: true,
  enableAutoPipelining: false,
  
  // 🔴 CRÍTICO: Timeouts robustos
  connectTimeout: 10000,
  commandTimeout: 5000,
  
  // 🔴 CRÍTICO: Estrategia de reconexión personalizada con logging
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 100, 3000);
    logger.warn(`🔄 Redis reconnect attempt ${times}, delay: ${delay}ms`, {
      attempt: times,
      delay,
      timestamp: new Date().toISOString(),
      host: process.env.REDIS_HOST || 'bot_automaticpdf-redis',
      port: process.env.REDIS_PORT || 6379,
    });
    return delay;
  },
  
  // 🔴 CRÍTICO: Manejo de eventos de conexión con logging detallado
  reconnectOnError: (err: Error) => {
    logger.warn('🔄 Redis reconnectOnError triggered:', {
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
      host: process.env.REDIS_HOST || 'bot_automaticpdf-redis',
    });
    
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      logger.warn('Redis en modo READONLY, reconectando...');
      return true;
    }
    return false;
  },
};

// 🔴 CRÍTICO: Logging de configuración aplicada
logger.info('🔧 Configuración Redis ROBUSTA aplicada:', {
  host: redisConfig.host,
  port: redisConfig.port,
  password: redisConfig.password ? '***' : 'none',
  db: redisConfig.db,
  maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
  enableReadyCheck: redisConfig.enableReadyCheck,
  enableOfflineQueue: redisConfig.enableOfflineQueue,
  connectTimeout: redisConfig.connectTimeout,
  commandTimeout: redisConfig.commandTimeout,
  retryDelayOnFailover: redisConfig.retryDelayOnFailover,
  lazyConnect: redisConfig.lazyConnect,
  enableAutoPipelining: redisConfig.enableAutoPipelining,
});

/**
 * Factory ROBUSTO para crear colas Bull con manejo de reconexión y logging detallado
 */
export const makeQueue = (name: string) => {
  const Bull = require('bull');
  
  logger.info(`🔧 Creando cola ROBUSTA: ${name}`, {
    queueName: name,
    timestamp: new Date().toISOString(),
    redisConfig: {
      host: redisConfig.host,
      port: redisConfig.port,
      db: redisConfig.db,
    }
  });
  
  // Configuración ROBUSTA para Bull v4
  const queueConfig = {
    // Pasar configuración Redis ROBUSTA
    redis: redisConfig,
    
    // Configuración de jobs robusta
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
    
    // Configuración de limpieza robusta
    settings: {
      lockDuration: 30000,
      stalledInterval: 30000,
      maxStalledCount: 1,
    },
  };
  
  const queue = new Bull(name, queueConfig);
  
  // 🔴 CRÍTICO: Manejo de eventos de conexión para cada cola con logging detallado
  queue.on('error', (error: Error) => {
    logger.error(`❌ Error en cola ${name}:`, {
      queueName: name,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      redisHost: redisConfig.host,
      redisPort: redisConfig.port,
    });
  });
  
  queue.on('waiting', (jobId: string) => {
    logger.debug(`⏳ Job ${jobId} esperando en cola ${name}`, {
      queueName: name,
      jobId,
      timestamp: new Date().toISOString(),
    });
  });
  
  queue.on('active', (job: any) => {
    logger.debug(`🔄 Job ${job.id} activo en cola ${name}`, {
      queueName: name,
      jobId: job.id,
      timestamp: new Date().toISOString(),
    });
  });
  
  queue.on('completed', (job: any, result: any) => {
    logger.info(`✅ Job ${job.id} completado en cola ${name}`, {
      queueName: name,
      jobId: job.id,
      result,
      timestamp: new Date().toISOString(),
    });
  });
  
  queue.on('failed', (job: any, error: Error) => {
    logger.error(`💥 Job ${job.id} falló en cola ${name}:`, {
      queueName: name,
      jobId: job.id,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  });
  
  // 🔴 CRÍTICO: Eventos adicionales para diagnóstico
  queue.on('stalled', (job: any) => {
    logger.warn(`⚠️ Job ${job.id} bloqueado en cola ${name}`, {
      queueName: name,
      jobId: job.id,
      timestamp: new Date().toISOString(),
    });
  });
  
  queue.on('delayed', (job: any) => {
    logger.debug(`⏰ Job ${job.id} retrasado en cola ${name}`, {
      queueName: name,
      jobId: job.id,
      timestamp: new Date().toISOString(),
    });
  });
  
  logger.info(`✅ Cola ROBUSTA ${name} creada exitosamente`, {
    queueName: name,
    timestamp: new Date().toISOString(),
  });
  
  return queue;
};

/**
 * Test de conexión Redis ROBUSTO con logging detallado
 */
export const testRedisConnection = async (): Promise<boolean> => {
  logger.info('🔍 Iniciando test de conexión Redis ROBUSTA...', {
    timestamp: new Date().toISOString(),
    host: redisConfig.host,
    port: redisConfig.port,
    db: redisConfig.db,
  });
  
  try {
    const client = new IORedis(redisConfig);
    
    // 🔴 CRÍTICO: Logging de eventos de conexión del cliente de prueba
    client.on('connect', () => {
      logger.info('🔗 Redis test client: conectando...', {
        timestamp: new Date().toISOString(),
        host: redisConfig.host,
        port: redisConfig.port,
      });
    });
    
    client.on('ready', () => {
      logger.info('✅ Redis test client: listo y operativo', {
        timestamp: new Date().toISOString(),
        host: redisConfig.host,
        port: redisConfig.port,
      });
    });
    
    client.on('error', (error: Error) => {
      logger.error('❌ Redis test client: error de conexión', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        host: redisConfig.host,
        port: redisConfig.port,
      });
    });
    
    client.on('close', () => {
      logger.warn('🔴 Redis test client: conexión cerrada', {
        timestamp: new Date().toISOString(),
        host: redisConfig.host,
        port: redisConfig.port,
      });
    });
    
    client.on('reconnecting', () => {
      logger.info('🔄 Redis test client: reconectando...', {
        timestamp: new Date().toISOString(),
        host: redisConfig.host,
        port: redisConfig.port,
      });
    });
    
    // 🔴 CRÍTICO: Esperar a que la conexión esté lista
    logger.info('⏳ Esperando conexión Redis...');
    await client.ping();
    logger.info('✅ PING exitoso');
    
    // 🔴 CRÍTICO: Verificar que la conexión esté activa
    if (client.status !== 'ready') {
      throw new Error(`Redis no está listo, status: ${client.status}`);
    }
    logger.info('✅ Status Redis:', client.status);
    
    // 🔴 CRÍTICO: Test de operaciones básicas
    logger.info('🧪 Probando operaciones básicas...');
    await client.set('test:connection', 'test-value');
    const testValue = await client.get('test:connection');
    await client.del('test:connection');
    logger.info('✅ Operaciones básicas exitosas');
    
    await client.disconnect();
    logger.info('✅ Redis: conexión ROBUSTA exitosa', {
      timestamp: new Date().toISOString(),
      host: redisConfig.host,
      port: redisConfig.port,
      status: 'disconnected',
    });
    return true;
    
  } catch (error) {
    logger.error('❌ Redis: error de conexión', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      host: redisConfig.host,
      port: redisConfig.port,
      db: redisConfig.db,
    });
    return false;
  }
};

/**
 * Cliente Redis ROBUSTO para uso directo con logging detallado
 */
export const createRedisClient = (): IORedis => {
  logger.info('🔧 Creando cliente Redis ROBUSTO...', {
    timestamp: new Date().toISOString(),
    host: redisConfig.host,
    port: redisConfig.port,
  });
  
  const client = new IORedis(redisConfig);
  
  // 🔴 CRÍTICO: Manejo de eventos de conexión con logging detallado
  client.on('connect', () => {
    logger.info('🔗 Redis: conectando...', {
      timestamp: new Date().toISOString(),
      host: redisConfig.host,
      port: redisConfig.port,
    });
  });
  
  client.on('ready', () => {
    logger.info('✅ Redis: listo y operativo', {
      timestamp: new Date().toISOString(),
      host: redisConfig.host,
      port: redisConfig.port,
      status: client.status,
    });
  });
  
  client.on('error', (error: Error) => {
    logger.error('❌ Redis: error de conexión', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      host: redisConfig.host,
      port: redisConfig.port,
      status: client.status,
    });
  });
  
  client.on('close', () => {
    logger.warn('🔴 Redis: conexión cerrada', {
      timestamp: new Date().toISOString(),
      host: redisConfig.host,
      port: redisConfig.port,
      status: client.status,
    });
  });
  
  client.on('reconnecting', () => {
    logger.info('🔄 Redis: reconectando...', {
      timestamp: new Date().toISOString(),
      host: redisConfig.host,
      port: redisConfig.port,
      status: client.status,
    });
  });
  
  client.on('end', () => {
    logger.info('🏁 Redis: conexión terminada', {
      timestamp: new Date().toISOString(),
      host: redisConfig.host,
      port: redisConfig.port,
    });
  });
  
  logger.info('✅ Cliente Redis ROBUSTO creado exitosamente', {
    timestamp: new Date().toISOString(),
    host: redisConfig.host,
    port: redisConfig.port,
  });
  
  return client;
};

export default redisConfig;
