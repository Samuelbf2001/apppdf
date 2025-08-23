#!/bin/bash

# =====================================
# SCRIPT DE DEPLOYMENT AUTOMATIZADO
# HubSpot PDF Generator - EasyPanel
# automaticpdfhub.cloud
# =====================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# =====================================
# VERIFICACIONES INICIALES
# =====================================

log "🚀 Iniciando deployment de HubSpot PDF Generator..."

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.easypanel.yml" ]; then
    error "No se encontró docker-compose.easypanel.yml"
    error "Ejecuta este script desde el directorio deployment/"
    exit 1
fi

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    error "Docker no está corriendo o no tienes permisos"
    exit 1
fi

# =====================================
# CONFIGURACIÓN DE ENTORNO
# =====================================

log "📋 Configurando variables de entorno..."

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    warning "Archivo .env no encontrado, creando uno básico..."
    
    cat > .env << EOF
# =====================================
# CONFIGURACIÓN DE PRODUCCIÓN
# automaticpdfhub.cloud
# =====================================

# Base de datos PostgreSQL
POSTGRES_PASSWORD=automaticpdf_secure_password_$(openssl rand -hex 8)

# Cache Redis
REDIS_PASSWORD=redis_secure_password_$(openssl rand -hex 8)

# JWT Secret (32+ caracteres)
JWT_SECRET=jwt_secret_$(openssl rand -hex 32)

# HubSpot API (CONFIGURAR MANUALMENTE)
HUBSPOT_CLIENT_ID=your_hubspot_client_id_here
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret_here

# Configuración de la aplicación
NODE_ENV=production
LOG_LEVEL=warn
MAX_FILE_SIZE_MB=25
DOCUMENT_CONCURRENCY=3
HUBSPOT_CONCURRENCY=2
EOF

    success "Archivo .env creado. ¡IMPORTANTE: Configura HUBSPOT_CLIENT_ID y HUBSPOT_CLIENT_SECRET!"
    warning "Revisa y edita el archivo .env antes de continuar"
    read -p "Presiona Enter cuando hayas configurado las variables de HubSpot..."
fi

# Cargar variables de entorno
source .env

# =====================================
# VERIFICAR CONFIGURACIÓN
# =====================================

log "🔍 Verificando configuración..."

# Verificar variables críticas
if [ "$HUBSPOT_CLIENT_ID" = "your_hubspot_client_id_here" ] || [ "$HUBSPOT_CLIENT_SECRET" = "your_hubspot_client_secret_here" ]; then
    error "Variables de HubSpot no configuradas correctamente"
    error "Edita el archivo .env y configura HUBSPOT_CLIENT_ID y HUBSPOT_CLIENT_SECRET"
    exit 1
fi

success "Configuración verificada correctamente"

# =====================================
# LIMPIAR CONTENEDORES EXISTENTES
# =====================================

log "🧹 Limpiando contenedores existentes..."

# Detener y remover contenedores existentes
docker-compose -f docker-compose.easypanel.yml down --remove-orphans 2>/dev/null || true

# Remover imágenes obsoletas
docker image prune -f

success "Limpieza completada"

# =====================================
# CONSTRUIR Y DESPLEGAR SERVICIOS
# =====================================

log "🏗️  Construyendo y desplegando servicios..."

# Construir y levantar servicios en orden
docker-compose -f docker-compose.easypanel.yml up -d --build

success "Servicios desplegados correctamente"

# =====================================
# ESPERAR A QUE LOS SERVICIOS ESTÉN LISTOS
# =====================================

log "⏳ Esperando a que los servicios estén listos..."

# Función para esperar servicio
wait_for_service() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    log "Esperando servicio $service en puerto $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
            success "Servicio $service está listo"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    error "Servicio $service no respondió después de $max_attempts intentos"
    return 1
}

# Esperar servicios base
wait_for_service "PostgreSQL" 5487
wait_for_service "Redis" 6418
wait_for_service "Gotenberg" 3021

# Esperar backend
wait_for_service "Backend" 3022

# Esperar frontend
wait_for_service "Frontend" 3020

# Esperar nginx
wait_for_service "Nginx" 8095

# =====================================
# EJECUTAR MIGRACIONES DE BASE DE DATOS
# =====================================

log "🗄️  Ejecutando migraciones de base de datos..."

# Ejecutar migraciones en el contenedor del backend
docker exec automaticpdf-backend npx prisma migrate deploy || {
    warning "No se pudieron ejecutar migraciones (puede ser la primera vez)"
}

# Generar cliente Prisma
docker exec automaticpdf-backend npx prisma generate

success "Base de datos configurada"

# =====================================
# VERIFICACIÓN FINAL
# =====================================

log "🔍 Verificación final de servicios..."

# Verificar estado de todos los servicios
docker-compose -f docker-compose.easypanel.yml ps

# Verificar logs del backend
log "📋 Últimos logs del backend:"
docker logs --tail=10 automaticpdf-backend

# =====================================
# RESUMEN FINAL
# =====================================

echo ""
echo "🎉 DEPLOYMENT COMPLETADO EXITOSAMENTE!"
echo "======================================"
echo ""
echo "🌐 URLs de acceso:"
echo "   • Frontend: https://automaticpdfhub.cloud"
echo "   • API: https://automaticpdfhub.cloud/api"
echo "   • Health Check: https://automaticpdfhub.cloud/health"
echo ""
echo "🔧 Servicios desplegados:"
echo "   • PostgreSQL: puerto 5487"
echo "   • Redis: puerto 6418"
echo "   • Gotenberg: puerto 3021"
echo "   • Backend: puerto 3022"
echo "   • Frontend: puerto 3020"
echo "   • Nginx: puerto 8095 (público)"
echo ""
echo "📋 Comandos útiles:"
echo "   • Ver logs: docker-compose -f docker-compose.easypanel.yml logs -f"
echo "   • Reiniciar: docker-compose -f docker-compose.easypanel.yml restart"
echo "   • Detener: docker-compose -f docker-compose.easypanel.yml down"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   • Configura el dominio automaticpdfhub.cloud en EasyPanel"
echo "   • Activa SSL/HTTPS en EasyPanel"
echo "   • Verifica que las variables de HubSpot estén configuradas"
echo ""

success "¡Deployment completado! 🚀"