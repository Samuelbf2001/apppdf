# 🚀 Guía de Deployment en EasyPanel
## HubSpot PDF Generator

**Servidor:** `https://145.79.2.141/`  
**Dominio:** `automaticpdfhub.cloud`  
**Puertos asignados:** 8095 (HTTP), 8096 (HTTPS), 5487 (PostgreSQL), 6418 (Redis), 3021 (Gotenberg), 3022 (Backend)

---

## 📋 PASO A PASO COMPLETO

### 🔧 **PASO 1: Subir a GitHub**

```bash
# 1. Crear repositorio en GitHub (llamarlo: hubspot-pdf-generator)

# 2. Desde tu directorio local:
cd C:\HubSpot-PDF-Generator

# 3. Inicializar Git (si no está inicializado)
git init

# 4. Agregar remote
git remote add origin https://github.com/TU-USUARIO/hubspot-pdf-generator.git

# 5. Crear .gitignore principal
echo "node_modules/
dist/
build/
*.log
.env
.env.local
storage/
logs/
temp/" > .gitignore

# 6. Agregar archivos
git add .
git commit -m "feat: Initial commit - HubSpot PDF Generator complete system"

# 7. Subir a GitHub
git branch -M main
git push -u origin main
```

### 🌐 **PASO 2: Configurar Dominio**

**2.1. DNS Records en tu proveedor de dominio:**
```
Type: A
Name: @
Value: 145.79.2.141
TTL: 300

Type: A  
Name: api
Value: 145.79.2.141
TTL: 300

Type: CNAME
Name: www
Value: automaticpdfhub.cloud
TTL: 300
```

**2.2. En EasyPanel - Configurar dominio:**
- Domain: `automaticpdfhub.cloud`
- Subdomain API: `api.automaticpdfhub.cloud` (opcional)

### 🐳 **PASO 3: Crear Proyecto en EasyPanel**

**3.1. Crear Nuevo Proyecto:**
- Nombre: `hubspot-pdf-generator`
- Domain: `automaticpdfhub.cloud`
- Environment: `Production`

**3.2. Servicios a crear (en este orden):**

#### **A) PostgreSQL Database**
```yaml
Service Type: Database
Database Type: PostgreSQL
Version: 15
Name: automaticpdf-postgres
Port: 5487
Database Name: automaticpdf_db
Username: automaticpdf_user
Password: [generar password seguro]
Storage: 10GB
```

#### **B) Redis Cache**
```yaml
Service Type: Database  
Database Type: Redis
Version: 7
Name: automaticpdf-redis
Port: 6418
Password: [generar password seguro]
Storage: 2GB
```

#### **C) Gotenberg Service**
```yaml
Service Type: App
Name: automaticpdf-gotenberg
Image: gotenberg/gotenberg:7
Port: 3021
Internal Port: 3000
Command: gotenberg --chromium-disable-web-security --log-level=warn
Memory: 1GB
CPU: 0.5
Health Check: /health
```

#### **D) Backend API**
```yaml
Service Type: App
Name: automaticpdf-backend
Build from: GitHub Repository
Repository: https://github.com/TU-USUARIO/hubspot-pdf-generator
Branch: main
Build Context: ./backend
Dockerfile: Dockerfile
Port: 3022
Internal Port: 3002
Memory: 2GB
CPU: 1.0
Health Check: /health
```

#### **E) Frontend React**
```yaml
Service Type: App
Name: automaticpdf-frontend  
Build from: GitHub Repository
Repository: https://github.com/TU-USUARIO/hubspot-pdf-generator
Branch: main
Build Context: ./frontend
Dockerfile: Dockerfile
Port: 3020
Internal Port: 80
Memory: 512MB
CPU: 0.5
Health Check: /health
```

### ⚙️ **PASO 4: Variables de Entorno en EasyPanel**

**4.1. Backend Environment Variables:**
```env
NODE_ENV=production
APP_PORT=3002
FRONTEND_URL=https://automaticpdfhub.cloud

# Database (usar valores reales de EasyPanel)
DATABASE_URL=postgresql://automaticpdf_user:PASSWORD_REAL@automaticpdf-postgres:5432/automaticpdf_db?schema=public
REDIS_URL=redis://:PASSWORD_REAL@automaticpdf-redis:6379

# HubSpot (CONFIGURAR CON TUS CREDENCIALES REALES)
HUBSPOT_CLIENT_ID=tu_client_id_real
HUBSPOT_CLIENT_SECRET=tu_client_secret_real
HUBSPOT_REDIRECT_URI=https://automaticpdfhub.cloud/api/auth/hubspot/callback

# Security (GENERAR SECRETOS ÚNICOS)
JWT_SECRET=jwt_secret_super_seguro_32_caracteres_minimo

# Services
GOTENBERG_URL=http://automaticpdf-gotenberg:3000
STORAGE_PATH=/app/storage
FILE_BASE_URL=https://automaticpdfhub.cloud/files

# Performance
DOCUMENT_CONCURRENCY=3
HUBSPOT_CONCURRENCY=2
LOG_LEVEL=warn
RATE_LIMIT_MAX_REQUESTS=200
MAX_FILE_SIZE_MB=25
```

**4.2. Frontend Environment Variables:**
```env
REACT_APP_API_URL=https://automaticpdfhub.cloud/api
REACT_APP_FILES_URL=https://automaticpdfhub.cloud/files
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
```

### 🔧 **PASO 5: Configuración de HubSpot App**

**5.1. En HubSpot Developer Portal:**
1. Ir a: `https://developers.hubspot.com/`
2. Crear nueva app: "AutomaticPDF Hub"
3. Configurar:
   - **App Name:** AutomaticPDF Hub
   - **App URL:** `https://automaticpdfhub.cloud`
   - **Redirect URL:** `https://automaticpdfhub.cloud/api/auth/hubspot/callback`
   - **Webhook URL:** `https://automaticpdfhub.cloud/api/webhooks/hubspot`

**5.2. Scopes requeridos:**
```
contacts, content, automation, files, timeline, business-intelligence,
crm.objects.deals.read, crm.objects.deals.write,
crm.objects.contacts.read, crm.objects.contacts.write,
crm.objects.companies.read, crm.objects.companies.write,
files.ui_hidden.read
```

**5.3. Custom Action Configuration:**
```json
{
  "configurationUrl": "https://automaticpdfhub.cloud/hubspot-app/extensions/pdf-generator-config.html",
  "executionUrl": "https://automaticpdfhub.cloud/api/hubspot/workflow-actions/generate-pdf"
}
```

### 🏗️ **PASO 6: Comandos para GitHub**

```bash
# 1. Crear repositorio
git init
git remote add origin https://github.com/TU-USUARIO/hubspot-pdf-generator.git

# 2. Crear .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*

# Build outputs
dist/
build/

# Environment files
.env
.env.local
.env.production
.env.test

# Logs
logs/
*.log

# Storage y temporales
storage/
temp/
uploads/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOF

# 3. Commit inicial
git add .
git commit -m "feat: Complete HubSpot PDF Generator system

✨ Features:
- Multi-tenant architecture for 1000+ clients
- OAuth2 HubSpot integration
- Template management with dynamic variables
- Gotenberg PDF generation
- Bull Queue async processing
- React Material-UI frontend
- Custom HubSpot workflow actions
- Docker deployment ready

🛡️ Security:
- Rate limiting
- Input sanitization
- Audit trails
- CORS protection

🚀 Ready for production deployment"

# 4. Subir a GitHub
git push -u origin main
```

### 📦 **PASO 7: Configurar EasyPanel**

**7.1. Crear nuevo proyecto:**
- **Project Name:** `hubspot-pdf-generator`
- **Domain:** `automaticpdfhub.cloud`

**7.2. Deploy Order (importante el orden):**

```bash
1. PostgreSQL (puerto 5487)
   └─ Esperar que esté healthy

2. Redis (puerto 6418)  
   └─ Esperar que esté healthy

3. Gotenberg (puerto 3021)
   └─ Esperar que esté healthy

4. Backend (puerto 3022)
   └─ Configurar todas las env vars
   └─ Esperar que esté healthy
   └─ Ejecutar migraciones: npx prisma migrate deploy

5. Frontend (puerto 3020)
   └─ Configurar env vars
   └─ Build automático

6. Nginx (puerto 8095 público)
   └─ Configurar proxy reverso
```

### 🔐 **PASO 8: Generar Secretos Seguros**

```bash
# Ejecutar en tu máquina local:
node scripts/generate-secrets.js

# Usar los secretos generados en EasyPanel:
# JWT_SECRET=secret_generado_aqui
# WEBHOOK_SECRET=webhook_secret_aqui
# REDIS_PASSWORD=redis_password_aqui
# POSTGRES_PASSWORD=postgres_password_aqui
```

### ⚡ **PASO 9: Configuración de Nginx en EasyPanel**

**Crear archivo de configuración de Nginx:**
```nginx
server {
    listen 80;
    server_name automaticpdfhub.cloud www.automaticpdfhub.cloud;
    client_max_body_size 25M;

    # API Backend
    location /api/ {
        proxy_pass http://automaticpdf-backend:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Files
    location /files/ {
        proxy_pass http://automaticpdf-backend:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # HubSpot App Files
    location /hubspot-app/ {
        proxy_pass http://automaticpdf-backend:3002;
        proxy_set_header Host $host;
    }

    # Frontend SPA
    location / {
        proxy_pass http://automaticpdf-frontend:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Para SPA routing
        try_files $uri $uri/ /index.html;
    }

    # Health check
    location /health {
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 🚀 **PASO 10: Deploy y Verificación**

**10.1. Verificar servicios:**
```bash
# Verificar cada servicio en EasyPanel:
✅ PostgreSQL: puerto 5487
✅ Redis: puerto 6418  
✅ Gotenberg: puerto 3021
✅ Backend: puerto 3022
✅ Frontend: puerto 3020
✅ Nginx: puerto 8095 (público)
```

**10.2. URLs finales:**
- **App:** `https://automaticpdfhub.cloud`
- **API:** `https://automaticpdfhub.cloud/api`
- **Health:** `https://automaticpdfhub.cloud/health`
- **Demo:** `https://automaticpdfhub.cloud/demo.html`

**10.3. Verificar funcionalidad:**
```bash
# Health checks
curl https://automaticpdfhub.cloud/health
curl https://automaticpdfhub.cloud/api/health

# Test OAuth
https://automaticpdfhub.cloud/api/auth/hubspot/authorize
```

### 🛡️ **PASO 11: Configuración de Seguridad**

**11.1. SSL/TLS:**
- EasyPanel configurará automáticamente Let's Encrypt
- Verificar que `automaticpdfhub.cloud` tenga certificado válido

**11.2. Firewall (en EasyPanel):**
```
Permitir solo:
- Puerto 8095 (HTTP público)
- Puerto 8096 (HTTPS público)  
- Puerto 22 (SSH admin)

Bloquear acceso directo a:
- Puertos de base de datos (5487, 6418)
- Puertos internos (3020, 3021, 3022)
```

### 📊 **PASO 12: Monitoreo y Mantenimiento**

**12.1. Configurar alertas en EasyPanel:**
- CPU > 80%
- Memoria > 90%
- Disco > 85%
- Servicios down

**12.2. Backups automáticos:**
```bash
# Configurar backup diario de PostgreSQL
# En EasyPanel: Settings > Backups > Enable Daily Backup
```

**12.3. Logs importantes:**
```bash
# Ver logs en EasyPanel:
- automaticpdf-backend: Errores de API
- automaticpdf-postgres: Errores de DB
- automaticpdf-nginx: Accesos y errores
```

### ✅ **VERIFICACIÓN FINAL**

**URLs a probar después del deployment:**

1. ✅ **Frontend:** `https://automaticpdfhub.cloud`
2. ✅ **API Health:** `https://automaticpdfhub.cloud/api/health`  
3. ✅ **HubSpot Auth:** `https://automaticpdfhub.cloud/api/auth/hubspot/authorize`
4. ✅ **Demo Constructor:** `https://automaticpdfhub.cloud/demo.html`
5. ✅ **Templates API:** `https://automaticpdfhub.cloud/api/templates` (debe pedir auth)

---

## 🚨 **IMPORTANTE ANTES DEL DEPLOY:**

1. **Generar secretos únicos** con `node scripts/generate-secrets.js`
2. **Configurar credenciales HubSpot** reales en variables de entorno
3. **Verificar que el dominio** `automaticpdfhub.cloud` apunte a `145.79.2.141`
4. **Probar localmente** con Docker antes del deploy final

---

## 🆘 **TROUBLESHOOTING**

**Si algo falla:**
1. Verificar logs en EasyPanel
2. Verificar health checks de cada servicio
3. Verificar DNS del dominio
4. Verificar variables de entorno
5. Verificar conectividad entre servicios

**¿Quieres que proceda con algún paso específico o tienes alguna pregunta sobre la configuración?**
