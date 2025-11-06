@echo off
echo Starting localtunnel for backend (port 3001)...
start "Backend Tunnel" cmd /k "lt --port 3001"

timeout /t 2 /nobreak >nul

echo Starting localtunnel for frontend (port 5173)...
start "Frontend Tunnel" cmd /k "lt --port 5173"

echo.
echo Tunnels are starting in separate windows.
echo Wait a few seconds, then check the windows for your public URLs.
echo.
pause
