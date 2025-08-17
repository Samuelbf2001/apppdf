#!/bin/bash

# ===============================================
# SCRIPT DE CONFIGURACIÓN PARA DESARROLLO
# HubSpot PDF Generator
# ===============================================

set -e  # Salir si hay errores

echo "🚀 Configurando HubSpot PDF Generator para desarrollo..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

print_status "Verificando dependencias del sistema..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -c 2-)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Node.js versión $REQUIRED_VERSION o superior requerida. Versión actual: $NODE_VERSION"
    exit 1
fi

print_success "Node.js $NODE_VERSION ✓"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

print_success "npm $(npm -v) ✓"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    print_warning "Docker no está instalado. Necesario para ejecutar servicios completos"
else
    print_success "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) ✓"
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose no está instalado. Necesario para servicios"
else
    print_success "Docker Compose $(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1) ✓"
fi

# Configurar variables de entorno
print_status "Configurando variables de entorno..."

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Archivo .env creado desde .env.example"
    else
        print_error "No se encontró .env.example"
        exit 1
    fi
else
    print_warning "El archivo .env ya existe, no se sobrescribirá"
fi

# Configurar backend
print_status "Configurando backend..."

cd backend

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Backend .env creado"
    fi
fi

print_status "Instalando dependencias del backend..."
npm install

print_success "Dependencias del backend instaladas ✓"

# Configurar frontend
print_status "Configurando frontend..."

cd ../frontend

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Frontend .env creado"
    fi
fi

print_status "Instalando dependencias del frontend..."
npm install

print_success "Dependencias del frontend instaladas ✓"

cd ..

# Configurar base de datos con Docker
print_status "Configurando servicios con Docker..."

if command -v docker-compose &> /dev/null; then
    print_status "Levantando servicios de desarrollo (PostgreSQL, Redis, Gotenberg)..."
    
    # Usar docker-compose.dev.yml para solo servicios esenciales
    docker-compose -f docker-compose.dev.yml up -d postgres redis gotenberg
    
    # Esperar a que los servicios estén listos
    print_status "Esperando a que los servicios estén listos..."
    sleep 10
    
    # Verificar que PostgreSQL esté disponible
    print_status "Verificando conexión a PostgreSQL..."
    
    for i in {1..30}; do
        if docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U hubspot_user -d hubspot_pdf_db; then
            print_success "PostgreSQL está listo ✓"
            break
        fi
        
        if [ $i -eq 30 ]; then
            print_error "PostgreSQL no responde después de 30 intentos"
            exit 1
        fi
        
        sleep 2
    done
    
    # Configurar base de datos
    print_status "Configurando base de datos..."
    
    cd backend
    
    # Generar cliente Prisma
    npx prisma generate
    print_success "Cliente Prisma generado ✓"
    
    # Ejecutar migraciones
    npx prisma migrate dev --name init
    print_success "Migraciones ejecutadas ✓"
    
    # Ejecutar seed
    npx prisma db seed
    print_success "Datos de ejemplo insertados ✓"
    
    cd ..
    
    print_success "Servicios Docker configurados ✓"
else
    print_warning "Docker no disponible. Configurar servicios manualmente:"
    print_warning "- PostgreSQL en puerto 5432"
    print_warning "- Redis en puerto 6379"
    print_warning "- Gotenberg en puerto 3001"
fi

# Crear directorios necesarios
print_status "Creando directorios necesarios..."

mkdir -p storage/documents
mkdir -p storage/temp
mkdir -p logs
mkdir -p backups

print_success "Directorios creados ✓"

# Mostrar siguiente pasos
echo ""
echo "🎉 ¡Configuración completada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. 📝 Editar archivo .env con tus credenciales de HubSpot:"
echo "   - HUBSPOT_CLIENT_ID"
echo "   - HUBSPOT_CLIENT_SECRET"
echo "   - JWT_SECRET (generar uno seguro)"
echo ""
echo "2. 🚀 Ejecutar en modo desarrollo:"
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm start"
echo ""
echo "3. 🌐 Acceder a la aplicación:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3002"
echo "   DB Admin: http://localhost:8081 (si usas Docker tools)"
echo ""
echo "4. 📚 Ver documentación completa en README.md"
echo ""

if command -v docker-compose &> /dev/null; then
    echo "🐳 Servicios Docker ejecutándose:"
    docker-compose -f docker-compose.dev.yml ps
fi

print_success "Setup completado. ¡Feliz desarrollo! 🚀"
