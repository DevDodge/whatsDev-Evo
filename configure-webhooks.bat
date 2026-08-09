@echo off
echo ========================================
echo  Configure Webhooks - WhatsDeveloper
echo ========================================
echo.

REM Configuration
set BACKEND_URL=https://dk.whatsdeveloper.com/api
set EVOLUTION_URL=https://dk.whatsdeveloper.com/evolution
set N8N_WEBHOOK=https://n8n.octobot.it.com/webhook/octoboto
set INSTANCE_NAME=OctoBot

echo Waiting for services to start...
timeout /t 5 /nobreak > nul
echo.

REM Step 1: Register n8n webhook in Backend
echo [1/2] Registering n8n webhook in Backend...
echo URL: %BACKEND_URL%/webhook/register
echo Target: %N8N_WEBHOOK%
echo.

curl -X POST "%BACKEND_URL%/webhook/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"url\":\"%N8N_WEBHOOK%\",\"enabled\":true}"

echo.
echo.
timeout /t 2 /nobreak > nul

REM Step 2: Configure Evolution API to send to Backend
echo [2/2] Configuring Evolution API webhook...
echo Instance: %INSTANCE_NAME%
echo Target: %BACKEND_URL%/webhook/incoming
echo.

curl -X POST "%EVOLUTION_URL%/webhook/set/%INSTANCE_NAME%" ^
  -H "Content-Type: application/json" ^
  -H "apikey: YOUR_EVOLUTION_API_KEY" ^
  -d "{\"webhook\":{\"enabled\":true,\"url\":\"%BACKEND_URL%/webhook/incoming\",\"events\":[\"messages.upsert\"],\"webhookByEvents\":false}}"

echo.
echo.
echo ========================================
echo   Webhook Configuration Complete!
echo ========================================
echo.
echo Flow:
echo   WhatsApp --^> Evolution API --^> Backend Bridge --^> n8n
echo.
echo Evolution webhook: %BACKEND_URL%/webhook/incoming
echo Backend forwards to: %N8N_WEBHOOK%
echo.
echo IMPORTANT: Replace YOUR_EVOLUTION_API_KEY above with your actual API key!
echo You can find it in Evolution API settings.
echo.
pause
