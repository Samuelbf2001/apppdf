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
 * SOLUCIÓN DEFINITIVA: sobrescribir completamente la configuración interna
 */
export const makeQueue = (name: string) => {
	const Bull = require('bull');
	const REDIS_URL = process.env.REDIS_URL;
	
	// SOLUCIÓN DEFINITIVA: Crear cliente Redis personalizado ANTES de Bull
	let redisClient: IORedis;
	
	if (REDIS_URL) {
		// Usar REDIS_URL con configuración personalizada
		redisClient = new IORedis(REDIS_URL, {
			enableOfflineQueue: true,
			maxRetriesPerRequest: null,  // Solo para conexiones principales
			retryStrategy: (times: number) => Math.min(times * 50, 2000),
		});
	} else {
		// Usar configuración por defecto personalizada
		redisClient = new IORedis({
			...redisCommon,
			maxRetriesPerRequest: null,  // Solo para conexiones principales
		});
	}
	
	// Configuración para Bull v4 que sobrescribe internamente
	const bullOpts = {
		// Pasar el cliente Redis personalizado
		redis: redisClient,
		
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
		
		// IMPORTANTE: Configuración que sobrescribe internamente
		createClient: (type: 'client' | 'subscriber' | 'bclient') => {
			logger.debug(`Creando cliente Redis tipo: ${type} para cola: ${name}`);
			
			// Para TODOS los tipos, usar configuración limpia
			const cleanConfig: RedisOptions = {
				host: redisClient.options.host,
				port: redisClient.options.port,
				password: redisClient.options.password,
				db: redisClient.options.db,
				enableOfflineQueue: true,
				// NO incluir maxRetriesPerRequest ni enableReadyCheck
			};
			
			return new IORedis(cleanConfig);
		},
	};
	
	return new Bull(name, bullOpts);
};

export default redisCommon;
