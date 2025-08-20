import IORedis, { RedisOptions } from 'ioredis';
import { logger } from './logger';

/**
 * CONFIGURACIÓN REDIS ULTRA MÍNIMA para Bull v4
 * Sin maxRetriesPerRequest, sin enableReadyCheck
 * Solo lo ABSOLUTAMENTE básico
 */

// Configuración Redis ULTRA MÍNIMA
const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'bot_automaticpdf-redis',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || 'hubspot',
  db: Number(process.env.REDIS_DB || 0),
  
  // SOLO las opciones ULTRA básicas
  enableOfflineQueue: true,
  
  // NO incluir maxRetriesPerRequest ni enableReadyCheck
  // NO incluir retryStrategy compleja
};

/**
 * Factory ULTRA SIMPLE para crear colas Bull
 * Configuración mínima absoluta
 */
export const makeQueue = (name: string) => {
  const Bull = require('bull');
  
  // Configuración ULTRA MÍNIMA para Bull v4
  const queueConfig = {
    // Pasar configuración Redis ULTRA simple
    redis: redisConfig,
    
    // Configuración básica de jobs
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
    },
  };
  
  logger.info(`Creando cola ultra simple: ${name}`);
  return new Bull(name, queueConfig);
};

/**
 * Test de conexión Redis ultra simple
 */
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    const client = new IORedis(redisConfig);
    await client.ping();
    await client.disconnect();
    logger.info('✅ Redis: conexión ultra simple exitosa');
    return true;
  } catch (error) {
    logger.error('❌ Redis: error de conexión:', error);
    return false;
  }
};

/**
 * Cliente Redis ultra simple para uso directo
 */
export const createRedisClient = (): IORedis => {
  return new IORedis(redisConfig);
};

export default redisConfig;
