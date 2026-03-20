#!/bin/bash

echo "Starting Diabetes Risk App..."
echo ""
echo "This will start both the backend (port 5000) and frontend (port 5173)."
echo ""
echo "Backend (Flask) starting..."
python app.py &
BACKEND_PID=$!

sleep 3

echo ""
echo "Frontend (React) starting..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo "✅ Both servers are running!"
echo "=========================================="
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers."
echo "=========================================="

wait
