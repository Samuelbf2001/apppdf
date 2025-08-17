#!/bin/bash

# ===============================================
# SCRIPT DE DEPLOYMENT
# HubSpot PDF Generator
# ===============================================

set -e

# Configuración
ENVIRONMENT=${1:-staging}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"tu-registry.com"}
IMAGE_TAG=${2:-latest}
PROJECT_NAME="hubspot-pdf-generator"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

print_header() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║               HUBSPOT PDF GENERATOR                           ║"
    echo "║                 Deployment Script                            ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
}

validate_environment() {
    case $ENVIRONMENT in
        development|staging|production)
            print_success "Entorno válido: $ENVIRONMENT"
            ;;
        *)
            print_error "Entorno inválido: $ENVIRONMENT"
            print_error "Opciones válidas: development, staging, production"
            exit 1
            ;;
    esac
}

check_dependencies() {
    print_status "Verificando dependencias..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado"
        exit 1
    fi
    
    # Verificar Node.js (para builds locales)
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado"
        exit 1
    fi
    
    print_success "Todas las dependencias están disponibles"
}

build_images() {
    print_status "Construyendo imágenes Docker..."
    
    # Build backend
    print_status "Construyendo imagen del backend..."
    docker build \
        --target production \
        --tag ${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:${IMAGE_TAG} \
        --tag ${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:latest \
        ./backend
    
    print_success "Imagen del backend construida"
    
    # Build frontend
    print_status "Construyendo imagen del frontend..."
    docker build \
        --target production \
        --build-arg REACT_APP_ENV=${ENVIRONMENT} \
        --tag ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:${IMAGE_TAG} \
        --tag ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:latest \
        ./frontend
    
    print_success "Imagen del frontend construida"
}

push_images() {
    if [ "$ENVIRONMENT" == "development" ]; then
        print_warning "Omitiendo push de imágenes en desarrollo"
        return
    fi
    
    print_status "Subiendo imágenes al registry..."
    
    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:${IMAGE_TAG}
    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:latest
    
    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:${IMAGE_TAG}
    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:latest
    
    print_success "Imágenes subidas al registry"
}

deploy_environment() {
    print_status "Deployando a $ENVIRONMENT..."
    
    # Seleccionar archivo de compose apropiado
    case $ENVIRONMENT in
        development)
            COMPOSE_FILE="docker-compose.dev.yml"
            ;;
        staging)
            COMPOSE_FILE="docker-compose.staging.yml"
            ;;
        production)
            COMPOSE_FILE="docker-compose.prod.yml"
            ;;
    esac
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Archivo de compose no encontrado: $COMPOSE_FILE"
        exit 1
    fi
    
    # Verificar configuración de entorno
    print_status "Verificando configuración de entorno..."
    node scripts/env-check.js
    
    if [ $? -ne 0 ]; then
        print_error "Configuración de entorno inválida"
        exit 1
    fi
    
    # Deploy con docker-compose
    print_status "Ejecutando docker-compose..."
    
    export IMAGE_TAG
    export ENVIRONMENT
    
    docker-compose -f $COMPOSE_FILE pull
    docker-compose -f $COMPOSE_FILE up -d
    
    print_success "Deployment completado"
}

run_health_checks() {
    print_status "Ejecutando health checks..."
    
    # Health check del backend
    for i in {1..30}; do
        if curl -s http://localhost:3002/health > /dev/null; then
            print_success "Backend health check ✓"
            break
        fi
        
        if [ $i -eq 30 ]; then
            print_error "Backend no responde después de health checks"
            exit 1
        fi
        
        sleep 2
    done
    
    # Health check de la base de datos
    if docker-compose exec -T postgres pg_isready -U hubspot_user -d hubspot_pdf_db; then
        print_success "Base de datos health check ✓"
    else
        print_error "Base de datos no está disponible"
        exit 1
    fi
    
    print_success "Todos los health checks pasaron"
}

cleanup() {
    print_status "Limpiando imágenes antiguas..."
    
    # Limpiar imágenes dangling
    docker image prune -f
    
    # Limpiar containers parados
    docker container prune -f
    
    print_success "Limpieza completada"
}

show_deployment_info() {
    print_success "🎉 Deployment completado exitosamente!"
    echo ""
    echo "📋 Información del deployment:"
    echo "   Entorno: $ENVIRONMENT"
    echo "   Tag: $IMAGE_TAG"
    echo "   Tiempo: $(date)"
    echo ""
    echo "🌐 URLs disponibles:"
    
    if [ "$ENVIRONMENT" == "development" ]; then
        echo "   Frontend: http://localhost:3000"
        echo "   Backend:  http://localhost:3002"
        echo "   DB Admin: http://localhost:8081"
    else
        echo "   Aplicación: https://${ENVIRONMENT}.tudominio.com"
        echo "   API:        https://${ENVIRONMENT}.tudominio.com/api"
    fi
    
    echo ""
    echo "📊 Verificar estado:"
    echo "   docker-compose -f $COMPOSE_FILE ps"
    echo "   docker-compose -f $COMPOSE_FILE logs -f"
}

# Función principal
main() {
    print_header
    
    print_status "Iniciando deployment para: $ENVIRONMENT"
    
    validate_environment
    check_dependencies
    build_images
    
    if [ "$ENVIRONMENT" != "development" ]; then
        push_images
    fi
    
    deploy_environment
    run_health_checks
    cleanup
    show_deployment_info
}

# Manejar interrupciones
trap 'print_error "Deployment interrumpido"; exit 1' INT TERM

# Validar argumentos
if [ $# -eq 0 ]; then
    echo "Uso: $0 [development|staging|production] [image-tag]"
    echo ""
    echo "Ejemplos:"
    echo "  $0 development"
    echo "  $0 staging v1.2.0"
    echo "  $0 production v1.0.0"
    exit 1
fi

# Ejecutar
main "$@"
