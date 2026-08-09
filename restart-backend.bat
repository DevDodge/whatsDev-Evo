@echo off
echo ========================================
echo Restarting WhatsDeveloper Backend
echo ========================================
echo.

cd whatsdeveloper-backend

echo [1/3] Building TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

echo [2/3] Stopping existing backend process...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq WhatsDeveloper Backend*" 2>nul
timeout /t 2 /nobreak >nul
echo.

echo [3/3] Starting backend...
start "WhatsDeveloper Backend" npm start

echo.
echo ========================================
echo Backend restarted successfully!
echo Check the new window for logs
echo ========================================
echo.
pause
