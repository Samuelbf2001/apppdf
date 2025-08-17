@echo off
REM ===============================================
REM SCRIPT PARA SUBIR A GITHUB - WINDOWS
REM HubSpot PDF Generator
REM ===============================================

echo 🚀 Preparando proyecto para GitHub...
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: Ejecutar desde la raíz del proyecto
    pause
    exit /b 1
)

echo ✅ Directorio correcto verificado
echo.

REM Crear .gitignore optimizado
echo 📝 Creando .gitignore...
(
echo # Dependencies
echo node_modules/
echo npm-debug.log*
echo yarn-debug.log*
echo.
echo # Build outputs  
echo dist/
echo build/
echo *.tsbuildinfo
echo.
echo # Environment files
echo .env
echo .env.local
echo .env.production
echo .env.test
echo deployment/secrets/
echo.
echo # Logs
echo logs/
echo *.log
echo.
echo # Storage y uploads
echo storage/
echo temp/
echo uploads/
echo backups/
echo.
echo # IDE
echo .vscode/
echo .idea/
echo *.swp
echo *.swo
echo.
echo # OS
echo .DS_Store
echo Thumbs.db
echo desktop.ini
echo.
echo # Docker
echo .dockerignore
) > .gitignore

echo ✅ .gitignore creado

REM Crear archivo de deployment info
echo 📋 Creando DEPLOYMENT.md...
(
echo # 🌐 automaticpdfhub.cloud - Deployment Info
echo.
echo **Servidor:** https://145.79.2.141/
echo **Dominio:** automaticpdfhub.cloud
echo **Proyecto:** hubspot-pdf-generator
echo.
echo ## Puertos asignados:
echo - 8095: HTTP público ^(para EasyPanel^)
echo - 5487: PostgreSQL
echo - 6418: Redis
echo - 3021: Gotenberg
echo - 3022: Backend API
echo - 3020: Frontend
echo.
echo ## Servicios:
echo - ✅ PostgreSQL 15 ^(database^)
echo - ✅ Redis 7 ^(cache/queues^)
echo - ✅ Gotenberg 7 ^(PDF generation^)
echo - ✅ Node.js 18 ^(backend API^)
echo - ✅ React 18 ^(frontend^)
echo - ✅ Nginx ^(proxy/SSL^)
echo.
echo ## URLs finales:
echo - App: https://automaticpdfhub.cloud
echo - API: https://automaticpdfhub.cloud/api
echo - Demo: https://automaticpdfhub.cloud/demo.html
echo.
echo Ver DEPLOY-EASYPANEL.md para instrucciones completas.
) > DEPLOYMENT.md

echo ✅ DEPLOYMENT.md creado
echo.

REM Verificar Git
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git no está instalado
    echo 📥 Descargar de: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✅ Git disponible
echo.

REM Inicializar Git si no está
if not exist ".git" (
    echo 🔧 Inicializando repositorio Git...
    git init
    echo ✅ Git inicializado
) else (
    echo ✅ Repositorio Git ya existe
)

echo.
echo 📤 Listo para subir a GitHub!
echo.
echo 📋 SIGUIENTE PASOS:
echo.
echo 1. 🌐 Crear repositorio en GitHub:
echo    └─ Ir a: https://github.com/new
echo    └─ Nombre: hubspot-pdf-generator
echo    └─ Descripción: Generador automático de PDFs - automaticpdfhub.cloud
echo.
echo 2. 🔗 Configurar remote ^(CAMBIAR por tu usuario^):
echo    git remote add origin https://github.com/TU-USUARIO/hubspot-pdf-generator.git
echo.
echo 3. 📦 Agregar archivos y hacer commit:
echo    git add .
echo    git commit -m "feat: Complete system for automaticpdfhub.cloud"
echo.
echo 4. 🚀 Subir a GitHub:
echo    git branch -M main
echo    git push -u origin main
echo.
echo 5. 🏗️ Continuar con EasyPanel según DEPLOY-EASYPANEL.md
echo.

echo ⚠️  IMPORTANTE:
echo    - Cambiar TU-USUARIO por tu usuario real de GitHub
echo    - Guardar las credenciales de base de datos
echo    - Configurar credenciales de HubSpot
echo.

pause
