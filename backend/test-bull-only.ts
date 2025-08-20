/**
 * Test que solo prueba Bull sin Redis para identificar el problema exacto
 * Ejecutar con: npx ts-node test-bull-only.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno locales
dotenv.config({ path: path.join(__dirname, 'env.local') });

async function testBullOnly() {
  console.log('🧪 Test de Bull sin Redis...');
  console.log('📋 Variables de entorno:');
  console.log('   REDIS_URL:', process.env.REDIS_URL);
  console.log('   NODE_ENV:', process.env.NODE_ENV);
  
  try {
    // 1. Importar Bull
    console.log('\n1️⃣ Importando Bull...');
    const Bull = require('bull');
    console.log('   ✅ Bull importado');
    
    // 2. Crear cola con configuración mínima
    console.log('\n2️⃣ Creando cola con configuración mínima...');
    
    // Configuración que NO debería causar problemas
    const testQueue = new Bull('test-queue', {
      // Sin configuración Redis - usar defaults
    });
    
    console.log('   ✅ Cola creada sin configuración Redis');
    
    // 3. Intentar registrar un procesador
    console.log('\n3️⃣ Intentando registrar procesador...');
    testQueue.process(async (job) => {
      console.log(`   🔄 Procesando job ${job.id}:`, job.data);
      return { ok: true, id: job.id };
    });
    console.log('   ✅ Procesador registrado');
    
    // 4. Limpiar
    await testQueue.close();
    console.log('\n✅ Test completado exitosamente');
    
  } catch (error) {
    console.error('\n❌ Error en test Bull:', error);
    
    // Mostrar detalles del error
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
      
      // Buscar líneas específicas del stack
      if (error.stack) {
        const lines = error.stack.split('\n');
        console.error('\n   📍 Stack trace relevante:');
        lines.forEach((line, index) => {
          if (line.includes('bull') || line.includes('queue') || line.includes('redis')) {
            console.error(`   ${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
    
    throw error;
  }
}

// Ejecutar test
testBullOnly()
  .then(() => {
    console.log('\n🎉 Test Bull completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test Bull falló:', error);
    process.exit(1);
  });
