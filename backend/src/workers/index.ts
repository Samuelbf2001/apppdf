import { queueService } from '../services/queueService';
import { logger } from '../config/logger';

// Importar procesadores
import { processDocumentGeneration, handleDocumentJobFailure } from './documentWorker';
import { processHubSpotUpload, handleHubSpotJobFailure } from './hubspotWorker';
import { processCleanup, handleCleanupJobFailure } from './cleanupWorker';

/**
 * Registro y configuración de workers para las colas
 * Centraliza el setup de todos los procesadores de jobs
 * 
 * IMPLEMENTACIÓN CAPA 3: Esperar queue.isReady() antes de usar las colas
 */

export class WorkerManager {
  private isRunning = false;

  /**
   * Iniciar todos los workers
   * CAPA 3: Esperar a que las colas estén listas antes de registrar procesadores
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Workers ya están ejecutándose');
      return;
    }

    try {
      logger.info('🚀 Iniciando workers...');

      // CAPA 3: ESPERAR a que el QueueService esté listo
      logger.info('⏳ Esperando a que QueueService esté listo...');
      const isReady = await queueService.waitForReady(30000); // 30 segundos timeout
      
      if (!isReady) {
        throw new Error('QueueService no está listo después de 30 segundos');
      }

      logger.info('✅ QueueService está listo, procediendo con workers...');

      // CAPA 3: Verificar que las colas existan antes de usarlas
      const documentQueue = (queueService as any).documentQueue;
      const hubspotQueue = (queueService as any).hubspotQueue;
      const cleanupQueue = (queueService as any).cleanupQueue;

      if (!documentQueue || !hubspotQueue || !cleanupQueue) {
        throw new Error('Una o más colas no están disponibles');
      }

      // CAPA 3: Esperar a que cada cola esté lista individualmente
      logger.info('⏳ Esperando a que las colas estén listas...');
      await Promise.all([
        documentQueue.isReady(),
        hubspotQueue.isReady(),
        cleanupQueue.isReady(),
      ]);

      logger.info('✅ Todas las colas están listas, registrando procesadores...');

      // Registrar procesador de documentos
      documentQueue.process(
        'generate-document',
        parseInt(process.env.DOCUMENT_CONCURRENCY || '2'), // Procesar hasta 2 documentos simultáneamente
        processDocumentGeneration
      );

      // Registrar handler de errores para documentos
      documentQueue.on('failed', handleDocumentJobFailure);

      // Registrar procesador de HubSpot
      hubspotQueue.process(
        'upload-to-hubspot',
        parseInt(process.env.HUBSPOT_CONCURRENCY || '1'), // Procesar de uno en uno para evitar rate limits
        processHubSpotUpload
      );

      // Registrar handler de errores para HubSpot
      hubspotQueue.on('failed', handleHubSpotJobFailure);

      // Registrar procesador de limpieza
      cleanupQueue.process(
        'cleanup',
        1, // Solo un job de limpieza a la vez
        processCleanup
      );

      // Registrar handler de errores para limpieza
      cleanupQueue.on('failed', handleCleanupJobFailure);

      // CAPA 3: Programar jobs de limpieza DESPUÉS de que las colas estén listas
      logger.info('📅 Programando jobs de limpieza automática...');
      await this.scheduleAutomaticCleanup();

      this.isRunning = true;

      logger.info('🎉 Workers iniciados exitosamente', {
        documentConcurrency: parseInt(process.env.DOCUMENT_CONCURRENCY || '2'),
        hubspotConcurrency: parseInt(process.env.HUBSPOT_CONCURRENCY || '1'),
        cleanupConcurrency: 1,
      });

    } catch (error: any) {
      logger.error('❌ Error iniciando workers:', {
        error: error.message,
        stack: error.stack,
      });
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Detener todos los workers
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Workers no están ejecutándose');
      return;
    }

    try {
      logger.info('🛑 Deteniendo workers...');

      // Verificar que las colas estén disponibles
      const documentQueue = (queueService as any).documentQueue;
      const hubspotQueue = (queueService as any).hubspotQueue;
      const cleanupQueue = (queueService as any).cleanupQueue;

      if (documentQueue && hubspotQueue && cleanupQueue) {
        // Pausar las colas
        await Promise.all([
          documentQueue.pause(),
          hubspotQueue.pause(),
          cleanupQueue.pause(),
        ]);

        // Esperar a que terminen los jobs en progreso
        await Promise.all([
          documentQueue.whenCurrentJobsFinished(),
          hubspotQueue.whenCurrentJobsFinished(),
          cleanupQueue.whenCurrentJobsFinished(),
        ]);
      }

      this.isRunning = false;
      logger.info('✅ Workers detenidos exitosamente');

    } catch (error: any) {
      logger.error('❌ Error deteniendo workers:', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Programar jobs de limpieza automática
   * CAPA 3: Solo se ejecuta después de que las colas estén listas
   */
  private async scheduleAutomaticCleanup(): Promise<void> {
    try {
      logger.info('🧹 Programando jobs de limpieza automática...');

      // Limpiar archivos temporales cada 6 horas
      await queueService.scheduleCleanup('temp_files', {
        maxAgeHours: 24,
      });

      // Limpiar documentos fallidos cada día
      await queueService.scheduleCleanup('old_documents', {
        maxAgeHours: 7 * 24, // 7 días
      });

      // Limpiar jobs fallidos cada 12 horas
      await queueService.scheduleCleanup('failed_jobs', {
        maxAgeHours: 24,
      });

      logger.info('✅ Jobs de limpieza automática programados');

    } catch (error: any) {
      logger.error('❌ Error programando jobs de limpieza:', {
        error: error.message,
      });
      // No fallar el inicio de workers por esto
    }
  }

  /**
   * Obtener estado de workers
   */
  getStatus(): {
    isRunning: boolean;
    queues: string[];
    queueServiceReady: boolean;
  } {
    return {
      isRunning: this.isRunning,
      queues: [
        'document-generation',
        'hubspot-upload',
        'cleanup',
      ],
      queueServiceReady: queueService.isReady(),
    };
  }

  /**
   * Reiniciar workers
   */
  async restart(): Promise<void> {
    logger.info('🔄 Reiniciando workers...');
    await this.stop();
    await this.start();
    logger.info('✅ Workers reiniciados exitosamente');
  }
}

// Singleton instance
export const workerManager = new WorkerManager();

// Manejo graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('🛑 SIGTERM recibido, deteniendo workers...');
  try {
    await workerManager.stop();
    await queueService.close();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error en shutdown graceful:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('🛑 SIGINT recibido, deteniendo workers...');
  try {
    await workerManager.stop();
    await queueService.close();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error en shutdown graceful:', error);
    process.exit(1);
  }
});
