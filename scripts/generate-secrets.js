#!/usr/bin/env node

/**
 * Script para generar secretos seguros para configuración
 */

const crypto = require('crypto');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generateJWTSecret() {
  // JWT secrets deben ser al menos 256 bits (32 bytes)
  return crypto.randomBytes(32).toString('base64');
}

function generateAPIKey() {
  // API keys en formato más legible
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(16).toString('hex');
  return `hpg_${timestamp}_${random}`;
}

function generateWebhookSecret() {
  // Webhook secrets para validar requests
  return crypto.randomBytes(32).toString('hex');
}

function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║               HUBSPOT PDF GENERATOR                           ║
║              Generador de Secretos                           ║
╚════════════════════════════════════════════════════════════════╝
`);

  console.log('🔐 Secretos generados para configuración segura:\n');

  const secrets = {
    jwt_secret: generateJWTSecret(),
    webhook_secret: generateWebhookSecret(),
    api_key: generateAPIKey(),
    session_secret: generateSecret(32),
    encryption_key: generateSecret(32),
  };

  // Mostrar secretos
  console.log('📋 Copia estos valores a tus archivos de configuración:\n');

  console.log('# JWT Secret (para autenticación)');
  console.log(`JWT_SECRET="${secrets.jwt_secret}"\n`);

  console.log('# Webhook Secret (para validar webhooks de HubSpot)');
  console.log(`WEBHOOK_SECRET="${secrets.webhook_secret}"\n`);

  console.log('# API Key interna (para servicios internos)');
  console.log(`INTERNAL_API_KEY="${secrets.api_key}"\n`);

  console.log('# Session Secret (para manejo de sesiones)');
  console.log(`SESSION_SECRET="${secrets.session_secret}"\n`);

  console.log('# Encryption Key (para datos sensibles)');
  console.log(`ENCRYPTION_KEY="${secrets.encryption_key}"\n`);

  // Generar archivo de configuración
  const configContent = `# Secretos generados automáticamente - ${new Date().toISOString()}
# IMPORTANTE: Usar diferentes secretos para cada entorno

# Desarrollo
JWT_SECRET_DEV="${generateJWTSecret()}"
WEBHOOK_SECRET_DEV="${generateWebhookSecret()}"

# Staging  
JWT_SECRET_STAGING="${generateJWTSecret()}"
WEBHOOK_SECRET_STAGING="${generateWebhookSecret()}"

# Producción
JWT_SECRET_PROD="${generateJWTSecret()}"
WEBHOOK_SECRET_PROD="${generateWebhookSecret()}"

# API Keys internas
API_KEY_DEV="${generateAPIKey()}"
API_KEY_STAGING="${generateAPIKey()}"
API_KEY_PROD="${generateAPIKey()}"
`;

  try {
    const fs = require('fs');
    const secretsDir = path.join(process.cwd(), 'config', 'secrets');
    
    if (!fs.existsSync(secretsDir)) {
      fs.mkdirSync(secretsDir, { recursive: true });
    }
    
    const secretsFile = path.join(secretsDir, `secrets-${Date.now()}.env`);
    fs.writeFileSync(secretsFile, configContent);
    
    console.log(`💾 Secretos guardados en: ${secretsFile}`);
    console.log('⚠️  IMPORTANTE: Mantén este archivo seguro y no lo subas a Git');
  } catch (error) {
    console.error('❌ Error guardando archivo de secretos:', error.message);
  }

  console.log('\n🔒 RECOMENDACIONES DE SEGURIDAD:');
  console.log('• Usar secretos diferentes para cada entorno');
  console.log('• Rotar secretos periódicamente');
  console.log('• Almacenar secretos de producción en servicios seguros (AWS Secrets Manager, etc.)');
  console.log('• No hardcodear secretos en el código');
  console.log('• Agregar config/secrets/ al .gitignore');

  console.log('\n✅ ¡Secretos generados exitosamente!');
}

if (require.main === module) {
  main();
}
