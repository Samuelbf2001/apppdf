# Dockerfile simplificado para el backend de HubSpot PDF Generator
# Optimizado para producción con ts-node

# =====================================
# Build Arguments
# =====================================
ARG NODE_ENV=production
ARG APP_PORT=3002

# =====================================
# Stage 1: Dependencies y Build
# =====================================
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    openssl

# Copiar package files
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias
RUN npm ci --only=production && npm cache clean --force

# Generar cliente Prisma
RUN npx prisma generate

# =====================================
# Stage 2: Production
# =====================================
FROM node:18-alpine AS production

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S hubspot -u 1001 -G nodejs

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    openssl \
    tini

# Configurar zona horaria
ENV TZ=America/Mexico_City

# Copiar dependencias y código desde builder
COPY --from=builder --chown=hubspot:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=hubspot:nodejs /app/package*.json ./
COPY --from=builder --chown=hubspot:nodejs /app/prisma ./prisma

# Copiar código fuente
COPY --chown=hubspot:nodejs src ./src
COPY --chown=hubspot:nodejs tsconfig.json ./

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

# Regenerar Prisma
RUN npx prisma generate

# Usar tini como init system
ENTRYPOINT ["/sbin/tini", "--"]

# Comando de inicio - usar ts-node directamente
CMD ["npx", "ts-node", "--transpile-only", "--ignore-type-errors", "src/server.ts"]
