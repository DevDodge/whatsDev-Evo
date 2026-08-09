@echo off
echo ========================================
echo   Quick Restart - Backend Only
echo ========================================
echo.

cd whatsdeveloper-backend

echo [1/3] Stopping Backend...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3456" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)
timeout /t 2 /nobreak > nul

echo [2/3] Building Backend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo [3/3] Starting Backend...
start "WhatsDev Backend Bridge" cmd /k "npm start"

cd ..

echo.
echo ========================================
echo   Backend Restarted!
echo ========================================
echo.
echo Backend running on: http://localhost:3456
echo.
echo Test with: curl http://localhost:3456/api/webhook/status
echo.
pause
