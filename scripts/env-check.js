#!/usr/bin/env node

/**
 * Script para verificar configuración de variables de entorno
 * Valida que todas las variables requeridas estén configuradas
 */

const fs = require('fs');
const path = require('path');

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
};

// Variables requeridas por entorno
const requiredVars = {
  development: [
    'NODE_ENV',
    'APP_PORT',
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'GOTENBERG_URL',
  ],
  staging: [
    'NODE_ENV',
    'APP_PORT',
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'GOTENBERG_URL',
    'HUBSPOT_CLIENT_ID',
    'HUBSPOT_CLIENT_SECRET',
    'HUBSPOT_REDIRECT_URI',
  ],
  production: [
    'NODE_ENV',
    'APP_PORT',
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'GOTENBERG_URL',
    'HUBSPOT_CLIENT_ID',
    'HUBSPOT_CLIENT_SECRET',
    'HUBSPOT_REDIRECT_URI',
    'SENTRY_DSN',
  ],
};

// Variables recomendadas por entorno
const recommendedVars = {
  development: [
    'FRONTEND_URL',
    'LOG_LEVEL',
  ],
  staging: [
    'FRONTEND_URL',
    'LOG_LEVEL',
    'AWS_S3_BUCKET',
    'SENTRY_DSN',
  ],
  production: [
    'FRONTEND_URL',
    'AWS_S3_BUCKET',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'NEW_RELIC_LICENSE_KEY',
    'SMTP_HOST',
    'WEBHOOK_SECRET',
  ],
};

function loadEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    
    content.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').replace(/^["']|["']$/g, '');
        }
      }
    });
    
    return env;
  } catch (error) {
    return null;
  }
}

function validateEnvironment(envPath, environment) {
  log.info(`Validando configuración de ${environment}...`);
  
  if (!fs.existsSync(envPath)) {
    log.error(`Archivo de configuración no encontrado: ${envPath}`);
    return false;
  }

  const env = loadEnvFile(envPath);
  if (!env) {
    log.error(`Error leyendo archivo: ${envPath}`);
    return false;
  }

  let isValid = true;
  const required = requiredVars[environment] || [];
  const recommended = recommendedVars[environment] || [];

  // Verificar variables requeridas
  log.info(`Verificando ${required.length} variables requeridas...`);
  
  for (const varName of required) {
    if (!env[varName] || env[varName].trim() === '') {
      log.error(`Variable requerida faltante o vacía: ${varName}`);
      isValid = false;
    } else if (env[varName].includes('tu_') || env[varName].includes('your_')) {
      log.warning(`Variable ${varName} tiene valor placeholder, debe configurarse`);
    } else {
      log.success(`${varName} ✓`);
    }
  }

  // Verificar variables recomendadas
  log.info(`Verificando ${recommended.length} variables recomendadas...`);
  
  for (const varName of recommended) {
    if (!env[varName] || env[varName].trim() === '') {
      log.warning(`Variable recomendada faltante: ${varName}`);
    } else if (env[varName].includes('tu_') || env[varName].includes('your_')) {
      log.warning(`Variable ${varName} tiene valor placeholder`);
    } else {
      log.success(`${varName} ✓`);
    }
  }

  // Validaciones específicas
  log.info('Ejecutando validaciones específicas...');

  // Validar JWT_SECRET
  if (env.JWT_SECRET && env.JWT_SECRET.length < 32) {
    log.warning('JWT_SECRET debería tener al menos 32 caracteres para mayor seguridad');
  }

  // Validar URLs
  if (env.DATABASE_URL && !env.DATABASE_URL.startsWith('postgresql://')) {
    log.error('DATABASE_URL debe ser una URL válida de PostgreSQL');
    isValid = false;
  }

  if (env.REDIS_URL && !env.REDIS_URL.startsWith('redis')) {
    log.error('REDIS_URL debe ser una URL válida de Redis');
    isValid = false;
  }

  // Validar puertos
  if (env.APP_PORT && (isNaN(env.APP_PORT) || env.APP_PORT < 1 || env.APP_PORT > 65535)) {
    log.error('APP_PORT debe ser un número válido entre 1 y 65535');
    isValid = false;
  }

  return isValid;
}

function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║               HUBSPOT PDF GENERATOR                           ║
║            Verificador de Configuración                      ║
╚════════════════════════════════════════════════════════════════╝
`);

  const environments = ['development', 'staging', 'production'];
  const results = {};

  for (const env of environments) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`VALIDANDO ENTORNO: ${env.toUpperCase()}`);
    console.log('='.repeat(60));

    let envPath;
    if (env === 'development') {
      envPath = path.join(process.cwd(), '.env');
    } else {
      envPath = path.join(process.cwd(), 'config', `${env}.env`);
    }

    results[env] = validateEnvironment(envPath, env);
  }

  // Resumen
  console.log(`\n${'='.repeat(60)}`);
  console.log('RESUMEN DE VALIDACIÓN');
  console.log('='.repeat(60));

  let allValid = true;
  for (const [env, isValid] of Object.entries(results)) {
    const status = isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO';
    console.log(`${env.padEnd(12)}: ${status}`);
    if (!isValid) allValid = false;
  }

  console.log('\n📋 RECOMENDACIONES:');
  console.log('• Configurar todas las variables requeridas');
  console.log('• Usar valores seguros y únicos para JWT_SECRET');
  console.log('• Configurar almacenamiento en la nube para producción');
  console.log('• Configurar monitoring (Sentry, New Relic)');
  console.log('• Configurar servicios de email para notificaciones');

  if (allValid) {
    log.success('\n🎉 Todas las configuraciones son válidas!');
    process.exit(0);
  } else {
    log.error('\n❌ Hay problemas en la configuración. Revisa los errores arriba.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
