@echo off
REM Quick start script for Windows

echo ===============================================
echo AI Service Platform - Development Quick Start
echo ===============================================

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo WARNING: Please configure .env with your API keys
    exit /b 1
)

REM Check Python version
python --version
echo.

REM Create virtual environment if not exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Initialize database
echo Initializing database...
python scripts\db_manage.py init

REM Start services
echo.
echo ===============================================
echo Starting services...
echo ===============================================
echo.
echo Starting Uvicorn server (press Ctrl+C to stop)...
echo API will be available at: http://localhost:8000
echo Documentation: http://localhost:8000/docs
echo.

REM Run API
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
