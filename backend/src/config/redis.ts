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
 * Esto asegura que TODAS las conexiones de Bull usen la configuración correcta
 */
export const makeQueue = (name: string) => {
	const Bull = require('bull');
	const REDIS_URL = process.env.REDIS_URL;
	
	return new Bull(name, {
		// Forzamos a Bull a usar nuestras opciones en TODAS sus conexiones
		createClient: (type: 'client' | 'subscriber' | 'bclient', opts?: RedisOptions) => {
			logger.debug(`Creando cliente Redis tipo: ${type} para cola: ${name}`);

			// Merge base + opts que Bull provee
			const base: RedisOptions = { ...(redisCommon as any) };
			const merged: RedisOptions = { ...(opts ?? {}), ...base };

			if (type === 'subscriber' || type === 'bclient') {
				// Bull v3: NO permitir estas claves en conexiones especiales
				const { enableReadyCheck, maxRetriesPerRequest, ...cleaned } = (merged as any);
				return REDIS_URL ? new IORedis(REDIS_URL, cleaned) : new IORedis(cleaned);
			}

			// Para 'client' usamos configuración completa
			return REDIS_URL ? new IORedis(REDIS_URL, merged) : new IORedis(merged);
		}
	});
};

export default redisCommon;
