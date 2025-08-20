import Bull, { Queue, Job } from 'bull';
import { logger, sanitizeForLogging } from '../config/logger';
import { DocumentGenerationJob, HubSpotUploadJob } from '../types';
import { makeQueue, testRedisConnection } from '../config/redis';

/**
 * Servicio de colas ROBUSTO para procesamiento asíncrono
 * SOLUCIÓN COMPLETA: reconexión automática + health checks + manejo de conexiones cerradas
 * LOGGING ROBUSTO: diagnóstico completo de problemas de conexión
 * 
 * IMPLEMENTACIÓN ROBUSTA PARA BULL V4:
 * - Reconexión automática a Redis
 * - Health checks continuos
 * - Manejo robusto de conexiones cerradas
 * - Event handlers con reconexión automática
 * - Logging detallado para diagnóstico
 */

export class QueueService {
  private documentQueue: Queue<DocumentGenerationJob>;
  private hubspotQueue: Queue<HubSpotUploadJob>;
  private cleanupQueue: Queue<any>;
  private isInitialized = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private lastHealthCheck: Date | null = null;
  private connectionStats = {
    totalReconnects: 0,
    lastReconnect: null as Date | null,
    lastError: null as string | null,
    lastErrorTime: null as Date | null,
  };

  constructor() {
    logger.info('🚀 Inicializando QueueService ROBUSTO...', {
      timestamp: new Date().toISOString(),
      service: 'QueueService',
      version: 'ROBUSTA',
    });
    
    // Crear las colas usando makeQueue ROBUSTO
    this.documentQueue = makeQueue('document-generation');
    this.hubspotQueue = makeQueue('hubspot-upload');
    this.cleanupQueue = makeQueue('cleanup');
    
    // Inicializar de forma asíncrona
    this.initializeQueues();
    
    // 🔴 CRÍTICO: Iniciar health checks continuos
    this.startHealthChecks();
    
    logger.info('✅ QueueService ROBUSTO inicializado en constructor', {
      timestamp: new Date().toISOString(),
      service: 'QueueService',
      queues: ['document-generation', 'hubspot-upload', 'cleanup'],
    });
  }

  /**
   * Inicializar las colas con manejo robusto de errores y logging detallado
   */
  private async initializeQueues(): Promise<void> {
    const startTime = Date.now();
    
    logger.info('🔍 Iniciando inicialización de colas ROBUSTAS...', {
      timestamp: new Date().toISOString(),
      service: 'QueueService',
      phase: 'initialization',
      reconnectAttempts: this.reconnectAttempts,
    });
    
    try {
      logger.info('🔍 Verificando conexión Redis ROBUSTA...', {
        timestamp: new Date().toISOString(),
        service: 'QueueService',
        phase: 'redis-check',
      });
      
      // Verificar conexión Redis primero
      const redisReady = await testRedisConnection();
      if (!redisReady) {
        throw new Error('No se pudo conectar a Redis');
      }

      logger.info('⏳ Esperando a que las colas estén listas...', {
        timestamp: new Date().toISOString(),
        service: 'QueueService',
        phase: 'queues-ready',
        redisStatus: 'connected',
      });
      
      // ESPERAR a que TODAS las colas estén listas
      const queuesReady = await Promise.all([
        this.documentQueue.isReady(),
        this.hubspotQueue.isReady(),
        this.cleanupQueue.isReady(),
      ]);

      logger.info('✅ Todas las colas están listas', {
        timestamp: new Date().toISOString(),
        service: 'QueueService',
        phase: 'queues-ready',
        documentQueue: queuesReady[0],
        hubspotQueue: queuesReady[1],
        cleanupQueue: queuesReady[2],
        initializationTime: Date.now() - startTime,
      });
      
      // Configurar event handlers ROBUSTOS
      this.setupEventHandlers();
      
      this.isInitialized = true;
      this.reconnectAttempts = 0; // Reset contador de reintentos
      this.lastHealthCheck = new Date();
      
      // Actualizar estadísticas de conexión
      this.connectionStats.lastReconnect = new Date();
      
      logger.info('🎉 QueueService ROBUSTO inicializado correctamente', {
        timestamp: new Date().toISOString(),
        service: 'QueueService',
        phase: 'complete',
        totalTime: Date.now() - startTime,
        reconnectAttempts: this.reconnectAttempts,
        connectionStats: this.connectionStats,
      });
      
    } catch (error) {
      const errorTime = Date.now() - startTime;
      
      logger.error('❌ Error inicializando colas ROBUSTAS:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        service: 'QueueService',
        phase: 'error',
        errorTime,
        reconnectAttempts: this.reconnectAttempts,
        connectionStats: this.connectionStats,
      });
      
      this.isInitialized = false;
      
      // 🔴 CRÍTICO: Reintentar con backoff exponencial
      this.scheduleReconnect();
    }
  }

  /**
   * Programar reconexión con backoff exponencial y logging detallado
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('❌ Máximo de reintentos alcanzado, deteniendo reconexión', {
        timestamp: new Date().toISOString(),
        service: 'QueueService',
        maxReconnectAttempts: this.maxReconnectAttempts,
        totalReconnects: this.connectionStats.totalReconnects,
        lastReconnect: this.connectionStats.lastReconnect,
        lastError: this.connectionStats.lastError,
        lastErrorTime: this.connectionStats.lastErrorTime,
      });
      return;
    }

    const delay = Math.min(Math.pow(2, this.reconnectAttempts) * 1000, 30000);
    this.reconnectAttempts++;
    this.connectionStats.totalReconnects++;
    
    logger.warn(`🔄 Programando reconexión en ${delay}ms`, {
      timestamp: new Date().toISOString(),
      service: 'QueueService',
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      delay,
      totalReconnects: this.connectionStats.totalReconnects,
      lastReconnect: this.connectionStats.lastReconnect,
    });
    
    setTimeout(() => {
      logger.info('🔄 Ejecutando reconexión programada...', {
        timestamp: new Date().toISOString(),
        service: 'QueueService',
        attempt: this.reconnectAttempts,
        delay,
      });
      this.initializeQueues();
    }, delay);
  }

  /**
   * Iniciar health checks continuos con logging detallado
   */
  private startHealthChecks(): void {
    // 🔴 CRÍTICO: Health check cada 30 segundos
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000);
    
    logger.info('🔍 Health checks iniciados (cada 30 segundos)', {
      timestamp: new Date().toISOString(),
      service: 'QueueService',
      interval: 30000,
      // 🔴 CRÍTICO: NO pasar el objeto healthCheckInterval al logger
    });
  }

  /**
   * Realizar health check completo con logging detallado
   */
  private async performHealthCheck(): Promise<void> {
    const healthCheckStart = Date.now();
    this.lastHealthCheck = new Date();
    
    logger.debug('🔍 Ejecutando health check...', {
      timestamp: new Date().toISOString(),
      service: 'QueueService',
      phase: 'health-check-start',
      lastHealthCheck: this.lastHealthCheck,
    });
    
    try {
      // Verificar conexión Redis
      const redisHealthy = await testRedisConnection();
      if (!redisHealthy) {
        logger.warn('⚠️ Health check: Redis no está saludable', {
          timestamp: new Date().toISOString(),
          service: 'QueueService',
          phase: 'health-check-redis',
          redisHealthy,
          healthCheckTime: Date.now() - healthCheckStart,
        });
        await this.handleRedisUnhealthy();
        return;
      }

      // Verificar que las colas estén listas
      const queuesReady = await Promise.all([
        this.documentQueue.isReady(),
        this.hubspotQueue.isReady(),
        this.cleanupQueue.isReady(),
      ]);

      const allQueuesReady = queuesReady.every(ready => ready);
      if (!allQueuesReady) {
        logger.warn('⚠️ Health check: Algunas colas no están listas', {
          timestamp: new Date().toISOString(),
          service: 'QueueService',
          phase: 'health-check-queues',
          documentQueue: queuesReady[0],
          hubspotQueue: queuesReady[1],
          cleanupQueue: queuesReady[2],
          allQueuesReady,
          healthCheckTime: Date.now() - healthCheckStart,
        });
        await this.handleQueuesUnhealthy();
        return;
      }

      logger.debug('✅ Health check: Todo funcionando correctamente', {
        timestamp: new Date().toISOString(),
        service: 'QueueService',
        phase: 'health-check-success',
        redisHealthy,
        allQueuesReady,
        healthCheckTime: Date.now() - healthCheckStart,
        lastHealthCheck: this.lastHealthCheck,
      });
      
    } catch (error) {
      const healthCheckTime = Date.now() - healthCheckStart;
      
      logger.error('❌ Error en health check:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        service: 'QueueService',
        phase: 'health-check-error',
        healthCheckTime,
        lastHealthCheck: this.lastHealthCheck,
      });
      
      await this.handleHealthCheckError();
    }
  }

  /**
   * Manejar Redis no saludable con logging detallado
   */
  private async handleRedisUnhealthy(): Promise<void> {
    logger.warn('🔄 Redis no saludable, intentando reconexión...', {
      timestamp: new Date().toISOString(),
      service: 'QueueService',
      action: 'redis-reconnect',
      lastError: this.connectionStats.lastError,
      lastErrorTime: this.connectionStats.lastErrorTime,
    });
    
    this.isInitialized = false;
    await this.initializeQueues();
  }

  /**
   * Manejar colas no saludables con logging detallado
   */
  private async handleQueuesUnhealthy(): Promise<void> {
    logger.warn('🔄 Colas no saludables, reinicializando...', {
      timestamp: new Date().toISOString(),
      service: 'QueueService',
      action: 'queues-reinitialize',
      lastError: this.connectionStats.lastError,
      lastErrorTime: this.connectionStats.lastErrorTime,
    });
    
    this.isInitialized = false;
    await this.initializeQueues();
  }

  /**
   * Manejar error en health check con logging detallado
   */
  private async handleHealthCheckError(): Promise<void> {
    logger.error('🔄 Error en health check, reinicializando servicios...', {
      timestamp: new Date().toISOString(),
      service: 'QueueService',
      action: 'services-reinitialize',
      lastError: this.connectionStats.lastError,
      lastErrorTime: this.connectionStats.lastErrorTime,
    });
    
    this.isInitialized = false;
    await this.initializeQueues();
  }

  /**
   * Verificar si el servicio está listo
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Esperar a que el servicio esté listo con timeout y logging
   */
  public async waitForReady(timeoutMs: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    
    logger.info('⏳ Esperando a que QueueService esté listo...', {
      timestamp: new Date().toISOString(),
      service: 'QueueService',
      action: 'wait-for-ready',
      timeoutMs,
      isInitialized: this.isInitialized,
    });
    
    while (!this.isReady() && (Date.now() - startTime) < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const waitTime = Date.now() - startTime;
    const success = this.isReady();
    
    logger.info(`✅ QueueService waitForReady completado`, {
      timestamp: new Date().toISOString(),
      service: 'QueueService',
      action: 'wait-for-ready-complete',
      success,
      waitTime,
      timeoutMs,
      isInitialized: this.isInitialized,
    });
    
    return success;
  }

  /**
   * Configurar event handlers ROBUSTOS con manejo de reconexión y logging detallado
   */
  private setupEventHandlers(): void {
    logger.info('🔧 Configurando event handlers ROBUSTOS...', {
      timestamp: new Date().toISOString(),
      service: 'QueueService',
      phase: 'event-handlers-setup',
    });
    
    // 🔴 CRÍTICO: Event handlers para document queue con reconexión
    this.documentQueue.on('completed', (job: Job<DocumentGenerationJob>, result: any) => {
      logger.info('✅ Job de documento completado:', {
        jobId: job.id,
        documentId: job.data.documentId,
        tenantId: job.data.tenantId,
        processingTime: `${Date.now() - job.processedOn!}ms`,
        timestamp: new Date().toISOString(),
        queue: 'document-generation',
      });
    });

    this.documentQueue.on('failed', (job: Job<DocumentGenerationJob>, error: Error) => {
      logger.error('💥 Job de documento fallido:', {
        jobId: job.id,
        documentId: job.data.documentId,
        tenantId: job.data.tenantId,
        error: error.message,
        stack: error.stack,
        attempts: job.attemptsMade,
        maxAttempts: job.opts.attempts,
        timestamp: new Date().toISOString(),
        queue: 'document-generation',
      });
    });

    this.documentQueue.on('stalled', (job: Job<DocumentGenerationJob>) => {
      logger.warn('⚠️ Job de documento bloqueado:', {
        jobId: job.id,
        documentId: job.data.documentId,
        tenantId: job.data.tenantId,
        timestamp: new Date().toISOString(),
        queue: 'document-generation',
      });
    });

    // 🔴 CRÍTICO: Event handlers para HubSpot queue con reconexión
    this.hubspotQueue.on('completed', (job: Job<HubSpotUploadJob>, result: any) => {
      logger.info('✅ Job de HubSpot completado:', {
        jobId: job.id,
        documentId: job.data.documentId,
        tenantId: job.data.tenantId,
        hubspotObjectId: job.data.hubspotObjectId,
        timestamp: new Date().toISOString(),
        queue: 'hubspot-upload',
      });
    });

    this.hubspotQueue.on('failed', (job: Job<HubSpotUploadJob>, error: Error) => {
      logger.error('💥 Job de HubSpot fallido:', {
        jobId: job.id,
        documentId: job.data.documentId,
        tenantId: job.data.tenantId,
        error: error.message,
        stack: error.stack,
        attempts: job.attemptsMade,
        timestamp: new Date().toISOString(),
        queue: 'hubspot-upload',
      });
    });

    // 🔴 CRÍTICO: Event handlers para cleanup queue con reconexión
    this.cleanupQueue.on('completed', (job: Job, result: any) => {
      logger.info('✅ Job de limpieza completado:', {
        jobId: job.id,
        result,
        timestamp: new Date().toISOString(),
        queue: 'cleanup',
      });
    });

    // 🔴 CRÍTICO: Event handlers globales ROBUSTOS para monitoreo
    const queues = [this.documentQueue, this.hubspotQueue, this.cleanupQueue];
    
    queues.forEach(queue => {
      // 🔴 CRÍTICO: Manejo robusto de errores de conexión con logging detallado
      queue.on('error', (error: Error) => {
        // Actualizar estadísticas de conexión
        this.connectionStats.lastError = error.message;
        this.connectionStats.lastErrorTime = new Date();
        
        logger.error(`❌ Error en cola ${queue.name}:`, {
          queueName: queue.name,
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          service: 'QueueService',
          connectionStats: this.connectionStats,
        });
        
        // 🔴 CRÍTICO: Si es error de conexión, intentar reconectar
        if (error.message.includes('Connection is closed') || 
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('ENOTFOUND')) {
          logger.warn(`🔄 Error de conexión en cola ${queue.name}, programando reconexión...`, {
            queueName: queue.name,
            error: error.message,
            timestamp: new Date().toISOString(),
            service: 'QueueService',
            action: 'schedule-reconnect',
          });
          this.scheduleReconnect();
        }
      });

      // 🔴 CRÍTICO: Event handlers adicionales para monitoreo
      queue.on('waiting', (jobId: string) => {
        logger.debug(`⏳ Job ${jobId} esperando en cola ${queue.name}`, {
          queueName: queue.name,
          jobId,
          timestamp: new Date().toISOString(),
          service: 'QueueService',
        });
      });

      queue.on('active', (job: Job, jobPromise: Promise<any>) => {
        logger.debug(`🔄 Job ${job.id} iniciado en cola ${queue.name}`, {
          queueName: queue.name,
          jobId: job.id,
          attempts: job.attemptsMade + 1,
          maxAttempts: job.opts.attempts,
          timestamp: new Date().toISOString(),
          service: 'QueueService',
        });
      });
    });
    
    logger.info('✅ Event handlers ROBUSTOS configurados exitosamente', {
      timestamp: new Date().toISOString(),
      service: 'QueueService',
      phase: 'event-handlers-complete',
      totalQueues: queues.length,
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
        timestamp: new Date().toISOString(),
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
        timestamp: new Date().toISOString(),
      });

      return job;
    } catch (error: any) {
      logger.error('Error agregando job de documento:', {
        error: error.message,
        documentId: data.documentId,
        tenantId: data.tenantId,
        timestamp: new Date().toISOString(),
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
        timestamp: new Date().toISOString(),
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
        timestamp: new Date().toISOString(),
      });

      const job = await this.hubspotQueue.add('upload-to-hubspot', data, {
        priority: options?.priority || 0,
        delay: options?.delay || 0,
        jobId: `hubspot-${data.documentId}`, // ID único
      });

      logger.info('Job de HubSpot agregado exitosamente:', {
        jobId: job.id,
        documentId: data.documentId,
        timestamp: new Date().toISOString(),
      });

      return job;
    } catch (error: any) {
      logger.error('Error agregando job de HubSpot:', {
        error: error.message,
        documentId: data.documentId,
        tenantId: data.tenantId,
        timestamp: new Date().toISOString(),
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
        timestamp: new Date().toISOString(),
      });

      return job;
    } catch (error: any) {
      logger.error('Error programando limpieza:', {
        error: error.message,
        type,
        timestamp: new Date().toISOString(),
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
      logger.error('Error obteniendo estadísticas de colas:', error, {
        timestamp: new Date().toISOString(),
      });
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
      logger.info(`Cola ${queueName} pausada`, {
        queueName,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error(`Error pausando cola ${queueName}:`, error, {
        queueName,
        timestamp: new Date().toISOString(),
      });
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
      logger.info(`Cola ${queueName} reanudada`, {
        queueName,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error(`Error reanudando cola ${queueName}:`, error, {
        queueName,
        timestamp: new Date().toISOString(),
      });
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
      logger.info('Iniciando limpieza de jobs...', {
        timestamp: new Date().toISOString(),
      });

      const queues = [
        { name: 'documents', queue: this.documentQueue },
        { name: 'hubspot', queue: this.hubspotQueue },
        { name: 'cleanup', queue: this.cleanupQueue },
      ];

      for (const { name, queue } of queues) {
        await queue.clean(24 * 60 * 60 * 1000, 'completed', 50); // Mantener 50 completed
        await queue.clean(7 * 24 * 60 * 60 * 1000, 'failed', 100); // Mantener failed por 7 días
        logger.info(`Cola ${name} limpiada`, {
          queueName: name,
          timestamp: new Date().toISOString(),
        });
      }

      logger.info('Limpieza de jobs completada', {
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error limpiando jobs:', error, {
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Cerrar conexiones de las colas
   */
  async close(): Promise<void> {
    try {
      logger.info('Cerrando conexiones de colas...', {
        timestamp: new Date().toISOString(),
      });

      await Promise.all([
        this.documentQueue.close(),
        this.hubspotQueue.close(),
        this.cleanupQueue.close(),
      ]);

      logger.info('Conexiones de colas cerradas', {
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error cerrando colas:', error, {
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }
}

// Singleton instance
export const queueService = new QueueService();