@echo off
REM HelixMonitor Quick Start Script for Windows
REM Created by CaptainCode - HelixOps Technologies

echo.
echo 🚀 HelixMonitor Quick Start Setup
echo ==================================
echo.

REM Check for Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose found
echo.

REM Get project root (current directory)
echo 📁 Project Directory: %CD%
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from .env.example...
    copy .env.example .env
    echo ✅ .env created. Please review and update if needed.
    echo.
)

REM Start services
echo 🐳 Starting Docker services...
echo ==================================
docker-compose up -d

REM Wait for services
echo.
echo ⏳ Waiting for services to be ready... (10 seconds)
timeout /t 10 /nobreak

echo.
echo 🎉 HelixMonitor is ready!
echo.
echo 📊 Access points:
echo   Dashboard:     http://localhost:5173
echo   API Docs:      http://localhost:8000/docs
echo   Prometheus:    http://localhost:9090
echo   AlertManager:  http://localhost:9093
echo.
echo 📝 Useful commands:
echo   View logs:     docker-compose logs -f backend
echo   Stop services: docker-compose down
echo   Rebuild:       docker-compose build
echo.
echo 📖 Documentation:
echo   - README.md for complete guide
echo   - ARCHITECTURE.md for system design
echo   - API documentation at /docs endpoint
echo.
echo Created by CaptainCode for HelixOps Technologies ❤️
echo.
pause
