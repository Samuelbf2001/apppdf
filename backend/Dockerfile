# Dockerfile para el backend de HubSpot PDF Generator
# Multi-stage build para optimizar tamaño en producción

# =====================================
# Stage 1: Dependencies
# =====================================
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Generar cliente Prisma
RUN npx prisma generate

# =====================================
# Stage 2: Build
# =====================================
FROM node:18-alpine AS build

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY tsconfig.json ./

# Instalar todas las dependencias (incluyendo dev)
RUN npm ci

# Copiar código fuente
COPY src ./src
COPY prisma ./prisma

# Generar cliente Prisma
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# =====================================
# Stage 3: Production
# =====================================
FROM node:18-alpine AS production

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S hubspot -u 1001

WORKDIR /app

# Instalar dependencias de sistema necesarias
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    && rm -rf /var/cache/apk/*

# Configurar zona horaria
ENV TZ=America/Mexico_City

# Copiar dependencias de producción
COPY --from=dependencies --chown=hubspot:nodejs /app/node_modules ./node_modules
COPY --from=dependencies --chown=hubspot:nodejs /app/package*.json ./

# Copiar código compilado
COPY --from=build --chown=hubspot:nodejs /app/dist ./dist
COPY --from=build --chown=hubspot:nodejs /app/prisma ./prisma

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

# Comando por defecto
CMD ["npm", "start"]

# =====================================
# Stage 4: Development
# =====================================
FROM node:18-alpine AS development

WORKDIR /app

# Instalar dependencias de sistema para desarrollo
RUN apk add --no-cache \
    ca-certificates \
    git \
    && rm -rf /var/cache/apk/*

# Copiar package files
COPY package*.json ./
COPY tsconfig.json ./

# Instalar todas las dependencias
RUN npm ci

# Copiar prisma schema
COPY prisma ./prisma

# Generar cliente Prisma
RUN npx prisma generate

# Crear directorios necesarios
RUN mkdir -p logs storage/documents storage/temp

# Variables de entorno para desarrollo
ENV NODE_ENV=development
ENV APP_PORT=3002

# Exponer puerto
EXPOSE 3002

# Comando para desarrollo con hot reload
CMD ["npm", "run", "dev"]
