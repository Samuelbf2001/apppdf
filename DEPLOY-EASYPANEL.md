# 🚀 DEPLOYMENT COMPLETO EN EASYPANEL
## HubSpot PDF Generator → automaticpdfhub.cloud

**Servidor:** `https://145.79.2.141/`  
**Dominio:** `automaticpdfhub.cloud`  
**Puertos elegidos:** 8095 (público), 5487 (PostgreSQL), 6418 (Redis), 3021 (Gotenberg), 3022 (Backend), 3020 (Frontend)

---

## 📋 PASO 1: PREPARAR Y SUBIR A GITHUB

### 1.1 Crear repositorio en GitHub
1. Ir a: `https://github.com/new`
2. Repository name: `hubspot-pdf-generator`
3. Description: `Generador automático de PDFs con integración HubSpot - automaticpdfhub.cloud`
4. **Public** o **Private** (tu elección)
5. ✅ Crear repositorio

### 1.2 Subir código desde tu máquina Windows

```powershell
# En PowerShell desde: C:\HubSpot-PDF-Generator

# 1. Inicializar Git (si no está)
git init

# 2. Configurar remote (CAMBIAR por tu usuario de GitHub)
git remote add origin https://github.com/TU-USUARIO-GITHUB/hubspot-pdf-generator.git

# 3. Crear .gitignore
@"
node_modules/
dist/
build/
*.log
.env*
storage/
logs/
temp/
deployment/secrets/
"@ | Out-File -FilePath .gitignore -Encoding UTF8

# 4. Agregar archivos
git add .

# 5. Commit inicial
git commit -m "feat: Complete HubSpot PDF Generator for automaticpdfhub.cloud

✨ Production-ready system:
- Multi-tenant architecture (1000+ clients)
- HubSpot OAuth2 + Custom Workflow Actions
- Template management with dynamic variables
- Gotenberg PDF generation
- Bull Queue async processing
- React Material-UI frontend
- Enterprise security features
- Docker deployment ready

🌐 Domain: automaticpdfhub.cloud
🖥️ Server: 145.79.2.141
📦 EasyPanel optimized"

# 6. Subir a GitHub
git branch -M main
git push -u origin main
```

---

## 📦 PASO 2: CONFIGURAR DNS

### 2.1 En tu proveedor de dominio (donde compraste automaticpdfhub.cloud)

```dns
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

### 2.2 Verificar DNS (esperar 5-10 minutos)
```bash
# Verificar que apunta correctamente:
nslookup automaticpdfhub.cloud
# Debe devolver: 145.79.2.141
```

---

## 🏗️ PASO 3: CREAR PROYECTO EN EASYPANEL

### 3.1 Acceder a EasyPanel
1. Ir a: `https://145.79.2.141/`
2. Login con tus credenciales
3. **Create New Project**

### 3.2 Configuración del proyecto
```
Project Name: hubspot-pdf-generator
Domain: automaticpdfhub.cloud
Environment: Production
```

---

## 📊 PASO 4: CREAR SERVICIOS (EN ESTE ORDEN EXACTO)

### 4.1 🗄️ PostgreSQL Database
```yaml
Service Type: Database
Database Engine: PostgreSQL
Version: 15
Service Name: automaticpdf-postgres
Port: 5487
Database Name: automaticpdf_db
Username: automaticpdf_user
Password: [generar password fuerte - guardar!]
Storage: 5GB
Memory: 512MB
```

### 4.2 🔄 Redis Cache
```yaml
Service Type: Database
Database Engine: Redis
Version: 7
Service Name: automaticpdf-redis
Port: 6418
Password: [generar password fuerte - guardar!]
Storage: 1GB
Memory: 256MB
```

### 4.3 📄 Gotenberg Service
```yaml
Service Type: App
Service Name: automaticpdf-gotenberg
Image: gotenberg/gotenberg:7
Port: 3021
Internal Port: 3000
Memory: 1GB
CPU: 0.5
Command: gotenberg --chromium-disable-web-security --log-level=warn
Health Check Path: /health
```

### 4.4 ⚡ Backend API
```yaml
Service Type: App
Service Name: automaticpdf-backend
Source: GitHub Repository
Repository: https://github.com/TU-USUARIO/hubspot-pdf-generator
Branch: main
Build Context: ./backend
Dockerfile: Dockerfile
Build Target: production
Port: 3022
Internal Port: 3002
Memory: 2GB
CPU: 1.0
Health Check Path: /health
```

**Environment Variables para Backend:**
```env
NODE_ENV=production
APP_PORT=3002
FRONTEND_URL=https://automaticpdfhub.cloud

DATABASE_URL=postgresql://automaticpdf_user:PASSWORD_POSTGRES@automaticpdf-postgres:5432/automaticpdf_db?schema=public
REDIS_URL=redis://:PASSWORD_REDIS@automaticpdf-redis:6379

GOTENBERG_URL=http://automaticpdf-gotenberg:3000

HUBSPOT_CLIENT_ID=TU_HUBSPOT_CLIENT_ID
HUBSPOT_CLIENT_SECRET=TU_HUBSPOT_CLIENT_SECRET
HUBSPOT_REDIRECT_URI=https://automaticpdfhub.cloud/api/auth/hubspot/callback

JWT_SECRET=JWT_SECRET_32_CARACTERES_MINIMO

STORAGE_PATH=/app/storage
FILE_BASE_URL=https://automaticpdfhub.cloud/files

DOCUMENT_CONCURRENCY=3
HUBSPOT_CONCURRENCY=2
LOG_LEVEL=warn
RATE_LIMIT_MAX_REQUESTS=200
MAX_FILE_SIZE_MB=25
```

### 4.5 🎨 Frontend React
```yaml
Service Type: App
Service Name: automaticpdf-frontend
Source: GitHub Repository
Repository: https://github.com/TU-USUARIO/hubspot-pdf-generator
Branch: main
Build Context: ./frontend
Dockerfile: Dockerfile
Build Target: production
Port: 3020
Internal Port: 80
Memory: 512MB
CPU: 0.5
```

**Build Args para Frontend:**
```env
REACT_APP_API_URL=https://automaticpdfhub.cloud/api
REACT_APP_FILES_URL=https://automaticpdfhub.cloud/files
REACT_APP_ENV=production
```

### 4.6 🌐 Nginx Proxy
```yaml
Service Type: App
Service Name: automaticpdf-nginx
Image: nginx:alpine
Port: 8095 (ESTE ES EL PUERTO PÚBLICO PARA EASYPANEL)
Internal Port: 80
Memory: 128MB
CPU: 0.2
```

**Configuración de Nginx:** (subir archivo `deployment/nginx-production.conf`)

---

## 🔐 PASO 5: CONFIGURAR VARIABLES DE ENTORNO

### 5.1 Generar secretos seguros
```powershell
# Ejecutar en tu máquina local:
node scripts/generate-secrets.js

# Copiar los secretos generados y usarlos en EasyPanel
```

### 5.2 Variables críticas a configurar en EasyPanel
```env
# OBLIGATORIAS - Backend
JWT_SECRET=[secreto_generado_32_caracteres]
POSTGRES_PASSWORD=[password_postgres_seguro]
REDIS_PASSWORD=[password_redis_seguro]

# HUBSPOT - Obtener de https://developers.hubspot.com
HUBSPOT_CLIENT_ID=[tu_client_id_real]
HUBSPOT_CLIENT_SECRET=[tu_client_secret_real]
```

---

## 🔗 PASO 6: CONFIGURAR HUBSPOT APP

### 6.1 En HubSpot Developer Portal
1. Ir a: `https://developers.hubspot.com/`
2. **Create App** → "AutomaticPDF Hub"
3. **App Info:**
   - App Name: `AutomaticPDF Hub`
   - App URL: `https://automaticpdfhub.cloud`
   - Description: `Generador automático de documentos PDF con variables dinámicas`

### 6.2 Auth Configuration
```
Redirect URL: https://automaticpdfhub.cloud/api/auth/hubspot/callback
Scopes: contacts,content,automation,files,crm.objects.deals.read,crm.objects.deals.write,crm.objects.contacts.read,crm.objects.contacts.write,crm.objects.companies.read,crm.objects.companies.write
```

### 6.3 Custom Action Configuration
```json
{
  "name": "Generar Documento PDF",
  "configurationUrl": "https://automaticpdfhub.cloud/hubspot-app/extensions/pdf-generator-config.html",
  "executionUrl": "https://automaticpdfhub.cloud/api/hubspot/workflow-actions/generate-pdf",
  "objectTypes": ["CONTACT", "DEAL", "COMPANY"]
}
```

---

## ✅ PASO 7: DEPLOYMENT Y VERIFICACIÓN

### 7.1 Orden de inicio en EasyPanel
```
1. ✅ PostgreSQL (5487) → Verificar healthy
2. ✅ Redis (6418) → Verificar healthy  
3. ✅ Gotenberg (3021) → Verificar healthy
4. ✅ Backend (3022) → Verificar healthy + ejecutar migraciones
5. ✅ Frontend (3020) → Verificar healthy
6. ✅ Nginx (8095) → Configurar como puerto público
```

### 7.2 Ejecutar migraciones de BD
```bash
# En EasyPanel, ejecutar en Backend service:
npx prisma migrate deploy
npx prisma db seed
```

### 7.3 Configurar dominio en EasyPanel
- **Domain:** `automaticpdfhub.cloud`
- **Service:** `automaticpdf-nginx`
- **Port:** `8095`
- **SSL:** Automático (Let's Encrypt)

### 7.4 URLs de verificación final
```
✅ App: https://automaticpdfhub.cloud
✅ API: https://automaticpdfhub.cloud/api/health
✅ Demo: https://automaticpdfhub.cloud/demo.html
✅ HubSpot Auth: https://automaticpdfhub.cloud/api/auth/hubspot/authorize
```

---

## 🛡️ CONFIGURACIÓN DE SEGURIDAD

### Firewall en EasyPanel
```
PERMITIR:
- Puerto 8095 (HTTP público)
- Puerto 443 (HTTPS público)  
- Puerto 22 (SSH admin)

BLOQUEAR acceso directo:
- 5487 (PostgreSQL)
- 6418 (Redis)
- 3021, 3022, 3020 (servicios internos)
```

---

## 📋 CHECKLIST FINAL

- [ ] Código subido a GitHub
- [ ] DNS configurado (automaticpdfhub.cloud → 145.79.2.141)
- [ ] PostgreSQL creado y healthy (puerto 5487)
- [ ] Redis creado y healthy (puerto 6418)
- [ ] Gotenberg creado y healthy (puerto 3021)
- [ ] Backend deployado desde GitHub (puerto 3022)
- [ ] Frontend deployado desde GitHub (puerto 3020)
- [ ] Nginx configurado (puerto 8095 público)
- [ ] Dominio conectado en EasyPanel
- [ ] SSL activado (Let's Encrypt)
- [ ] HubSpot App configurada
- [ ] Variables de entorno configuradas
- [ ] Migraciones de BD ejecutadas
- [ ] Health checks pasando
- [ ] Demo funcionando: `https://automaticpdfhub.cloud/demo.html`

---

## 🚨 CREDENCIALES IMPORTANTES

**Guardar estos datos de forma segura:**
- PostgreSQL: `automaticpdf_user` / `[password_generado]` / puerto 5487
- Redis: `[password_redis_generado]` / puerto 6418
- JWT_SECRET: `[secret_generado_32_caracteres]`
- HubSpot Client ID/Secret
- Domain: `automaticpdfhub.cloud` → `145.79.2.141`

**¿Quieres que proceda con el primer paso (subir a GitHub) o necesitas alguna aclaración?**
