@echo off
echo ========================================
echo   Restart Evolution API with Logging
echo ========================================
echo.

echo [1/2] Stopping Evolution API...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":2345" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)
timeout /t 3 /nobreak > nul

echo [2/2] Starting Evolution API...
cd evolution-api
start "Evolution API - Check Console" cmd /k "npm start"
cd ..

echo.
echo ========================================
echo   Evolution API Restarted!
echo ========================================
echo.
echo IMPORTANT: Watch the Evolution API console window!
echo It will show [LOCAL_STORAGE] and [WEBHOOK] logs
echo.
echo Now send a media message and watch the logs!
echo.
pause
