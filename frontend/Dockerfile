# Dockerfile para el frontend de HubSpot PDF Generator
# Multi-stage build para optimizar para producción

# =====================================
# Stage 1: Build
# =====================================
FROM node:18-alpine AS build

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY public ./public
COPY src ./src
COPY tsconfig.json ./

# Variables de build
ARG REACT_APP_API_URL=http://localhost:3002/api
ARG REACT_APP_FILES_URL=http://localhost:3002/files
ARG REACT_APP_ENV=production

# Construir aplicación
RUN npm run build

# =====================================
# Stage 2: Production
# =====================================
FROM nginx:alpine AS production

# Copiar archivos compilados
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración custom de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Variables de entorno
ENV REACT_APP_API_URL=http://localhost:3002/api
ENV REACT_APP_FILES_URL=http://localhost:3002/files

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]

# =====================================
# Stage 3: Development
# =====================================
FROM node:18-alpine AS development

WORKDIR /app

# Instalar dependencias de sistema
RUN apk add --no-cache git

# Copiar package files
COPY package*.json ./

# Instalar todas las dependencias
RUN npm ci

# Variables de entorno para desarrollo
ENV REACT_APP_API_URL=http://localhost:3002/api
ENV REACT_APP_FILES_URL=http://localhost:3002/files
ENV REACT_APP_ENV=development

# Exponer puerto
EXPOSE 3000

# Comando para desarrollo con hot reload
CMD ["npm", "start"]
