#!/bin/bash

echo "========================================"
echo "  Starting WhatsDeveloper Evolution"
echo "========================================"
echo ""

# Create logs directory
mkdir -p logs

# Start Evolution API
echo "[1/3] Starting Evolution API (Port 2345)..."
cd evolution-api
npm start > ../logs/evolution-api.log 2>&1 &
echo $! > ../logs/evolution-api.pid
cd ..
sleep 5

# Start Backend API
echo "[2/3] Starting Backend API (Port 3456)..."
cd whatsdeveloper-backend
npm start > ../logs/backend.log 2>&1 &
echo $! > ../logs/backend.pid
cd ..
sleep 5

# Start Manager UI
echo "[3/3] Starting Manager UI (Port 4567)..."
cd WhatsDeveloper-Manager
npm run dev -- --port 4567 --host > ../logs/manager.log 2>&1 &
echo $! > ../logs/manager.pid
cd ..

echo ""
echo "========================================"
echo "  All Services Started!"
echo "========================================"
echo ""
echo "Evolution API:  http://localhost:2345"
echo "Backend API:    http://localhost:3456"
echo "Manager UI:     http://localhost:4567"
echo ""
echo "Domain:         https://dk.whatsdeveloper.com/"
echo ""
echo "Logs available in ./logs/"
echo "PID files available in ./logs/*.pid"
echo ""
