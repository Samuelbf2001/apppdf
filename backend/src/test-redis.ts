/**
 * Smoke test rápido para validar conectividad Redis y colas Bull
 * Basado en la guía de solución para Bull v3
 */

import IORedis from 'ioredis';
import { makeQueue } from './config/redis';
import { logger } from './config/logger';

async function testRedisConnection() {
  logger.info('🧪 Iniciando smoke test de Redis y Bull...');
  
  try {
    // 1. Test de conexión Redis directa
    logger.info('1️⃣ Probando conexión Redis directa...');
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      const r = new IORedis(redisUrl);
      await r.ping();
      logger.info('✅ Redis directo: PING exitoso');
      await r.disconnect();
    } else {
      logger.warn('⚠️ REDIS_URL no configurado, usando configuración por defecto');
    }
    
    // 2. Test de cola Bull
    logger.info('2️⃣ Probando creación de cola Bull...');
    const testQueue = makeQueue('test-queue');
    
    // 3. Test de procesador
    logger.info('3️⃣ Probando procesador de cola...');
    testQueue.process(async (job) => {
      logger.info(`🔄 Procesando job ${job.id}:`, job.data);
      return { ok: true, id: job.id, timestamp: new Date().toISOString() };
    });
    
    // 4. Test de agregar job
    logger.info('4️⃣ Probando agregar job a la cola...');
    const job = await testQueue.add({ hello: 'world', test: true });
    logger.info(`✅ Job agregado: ${job.id}`);
    
    // 5. Esperar procesamiento
    logger.info('5️⃣ Esperando procesamiento del job...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 6. Verificar estado
    const jobStatus = await testQueue.getJob(job.id);
    if (jobStatus) {
      const state = await jobStatus.getState();
      logger.info(`📊 Estado del job: ${state}`);
    }
    
    // 7. Limpiar
    await testQueue.close();
    logger.info('✅ Smoke test completado exitosamente');
    
  } catch (error) {
    logger.error('❌ Error en smoke test:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testRedisConnection()
    .then(() => {
      logger.info('🎉 Todos los tests pasaron');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Tests fallaron:', error);
      process.exit(1);
    });
}

export { testRedisConnection };
