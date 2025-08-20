import { queueService } from '../services/queueService';
import { logger } from '../config/logger';

// Importar procesadores
import { processDocumentGeneration, handleDocumentJobFailure } from './documentWorker';
import { processHubSpotUpload, handleHubSpotJobFailure } from './hubspotWorker';
import { processCleanup, handleCleanupJobFailure } from './cleanupWorker';

/**
 * Registro y configuración ROBUSTA de workers para las colas
 * SOLUCIÓN COMPLETA: reconexión automática + health checks + manejo de conexiones cerradas
 * 
 * IMPLEMENTACIÓN ROBUSTA: Workers que se reconectan automáticamente
 */

export class WorkerManager {
  private isRunning = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private workersHealth = {
    document: false,
    hubspot: false,
    cleanup: false
  };

  /**
   * Iniciar todos los workers con manejo robusto
   * SOLUCIÓN COMPLETA: Reconexión automática + health checks
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Workers ya están ejecutándose');
      return;
    }

    try {
      logger.info('🚀 Iniciando workers ROBUSTOS...');

      // 🔴 CRÍTICO: ESPERAR a que el QueueService esté listo
      logger.info('⏳ Esperando a que QueueService esté listo...');
      const isReady = await queueService.waitForReady(30000); // 30 segundos timeout
      
      if (!isReady) {
        throw new Error('QueueService no está listo después de 30 segundos');
      }

      logger.info('✅ QueueService está listo, procediendo con workers...');

      // 🔴 CRÍTICO: Verificar que las colas existan antes de usarlas
      const documentQueue = (queueService as any).documentQueue;
      const hubspotQueue = (queueService as any).hubspotQueue;
      const cleanupQueue = (queueService as any).cleanupQueue;

      if (!documentQueue || !hubspotQueue || !cleanupQueue) {
        throw new Error('Una o más colas no están disponibles');
      }

      // 🔴 CRÍTICO: Esperar a que cada cola esté lista individualmente
      logger.info('⏳ Esperando a que las colas estén listas...');
      await Promise.all([
        documentQueue.isReady(),
        hubspotQueue.isReady(),
        cleanupQueue.isReady(),
      ]);

      logger.info('✅ Todas las colas están listas, registrando procesadores...');

      // 🔴 CRÍTICO: Registrar procesadores con manejo robusto
      await this.registerDocumentWorker(documentQueue);
      await this.registerHubSpotWorker(hubspotQueue);
      await this.registerCleanupWorker(cleanupQueue);

      // 🔴 CRÍTICO: Programar jobs de limpieza DESPUÉS de que las colas estén listas
      logger.info('📅 Programando jobs de limpieza automática...');
      await this.scheduleAutomaticCleanup();

      this.isRunning = true;
      this.reconnectAttempts = 0; // Reset contador de reintentos

      // 🔴 CRÍTICO: Iniciar health checks continuos para workers
      this.startWorkerHealthChecks();

      logger.info('🎉 Workers ROBUSTOS iniciados exitosamente', {
        documentConcurrency: parseInt(process.env.DOCUMENT_CONCURRENCY || '2'),
        hubspotConcurrency: parseInt(process.env.HUBSPOT_CONCURRENCY || '1'),
        cleanupConcurrency: 1,
      });

    } catch (error) {
      logger.error('❌ Error iniciando workers ROBUSTOS:', error);
      this.isRunning = false;
      
      // 🔴 CRÍTICO: Reintentar con backoff exponencial
      this.scheduleWorkerReconnect();
    }
  }

  /**
   * Registrar worker de documentos con manejo robusto
   */
  private async registerDocumentWorker(queue: any): Promise<void> {
    try {
      // Registrar procesador de documentos
      queue.process(
        'generate-document',
        parseInt(process.env.DOCUMENT_CONCURRENCY || '2'),
        processDocumentGeneration
      );

      // Registrar handler de errores para documentos
      queue.on('failed', handleDocumentJobFailure);

      this.workersHealth.document = true;
      logger.info('✅ Worker de documentos registrado correctamente');
      
    } catch (error) {
      logger.error('❌ Error registrando worker de documentos:', error);
      this.workersHealth.document = false;
      throw error;
    }
  }

  /**
   * Registrar worker de HubSpot con manejo robusto
   */
  private async registerHubSpotWorker(queue: any): Promise<void> {
    try {
      // Registrar procesador de HubSpot
      queue.process(
        'upload-to-hubspot',
        parseInt(process.env.HUBSPOT_CONCURRENCY || '1'),
        processHubSpotUpload
      );

      // Registrar handler de errores para HubSpot
      queue.on('failed', handleHubSpotJobFailure);

      this.workersHealth.hubspot = true;
      logger.info('✅ Worker de HubSpot registrado correctamente');
      
    } catch (error) {
      logger.error('❌ Error registrando worker de HubSpot:', error);
      this.workersHealth.hubspot = false;
      throw error;
    }
  }

  /**
   * Registrar worker de limpieza con manejo robusto
   */
  private async registerCleanupWorker(queue: any): Promise<void> {
    try {
      // Registrar procesador de limpieza
      queue.process(
        'cleanup',
        1, // Solo un job de limpieza a la vez
        processCleanup
      );

      // Registrar handler de errores para limpieza
      queue.on('failed', handleCleanupJobFailure);

      this.workersHealth.cleanup = true;
      logger.info('✅ Worker de limpieza registrado correctamente');
      
    } catch (error) {
      logger.error('❌ Error registrando worker de limpieza:', error);
      this.workersHealth.cleanup = false;
      throw error;
    }
  }

  /**
   * Programar reconexión de workers con backoff exponencial
   */
  private scheduleWorkerReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('❌ Máximo de reintentos de workers alcanzado, deteniendo reconexión');
      return;
    }

    const delay = Math.min(Math.pow(2, this.reconnectAttempts) * 1000, 30000);
    this.reconnectAttempts++;
    
    logger.warn(`🔄 Reintentando workers en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.start();
    }, delay);
  }

  /**
   * Iniciar health checks continuos para workers
   */
  private startWorkerHealthChecks(): void {
    // 🔴 CRÍTICO: Health check cada 45 segundos para workers
    this.healthCheckInterval = setInterval(async () => {
      await this.performWorkerHealthCheck();
    }, 45000);
    
    logger.info('🔍 Health checks de workers iniciados (cada 45 segundos)');
  }

  /**
   * Realizar health check completo de workers
   */
  private async performWorkerHealthCheck(): Promise<void> {
    try {
      // Verificar que QueueService esté listo
      if (!queueService.isReady()) {
        logger.warn('⚠️ Health check workers: QueueService no está listo');
        await this.handleQueueServiceUnhealthy();
        return;
      }

      // Verificar que las colas estén listas
      const documentQueue = (queueService as any).documentQueue;
      const hubspotQueue = (queueService as any).hubspotQueue;
      const cleanupQueue = (queueService as any).cleanupQueue;

      if (!documentQueue || !hubspotQueue || !cleanupQueue) {
        logger.warn('⚠️ Health check workers: Algunas colas no están disponibles');
        await this.handleQueuesUnavailable();
        return;
      }

      // Verificar estado de cada worker
      const workersStatus = await Promise.all([
        documentQueue.isReady(),
        hubspotQueue.isReady(),
        cleanupQueue.isReady(),
      ]);

      // Actualizar estado de salud de workers
      this.workersHealth.document = workersStatus[0];
      this.workersHealth.hubspot = workersStatus[1];
      this.workersHealth.cleanup = workersStatus[2];

      // Verificar si algún worker no está saludable
      const allWorkersHealthy = Object.values(this.workersHealth).every(healthy => healthy);
      if (!allWorkersHealthy) {
        logger.warn('⚠️ Health check workers: Algunos workers no están saludables:', this.workersHealth);
        await this.handleWorkersUnhealthy();
        return;
      }

      logger.debug('✅ Health check workers: Todos los workers están saludables');
      
    } catch (error) {
      logger.error('❌ Error en health check de workers:', error);
      await this.handleWorkerHealthCheckError();
    }
  }

  /**
   * Manejar QueueService no saludable
   */
  private async handleQueueServiceUnhealthy(): Promise<void> {
    logger.warn('🔄 QueueService no saludable, esperando a que se recupere...');
    // No hacer nada, esperar a que QueueService se recupere automáticamente
  }

  /**
   * Manejar colas no disponibles
   */
  private async handleQueuesUnavailable(): Promise<void> {
    logger.warn('🔄 Colas no disponibles, reiniciando workers...');
    this.isRunning = false;
    await this.start();
  }

  /**
   * Manejar workers no saludables
   */
  private async handleWorkersUnhealthy(): Promise<void> {
    logger.warn('🔄 Workers no saludables, reiniciando workers...');
    this.isRunning = false;
    await this.start();
  }

  /**
   * Manejar error en health check de workers
   */
  private async handleWorkerHealthCheckError(): Promise<void> {
    logger.error('🔄 Error en health check de workers, reiniciando workers...');
    this.isRunning = false;
    await this.start();
  }

  /**
   * Programar limpieza automática
   */
  private async scheduleAutomaticCleanup(): Promise<void> {
    try {
      const cleanupQueue = (queueService as any).cleanupQueue;
      
      // Programar limpieza cada hora
      await cleanupQueue.add(
        'cleanup',
        { type: 'scheduled' },
        { 
          repeat: { cron: '0 * * * *' }, // Cada hora
          jobId: 'scheduled-cleanup',
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      logger.info('✅ Limpieza automática programada (cada hora)');
      
    } catch (error) {
      logger.error('❌ Error programando limpieza automática:', error);
    }
  }

  /**
   * Detener workers de forma graceful
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Workers no están ejecutándose');
      return;
    }

    try {
      logger.info('🛑 Deteniendo workers...');

      // Detener health checks
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

      // Cerrar colas gracefulmente
      const documentQueue = (queueService as any).documentQueue;
      const hubspotQueue = (queueService as any).hubspotQueue;
      const cleanupQueue = (queueService as any).cleanupQueue;

      if (documentQueue) await documentQueue.close();
      if (hubspotQueue) await hubspotQueue.close();
      if (cleanupQueue) await cleanupQueue.close();

      this.isRunning = false;
      logger.info('✅ Workers detenidos correctamente');
      
    } catch (error) {
      logger.error('❌ Error deteniendo workers:', error);
    }
  }

  /**
   * Obtener estado de salud de workers
   */
  getWorkersHealth(): typeof this.workersHealth {
    return { ...this.workersHealth };
  }

  /**
   * Verificar si los workers están ejecutándose
   */
  isWorkersRunning(): boolean {
    return this.isRunning;
  }
}

// Exportar instancia singleton
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
