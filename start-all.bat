@echo off
echo ==========================================
echo      Tech Site Craft - Startup Script
echo ==========================================
echo.

echo [1/3] Checking API server dependencies...
if not exist "server\node_modules" (
    echo     Installing API server dependencies...
    cd server
    call npm install
    if %errorlevel% neq 0 (
        echo     X Error installing API dependencies
        pause
        exit /b 1
    )
    cd ..
) else (
    echo     OK API server dependencies installed
)

echo.
echo [2/3] Checking frontend dependencies...
if not exist "node_modules" (
    echo     Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo     X Error installing frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo     OK Frontend dependencies installed
)

echo.
echo [3/3] Starting services...
echo.
echo     Starting API server with WebSocket support (port 3001)...
start "Tech Site API Server" cmd /k "cd /d %~dp0server && npm start"

echo.
echo     Waiting for API server to start...
ping -n 6 127.0.0.1 >nul 2>&1

echo.
echo     Starting frontend (port 8080)...
start "Tech Site Frontend" cmd /c "cd /d %~dp0 && npm run dev"

echo.
echo ==========================================
echo           Services Started!
echo ==========================================
echo.
echo  API Server:  http://localhost:3001  (WebSocket: ws://localhost:3001/chat)
echo  Frontend:    http://localhost:8080  
echo  Admin:       test@admin.com / admin123
echo.
echo ==========================================
echo         Management Commands:
echo ==========================================
echo  npm run check - check status
echo  npm run stop  - stop services
echo.
echo  Open http://localhost:8080 in your browser
echo.
echo  Press any key to exit...
pause >nul 