#!/bin/bash

# ===============================================
# SCRIPT DE RESTAURACIÓN DE BASE DE DATOS
# HubSpot PDF Generator
# ===============================================

set -e

ENVIRONMENT=${1:-staging}
BACKUP_TIMESTAMP=${2}
BACKUP_DIR=${BACKUP_DIR:-"./backups"}

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }

echo "🔄 Iniciando restauración de base de datos para: $ENVIRONMENT"

# Validar argumentos
if [ -z "$BACKUP_TIMESTAMP" ]; then
    print_error "Uso: $0 [environment] [backup_timestamp]"
    echo ""
    echo "Backups disponibles:"
    ls -la "$BACKUP_DIR"/hubspot_pdf_*_*.sql* 2>/dev/null || echo "No hay backups disponibles"
    exit 1
fi

# Configurar variables según entorno
case $ENVIRONMENT in
    development)
        DB_CONTAINER="hubspot-pdf-dev-postgres"
        DB_NAME="hubspot_pdf_db"
        DB_USER="hubspot_user"
        COMPOSE_FILE="docker-compose.dev.yml"
        ;;
    staging)
        DB_CONTAINER="hubspot-pdf-staging-postgres"
        DB_NAME="hubspot_pdf_staging_db"
        DB_USER="staging_user"
        COMPOSE_FILE="config/docker-compose.staging.yml"
        ;;
    production)
        DB_CONTAINER="hubspot-pdf-prod-postgres"
        DB_NAME="hubspot_pdf_prod_db"
        DB_USER="${POSTGRES_USER:-prod_user}"
        COMPOSE_FILE="config/docker-compose.prod.yml"
        ;;
    *)
        print_error "Entorno inválido: $ENVIRONMENT"
        exit 1
        ;;
esac

# Localizar archivo de backup
BACKUP_FILE="${BACKUP_DIR}/hubspot_pdf_${ENVIRONMENT}_${BACKUP_TIMESTAMP}.sql"
BACKUP_PGDUMP="${BACKUP_DIR}/hubspot_pdf_${ENVIRONMENT}_${BACKUP_TIMESTAMP}.sql.pgdump"

if [ -f "$BACKUP_PGDUMP" ]; then
    BACKUP_TO_USE="$BACKUP_PGDUMP"
    BACKUP_TYPE="pgdump"
    print_info "Usando backup comprimido: $BACKUP_PGDUMP"
elif [ -f "$BACKUP_FILE" ]; then
    BACKUP_TO_USE="$BACKUP_FILE"
    BACKUP_TYPE="sql"
    print_info "Usando backup SQL: $BACKUP_FILE"
else
    print_error "Archivo de backup no encontrado:"
    print_error "  Buscado: $BACKUP_FILE"
    print_error "  Buscado: $BACKUP_PGDUMP"
    exit 1
fi

# Confirmar restauración en producción
if [ "$ENVIRONMENT" = "production" ]; then
    echo ""
    print_warning "⚠️  ADVERTENCIA: Restauración en PRODUCCIÓN"
    print_warning "Esta operación SOBRESCRIBIRÁ la base de datos actual"
    echo ""
    read -p "¿Estás seguro de continuar? (escribir 'yes' para confirmar): " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_info "Restauración cancelada"
        exit 0
    fi
fi

# Verificar que el contenedor existe
if ! docker ps | grep -q "$DB_CONTAINER"; then
    print_error "Contenedor de base de datos no encontrado: $DB_CONTAINER"
    print_info "Iniciando servicios..."
    docker-compose -f "$COMPOSE_FILE" up -d postgres
    
    # Esperar a que esté listo
    for i in {1..30}; do
        if docker ps | grep -q "$DB_CONTAINER"; then
            print_success "Servicios iniciados"
            break
        fi
        sleep 2
    done
fi

# Crear backup de seguridad antes de restaurar (excepto en development)
if [ "$ENVIRONMENT" != "development" ]; then
    print_info "Creando backup de seguridad..."
    SAFETY_BACKUP="${BACKUP_DIR}/safety_backup_${ENVIRONMENT}_$(date +%Y%m%d_%H%M%S).sql"
    
    docker exec "$DB_CONTAINER" pg_dump \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-password \
        --clean \
        --if-exists \
        --create > "$SAFETY_BACKUP"
    
    print_success "Backup de seguridad creado: $SAFETY_BACKUP"
fi

# Detener aplicación temporalmente
print_info "Deteniendo servicios de aplicación..."
docker-compose -f "$COMPOSE_FILE" stop backend frontend 2>/dev/null || true

# Restaurar base de datos
print_info "Restaurando base de datos desde $BACKUP_TO_USE..."

if [ "$BACKUP_TYPE" = "pgdump" ]; then
    # Restaurar desde archivo pgdump
    cat "$BACKUP_TO_USE" | docker exec -i "$DB_CONTAINER" pg_restore \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-password \
        --verbose \
        --clean \
        --if-exists \
        --create
else
    # Restaurar desde archivo SQL
    cat "$BACKUP_TO_USE" | docker exec -i "$DB_CONTAINER" psql \
        -U "$DB_USER" \
        -d postgres \
        --no-password
fi

print_success "Base de datos restaurada"

# Ejecutar migraciones si es necesario
print_info "Verificando migraciones..."

# Inicializar backend temporalmente para migraciones
docker-compose -f "$COMPOSE_FILE" up -d backend

# Esperar a que backend esté listo
sleep 10

# Ejecutar migraciones
docker-compose -f "$COMPOSE_FILE" exec backend npx prisma migrate deploy

print_success "Migraciones aplicadas"

# Reiniciar todos los servicios
print_info "Reiniciando servicios..."
docker-compose -f "$COMPOSE_FILE" restart

# Health check
print_info "Verificando salud de servicios..."
sleep 15

for service in postgres redis backend; do
    if docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -q "Up"; then
        print_success "$service está operativo"
    else
        print_error "$service no está operativo"
    fi
done

# Verificar API
API_URL="http://localhost:3002/health"
if [ "$ENVIRONMENT" = "production" ]; then
    API_URL="https://api.tudominio.com/health"
elif [ "$ENVIRONMENT" = "staging" ]; then
    API_URL="https://staging.tudominio.com/health"
fi

if curl -s "$API_URL" > /dev/null; then
    print_success "API está respondiendo"
else
    print_warning "API no responde, verificar manualmente"
fi

echo ""
print_success "🎉 Restauración completada!"
echo ""
echo "📋 Resumen:"
echo "   Entorno: $ENVIRONMENT"
echo "   Backup usado: $BACKUP_TO_USE"
echo "   Timestamp: $BACKUP_TIMESTAMP"
echo "   Fecha: $(date)"
echo ""
echo "🔍 Verificar que todo funciona correctamente:"
echo "   docker-compose -f $COMPOSE_FILE logs -f"
echo "   curl $API_URL"
