import IORedis, { RedisOptions } from 'ioredis';
import { logger } from './logger';

/**
 * Configuración Redis optimizada para Bull v3
 * Basada en las mejores prácticas para evitar errores de conexión
 */

// Configuración común para todas las conexiones Redis
export const redisCommon: RedisOptions = {
	host: process.env.REDIS_HOST || 'bot_automaticpdf-redis',
	port: Number(process.env.REDIS_PORT || 6379),
	password: process.env.REDIS_PASSWORD || 'hubspot',
	db: Number(process.env.REDIS_DB || 0),
	
	// IMPORTANTE para Bull v3:
	enableOfflineQueue: true,           // 👈 HABILITAR cola offline
	maxRetriesPerRequest: null,         // 👈 Recomendado para Bull (comandos bloqueantes)
	
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
 * Factory para crear colas Bull con configuración Redis correcta
 * Implementación exacta de la solución sugerida para Bull v3
 */
export const makeQueue = (name: string) => {
	const Bull = require('bull');
	const REDIS_URL = process.env.REDIS_URL;
	
	const bullOpts = {
		createClient(type: 'client' | 'subscriber' | 'bclient', opts?: RedisOptions) {
			logger.debug(`Creando cliente Redis tipo: ${type} para cola: ${name}`);
			
			// Conexión normal para comandos
			if (type === 'client') {
				const clientOpts = { ...(opts ?? {}), ...redisCommon };
				return REDIS_URL ? new IORedis(REDIS_URL, clientOpts) : new IORedis(clientOpts);
			}
			
			// Conexiones especiales: suscriptor y bloqueante
			// Bull v3 exige maxRetriesPerRequest: null y enableReadyCheck: false
			const specialOpts = {
				...redisCommon,
				...(opts ?? {}),
				maxRetriesPerRequest: null, // requerido por Bull para bclient/subscriber
				enableReadyCheck: false,    // desactiva readyCheck en estas conexiones
				// ¡OJO! No poner enableOfflineQueue: false aquí
			};
			
			return REDIS_URL ? new IORedis(REDIS_URL, specialOpts) : new IORedis(specialOpts);
		},
	};
	
	return new Bull(name, bullOpts);
};

export default redisCommon;
