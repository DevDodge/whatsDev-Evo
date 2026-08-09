@echo off
echo ========================================
echo   Restart Evolution API Only
echo ========================================
echo.

echo [1/3] Stopping Evolution API...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":2345" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)
timeout /t 3 /nobreak > nul

echo [2/3] Starting Evolution API...
cd evolution-api
start "Evolution API" cmd /k "npm start"
cd ..

echo [3/3] Waiting for Evolution to start...
timeout /t 10 /nobreak > nul

echo.
echo ========================================
echo   Evolution API Restarted!
echo ========================================
echo.
echo Evolution API: http://localhost:2345
echo.
echo Now test by sending a media message!
echo.
pause
