@echo off
REM LocalTunnel Development Helper Script for Windows

setlocal enabledelayedexpansion

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    exit /b 1
)

echo [SUCCESS] Node.js is installed

REM Main script logic
set "command=%~1"
if "%command%"=="" set "command=dev"

if "%command%"=="install" goto :install
if "%command%"=="server" goto :server
if "%command%"=="dashboard" goto :dashboard
if "%command%"=="dev" goto :dev
if "%command%"=="build" goto :build
if "%command%"=="health" goto :health
if "%command%"=="help" goto :help

echo [ERROR] Unknown command: %command%
goto :help

:install
echo [INFO] Installing server dependencies...
call npm install
echo [INFO] Installing dashboard dependencies...
cd client_app
call npm install
cd ..
echo [SUCCESS] All dependencies installed
goto :end

:server
echo [INFO] Starting LocalTunnel server on port 3000...
call node start-server.js --port 3000
goto :end

:dashboard
echo [INFO] Starting customer dashboard...
cd client_app
call npm run dev
goto :end

:dev
echo [INFO] Starting both server and dashboard...
REM Install concurrently if not present
npm list concurrently >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Installing concurrently for running both services...
    call npm install --save-dev concurrently
)
call npx concurrently --names "SERVER,DASHBOARD" --prefix-colors "blue,green" "node start-server.js --port 3000" "cd client_app && npm run dev"
goto :end

:build
echo [INFO] Building dashboard for production...
cd client_app
call npm run build
echo [SUCCESS] Dashboard built successfully in client_app/dist/
goto :end

:health
echo [INFO] Checking server health...
curl -f http://localhost:3000/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Server is not running or not healthy
) else (
    echo [SUCCESS] Server is running and healthy
)
goto :end

:help
echo LocalTunnel Development Helper
echo.
echo Usage: %~nx0 [command]
echo.
echo Commands:
echo   install     Install all dependencies
echo   server      Start only the LocalTunnel server
echo   dashboard   Start only the customer dashboard
echo   dev         Start both server and dashboard (default)
echo   build       Build dashboard for production
echo   health      Check server health
echo   help        Show this help message
echo.
echo Examples:
echo   %~nx0 install    # Install dependencies
echo   %~nx0 dev        # Start development environment
echo   %~nx0 server     # Start only server
echo   %~nx0 dashboard  # Start only dashboard
echo.
goto :end

:end
endlocal
