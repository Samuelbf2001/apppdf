#!/bin/bash

# ===============================================
# SCRIPT DE MANTENIMIENTO
# HubSpot PDF Generator
# ===============================================

set -e

ENVIRONMENT=${1:-development}
TASK=${2:-all}

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

echo "🔧 Ejecutando mantenimiento para: $ENVIRONMENT"
echo "Tarea: $TASK"
echo "======================================"

# Configurar variables según entorno
case $ENVIRONMENT in
    development)
        COMPOSE_FILE="docker-compose.dev.yml"
        ;;
    staging)
        COMPOSE_FILE="config/docker-compose.staging.yml"
        ;;
    production)
        COMPOSE_FILE="config/docker-compose.prod.yml"
        ;;
    *)
        print_error "Entorno inválido: $ENVIRONMENT"
        exit 1
        ;;
esac

# Funciones de mantenimiento
cleanup_docker() {
    print_info "Limpiando Docker..."
    
    # Limpiar imágenes no utilizadas
    docker image prune -f
    
    # Limpiar contenedores parados
    docker container prune -f
    
    # Limpiar volúmenes no utilizados (cuidado en producción)
    if [ "$ENVIRONMENT" != "production" ]; then
        docker volume prune -f
    fi
    
    # Limpiar redes no utilizadas
    docker network prune -f
    
    print_success "Limpieza de Docker completada"
}

backup_database() {
    print_info "Creando backup de base de datos..."
    bash scripts/backup-db.sh "$ENVIRONMENT"
    print_success "Backup de base de datos completado"
}

update_dependencies() {
    print_info "Actualizando dependencias..."
    
    # Backend
    cd backend
    npm audit fix --force
    cd ..
    
    # Frontend
    cd frontend  
    npm audit fix --force
    cd ..
    
    print_success "Dependencias actualizadas"
}

restart_services() {
    print_info "Reiniciando servicios..."
    
    # Restart gradual para minimizar downtime
    docker-compose -f "$COMPOSE_FILE" restart redis
    sleep 5
    
    docker-compose -f "$COMPOSE_FILE" restart gotenberg
    sleep 5
    
    docker-compose -f "$COMPOSE_FILE" restart backend
    sleep 10
    
    docker-compose -f "$COMPOSE_FILE" restart frontend
    sleep 5
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f "$COMPOSE_FILE" restart nginx
    fi
    
    print_success "Servicios reiniciados"
}

optimize_database() {
    print_info "Optimizando base de datos..."
    
    # Configurar contenedor según entorno
    case $ENVIRONMENT in
        development)
            DB_CONTAINER="hubspot-pdf-dev-postgres"
            DB_USER="hubspot_user"
            DB_NAME="hubspot_pdf_db"
            ;;
        staging)
            DB_CONTAINER="hubspot-pdf-staging-postgres"
            DB_USER="staging_user"
            DB_NAME="hubspot_pdf_staging_db"
            ;;
        production)
            DB_CONTAINER="hubspot-pdf-prod-postgres"
            DB_USER="${POSTGRES_USER:-prod_user}"
            DB_NAME="hubspot_pdf_prod_db"
            ;;
    esac
    
    # VACUUM y ANALYZE
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "VACUUM ANALYZE;"
    
    # Reindexar tablas principales
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "REINDEX DATABASE $DB_NAME;"
    
    print_success "Optimización de base de datos completada"
}

cleanup_logs() {
    print_info "Limpiando logs antiguos..."
    
    # Limpiar logs de aplicación
    find logs/ -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    # Limpiar logs de Docker
    docker system prune -f --volumes
    
    print_success "Logs limpiados"
}

check_disk_space() {
    print_info "Verificando espacio en disco..."
    
    # Verificar espacio disponible
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$DISK_USAGE" -gt 85 ]; then
        print_error "Espacio en disco crítico: $DISK_USAGE%"
        return 1
    elif [ "$DISK_USAGE" -gt 70 ]; then
        print_warning "Espacio en disco alto: $DISK_USAGE%"
    else
        print_success "Espacio en disco OK: $DISK_USAGE%"
    fi
    
    # Mostrar directorios más grandes
    if [ "$ENVIRONMENT" = "development" ]; then
        print_info "Directorios más grandes:"
        du -sh storage/* 2>/dev/null | head -5
        du -sh logs/* 2>/dev/null | head -5
    fi
}

generate_report() {
    print_info "Generando reporte de mantenimiento..."
    
    REPORT_FILE="maintenance_report_${ENVIRONMENT}_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$REPORT_FILE" << EOF
HubSpot PDF Generator - Reporte de Mantenimiento
===============================================

Entorno: $ENVIRONMENT
Fecha: $(date)
Ejecutado por: $(whoami)

Sistema:
- OS: $(uname -s)
- Kernel: $(uname -r)
- Uptime: $(uptime)

Docker:
$(docker version --format "Client: {{.Client.Version}} | Server: {{.Server.Version}}" 2>/dev/null || echo "Docker no disponible")

Servicios:
$(docker-compose -f "$COMPOSE_FILE" ps 2>/dev/null || echo "Compose no disponible")

Espacio en disco:
$(df -h / | tail -1)

Memoria:
$(free -h | head -2)

Health Check:
$(bash scripts/health-check.sh "$ENVIRONMENT" false 2>&1)

Tareas ejecutadas: $TASK
Estado: Completado exitosamente
EOF
    
    print_success "Reporte guardado: $REPORT_FILE"
}

# ====================================
# EJECUTAR TAREAS SEGÚN PARÁMETRO
# ====================================

case $TASK in
    all)
        print_info "Ejecutando mantenimiento completo..."
        cleanup_docker
        backup_database
        optimize_database
        cleanup_logs
        check_disk_space
        restart_services
        generate_report
        ;;
    backup)
        backup_database
        ;;
    cleanup)
        cleanup_docker
        cleanup_logs
        ;;
    optimize)
        optimize_database
        ;;
    restart)
        restart_services
        ;;
    check)
        check_disk_space
        bash scripts/health-check.sh "$ENVIRONMENT" true
        ;;
    report)
        generate_report
        ;;
    *)
        print_error "Tarea inválida: $TASK"
        echo ""
        echo "Tareas disponibles:"
        echo "  all      - Mantenimiento completo"
        echo "  backup   - Solo backup de DB"
        echo "  cleanup  - Solo limpieza"
        echo "  optimize - Solo optimización de DB"
        echo "  restart  - Solo reinicio de servicios"
        echo "  check    - Solo verificaciones"
        echo "  report   - Solo generar reporte"
        exit 1
        ;;
esac

print_success "🎉 Mantenimiento completado!"

# Ejecutar health check final
echo ""
print_info "Ejecutando health check final..."
bash scripts/health-check.sh "$ENVIRONMENT" false
