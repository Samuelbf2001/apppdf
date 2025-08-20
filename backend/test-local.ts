/**
 * Script de testing local para Redis y Bull
 * Ejecutar con: npx ts-node test-local.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno locales
dotenv.config({ path: path.join(__dirname, 'env.local') });

import IORedis from 'ioredis';
import { makeQueue } from './src/config/redis';

async function testLocalSetup() {
  console.log('🧪 Iniciando test local de Redis y Bull...');
  console.log('📋 Variables de entorno:');
  console.log('   REDIS_URL:', process.env.REDIS_URL);
  console.log('   REDIS_HOST:', process.env.REDIS_HOST);
  console.log('   REDIS_PORT:', process.env.REDIS_PORT);
  console.log('   NODE_ENV:', process.env.NODE_ENV);
  
  try {
    // 1. Test de conexión Redis directa
    console.log('\n1️⃣ Probando conexión Redis directa...');
    const redisUrl = process.env.REDIS_URL;
    
    if (redisUrl) {
      console.log('   Usando REDIS_URL:', redisUrl);
      const r = new IORedis(redisUrl);
      await r.ping();
      console.log('   ✅ Redis directo: PING exitoso');
      await r.disconnect();
    } else {
      console.log('   ⚠️ REDIS_URL no configurado, usando configuración por defecto');
      const r = new IORedis({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
        password: process.env.REDIS_PASSWORD || undefined,
        db: Number(process.env.REDIS_DB || 0),
      });
      await r.ping();
      console.log('   ✅ Redis por defecto: PING exitoso');
      await r.disconnect();
    }
    
    // 2. Test de creación de cola Bull
    console.log('\n2️⃣ Probando creación de cola Bull...');
    const testQueue = makeQueue('test-local-queue');
    console.log('   ✅ Cola Bull creada exitosamente');
    
    // 3. Test de procesador
    console.log('\n3️⃣ Probando procesador de cola...');
    testQueue.process(async (job) => {
      console.log(`   🔄 Procesando job ${job.id}:`, job.data);
      return { ok: true, id: job.id, timestamp: new Date().toISOString() };
    });
    console.log('   ✅ Procesador registrado exitosamente');
    
    // 4. Test de agregar job
    console.log('\n4️⃣ Probando agregar job a la cola...');
    const job = await testQueue.add({ hello: 'local', test: true });
    console.log(`   ✅ Job agregado: ${job.id}`);
    
    // 5. Esperar procesamiento
    console.log('\n5️⃣ Esperando procesamiento del job...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 6. Verificar estado
    const jobStatus = await testQueue.getJob(job.id);
    if (jobStatus) {
      const state = await jobStatus.getState();
      console.log(`   📊 Estado del job: ${state}`);
    }
    
    // 7. Limpiar
    await testQueue.close();
    console.log('\n✅ Test local completado exitosamente');
    
  } catch (error) {
    console.error('\n❌ Error en test local:', error);
    
    // Mostrar detalles del error
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
    }
    
    throw error;
  }
}

// Ejecutar test
testLocalSetup()
  .then(() => {
    console.log('\n🎉 Todos los tests locales pasaron');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Tests locales fallaron:', error);
    process.exit(1);
  });
