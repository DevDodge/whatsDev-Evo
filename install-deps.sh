#!/bin/bash
# WhatsDeveloper-Evolution Stack Startup Script
# Server: 178.63.34.211

echo "========================================"
echo "Installing Dependencies..."
echo "========================================"

# Install Evolution API dependencies
echo "[1/3] Installing Evolution API dependencies..."
cd evolution-api
npm install
cd ..

# Install Backend dependencies
echo "[2/3] Installing Backend dependencies..."
cd whatsdeveloper-backend
npm install
cd ..

# Install Manager dependencies
echo "[3/3] Installing Manager dependencies..."
cd WhatsDeveloper-Manager
npm install
cd ..

echo ""
echo "========================================"
echo "Dependencies installed successfully!"
echo "========================================"
