@echo off
echo ========================================
echo   Clean Start - New Port 55453
echo ========================================
echo.

echo [1/3] Stopping old services...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3456" ^| findstr "LISTENING"') do (
    echo Killing old Backend on port 3456 (PID %%a)
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":55453" ^| findstr "LISTENING"') do (
    echo Killing Backend on port 55453 (PID %%a)
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":2345" ^| findstr "LISTENING"') do (
    echo Killing Evolution API on port 2345 (PID %%a)
    taskkill /F /PID %%a 2>nul
)
timeout /t 3 /nobreak > nul

echo [2/3] Building Backend...
cd whatsdeveloper-backend
call npm run build
cd ..

echo [3/3] Starting services with new port...
call start-all.bat

echo.
echo ========================================
echo   Clean Start Complete!
echo ========================================
echo.
echo Backend now on: http://localhost:55453
echo Status check: http://localhost:55453/api/webhook/status
echo.
