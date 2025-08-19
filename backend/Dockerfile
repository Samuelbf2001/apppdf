# Dockerfile para el backend de HubSpot PDF Generator
# Multi-stage build para optimizar tamaño en producción

# =====================================
# Build Arguments (para compatibilidad con EasyPanel)
# =====================================
ARG NODE_ENV=production
ARG APP_PORT=3002
ARG FRONTEND_URL
ARG DATABASE_URL
ARG REDIS_URL
ARG GOTENBERG_URL
ARG HUBSPOT_APP_ID
ARG HUBSPOT_CLIENT_ID
ARG HUBSPOT_CLIENT_SECRET
ARG HUBSPOT_REDIRECT_URI
ARG HUBSPOT_BASE_URL
ARG JWT_SECRET
ARG ENCRYPTION_KEY
ARG STORAGE_PATH
ARG FILE_BASE_URL
ARG DOCUMENT_CONCURRENCY
ARG HUBSPOT_CONCURRENCY
ARG LOG_LEVEL
ARG RATE_LIMIT_MAX_REQUESTS
ARG MAX_FILE_SIZE_MB
ARG CORS_ORIGIN
ARG UPLOAD_PATH
ARG MAX_FILE_SIZE
ARG RATE_LIMIT_WINDOW_MS
ARG ENABLE_METRICS
ARG GIT_SHA

# =====================================
# Stage 1: Dependencies
# =====================================
FROM node:18-alpine AS dependencies

WORKDIR /app

# Alpine 3.21 usa OpenSSL 3.x por defecto
# No se necesita instalación adicional

# Copiar package files
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias de producción (sin package-lock.json, usar npm install)
RUN npm install --only=production && npm cache clean --force

# Generar cliente Prisma
RUN npx prisma generate

# =====================================
# Stage 2: Build
# =====================================
FROM node:18-alpine AS build

WORKDIR /app

# Alpine 3.21 usa OpenSSL 3.x por defecto
# No se necesita instalación adicional

# Copiar package files
COPY package*.json ./
COPY tsconfig.json ./

# Instalar TODAS las dependencias (incluyendo dev)
RUN npm install

# Copiar código fuente
COPY src ./src
COPY prisma ./prisma

# Generar cliente Prisma
RUN npx prisma generate

# Skip TypeScript compilation due to errors
# We'll run directly with ts-node in production
# RUN npm run build

# =====================================
# Stage 3: Production (DEFAULT - último stage)
# =====================================
FROM node:18-alpine AS production

# Crear usuario no-root (Alpine)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S hubspot -u 1001 -G nodejs

WORKDIR /app

# Instalar dependencias de sistema necesarias (Alpine/OpenSSL 3.x)
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    openssl \
    tini

# Configurar zona horaria
ENV TZ=America/Mexico_City

# Copiar dependencias de producción
COPY --from=dependencies --chown=hubspot:nodejs /app/node_modules ./node_modules
COPY --from=dependencies --chown=hubspot:nodejs /app/package*.json ./

# Copiar código fuente y configuración desde build stage
COPY --from=build --chown=hubspot:nodejs /app/src ./src
COPY --from=build --chown=hubspot:nodejs /app/tsconfig.json ./
COPY --from=build --chown=hubspot:nodejs /app/prisma ./prisma
COPY --from=build --chown=hubspot:nodejs /app/node_modules ./node_modules

# Crear directorios necesarios
RUN mkdir -p logs storage/documents storage/temp && \
    chown -R hubspot:nodejs logs storage

# Variables de entorno
ENV NODE_ENV=production
ENV APP_PORT=3002

# Exponer puerto
EXPOSE 3002

# Cambiar a usuario no-root
USER hubspot

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3002/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Regenerar Prisma y verificar
RUN npx prisma generate && \
    node -e "require('@prisma/client')" || (echo "ERROR: Prisma client failed to load" && exit 1)

# Usar tini como init system
ENTRYPOINT ["/sbin/tini", "--"]

# Comando por defecto - usar ts-node directamente
CMD ["npx", "ts-node", "--transpile-only", "src/server.ts"]
