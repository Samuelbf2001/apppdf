import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Configuración del cliente Prisma
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Event listeners para logging
prisma.$on('query', (e) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Query ejecutada:', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  }
});

prisma.$on('error', (e) => {
  logger.error('Error en base de datos:', {
    target: e.target,
    message: e.message,
  });
});

prisma.$on('warn', (e) => {
  logger.warn('Advertencia en base de datos:', {
    target: e.target,
    message: e.message,
  });
});

/**
 * Conectar a la base de datos
 */
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Conexión a base de datos establecida');
  } catch (error) {
    logger.error('❌ Error conectando a base de datos:', error);
    process.exit(1);
  }
};

/**
 * Desconectar de la base de datos
 */
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    logger.info('🔌 Conexión a base de datos cerrada');
  } catch (error) {
    logger.error('Error cerrando conexión a base de datos:', error);
  }
};

export default prisma;
