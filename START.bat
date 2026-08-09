@echo off
REM ============================================================
REM   START - WhatsDeveloper (dk.whatsdeveloper.com)
REM ============================================================
REM   Backend + Evolution run under pm2 (auto-restart on crash).
REM   The Manager frontend is a STATIC build served by IIS from
REM   WhatsDeveloper-Manager\dist - there is no dev server.
REM
REM   Do NOT run "npm run dev" for the Manager in production.
REM   A Vite dev server behind IIS dies on ECONNRESET and stays dead.
REM ============================================================
echo.
echo ========================================
echo   START - WhatsDeveloper (pm2)
echo ========================================
echo.

cd /d "%~dp0"

REM ---------- [1/4] Build Backend ----------
echo [1/4] Building Backend...
cd whatsdeveloper-backend
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Backend build failed. Nothing was restarted.
    cd ..
    pause
    exit /b 1
)
cd ..
echo Done.
echo.

REM ---------- [2/4] Build Manager (static, served by IIS) ----------
echo [2/4] Building Manager UI (static)...
cd WhatsDeveloper-Manager
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Manager build failed. Nothing was restarted.
    echo The previously built dist\ is still being served by IIS.
    cd ..
    pause
    exit /b 1
)
cd ..
echo Done.
echo.

REM ---------- [3/4] Start / reload services under pm2 ----------
echo [3/4] Starting services under pm2...
call pm2 startOrReload ecosystem.config.js
if %errorlevel% neq 0 (
    echo.
    echo ERROR: pm2 failed to start the services.
    pause
    exit /b 1
)
call pm2 save
echo Done.
echo.

REM ---------- [4/4] Status ----------
echo [4/4] Current status:
call pm2 list
echo.

echo ========================================
echo   Services
echo ========================================
echo.
echo Evolution API:  http://localhost:2345      (pm2: dkevo-evolution)
echo Backend API:    http://localhost:55453     (pm2: dkevo-backend)
echo Manager UI:     https://dk.whatsdeveloper.com   (IIS static, no process)
echo.
echo Health:         http://localhost:55453/health
echo Webhook status: http://localhost:55453/api/webhook/status
echo.
echo Flow: WhatsApp --^> Evolution --^> Backend --^> n8n
echo.
echo ========================================
echo   Useful pm2 commands
echo ========================================
echo.
echo   pm2 logs dkevo-backend        show backend logs
echo   pm2 logs dkevo-evolution      show evolution logs
echo   pm2 restart dkevo-backend     restart backend only
echo   pm2 list                      status of everything
echo.
echo NOTE: after changing Manager source, re-run this script
echo       (or: cd WhatsDeveloper-Manager ^&^& npm run build).
echo       IIS serves dist\ directly - no restart needed.
echo.
pause
