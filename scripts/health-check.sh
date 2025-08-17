#!/bin/bash

# ===============================================
# SCRIPT DE HEALTH CHECK COMPLETO
# HubSpot PDF Generator
# ===============================================

ENVIRONMENT=${1:-development}
VERBOSE=${2:-false}

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }

# Configurar URLs según entorno
case $ENVIRONMENT in
    development)
        API_URL="http://localhost:3002"
        FRONTEND_URL="http://localhost:3000"
        ;;
    staging)
        API_URL="https://staging-api.tudominio.com"
        FRONTEND_URL="https://staging.tudominio.com"
        ;;
    production)
        API_URL="https://api.tudominio.com"
        FRONTEND_URL="https://tudominio.com"
        ;;
    *)
        print_error "Entorno inválido: $ENVIRONMENT"
        exit 1
        ;;
esac

echo "🏥 Health Check para: $ENVIRONMENT"
echo "======================================"

# Función para verificar URL
check_url() {
    local url=$1
    local name=$2
    local timeout=${3:-10}
    
    if [ "$VERBOSE" = "true" ]; then
        print_info "Verificando $name: $url"
    fi
    
    if curl -s --max-time "$timeout" "$url" > /dev/null; then
        print_success "$name está disponible"
        return 0
    else
        print_error "$name no está disponible"
        return 1
    fi
}

# Función para verificar servicio Docker
check_docker_service() {
    local service_name=$1
    local compose_file=$2
    
    if docker-compose -f "$compose_file" ps "$service_name" | grep -q "Up"; then
        print_success "Docker service $service_name está ejecutándose"
        return 0
    else
        print_error "Docker service $service_name no está ejecutándose"
        return 1
    fi
}

# Función para verificar base de datos
check_database() {
    local container_name=$1
    local db_user=$2
    local db_name=$3
    
    if docker exec "$container_name" pg_isready -U "$db_user" -d "$db_name" > /dev/null 2>&1; then
        print_success "Base de datos está disponible"
        
        # Verificar conectividad real
        if docker exec "$container_name" psql -U "$db_user" -d "$db_name" -c "SELECT 1;" > /dev/null 2>&1; then
            print_success "Base de datos responde a consultas"
            return 0
        else
            print_error "Base de datos no responde a consultas"
            return 1
        fi
    else
        print_error "Base de datos no está disponible"
        return 1
    fi
}

# Inicializar contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0

# ====================================
# VERIFICACIONES PRINCIPALES
# ====================================

echo ""
print_info "Verificando servicios principales..."

# API Backend
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if check_url "$API_URL/health" "API Backend" 15; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    
    # Verificar endpoint específico
    if [ "$VERBOSE" = "true" ]; then
        response=$(curl -s "$API_URL/health" | jq -r '.status' 2>/dev/null)
        if [ "$response" = "OK" ]; then
            print_success "API responde con status OK"
        fi
    fi
fi

# Frontend (si no es solo API)
if [ "$ENVIRONMENT" != "api-only" ]; then
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if check_url "$FRONTEND_URL" "Frontend" 10; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
fi

# ====================================
# VERIFICACIONES DE DOCKER
# ====================================

if command -v docker-compose &> /dev/null; then
    echo ""
    print_info "Verificando servicios Docker..."
    
    # Determinar archivo de compose
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
    esac
    
    if [ -f "$COMPOSE_FILE" ]; then
        # PostgreSQL
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        if check_docker_service "postgres" "$COMPOSE_FILE"; then
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            
            # Health check detallado de DB
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
            
            TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
            if check_database "$DB_CONTAINER" "$DB_USER" "$DB_NAME"; then
                PASSED_CHECKS=$((PASSED_CHECKS + 1))
            fi
        fi
        
        # Redis
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        if check_docker_service "redis" "$COMPOSE_FILE"; then
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        fi
        
        # Gotenberg
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        if check_docker_service "gotenberg" "$COMPOSE_FILE"; then
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        fi
        
        # Backend
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        if check_docker_service "backend" "$COMPOSE_FILE"; then
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        fi
    else
        print_warning "Archivo de compose no encontrado: $COMPOSE_FILE"
    fi
fi

# ====================================
# VERIFICACIONES FUNCIONALES
# ====================================

echo ""
print_info "Verificando funcionalidades..."

# Health endpoint detallado
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
health_response=$(curl -s "$API_URL/health" 2>/dev/null)
if [ $? -eq 0 ]; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    
    if [ "$VERBOSE" = "true" ] && command -v jq &> /dev/null; then
        echo "Response del health check:"
        echo "$health_response" | jq .
    fi
fi

# Verificar endpoints críticos (con autenticación mock)
if [ "$VERBOSE" = "true" ]; then
    echo ""
    print_info "Verificando endpoints críticos..."
    
    # Templates endpoint (debe devolver 401 sin auth)
    if curl -s "$API_URL/api/templates" | grep -q "Token de acceso requerido"; then
        print_success "Endpoint de templates protegido correctamente"
    else
        print_warning "Endpoint de templates puede tener problemas de autenticación"
    fi
fi

# ====================================
# RESUMEN
# ====================================

echo ""
echo "======================================"
echo "📊 RESUMEN DEL HEALTH CHECK"
echo "======================================"

PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo "Entorno: $ENVIRONMENT"
echo "Fecha: $(date)"
echo "Checks pasados: $PASSED_CHECKS/$TOTAL_CHECKS ($PERCENTAGE%)"

if [ $PERCENTAGE -eq 100 ]; then
    print_success "🎉 Todos los checks pasaron! Sistema operativo"
    exit 0
elif [ $PERCENTAGE -ge 80 ]; then
    print_warning "⚠️ La mayoría de checks pasaron, pero hay algunos problemas"
    exit 1
else
    print_error "❌ Múltiples checks fallaron, sistema puede no estar operativo"
    exit 2
fi
