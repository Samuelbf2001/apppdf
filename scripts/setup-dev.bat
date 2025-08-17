@echo off
REM ===============================================
REM SCRIPT DE CONFIGURACIÓN PARA DESARROLLO - WINDOWS
REM HubSpot PDF Generator
REM ===============================================

echo 🚀 Configurando HubSpot PDF Generator para desarrollo...

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Este script debe ejecutarse desde la raíz del proyecto
    exit /b 1
)

echo 📋 Verificando dependencias del sistema...

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado. Instala Node.js 18+ desde https://nodejs.org
    exit /b 1
)

echo ✅ Node.js instalado

REM Verificar npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm no está instalado
    exit /b 1
)

echo ✅ npm instalado

REM Verificar Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Docker no está instalado. Recomendado para servicios completos
) else (
    echo ✅ Docker instalado
)

REM Configurar variables de entorno
echo 📝 Configurando variables de entorno...

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo ✅ Archivo .env creado desde .env.example
    ) else (
        echo ❌ No se encontró .env.example
        exit /b 1
    )
) else (
    echo ⚠️ El archivo .env ya existe, no se sobrescribirá
)

REM Configurar backend
echo 📦 Configurando backend...

cd backend

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo ✅ Backend .env creado
    )
)

echo 📦 Instalando dependencias del backend...
call npm install

if errorlevel 1 (
    echo ❌ Error instalando dependencias del backend
    exit /b 1
)

echo ✅ Dependencias del backend instaladas

REM Configurar frontend
echo 🎨 Configurando frontend...

cd ..\frontend

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo ✅ Frontend .env creado
    )
)

echo 📦 Instalando dependencias del frontend...
call npm install

if errorlevel 1 (
    echo ❌ Error instalando dependencias del frontend
    exit /b 1
)

echo ✅ Dependencias del frontend instaladas

cd ..

REM Configurar servicios con Docker (si está disponible)
docker --version >nul 2>&1
if not errorlevel 1 (
    echo 🐳 Configurando servicios con Docker...
    
    echo 🚀 Levantando servicios de desarrollo...
    docker-compose -f docker-compose.dev.yml up -d postgres redis gotenberg
    
    echo ⏳ Esperando a que los servicios estén listos...
    timeout /t 15 /nobreak >nul
    
    echo 🗄️ Configurando base de datos...
    cd backend
    
    REM Generar cliente Prisma
    call npx prisma generate
    echo ✅ Cliente Prisma generado
    
    REM Ejecutar migraciones
    call npx prisma migrate dev --name init
    echo ✅ Migraciones ejecutadas
    
    REM Ejecutar seed
    call npx prisma db seed
    echo ✅ Datos de ejemplo insertados
    
    cd ..
    
    echo ✅ Servicios Docker configurados
) else (
    echo ⚠️ Docker no disponible. Configurar servicios manualmente:
    echo   - PostgreSQL en puerto 5432
    echo   - Redis en puerto 6379  
    echo   - Gotenberg en puerto 3001
)

REM Crear directorios necesarios
echo 📁 Creando directorios necesarios...

if not exist "storage" mkdir storage
if not exist "storage\documents" mkdir storage\documents
if not exist "storage\temp" mkdir storage\temp
if not exist "logs" mkdir logs
if not exist "backups" mkdir backups

echo ✅ Directorios creados

REM Mostrar siguientes pasos
echo.
echo 🎉 ¡Configuración completada exitosamente!
echo.
echo 📋 Próximos pasos:
echo.
echo 1. 📝 Editar archivo .env con tus credenciales de HubSpot:
echo    - HUBSPOT_CLIENT_ID
echo    - HUBSPOT_CLIENT_SECRET  
echo    - JWT_SECRET (generar uno seguro)
echo.
echo 2. 🚀 Ejecutar en modo desarrollo:
echo    Backend:  cd backend ^&^& npm run dev
echo    Frontend: cd frontend ^&^& npm start
echo.
echo 3. 🌐 Acceder a la aplicación:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3002
echo    DB Admin: http://localhost:8081 (si usas Docker tools)
echo.
echo 4. 📚 Ver documentación completa en README.md
echo.

docker --version >nul 2>&1
if not errorlevel 1 (
    echo 🐳 Servicios Docker ejecutándose:
    docker-compose -f docker-compose.dev.yml ps
)

echo ✅ Setup completado. ¡Feliz desarrollo! 🚀
pause
