# Dockerfile para Nginx Reverse Proxy de Producción
# AutomaticPDFHub - EasyPanel Deployment

FROM nginx:alpine

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar configuración de Nginx personalizada
COPY nginx-production.conf /etc/nginx/conf.d/default.conf

# Crear directorio para logs
RUN mkdir -p /var/log/nginx

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
