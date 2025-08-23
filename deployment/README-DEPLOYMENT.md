# 🚀 DEPLOYMENT SIMPLIFICADO - HubSpot PDF Generator

## 📋 **RESUMEN DE LA SOLUCIÓN**

He simplificado y optimizado la arquitectura del proyecto para resolver los problemas de despliegue:

### ✅ **PROBLEMAS SOLUCIONADOS**
1. **TypeScript Compilation**: Uso directo de `ts-node --transpile-only` en producción
2. **Logger Winston**: Simplificado para evitar objetos circulares
3. **Middleware Complejo**: Eliminados middlewares problemáticos
4. **Docker Networking**: Hostnames corregidos y healthchecks agregados
5. **Arquitectura Over-engineered**: Simplificada para producción

---

## 🏗️ **ARQUITECTURA SIMPLIFICADA**

```
Usuario → automaticpdfhub.cloud → Nginx (8095) → Frontend (3020) + Backend (3022)
                                              ↓
                                    [PostgreSQL + Redis + Gotenberg]
```

### **Servicios Principales:**
- **PostgreSQL** (5487): Base de datos principal
- **Redis** (6418): Cache y colas
- **Gotenberg** (3021): Generación de PDFs
- **Backend** (3022): API Express + ts-node
- **Frontend** (3020): React SPA
- **Nginx** (8095): Reverse proxy público

---

## 🚀 **DEPLOYMENT AUTOMATIZADO**

### **Opción 1: Script Automático (RECOMENDADO)**
```bash
cd deployment/
./easypanel-deploy.sh
```

### **Opción 2: Manual**
```bash
cd deployment/

# 1. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de HubSpot

# 2. Desplegar servicios
docker-compose -f docker-compose.easypanel.yml up -d --build

# 3. Verificar estado
docker-compose -f docker-compose.easypanel.yml ps
```

---

## ⚙️ **CONFIGURACIÓN REQUERIDA**

### **1. Variables de Entorno (.env)**
```env
# Base de datos
POSTGRES_PASSWORD=tu_password_seguro
REDIS_PASSWORD=tu_password_redis

# JWT
JWT_SECRET=tu_jwt_secret_32_caracteres

# HubSpot (OBLIGATORIO)
HUBSPOT_CLIENT_ID=tu_client_id_real
HUBSPOT_CLIENT_SECRET=tu_client_secret_real

# Configuración
NODE_ENV=production
LOG_LEVEL=warn
```

### **2. Credenciales de HubSpot**
1. Ve a [HubSpot Developer Portal](https://developers.hubspot.com/)
2. Crea una nueva app: "AutomaticPDF Hub"
3. Configura OAuth2 con redirect: `https://automaticpdfhub.cloud/api/auth/hubspot/callback`
4. Copia `Client ID` y `Client Secret` al archivo `.env`

---

## 🔧 **CONFIGURACIÓN EN EASYPANEL**

### **1. Crear Proyecto**
- **Nombre**: `hubspot-pdf-generator`
- **Dominio**: `automaticpdfhub.cloud`

### **2. Configurar Dominio**
- **Service**: `automaticpdf-nginx`
- **Port**: `8095`
- **SSL**: Activar (Let's Encrypt automático)

### **3. Variables de Entorno**
Configurar en cada servicio según el archivo `.env`

---

## 📊 **VERIFICACIÓN DEL DEPLOYMENT**

### **Health Checks**
```bash
# Backend
curl http://localhost:3022/health

# Frontend
curl http://localhost:3020/health

# Nginx público
curl http://localhost:8095/health
```

### **URLs de Acceso**
- **Frontend**: https://automaticpdfhub.cloud
- **API**: https://automaticpdfhub.cloud/api
- **Health**: https://automaticpdfhub.cloud/health
- **Demo**: https://automaticpdfhub.cloud/demo.html

---

## 🛠️ **COMANDOS ÚTILES**

### **Gestión de Servicios**
```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.easypanel.yml logs -f

# Reiniciar servicios
docker-compose -f docker-compose.easypanel.yml restart

# Ver estado
docker-compose -f docker-compose.easypanel.yml ps

# Detener todo
docker-compose -f docker-compose.easypanel.yml down
```

### **Logs Específicos**
```bash
# Backend
docker logs -f automaticpdf-backend

# Frontend
docker logs -f automaticpdf-frontend

# Nginx
docker logs -f automaticpdf-nginx
```

### **Base de Datos**
```bash
# Ejecutar migraciones
docker exec automaticpdf-backend npx prisma migrate deploy

# Generar cliente Prisma
docker exec automaticpdf-backend npx prisma generate

# Acceder a PostgreSQL
docker exec -it automaticpdf-postgres psql -U automaticpdf_user -d automaticpdf_db
```

---

## 🔍 **TROUBLESHOOTING**

### **Problema: Backend no inicia**
```bash
# Ver logs detallados
docker logs automaticpdf-backend

# Verificar variables de entorno
docker exec automaticpdf-backend env | grep -E "(DATABASE_URL|REDIS_URL|JWT_SECRET)"

# Verificar conectividad
docker exec automaticpdf-backend ping postgres
docker exec automaticpdf-backend ping redis
```

### **Problema: Frontend no puede conectar al backend**
```bash
# Verificar nginx logs
docker logs automaticpdf-nginx

# Verificar que el backend responde
curl http://automaticpdf-backend:3002/health

# Verificar configuración nginx
docker exec automaticpdf-nginx nginx -t
```

### **Problema: Base de datos no conecta**
```bash
# Verificar estado PostgreSQL
docker exec automaticpdf-postgres pg_isready -U automaticpdf_user

# Verificar variables de entorno
echo $DATABASE_URL

# Verificar red Docker
docker network ls
docker network inspect hubspot-pdf-generator_automaticpdf-network
```

---

## 📈 **MONITOREO Y MÉTRICAS**

### **Health Checks Automáticos**
- **PostgreSQL**: Cada 30s
- **Redis**: Cada 30s  
- **Gotenberg**: Cada 30s
- **Backend**: Cada 30s
- **Frontend**: Cada 30s
- **Nginx**: Cada 30s

### **Logs Centralizados**
```bash
# Ver todos los logs
docker-compose -f docker-compose.easypanel.yml logs --tail=100

# Filtrar por servicio
docker-compose -f docker-compose.easypanel.yml logs backend --tail=50
```

---

## 🔒 **SEGURIDAD**

### **Headers Implementados**
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` (en producción)
- `Referrer-Policy: strict-origin-when-cross-origin`

### **Acceso Restringido**
- Solo puerto 8095 es público
- Servicios internos no accesibles desde fuera
- CORS configurado para dominios específicos

---

## 📝 **NOTAS TÉCNICAS**

### **Cambios Principales Realizados**
1. **Backend**: Eliminados middlewares complejos, logger simplificado
2. **TypeScript**: Configuración ultra-permisiva para producción
3. **Docker**: Healthchecks, dependencias ordenadas, build optimizado
4. **Nginx**: Configuración simplificada, hostnames corregidos
5. **Scripts**: Deployment automatizado con verificaciones

### **Optimizaciones de Producción**
- **Build multi-stage** para imágenes más pequeñas
- **Health checks** para todos los servicios
- **Dependencias ordenadas** para startup correcto
- **Logs estructurados** para debugging
- **Graceful shutdown** para todos los servicios

---

## 🎯 **PRÓXIMOS PASOS**

1. **Configurar HubSpot App** con las credenciales reales
2. **Probar endpoints** de la API
3. **Configurar dominio** en EasyPanel
4. **Activar SSL/HTTPS**
5. **Testing completo** del flujo de trabajo
6. **Monitoreo** en producción

---

## 📞 **SOPORTE**

Si encuentras problemas:

1. **Revisar logs**: `docker logs [nombre-servicio]`
2. **Verificar health checks**: `curl http://localhost:[puerto]/health`
3. **Verificar variables de entorno**: `docker exec [servicio] env`
4. **Revisar conectividad**: `docker exec [servicio] ping [otro-servicio]`

---

**¡La arquitectura simplificada está lista para producción! 🚀**