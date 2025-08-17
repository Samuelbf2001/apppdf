#!/bin/bash

# ===============================================
# SCRIPT DE BACKUP DE BASE DE DATOS
# HubSpot PDF Generator
# ===============================================

set -e

ENVIRONMENT=${1:-staging}
BACKUP_DIR=${BACKUP_DIR:-"./backups"}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/hubspot_pdf_${ENVIRONMENT}_${TIMESTAMP}.sql"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "🗄️ Iniciando backup de base de datos para: $ENVIRONMENT"

# Verificar que el directorio de backup existe
mkdir -p "$BACKUP_DIR"

# Configurar variables según entorno
case $ENVIRONMENT in
    development)
        DB_CONTAINER="hubspot-pdf-dev-postgres"
        DB_NAME="hubspot_pdf_db"
        DB_USER="hubspot_user"
        ;;
    staging)
        DB_CONTAINER="hubspot-pdf-staging-postgres"
        DB_NAME="hubspot_pdf_staging_db"
        DB_USER="staging_user"
        ;;
    production)
        DB_CONTAINER="hubspot-pdf-prod-postgres"
        DB_NAME="hubspot_pdf_prod_db"
        DB_USER="${POSTGRES_USER:-prod_user}"
        ;;
    *)
        print_error "Entorno inválido: $ENVIRONMENT"
        exit 1
        ;;
esac

# Verificar que el contenedor existe
if ! docker ps | grep -q "$DB_CONTAINER"; then
    print_error "Contenedor de base de datos no encontrado: $DB_CONTAINER"
    exit 1
fi

print_success "Contenedor encontrado: $DB_CONTAINER"

# Ejecutar backup
echo "📦 Creando backup..."

docker exec "$DB_CONTAINER" pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --format=custom \
    --compress=9 > "${BACKUP_FILE}.pgdump"

# También crear backup en SQL plano
docker exec "$DB_CONTAINER" pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
    --clean \
    --if-exists \
    --create > "$BACKUP_FILE"

print_success "Backup creado: $BACKUP_FILE"
print_success "Backup comprimido: ${BACKUP_FILE}.pgdump"

# Obtener tamaños
SQL_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
PGDUMP_SIZE=$(du -h "${BACKUP_FILE}.pgdump" | cut -f1)

echo "📊 Información del backup:"
echo "   Entorno: $ENVIRONMENT"
echo "   Base de datos: $DB_NAME"
echo "   Timestamp: $TIMESTAMP"
echo "   Archivo SQL: $SQL_SIZE"
echo "   Archivo comprimido: $PGDUMP_SIZE"

# Crear resumen del backup
SUMMARY_FILE="${BACKUP_DIR}/backup_summary_${TIMESTAMP}.txt"
cat > "$SUMMARY_FILE" << EOF
HubSpot PDF Generator - Backup Summary
=====================================

Entorno: $ENVIRONMENT
Base de datos: $DB_NAME
Usuario: $DB_USER
Contenedor: $DB_CONTAINER

Fecha: $(date)
Timestamp: $TIMESTAMP

Archivos creados:
- SQL: $BACKUP_FILE ($SQL_SIZE)
- Comprimido: ${BACKUP_FILE}.pgdump ($PGDUMP_SIZE)

Comando para restaurar:
bash scripts/restore-db.sh $ENVIRONMENT $TIMESTAMP

Notas:
- El backup incluye estructura y datos completos
- El archivo .pgdump es más eficiente para restauración
- Verificar integridad antes de usar en producción
EOF

print_success "Resumen guardado: $SUMMARY_FILE"

# Limpiar backups antiguos (mantener últimos 7 días)
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🧹 Limpiando backups antiguos..."
    find "$BACKUP_DIR" -name "hubspot_pdf_${ENVIRONMENT}_*.sql*" -mtime +7 -delete
    find "$BACKUP_DIR" -name "backup_summary_*.txt" -mtime +7 -delete
    print_success "Backups antiguos limpiados (>7 días)"
fi

# Opcional: Subir a almacenamiento en la nube
if [ -n "$AWS_S3_BUCKET" ] && [ "$ENVIRONMENT" = "production" ]; then
    echo "☁️ Subiendo backup a S3..."
    
    if command -v aws &> /dev/null; then
        aws s3 cp "${BACKUP_FILE}.pgdump" "s3://$AWS_S3_BUCKET/backups/database/" --quiet
        aws s3 cp "$SUMMARY_FILE" "s3://$AWS_S3_BUCKET/backups/database/" --quiet
        print_success "Backup subido a S3"
    else
        print_warning "AWS CLI no disponible, backup solo local"
    fi
fi

print_success "🎉 Backup completado exitosamente!"
