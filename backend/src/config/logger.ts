import winston from 'winston';

/**
 * Logger simplificado y robusto para producción
 * Evita problemas con objetos circulares y estructuras complejas
 */

// Configuración básica de formato
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Simplificar meta para evitar problemas
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      try {
        // Solo incluir propiedades simples
        const simpleMeta: any = {};
        for (const [key, value] of Object.entries(meta)) {
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            simpleMeta[key] = value;
          } else if (value === null || value === undefined) {
            simpleMeta[key] = value;
          } else {
            simpleMeta[key] = '[Complex Object]';
          }
        }
        metaStr = ` ${JSON.stringify(simpleMeta)}`;
      } catch (error) {
        metaStr = ' [Error formatting metadata]';
      }
    }
    
    return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
  })
);

// Configuración de transports
const transports = [
  // Console transport para todos los entornos
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
];

// En producción, agregar archivos de log
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
    })
  );
}

// Crear logger robusto
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  silent: process.env.NODE_ENV === 'test',
  exitOnError: false,
});

// Stream para usar con morgan
export const logStream = {
  write: (message: string) => {
    try {
      logger.info(message.trim());
    } catch (error) {
      // Fallback si el logger falla
      console.error('Logger error:', error);
      console.log(message.trim());
    }
  },
};

// Función helper para logging seguro
export const safeLog = (level: string, message: string, meta?: any) => {
  try {
    if (meta && typeof meta === 'object') {
      // Solo incluir propiedades seguras
      const safeMeta: any = {};
      for (const [key, value] of Object.entries(meta)) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          safeMeta[key] = value;
        }
      }
      logger.log(level, message, safeMeta);
    } else {
      logger.log(level, message);
    }
  } catch (error) {
    // Fallback seguro
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
};
