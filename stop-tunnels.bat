@echo off
echo Stopping all localtunnel processes...

REM Find and kill all node processes running lt (localtunnel)
for /f "tokens=2" %%i in ('tasklist ^| findstr /i "node.exe"') do (
    taskkill //F //PID %%i 2>nul
)

echo.
echo All node processes have been stopped.
echo This includes localtunnel and any other node processes.
echo.
echo You may need to restart your dev servers (backend and frontend) if they were stopped.
echo.
pause
