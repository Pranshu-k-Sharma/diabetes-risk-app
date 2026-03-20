@echo off
REM Start Diabetes Risk App on Windows

echo Starting Diabetes Risk App...
echo.
echo This will start both the backend (port 5000) and frontend (port 5173).
echo.

REM Start backend in a new terminal window
echo Starting Backend (Flask)...
start cmd /k python app.py

REM Wait a bit for backend to start
timeout /t 3 /nobreak

REM Start frontend in a new terminal window
echo Starting Frontend (React)...
cd frontend
start cmd /k npm run dev

echo.
echo ==========================================
echo. Both servers should be opening in new windows
echo ==========================================
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo Close the terminal windows to stop.
echo ==========================================
