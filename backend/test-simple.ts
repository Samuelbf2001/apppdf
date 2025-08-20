/**
 * TEST ULTRA SIMPLE para verificar configuración Redis básica
 * Sin Bull, solo Redis puro
 */

import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, 'env.local') });

import IORedis from 'ioredis';

async function testRedisSimple() {
  console.log('🧪 TEST ULTRA SIMPLE - Solo Redis básico');
  console.log('📋 Variables de entorno:');
  console.log('   REDIS_HOST:', process.env.REDIS_HOST);
  console.log('   REDIS_PORT:', process.env.REDIS_PORT);
  console.log('   REDIS_PASSWORD:', process.env.REDIS_PASSWORD ? '***' : 'none');
  console.log('   REDIS_DB:', process.env.REDIS_DB);
  
  try {
    // 1. Test Redis directo
    console.log('\n1️⃣ Probando Redis directo...');
    
    const redisConfig = {
      host: process.env.REDIS_HOST || 'bot_automaticpdf-redis',
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || 'hubspot',
      db: Number(process.env.REDIS_DB || 0),
      enableOfflineQueue: true,
    };
    
    console.log('   Configuración:', {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password ? '***' : 'none',
      db: redisConfig.db,
    });
    
    const client = new IORedis(redisConfig);
    
    // 2. Test de conexión
    console.log('\n2️⃣ Test de conexión...');
    await client.ping();
    console.log('   ✅ PING exitoso');
    
    // 3. Test de operaciones básicas
    console.log('\n3️⃣ Test de operaciones básicas...');
    await client.set('test:simple', 'hello world');
    const value = await client.get('test:simple');
    console.log('   ✅ SET/GET exitoso:', value);
    
    // 4. Limpiar
    await client.del('test:simple');
    await client.disconnect();
    
    console.log('\n🎉 TEST ULTRA SIMPLE COMPLETADO');
    
  } catch (error) {
    console.error('\n❌ ERROR en test simple:', error);
    
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
    }
    
    throw error;
  }
}

// Ejecutar test
testRedisSimple()
  .then(() => {
    console.log('\n✅ Test simple exitoso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test simple falló');
    process.exit(1);
  });
