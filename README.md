# HubSpot PDF Document Generator

Aplicación pública de HubSpot que permite crear documentos con variables dinámicas y convertirlos a PDF usando Gotenberg.

## 🚀 Características Principales

- ✅ Editor de documentos tipo Word con variables de HubSpot
- ✅ Integración con Gotenberg para conversión PDF
- ✅ Workflow action personalizada en HubSpot
- ✅ Subida automática de archivos a HubSpot
- ✅ Arquitectura escalable para +1000 clientes
- ✅ Multi-tenant con aislamiento de datos

## 🏗️ Arquitectura del Sistema

```
├── frontend/           # React app con editor de documentos
├── backend/           # Node.js API con Express
├── hubspot-app/       # Configuración de la app HubSpot
├── docker/           # Configuraciones Docker
├── database/         # Esquemas y migraciones
└── docs/            # Documentación técnica
```

## 🛠️ Stack Tecnológico

### Frontend
- React 18 con TypeScript
- Material-UI para componentes
- Draft.js para editor de texto rico
- Axios para peticiones HTTP

### Backend
- Node.js 18+ con Express
- TypeScript para tipado fuerte
- PostgreSQL para base de datos
- Redis para caché y sesiones
- Bull Queue para procesamiento asíncrono

### Integraciones
- HubSpot API v3
- Gotenberg para conversión PDF
- AWS S3 para almacenamiento (opcional)

### DevOps
- Docker & Docker Compose
- Nginx como proxy reverso
- PM2 para gestión de procesos

## 🚦 Instalación Rápida

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose
- Gotenberg instalado

### Configuración Inicial

1. **Clonar el repositorio**
```bash
git clone [tu-repo]
cd hubspot-pdf-generator
```

2. **Instalar dependencias**
```bash
# Backend
cd backend && npm install

# Frontend  
cd ../frontend && npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. **Inicializar base de datos**
```bash
cd backend
npm run db:migrate
npm run db:seed
```

5. **Levantar servicios con Docker**
```bash
docker-compose up -d
```

## 🔧 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# HubSpot Configuration
HUBSPOT_CLIENT_ID=your_client_id
HUBSPOT_CLIENT_SECRET=your_client_secret
HUBSPOT_REDIRECT_URI=http://localhost:3000/auth/hubspot/callback

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hubspot_pdf_db
REDIS_URL=redis://localhost:6379

# Gotenberg
GOTENBERG_URL=http://localhost:3001

# App Configuration  
JWT_SECRET=your_jwt_secret_key
APP_PORT=3000
NODE_ENV=development

# File Storage (optional)
AWS_S3_BUCKET=your-s3-bucket
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## 📚 Guías de Desarrollo

### Crear Nuevo Template
```typescript
// Ejemplo de uso del API
const template = await createTemplate({
  name: "Contrato de Servicio",
  content: "Estimado {{contact.firstname}}, ...",
  variables: ["contact.firstname", "contact.email", "deal.amount"]
});
```

### Procesar Documento
```typescript
// Workflow action procesará automáticamente
const document = await processDocument({
  templateId: "template-123",
  contactId: "contact-456",
  dealId: "deal-789"
});
```

## 🔒 Seguridad

- Autenticación OAuth2 con HubSpot
- Tokens JWT para sesiones
- Validación de permisos por tenant
- Sanitización de variables de entrada
- Rate limiting en endpoints críticos

## 📈 Escalabilidad

- Arquitectura multi-tenant
- Queue system para procesamiento asíncrono  
- Cache Redis para consultas frecuentes
- Índices optimizados en base de datos
- Balanceador de carga con Nginx

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run start
```

### Con Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📞 Soporte

Para dudas técnicas, crear un issue en el repositorio o contactar al equipo de desarrollo.

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.