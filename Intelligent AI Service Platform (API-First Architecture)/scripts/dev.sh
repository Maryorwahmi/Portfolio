#!/bin/bash
# Quick start script for development

echo "==============================================="
echo "AI Service Platform - Development Quick Start"
echo "==============================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please configure .env with your API keys"
    exit 1
fi

# Check Python version
python_version=$(python --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $python_version"

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Initialize database
echo "Initializing database..."
python scripts/db_manage.py init

# Start services
echo ""
echo "==============================================="
echo "Starting services..."
echo "==============================================="
echo ""
echo "Starting Uvicorn server (press Ctrl+C to stop)..."
echo "API will be available at: http://localhost:8000"
echo "Documentation: http://localhost:8000/docs"
echo ""

# Run in single process (for development only)
# In production, use separate terminals for API, Celery worker, and beat

uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
