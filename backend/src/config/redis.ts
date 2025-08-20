import IORedis, { RedisOptions } from 'ioredis';
import { logger } from './logger';

/**
 * Configuración Redis optimizada para Bull v4
 * SOLUCIÓN DEFINITIVA: usar solo configuración redis directa
 */

// Configuración común para todas las conexiones Redis
export const redisCommon: RedisOptions = {
	host: process.env.REDIS_HOST || 'bot_automaticpdf-redis',
	port: Number(process.env.REDIS_PORT || 6379),
	password: process.env.REDIS_PASSWORD || 'hubspot',
	db: Number(process.env.REDIS_DB || 0),
	
	// IMPORTANTE para Bull v4:
	enableOfflineQueue: true,           // 👈 HABILITAR cola offline
	
	// Configuración de reconexión
	retryStrategy: (times: number) => {
		const delay = Math.min(times * 50, 2000);
		logger.warn(`Reintentando conexión Redis (intento ${times})...`);
		return delay;
	},
	
	// TLS si es necesario (para proveedores como Upstash, ElastiCache)
	...(process.env.REDIS_TLS === 'true' ? { 
		tls: { rejectUnauthorized: false } 
	} : {}),
	
	// Logging para debugging
	lazyConnect: false, // Conectar inmediatamente para verificar
};

/**
 * Crear cliente Redis de prueba para verificar conectividad
 */
export const createTestRedisClient = (): IORedis => {
	const url = process.env.REDIS_URL;
	return url ? new IORedis(url) : new IORedis(redisCommon);
};

/**
 * Verificar conexión Redis
 */
export const testRedisConnection = async (): Promise<boolean> => {
	const client = createTestRedisClient();
	
	try {
		await client.ping();
		logger.info('✅ Conexión Redis verificada exitosamente');
		return true;
	} catch (error) {
		logger.error('❌ Error verificando conexión Redis:', error);
		return false;
	} finally {
		await client.disconnect();
	}
};

/**
 * Factory para crear colas Bull v4 con configuración Redis correcta
 * SOLUCIÓN DEFINITIVA: NO usar createClient, solo configuración redis directa
 */
export const makeQueue = (name: string) => {
	const Bull = require('bull');
	const REDIS_URL = process.env.REDIS_URL;
	
	// SOLUCIÓN DEFINITIVA: Configuración Redis limpia para Bull v4
	let redisConfig: RedisOptions;
	
	if (REDIS_URL) {
		// Usar REDIS_URL con configuración mínima
		redisConfig = {
			// Solo las opciones que Bull v4 permite
			enableOfflineQueue: true,
			// NO incluir maxRetriesPerRequest ni enableReadyCheck
		};
	} else {
		// Usar configuración por defecto limpia
		redisConfig = {
			...redisCommon,
			// NO incluir maxRetriesPerRequest ni enableReadyCheck
		};
	}
	
	// Configuración para Bull v4 - SOLO redis, NO createClient
	const bullOpts = {
		// Pasar configuración Redis limpia
		redis: REDIS_URL || redisConfig,
		
		// Configuración de jobs
		defaultJobOptions: {
			removeOnComplete: 50,
			removeOnFail: 100,
			attempts: 3,
			backoff: {
				type: 'exponential',
				delay: 2000,
			},
		},
		
		// Configuración de limpieza
		settings: {
			lockDuration: 30000,
			stalledInterval: 30000,
			maxStalledCount: 1,
		},
		
		// IMPORTANTE: NO usar createClient - dejar que Bull v4 maneje internamente
	};
	
	return new Bull(name, bullOpts);
};

export default redisCommon;
