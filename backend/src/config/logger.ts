import winston from 'winston';

/**
 * Función segura para serializar objetos evitando estructuras circulares
 * Filtra objetos problemáticos como setInterval, setTimeout, etc.
 */
function safeStringify(obj: any, space?: string | number): string {
  try {
    // Función para detectar y filtrar objetos problemáticos
    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key: string, value: any) => {
        // Filtrar objetos problemáticos conocidos
        if (value && typeof value === 'object') {
          // Filtrar Node.js timers y otros objetos problemáticos
          if (value.constructor && value.constructor.name === 'Timeout') {
            return '[Timeout Object]';
          }
          if (value.constructor && value.constructor.name === 'Immediate') {
            return '[Immediate Object]';
          }
          if (value.constructor && value.constructor.name === 'TimersList') {
            return '[TimersList Object]';
          }
          if (value.constructor && value.constructor.name === 'Interval') {
            return '[Interval Object]';
          }
          if (value.constructor && value.constructor.name === 'AbortController') {
            return '[AbortController Object]';
          }
          if (value.constructor && value.constructor.name === 'AbortSignal') {
            return '[AbortSignal Object]';
          }
          if (value.constructor && value.constructor.name === 'EventEmitter') {
            return '[EventEmitter Object]';
          }
          if (value.constructor && value.constructor.name === 'Stream') {
            return '[Stream Object]';
          }
          if (value.constructor && value.constructor.name === 'Socket') {
            return '[Socket Object]';
          }
          if (value.constructor && value.constructor.name === 'Server') {
            return '[Server Object]';
          }
          if (value.constructor && value.constructor.name === 'Response') {
            return '[Response Object]';
          }
          if (value.constructor && value.constructor.name === 'Request') {
            return '[Request Object]';
          }
          
          // Detectar referencias circulares
          if (seen.has(value)) {
            return '[Circular Reference]';
          }
          seen.add(value);
        }
        return value;
      };
    };

    return JSON.stringify(obj, getCircularReplacer(), space);
  } catch (error) {
    return `[Error serializing object: ${error instanceof Error ? error.message : String(error)}]`;
  }
}

/**
 * Función para limpiar objetos antes de logging
 * Elimina propiedades problemáticas y simplifica objetos complejos
 */
function sanitizeForLogging(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // Si es un array, sanitizar cada elemento
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForLogging(item));
  }

  // Si es un objeto, crear una copia limpia
  const cleanObj: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Saltar propiedades problemáticas
    if (key === 'healthCheckInterval' || 
        key === 'healthCheckTimeout' || 
        key === 'reconnectTimeout' ||
        key === '_idlePrev' ||
        key === '_idleNext' ||
        key === '_idleStart' ||
        key === '_onTimeout' ||
        key === '_timerArgs' ||
        key === '_destroyed' ||
        key === '_events' ||
        key === '_eventsCount' ||
        key === '_maxListeners' ||
        key === 'domain' ||
        key === 'stdin' ||
        key === 'stdout' ||
        key === 'stderr') {
      continue;
    }

    // Sanitizar valores
    if (value && typeof value === 'object') {
      if (value.constructor && value.constructor.name === 'Timeout') {
        cleanObj[key] = '[Timeout Object]';
      } else if (value.constructor && value.constructor.name === 'Interval') {
        cleanObj[key] = '[Interval Object]';
      } else if (value.constructor && value.constructor.name === 'Immediate') {
        cleanObj[key] = '[Immediate Object]';
      } else if (value.constructor && value.constructor.name === 'TimersList') {
        cleanObj[key] = '[TimersList Object]';
      } else if (value.constructor && value.constructor.name === 'EventEmitter') {
        cleanObj[key] = '[EventEmitter Object]';
      } else if (value.constructor && value.constructor.name === 'Stream') {
        cleanObj[key] = '[Stream Object]';
      } else if (value.constructor && value.constructor.name === 'Socket') {
        cleanObj[key] = '[Socket Object]';
      } else if (value.constructor && value.constructor.name === 'Server') {
        cleanObj[key] = '[Server Object]';
      } else if (value.constructor && value.constructor.name === 'Response') {
        cleanObj[key] = '[Response Object]';
      } else if (value.constructor && value.constructor.name === 'Request') {
        cleanObj[key] = '[Request Object]';
      } else if (value.constructor && value.constructor.name === 'AbortController') {
        cleanObj[key] = '[AbortController Object]';
      } else if (value.constructor && value.constructor.name === 'AbortSignal') {
        cleanObj[key] = '[AbortSignal Object]';
      } else {
        // Recursivamente sanitizar objetos anidados
        cleanObj[key] = sanitizeForLogging(value);
      }
    } else {
      cleanObj[key] = value;
    }
  }

  return cleanObj;
}

// Configuración de formatos de log ROBUSTA
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    try {
      // Sanitizar meta antes de serializar
      const sanitizedMeta = sanitizeForLogging(meta);
      
      // Usar safeStringify para evitar errores de estructuras circulares
      const metaString = Object.keys(sanitizedMeta).length 
        ? safeStringify(sanitizedMeta, 2) 
        : '';
      
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
    } catch (error) {
      // Fallback seguro si algo falla
      return `${timestamp} [${level.toUpperCase()}]: ${message} [Error formatting metadata: ${error instanceof Error ? error.message : String(error)}]`;
    }
  })
);

// Configuración de transports
const transports = [
  // Console transport para desarrollo
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

// Crear logger ROBUSTO
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  // No logear en modo de pruebas
  silent: process.env.NODE_ENV === 'test',
  // Manejo de errores del logger
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

// Exportar funciones de sanitización para uso externo
export { sanitizeForLogging, safeStringify };
