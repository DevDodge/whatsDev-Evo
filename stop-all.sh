#!/bin/bash

echo "========================================"
echo "  Stopping All Services"
echo "========================================"
echo ""

# Kill processes by PID
if [ -f logs/evolution-api.pid ]; then
  echo "Stopping Evolution API..."
  kill $(cat logs/evolution-api.pid) 2>/dev/null
  rm logs/evolution-api.pid
fi

if [ -f logs/backend.pid ]; then
  echo "Stopping Backend API..."
  kill $(cat logs/backend.pid) 2>/dev/null
  rm logs/backend.pid
fi

if [ -f logs/manager.pid ]; then
  echo "Stopping Manager UI..."
  kill $(cat logs/manager.pid) 2>/dev/null
  rm logs/manager.pid
fi

echo ""
echo "All services stopped."
echo ""
