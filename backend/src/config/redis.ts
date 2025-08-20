import IORedis, { RedisOptions } from 'ioredis';
import { logger } from './logger';

/**
 * CONFIGURACIÓN REDIS CORREGIDA para Bull v4
 * SOLUCIÓN DEFINITIVA: sobrescribir valores por defecto de ioredis v5
 */

// Configuración Redis CORREGIDA
const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'bot_automaticpdf-redis',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || 'hubspot',
  db: Number(process.env.REDIS_DB || 0),
  
  // 🔴 CRÍTICO: Sobrescribir valor por defecto de ioredis v5
  maxRetriesPerRequest: null,
  
  // 🔴 CRÍTICO: Asegurar que Bull v4 no use enableReadyCheck
  enableReadyCheck: false,
  
  // Opción básica permitida
  enableOfflineQueue: true,
};

/**
 * Factory CORREGIDO para crear colas Bull
 * Configuración que respeta las limitaciones de Bull v4
 */
export const makeQueue = (name: string) => {
  const Bull = require('bull');
  
  // Configuración CORREGIDA para Bull v4
  const queueConfig = {
    // Pasar configuración Redis CORREGIDA
    redis: redisConfig,
    
    // Configuración básica de jobs
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
    },
  };
  
  logger.info(`Creando cola CORREGIDA: ${name}`);
  return new Bull(name, queueConfig);
};

/**
 * Test de conexión Redis CORREGIDO
 */
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    const client = new IORedis(redisConfig);
    await client.ping();
    await client.disconnect();
    logger.info('✅ Redis: conexión CORREGIDA exitosa');
    return true;
  } catch (error) {
    logger.error('❌ Redis: error de conexión:', error);
    return false;
  }
};

/**
 * Cliente Redis CORREGIDO para uso directo
 */
export const createRedisClient = (): IORedis => {
  return new IORedis(redisConfig);
};

export default redisConfig;
