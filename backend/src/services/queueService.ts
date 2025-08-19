import Bull, { Queue, Job } from 'bull';
import { logger } from '../config/logger';
import { DocumentGenerationJob, HubSpotUploadJob } from '../types';
import { makeQueue, testRedisConnection } from '../config/redis';

/**
 * Servicio de colas para procesamiento asíncrono
 * Maneja generación de documentos PDF y subida a HubSpot
 * 
 * IMPLEMENTACIÓN BASADA EN MEJORES PRÁCTICAS PARA BULL V3:
 * - Usa makeQueue() para configuración Redis correcta
 * - Espera queue.isReady() antes de usar las colas
 * - Manejo robusto de conexiones Redis
 */

export class QueueService {
  private documentQueue: Queue<DocumentGenerationJob>;
  private hubspotQueue: Queue<HubSpotUploadJob>;
  private cleanupQueue: Queue<any>;
  private isInitialized = false;

  constructor() {
    logger.info('🚀 Inicializando QueueService...');
    
    // Crear las colas usando makeQueue (configuración Redis correcta)
    this.documentQueue = makeQueue('document-generation');
    this.hubspotQueue = makeQueue('hubspot-upload');
    this.cleanupQueue = makeQueue('cleanup');
    
    // Inicializar de forma asíncrona
    this.initializeQueues();
  }

  /**
   * Inicializar las colas esperando a que estén listas
   */
  private async initializeQueues(): Promise<void> {
    try {
      logger.info('🔍 Verificando conexión Redis...');
      
      // Verificar conexión Redis primero
      const redisReady = await testRedisConnection();
      if (!redisReady) {
        throw new Error('No se pudo conectar a Redis');
      }

      logger.info('⏳ Esperando a que las colas estén listas...');
      
      // ESPERAR a que TODAS las colas estén listas (CAPA 2 de la solución)
      await Promise.all([
        this.documentQueue.isReady(),
        this.hubspotQueue.isReady(),
        this.cleanupQueue.isReady(),
      ]);

      logger.info('✅ Todas las colas están listas');
      
      // Configurar event handlers
      this.setupEventHandlers();
      
      this.isInitialized = true;
      logger.info('🎉 QueueService inicializado correctamente');
      
    } catch (error) {
      logger.error('❌ Error inicializando colas:', error);
      this.isInitialized = false;
      
      // Reintentar en 5 segundos
      setTimeout(() => {
        this.initializeQueues();
      }, 5000);
    }
  }

  /**
   * Verificar si el servicio está listo
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Esperar a que el servicio esté listo
   */
  public async waitForReady(timeoutMs: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    
    while (!this.isReady() && (Date.now() - startTime) < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return this.isReady();
  }

  /**
   * Configurar event handlers para logging y monitoreo
   */
  private setupEventHandlers(): void {
    // Event handlers para document queue
    this.documentQueue.on('completed', (job: Job<DocumentGenerationJob>, result: any) => {
      logger.info('Job de documento completado:', {
        jobId: job.id,
        documentId: job.data.documentId,
        tenantId: job.data.tenantId,
        processingTime: `${Date.now() - job.processedOn!}ms`,
      });
    });

    this.documentQueue.on('failed', (job: Job<DocumentGenerationJob>, error: Error) => {
      logger.error('Job de documento fallido:', {
        jobId: job.id,
        documentId: job.data.documentId,
        tenantId: job.data.tenantId,
        error: error.message,
        attempts: job.attemptsMade,
        maxAttempts: job.opts.attempts,
      });
    });

    this.documentQueue.on('stalled', (job: Job<DocumentGenerationJob>) => {
      logger.warn('Job de documento bloqueado:', {
        jobId: job.id,
        documentId: job.data.documentId,
        tenantId: job.data.tenantId,
      });
    });

    // Event handlers para HubSpot queue
    this.hubspotQueue.on('completed', (job: Job<HubSpotUploadJob>, result: any) => {
      logger.info('Job de HubSpot completado:', {
        jobId: job.id,
        documentId: job.data.documentId,
        tenantId: job.data.tenantId,
        hubspotObjectId: job.data.hubspotObjectId,
      });
    });

    this.hubspotQueue.on('failed', (job: Job<HubSpotUploadJob>, error: Error) => {
      logger.error('Job de HubSpot fallido:', {
        jobId: job.id,
        documentId: job.data.documentId,
        tenantId: job.data.tenantId,
        error: error.message,
        attempts: job.attemptsMade,
      });
    });

    // Event handlers para cleanup queue
    this.cleanupQueue.on('completed', (job: Job, result: any) => {
      logger.info('Job de limpieza completado:', {
        jobId: job.id,
        result,
      });
    });

    // Event handlers globales para monitoreo
    const queues = [this.documentQueue, this.hubspotQueue, this.cleanupQueue];
    
    queues.forEach(queue => {
      queue.on('error', (error: Error) => {
        logger.error(`Error en cola ${queue.name}:`, {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
      });

      queue.on('waiting', (jobId: string) => {
        logger.debug(`Job ${jobId} esperando en cola ${queue.name}`);
      });

      queue.on('active', (job: Job, jobPromise: Promise<any>) => {
        logger.debug(`Job ${job.id} iniciado en cola ${queue.name}`, {
          attempts: job.attemptsMade + 1,
          maxAttempts: job.opts.attempts,
        });
      });
    });
  }

  // ========================================
  // MÉTODOS PARA DOCUMENT QUEUE
  // ========================================

  /**
   * Agregar job de generación de documento a la cola
   */
  async addDocumentGenerationJob(
    data: DocumentGenerationJob,
    options?: {
      delay?: number;
      priority?: number;
      attempts?: number;
    }
  ): Promise<Job<DocumentGenerationJob>> {
    // Verificar que el servicio esté listo
    if (!this.isReady()) {
      throw new Error('QueueService no está listo. Espera a que se inicialice.');
    }

    try {
      logger.info('Agregando job de generación de documento:', {
        documentId: data.documentId,
        templateId: data.templateId,
        tenantId: data.tenantId,
        priority: options?.priority,
        delay: options?.delay,
      });

      const job = await this.documentQueue.add('generate-document', data, {
        priority: options?.priority || 0,
        delay: options?.delay || 0,
        attempts: options?.attempts || 3,
        jobId: `doc-${data.documentId}`, // ID único para evitar duplicados
      });

      logger.info('Job de documento agregado exitosamente:', {
        jobId: job.id,
        documentId: data.documentId,
      });

      return job;
    } catch (error: any) {
      logger.error('Error agregando job de documento:', {
        error: error.message,
        documentId: data.documentId,
        tenantId: data.tenantId,
      });
      throw error;
    }
  }

  /**
   * Obtener estado de un job de documento
   */
  async getDocumentJobStatus(documentId: string): Promise<{
    status: string;
    progress?: number;
    error?: string;
    result?: any;
  } | null> {
    if (!this.isReady()) {
      throw new Error('QueueService no está listo');
    }

    try {
      const jobId = `doc-${documentId}`;
      const job = await this.documentQueue.getJob(jobId);
      
      if (!job) {
        return null;
      }

      const state = await job.getState();
      
      return {
        status: state,
        progress: job.progress(),
        error: job.failedReason,
        result: job.returnvalue,
      };
    } catch (error: any) {
      logger.error('Error obteniendo estado de job:', {
        error: error.message,
        documentId,
      });
      return null;
    }
  }

  // ========================================
  // MÉTODOS PARA HUBSPOT QUEUE
  // ========================================

  /**
   * Agregar job de subida a HubSpot a la cola
   */
  async addHubSpotUploadJob(
    data: HubSpotUploadJob,
    options?: {
      delay?: number;
      priority?: number;
    }
  ): Promise<Job<HubSpotUploadJob>> {
    if (!this.isReady()) {
      throw new Error('QueueService no está listo');
    }

    try {
      logger.info('Agregando job de subida a HubSpot:', {
        documentId: data.documentId,
        hubspotObjectId: data.hubspotObjectId,
        hubspotObjectType: data.hubspotObjectType,
        tenantId: data.tenantId,
      });

      const job = await this.hubspotQueue.add('upload-to-hubspot', data, {
        priority: options?.priority || 0,
        delay: options?.delay || 0,
        jobId: `hubspot-${data.documentId}`, // ID único
      });

      logger.info('Job de HubSpot agregado exitosamente:', {
        jobId: job.id,
        documentId: data.documentId,
      });

      return job;
    } catch (error: any) {
      logger.error('Error agregando job de HubSpot:', {
        error: error.message,
        documentId: data.documentId,
        tenantId: data.tenantId,
      });
      throw error;
    }
  }

  // ========================================
  // MÉTODOS PARA CLEANUP QUEUE
  // ========================================

  /**
   * Programar limpieza de archivos temporales
   */
  async scheduleCleanup(
    type: 'temp_files' | 'old_documents' | 'failed_jobs',
    options: {
      maxAgeHours?: number;
      tenantId?: string;
    } = {}
  ): Promise<Job> {
    if (!this.isReady()) {
      throw new Error('QueueService no está listo');
    }

    try {
      const job = await this.cleanupQueue.add(
        'cleanup',
        {
          type,
          maxAgeHours: options.maxAgeHours || 24,
          tenantId: options.tenantId,
        },
        {
          // Programar para ejecutar cada 6 horas
          repeat: { cron: '0 */6 * * *' },
          jobId: `cleanup-${type}`, // Evitar duplicados
        }
      );

      logger.info('Job de limpieza programado:', {
        jobId: job.id,
        type,
        maxAgeHours: options.maxAgeHours,
      });

      return job;
    } catch (error: any) {
      logger.error('Error programando limpieza:', {
        error: error.message,
        type,
      });
      throw error;
    }
  }

  // ========================================
  // MÉTODOS DE MONITOREO Y GESTIÓN
  // ========================================

  /**
   * Obtener estadísticas de las colas
   */
  async getQueueStats(): Promise<{
    documentQueue: any;
    hubspotQueue: any;
    cleanupQueue: any;
  }> {
    if (!this.isReady()) {
      throw new Error('QueueService no está listo');
    }

    try {
      const [docStats, hubspotStats, cleanupStats] = await Promise.all([
        this.documentQueue.getJobCounts(),
        this.hubspotQueue.getJobCounts(),
        this.cleanupQueue.getJobCounts(),
      ]);

      return {
        documentQueue: docStats,
        hubspotQueue: hubspotStats,
        cleanupQueue: cleanupStats,
      };
    } catch (error: any) {
      logger.error('Error obteniendo estadísticas de colas:', error);
      throw error;
    }
  }

  /**
   * Pausar una cola específica
   */
  async pauseQueue(queueName: 'documents' | 'hubspot' | 'cleanup'): Promise<void> {
    if (!this.isReady()) {
      throw new Error('QueueService no está listo');
    }

    try {
      let queue: Queue;
      
      switch (queueName) {
        case 'documents':
          queue = this.documentQueue;
          break;
        case 'hubspot':
          queue = this.hubspotQueue;
          break;
        case 'cleanup':
          queue = this.cleanupQueue;
          break;
        default:
          throw new Error(`Cola desconocida: ${queueName}`);
      }

      await queue.pause();
      logger.info(`Cola ${queueName} pausada`);
    } catch (error: any) {
      logger.error(`Error pausando cola ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Reanudar una cola específica
   */
  async resumeQueue(queueName: 'documents' | 'hubspot' | 'cleanup'): Promise<void> {
    if (!this.isReady()) {
      throw new Error('QueueService no está listo');
    }

    try {
      let queue: Queue;
      
      switch (queueName) {
        case 'documents':
          queue = this.documentQueue;
          break;
        case 'hubspot':
          queue = this.hubspotQueue;
          break;
        case 'cleanup':
          queue = this.cleanupQueue;
          break;
        default:
          throw new Error(`Cola desconocida: ${queueName}`);
      }

      await queue.resume();
      logger.info(`Cola ${queueName} reanudada`);
    } catch (error: any) {
      logger.error(`Error reanudando cola ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Limpiar jobs completados y fallidos
   */
  async cleanupJobs(): Promise<void> {
    if (!this.isReady()) {
      throw new Error('QueueService no está listo');
    }

    try {
      logger.info('Iniciando limpieza de jobs...');

      const queues = [
        { name: 'documents', queue: this.documentQueue },
        { name: 'hubspot', queue: this.hubspotQueue },
        { name: 'cleanup', queue: this.cleanupQueue },
      ];

      for (const { name, queue } of queues) {
        await queue.clean(24 * 60 * 60 * 1000, 'completed', 50); // Mantener 50 completed
        await queue.clean(7 * 24 * 60 * 60 * 1000, 'failed', 100); // Mantener failed por 7 días
        logger.info(`Cola ${name} limpiada`);
      }

      logger.info('Limpieza de jobs completada');
    } catch (error: any) {
      logger.error('Error limpiando jobs:', error);
      throw error;
    }
  }

  /**
   * Cerrar conexiones de las colas
   */
  async close(): Promise<void> {
    try {
      logger.info('Cerrando conexiones de colas...');

      await Promise.all([
        this.documentQueue.close(),
        this.hubspotQueue.close(),
        this.cleanupQueue.close(),
      ]);

      logger.info('Conexiones de colas cerradas');
    } catch (error: any) {
      logger.error('Error cerrando colas:', error);
      throw error;
    }
  }
}

// Singleton instance
export const queueService = new QueueService();
