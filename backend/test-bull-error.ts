/**
 * Test que capture específicamente el error de Bull
 * Ejecutar con: npx ts-node test-bull-error.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno locales
dotenv.config({ path: path.join(__dirname, 'env.local') });

async function testBullError() {
  console.log('🧪 Test de Bull para capturar error específico...');
  
  try {
    // 1. Importar Bull
    console.log('\n1️⃣ Importando Bull...');
    const Bull = require('bull');
    console.log('   ✅ Bull importado');
    
    // 2. Crear cola con configuración mínima
    console.log('\n2️⃣ Creando cola con configuración mínima...');
    
    const testQueue = new Bull('test-queue', {
      // Sin configuración Redis - usar defaults
    });
    
    console.log('   ✅ Cola creada sin configuración Redis');
    
    // 3. Esperar a que la cola esté lista
    console.log('\n3️⃣ Esperando a que la cola esté lista...');
    await testQueue.isReady();
    console.log('   ✅ Cola está lista');
    
    // 4. Intentar registrar un procesador
    console.log('\n4️⃣ Intentando registrar procesador...');
    testQueue.process(async (job) => {
      console.log(`   🔄 Procesando job ${job.id}:`, job.data);
      return { ok: true, id: job.id };
    });
    console.log('   ✅ Procesador registrado');
    
    // 5. Limpiar
    console.log('\n5️⃣ Limpiando...');
    await testQueue.close();
    console.log('   ✅ Cola cerrada');
    
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
          if (line.includes('bull') || line.includes('queue') || line.includes('redis') || line.includes('ioredis')) {
            console.error(`   ${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
    
    throw error;
  }
}

// Ejecutar test con manejo de promesas no manejadas
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n🚨 PROMESA NO MANEJADA DETECTADA:');
  console.error('   Razón:', reason);
  console.error('   Promise:', promise);
});

// Ejecutar test
testBullError()
  .then(() => {
    console.log('\n🎉 Test Bull completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test Bull falló:', error);
    process.exit(1);
  });
