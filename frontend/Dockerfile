# Frontend Dockerfile para React + TypeScript
# Multi-stage build para optimización

# =====================================
# Build Arguments
# =====================================
ARG NODE_ENV=production
ARG PORT=80
ARG GENERATE_SOURCEMAP=false
ARG GIT_SHA

# =====================================
# Stage 1: Build
# =====================================
FROM node:18-alpine AS build

WORKDIR /app

# Variables de entorno para build
ARG REACT_APP_API_URL=https://automaticpdfhub.cloud/api
ARG REACT_APP_APP_NAME=AutomaticPDFHub
ARG REACT_APP_VERSION=1.0.0
ARG REACT_APP_HUBSPOT_CLIENT_ID
ARG REACT_APP_BACKEND_URL=https://automaticpdfhub.cloud

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_APP_NAME=$REACT_APP_APP_NAME
ENV REACT_APP_VERSION=$REACT_APP_VERSION
ENV REACT_APP_HUBSPOT_CLIENT_ID=$REACT_APP_HUBSPOT_CLIENT_ID
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV GENERATE_SOURCEMAP=false
ENV CI=true

# Copiar package files
COPY package*.json ./

    # Instalar dependencias (con legacy-peer-deps para resolver conflictos de TypeScript)
    RUN npm install --legacy-peer-deps

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# =====================================
# Stage 2: Production (Nginx)
# =====================================
FROM nginx:alpine AS production

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build files
COPY --from=build /app/build /usr/share/nginx/html

# Crear usuario no-root
RUN addgroup -g 1001 -S nginx_group
RUN adduser -S nginx_user -u 1001

# Permisos
RUN chown -R nginx_user:nginx_group /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Exponer puerto
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]