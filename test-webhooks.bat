@echo off
echo ========================================
echo   Test Webhook Configuration
echo ========================================
echo.

set BACKEND_URL=http://localhost:3456/api
set EVOLUTION_URL=http://localhost:2345

echo Testing local services...
echo.

REM Test 1: Backend Health
echo [1/4] Testing Backend API...
curl -s %BACKEND_URL%/health
echo.
echo.
timeout /t 2 /nobreak > nul

REM Test 2: Get webhook config
echo [2/4] Checking Backend webhook configuration...
curl -s %BACKEND_URL%/webhook/config
echo.
echo.
timeout /t 2 /nobreak > nul

REM Test 3: Send test webhook
echo [3/4] Sending test webhook from Backend...
curl -s -X POST %BACKEND_URL%/webhook/test
echo.
echo.
timeout /t 2 /nobreak > nul

REM Test 4: Check Evolution connection
echo [4/4] Testing Evolution API connection...
curl -s %EVOLUTION_URL%/
echo.
echo.

echo ========================================
echo   Test Complete!
echo ========================================
echo.
echo Check n8n to see if test webhook arrived.
echo.
echo If everything is configured correctly, you should see:
echo - Backend returns webhook config with n8n URL
echo - Test webhook sent successfully
echo - n8n received a test message payload
echo.
pause
