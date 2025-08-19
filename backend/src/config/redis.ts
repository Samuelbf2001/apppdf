import IORedis, { RedisOptions } from 'ioredis';
import { logger } from './logger';

/**
 * Configuración Redis optimizada para Bull v4
 * Basada en las mejores prácticas para evitar errores de conexión
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
 * Bull v4 tiene una API diferente a v3
 */
export const makeQueue = (name: string) => {
	const Bull = require('bull');
	const REDIS_URL = process.env.REDIS_URL;
	
	// Configuración para Bull v4
	const bullOpts = {
		// Bull v4: usar redis directamente en lugar de createClient
		redis: REDIS_URL || redisCommon,
		
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
	};
	
	return new Bull(name, bullOpts);
};

export default redisCommon;
