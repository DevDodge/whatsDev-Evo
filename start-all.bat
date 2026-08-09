@echo off
echo ========================================
echo   Starting WhatsDeveloper Evolution
echo ========================================
echo.

REM Kill any existing processes on ports
echo [0/4] Cleaning up existing services...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":2345" ^| findstr "LISTENING"') do (
    echo Killing process on port 2345 (PID %%a)
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":55453" ^| findstr "LISTENING"') do (
    echo Killing process on port 55453 (PID %%a)
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4567" ^| findstr "LISTENING"') do (
    echo Killing process on port 4567 (PID %%a)
    taskkill /F /PID %%a 2>nul
)
timeout /t 3 /nobreak > nul
echo Ports cleared.
echo.

REM Create logs directory if not exists
if not exist "logs" mkdir logs

REM Build Backend API First
echo [1/4] Building Backend API...
cd whatsdeveloper-backend
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Backend build failed!
    pause
    exit /b 1
)
cd ..
echo Backend built successfully.
echo.
timeout /t 2 /nobreak > nul

REM Start Evolution API
echo [2/4] Starting Evolution API (Port 2345)...
cd evolution-api
start "Evolution API" cmd /k "npm start"
cd ..
timeout /t 10 /nobreak > nul

REM Start Backend API
echo [3/4] Starting Backend API (Port 55453)...
cd whatsdeveloper-backend
start "WhatsDev Backend Bridge" cmd /k "npm start"
cd ..
timeout /t 8 /nobreak > nul

REM Start Manager UI
echo [4/4] Starting Manager UI (Port 4567)...
cd WhatsDeveloper-Manager
start "Manager UI" cmd /k "npm run dev -- --port 4567 --host"
cd ..

echo.
echo ========================================
echo   All Services Started Successfully!
echo ========================================
echo.
echo Evolution API:    http://localhost:2345
echo Backend Bridge:   http://localhost:55453
echo Manager UI:       http://localhost:4567
echo.
echo Public URLs:
echo Evolution:        https://dk.whatsdeveloper.com/evolution
echo Backend:          https://dk.whatsdeveloper.com/api
echo Manager:          https://dk.whatsdeveloper.com/
echo.
echo ========================================
echo   IMPORTANT: Webhook Configuration
echo ========================================
echo.
echo 1. Evolution webhook URL should be:
echo    https://dk.whatsdeveloper.com/api/webhook/incoming
echo.
echo 2. Register your n8n webhook in backend:
echo    POST https://dk.whatsdeveloper.com/api/webhook/register
echo    Body: {"url": "https://n8n.octobot.it.com/webhook/octoboto"}
echo.
echo Three CMD windows have been opened.
echo.
echo Press any key to exit this window...
pause > nul
