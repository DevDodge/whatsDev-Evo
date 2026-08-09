@echo off
echo ========================================
echo   Stopping WhatsDeveloper Services
echo ========================================
echo.

REM Stop services on specific ports only (2345, 55453, 4567)
echo Stopping services on ports 2345, 55453, 4567...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":2345" ^| findstr "LISTENING"') do (
    echo Stopping Evolution API (Port 2345, PID %%a)
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":55453" ^| findstr "LISTENING"') do (
    echo Stopping Backend API (Port 55453, PID %%a)
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4567" ^| findstr "LISTENING"') do (
    echo Stopping Manager UI (Port 4567, PID %%a)
    taskkill /F /PID %%a 2>nul
)

echo.
echo Services on ports 2345, 55453, 4567 stopped.
echo.
pause
