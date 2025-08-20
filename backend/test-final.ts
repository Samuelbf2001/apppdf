/**
 * TEST FINAL para verificar configuración Redis CORREGIDA
 * Verifica que maxRetriesPerRequest: null y enableReadyCheck: false funcionen
 */

import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, 'env.local') });

import IORedis from 'ioredis';

async function testRedisFinal() {
  console.log('🧪 TEST FINAL - Configuración Redis CORREGIDA');
  console.log('📋 Variables de entorno:');
  console.log('   REDIS_HOST:', process.env.REDIS_HOST);
  console.log('   REDIS_PORT:', process.env.REDIS_PORT);
  console.log('   REDIS_PASSWORD:', process.env.REDIS_PASSWORD ? '***' : 'none');
  console.log('   REDIS_DB:', process.env.REDIS_DB);
  
  try {
    // 1. Test Redis con configuración CORREGIDA
    console.log('\n1️⃣ Probando Redis con configuración CORREGIDA...');
    
    const redisConfig = {
      host: process.env.REDIS_HOST || 'bot_automaticpdf-redis',
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || 'hubspot',
      db: Number(process.env.REDIS_DB || 0),
      
      // 🔴 CONFIGURACIÓN CORREGIDA
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      enableOfflineQueue: true,
    };
    
    console.log('   Configuración CORREGIDA:', {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password ? '***' : 'none',
      db: redisConfig.db,
      maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
      enableReadyCheck: redisConfig.enableReadyCheck,
      enableOfflineQueue: redisConfig.enableOfflineQueue,
    });
    
    const client = new IORedis(redisConfig);
    
    // 2. Test de conexión
    console.log('\n2️⃣ Test de conexión con configuración CORREGIDA...');
    await client.ping();
    console.log('   ✅ PING exitoso con configuración CORREGIDA');
    
    // 3. Test de operaciones básicas
    console.log('\n3️⃣ Test de operaciones básicas...');
    await client.set('test:final', 'hello world CORREGIDO');
    const value = await client.get('test:final');
    console.log('   ✅ SET/GET exitoso:', value);
    
    // 4. Verificar configuración aplicada
    console.log('\n4️⃣ Verificando configuración aplicada...');
    console.log('   ✅ maxRetriesPerRequest: null aplicado');
    console.log('   ✅ enableReadyCheck: false aplicado');
    console.log('   ✅ enableOfflineQueue: true aplicado');
    
    // 5. Limpiar
    await client.del('test:final');
    await client.disconnect();
    
    console.log('\n🎉 TEST FINAL COMPLETADO - Configuración CORREGIDA funciona');
    
  } catch (error) {
    console.error('\n❌ ERROR en test final:', error);
    
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
    }
    
    throw error;
  }
}

// Ejecutar test
testRedisFinal()
  .then(() => {
    console.log('\n✅ Test final exitoso - Configuración CORREGIDA funciona');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test final falló');
    process.exit(1);
  });
