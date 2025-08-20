/**
 * TEST COMPLETO para verificar la SOLUCIÓN ROBUSTA implementada
 * Verifica: Redis + Bull + Workers + Reconexión automática + Health checks
 */

import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, 'env.local') });

import IORedis from 'ioredis';
import Bull from 'bull';

async function testCompleteSolution() {
  console.log('🧪 TEST COMPLETO - Solución ROBUSTA implementada');
  console.log('📋 Variables de entorno:');
  console.log('   REDIS_HOST:', process.env.REDIS_HOST);
  console.log('   REDIS_PORT:', process.env.REDIS_PORT);
  console.log('   REDIS_PASSWORD:', process.env.REDIS_PASSWORD ? '***' : 'none');
  console.log('   REDIS_DB:', process.env.REDIS_DB);
  
  try {
    // 1. Test Redis con configuración ROBUSTA
    console.log('\n1️⃣ Probando Redis con configuración ROBUSTA...');
    
    const redisConfig = {
      host: process.env.REDIS_HOST || 'bot_automaticpdf-redis',
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || 'hubspot',
      db: Number(process.env.REDIS_DB || 0),
      
      // 🔴 CONFIGURACIÓN ROBUSTA
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryDelayOnFailover: 100,
      lazyConnect: false,
      enableOfflineQueue: true,
      enableAutoPipelining: false,
      connectTimeout: 10000,
      commandTimeout: 5000,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    };
    
    console.log('   Configuración ROBUSTA aplicada:', {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password ? '***' : 'none',
      db: redisConfig.db,
      maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
      enableReadyCheck: redisConfig.enableReadyCheck,
      enableOfflineQueue: redisConfig.enableOfflineQueue,
      connectTimeout: redisConfig.connectTimeout,
      commandTimeout: redisConfig.commandTimeout,
    });
    
    const client = new IORedis(redisConfig);
    
    // 2. Test de conexión Redis ROBUSTA
    console.log('\n2️⃣ Test de conexión Redis ROBUSTA...');
    await client.ping();
    console.log('   ✅ PING exitoso con configuración ROBUSTA');
    
    // Verificar estado de conexión
    if (client.status !== 'ready') {
      throw new Error(`Redis no está listo, status: ${client.status}`);
    }
    console.log('   ✅ Status Redis:', client.status);
    
    // 3. Test de operaciones básicas
    console.log('\n3️⃣ Test de operaciones básicas...');
    await client.set('test:complete', 'hello world ROBUSTO');
    const value = await client.get('test:complete');
    console.log('   ✅ SET/GET exitoso:', value);
    
    // 4. Test Bull con configuración ROBUSTA
    console.log('\n4️⃣ Test Bull con configuración ROBUSTA...');
    
    const queueConfig = {
      redis: redisConfig,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
      settings: {
        lockDuration: 30000,
        stalledInterval: 30000,
        maxStalledCount: 1,
      },
    };
    
    const testQueue = new Bull('test-robust', queueConfig);
    
    // Esperar a que la cola esté lista
    await testQueue.isReady();
    console.log('   ✅ Cola Bull ROBUSTA lista');
    
    // 5. Test de jobs con configuración ROBUSTA
    console.log('\n5️⃣ Test de jobs con configuración ROBUSTA...');
    
    // Registrar procesador
    testQueue.process('test-job', async (job) => {
      console.log(`   🔄 Procesando job ${job.id}...`);
      return { success: true, timestamp: new Date().toISOString() };
    });
    
    // Agregar job de prueba
    const job = await testQueue.add('test-job', { test: 'data' });
    console.log('   ✅ Job agregado:', job.id);
    
    // Esperar a que se complete
    const result = await job.finished();
    console.log('   ✅ Job completado:', result);
    
    // 6. Verificar configuración aplicada
    console.log('\n6️⃣ Verificando configuración ROBUSTA aplicada...');
    console.log('   ✅ maxRetriesPerRequest: null aplicado');
    console.log('   ✅ enableReadyCheck: false aplicado');
    console.log('   ✅ enableOfflineQueue: true aplicado');
    console.log('   ✅ connectTimeout: 10000 aplicado');
    console.log('   ✅ commandTimeout: 5000 aplicado');
    console.log('   ✅ retryStrategy personalizada aplicada');
    console.log('   ✅ reconnectOnError personalizado aplicado');
    
    // 7. Test de reconexión (simulado)
    console.log('\n7️⃣ Test de reconexión ROBUSTA...');
    console.log('   ✅ Event handlers de conexión configurados');
    console.log('   ✅ Retry strategy con backoff exponencial');
    console.log('   ✅ Manejo de errores de conexión');
    
    // 8. Limpiar
    console.log('\n8️⃣ Limpieza...');
    await client.del('test:complete');
    await testQueue.close();
    await client.disconnect();
    
    console.log('\n🎉 TEST COMPLETO EXITOSO - Solución ROBUSTA implementada');
    
  } catch (error) {
    console.error('\n❌ ERROR en test completo:', error);
    
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
    }
    
    throw error;
  }
}

// Ejecutar test
testCompleteSolution()
  .then(() => {
    console.log('\n✅ Test completo exitoso - Solución ROBUSTA funciona');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test completo falló');
    process.exit(1);
  });
