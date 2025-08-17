#!/bin/bash

# ===============================================
# SCRIPT DE DEPLOYMENT PARA EASYPANEL
# HubSpot PDF Generator
# Dominio: automaticpdfhub.cloud
# Servidor: 145.79.2.141
# ===============================================

set -e

# Configuración
SERVER_IP="145.79.2.141"
DOMAIN="automaticpdfhub.cloud"
PROJECT_NAME="hubspot-pdf-generator"
GITHUB_REPO="TU-USUARIO/hubspot-pdf-generator"  # CAMBIAR por tu repo

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

print_header() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                  HUBSPOT PDF GENERATOR                          ║"
    echo "║                 Deployment para EasyPanel                       ║"
    echo "║                                                                  ║"
    echo "║  🌐 Dominio: automaticpdfhub.cloud                             ║"
    echo "║  🖥️  Servidor: 145.79.2.141                                    ║"
    echo "║  📦 Puertos: 8095 (HTTP), 5487 (DB), 6418 (Redis)             ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
}

check_requirements() {
    print_info "Verificando requisitos..."
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        print_error "Git no está instalado"
        exit 1
    fi
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        print_error "Ejecutar desde la raíz del proyecto (donde está package.json)"
        exit 1
    fi
    
    # Verificar que tenemos los archivos de deployment
    if [ ! -f "deployment/easypanel-config.yml" ]; then
        print_error "Archivo deployment/easypanel-config.yml no encontrado"
        exit 1
    fi
    
    print_success "Requisitos verificados ✓"
}

generate_secrets() {
    print_info "Generando secretos para producción..."
    
    # Crear directorio de secretos si no existe
    mkdir -p deployment/secrets
    
    # Generar secretos únicos
    JWT_SECRET=$(openssl rand -base64 32)
    POSTGRES_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    REDIS_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    WEBHOOK_SECRET=$(openssl rand -hex 32)
    
    # Crear archivo de secretos
    cat > deployment/secrets/production.env << EOF
# Secretos generados para automaticpdfhub.cloud
# Fecha: $(date)
# IMPORTANTE: Mantener estos valores seguros

JWT_SECRET=${JWT_SECRET}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
REDIS_PASSWORD=${REDIS_PASSWORD}
WEBHOOK_SECRET=${WEBHOOK_SECRET}

# Configurar en EasyPanel:
# 1. Crear variables de entorno con estos valores
# 2. NO subir este archivo a Git
# 3. Usar estos valores en la configuración del proyecto
EOF

    print_success "Secretos generados en: deployment/secrets/production.env"
    print_warning "IMPORTANTE: Configurar estos secretos en EasyPanel manualmente"
}

prepare_for_github() {
    print_info "Preparando archivos para GitHub..."
    
    # Crear .gitignore optimizado
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment files
.env
.env.local
.env.production
.env.test
deployment/secrets/

# Logs
logs/
*.log

# Storage y uploads
storage/
temp/
uploads/
backups/

# Coverage
coverage/
*.lcov

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Docker
.dockerignore

# Prisma
prisma/migrations/dev.db*
EOF

    # Crear README específico para deployment
    cat > DEPLOYMENT.md << 'EOF'
# 🚀 Deployment Guide - automaticpdfhub.cloud

## Configuración EasyPanel

### 1. Servicios requeridos:
- PostgreSQL (puerto 5487)
- Redis (puerto 6418)
- Gotenberg (puerto 3021)
- Backend (puerto 3022)
- Frontend (puerto 3020)
- Nginx (puerto 8095 - público)

### 2. Variables de entorno:
Ver `deployment/secrets/production.env` (no incluido en Git)

### 3. Orden de deployment:
1. PostgreSQL → 2. Redis → 3. Gotenberg → 4. Backend → 5. Frontend → 6. Nginx

### 4. URLs finales:
- App: https://automaticpdfhub.cloud
- API: https://automaticpdfhub.cloud/api
- Demo: https://automaticpdfhub.cloud/demo.html

### 5. HubSpot Configuration:
- Redirect URI: https://automaticpdfhub.cloud/api/auth/hubspot/callback
- Webhook URL: https://automaticpdfhub.cloud/api/webhooks/hubspot
- Custom Action Config: https://automaticpdfhub.cloud/hubspot-app/extensions/pdf-generator-config.html
EOF

    print_success "Archivos preparados para GitHub ✓"
}

push_to_github() {
    print_info "Subiendo a GitHub..."
    
    # Verificar que el remote está configurado
    if ! git remote get-url origin &> /dev/null; then
        print_warning "Configurando remote de GitHub..."
        echo "Por favor ingresa la URL de tu repositorio de GitHub:"
        echo "Ejemplo: https://github.com/tu-usuario/hubspot-pdf-generator.git"
        read -p "URL del repositorio: " REPO_URL
        
        git remote add origin "$REPO_URL"
    fi
    
    # Agregar archivos
    git add .
    
    # Commit
    git commit -m "feat: Production deployment configuration for automaticpdfhub.cloud

🎯 Deployment ready for EasyPanel:
- Docker configuration optimized
- Nginx proxy configuration
- Production environment setup
- Security configurations
- Custom HubSpot workflow actions

🔧 EasyPanel Configuration:
- Domain: automaticpdfhub.cloud
- Ports: 8095 (public), 5487 (PostgreSQL), 6418 (Redis)
- Multi-service architecture
- SSL/TLS ready

🛡️ Production Security:
- Rate limiting configured
- CORS for production domain
- Secure headers
- Input sanitization
- Audit trails

📦 Services:
- PostgreSQL 15 (database)
- Redis 7 (cache/queues)
- Gotenberg 7 (PDF generation)
- Node.js 18 (backend API)
- React 18 (frontend)
- Nginx (proxy/SSL)

Ready for: automaticpdfhub.cloud deployment"
    
    # Push a GitHub
    git push -u origin main
    
    print_success "Código subido a GitHub ✓"
    print_info "Repositorio disponible en: $(git remote get-url origin)"
}

display_easypanel_instructions() {
    print_success "🎉 ¡Listo para EasyPanel!"
    echo ""
    echo "📋 INSTRUCCIONES PARA EASYPANEL:"
    echo ""
    echo "1. 🔐 CONFIGURAR SECRETOS:"
    echo "   - Usar valores de: deployment/secrets/production.env"
    echo "   - Configurar en EasyPanel Environment Variables"
    echo ""
    echo "2. 🏗️ CREAR SERVICIOS EN ESTE ORDEN:"
    echo "   a) PostgreSQL Database:"
    echo "      └─ Port: 5487, DB: automaticpdf_db, User: automaticpdf_user"
    echo "   b) Redis Cache:"
    echo "      └─ Port: 6418, Password: [usar secreto generado]"
    echo "   c) Gotenberg App:"
    echo "      └─ Image: gotenberg/gotenberg:7, Port: 3021"
    echo "   d) Backend App:"
    echo "      └─ GitHub: $GITHUB_REPO, Context: ./backend, Port: 3022"
    echo "   e) Frontend App:"
    echo "      └─ GitHub: $GITHUB_REPO, Context: ./frontend, Port: 3020"
    echo "   f) Nginx Proxy:"
    echo "      └─ Port: 8095 (público para EasyPanel)"
    echo ""
    echo "3. 🌐 CONFIGURAR DOMINIO:"
    echo "   - Domain: automaticpdfhub.cloud"
    echo "   - SSL: Auto (Let's Encrypt)"
    echo "   - Port: 8095"
    echo ""
    echo "4. 🧪 VERIFICAR DEPLOYMENT:"
    echo "   - Health: https://automaticpdfhub.cloud/health"
    echo "   - Demo: https://automaticpdfhub.cloud/demo.html"
    echo "   - API: https://automaticpdfhub.cloud/api/health"
    echo ""
    echo "5. 🔗 CONFIGURAR HUBSPOT:"
    echo "   - Redirect URI: https://automaticpdfhub.cloud/api/auth/hubspot/callback"
    echo "   - Webhook URL: https://automaticpdfhub.cloud/api/webhooks/hubspot"
    echo ""
    echo "📁 Archivos importantes creados:"
    echo "   ✅ deployment/easypanel-config.yml"
    echo "   ✅ deployment/nginx-production.conf"
    echo "   ✅ deployment/secrets/production.env"
    echo "   ✅ DEPLOYMENT.md"
}

# Función principal
main() {
    print_header
    
    check_requirements
    generate_secrets
    prepare_for_github
    push_to_github
    display_easypanel_instructions
}

# Ejecutar
main "$@"
