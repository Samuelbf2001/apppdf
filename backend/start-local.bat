@echo off
echo 🚀 Iniciando servicios locales para HubSpot PDF Backend...
echo.

echo 📦 Iniciando Redis y PostgreSQL...
docker-compose -f docker-compose.local.yml up -d

echo.
echo ⏳ Esperando que los servicios estén listos...
timeout /t 10 /nobreak > nul

echo.
echo 🧪 Ejecutando test local...
npx ts-node test-local.ts

echo.
echo ✅ Test completado. Presiona cualquier tecla para continuar...
pause > nul
