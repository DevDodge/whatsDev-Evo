@echo off
echo ========================================
echo Installing Dependencies...
echo ========================================
echo.

echo [1/3] Installing Evolution API dependencies...
cd evolution-api
call npm install
cd ..

echo [2/3] Installing Backend dependencies...
cd whatsdeveloper-backend
call npm install
cd ..

echo [3/3] Installing Manager dependencies...
cd WhatsDeveloper-Manager
call npm install
cd ..

echo.
echo ========================================
echo Dependencies installed successfully!
echo ========================================
pause
