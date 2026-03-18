#!/bin/bash
# HelixMonitor Quick Start Script
# Created by CaptainCode - HelixOps Technologies

set -e

echo "🚀 HelixMonitor Quick Start Setup"
echo "=================================="
echo ""

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"
echo ""

# Get project root
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_ROOT"

echo "📁 Project Directory: $PROJECT_ROOT"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env created. Please review and update if needed."
    echo ""
fi

# Start services
echo "🐳 Starting Docker services..."
echo "=================================="
docker-compose up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
SERVICES=(postgres redis prometheus alertmanager backend frontend)

for service in "${SERVICES[@]}"; do
    if docker-compose ps $service 2>/dev/null | grep -q "Up"; then
        echo "✅ $service is running"
    else
        echo "❌ $service failed to start"
    fi
done

echo ""
echo "🎉 HelixMonitor is ready!"
echo ""
echo "📊 Access points:"
echo "  Dashboard:     http://localhost:5173"
echo "  API Docs:      http://localhost:8000/docs"
echo "  Prometheus:    http://localhost:9090"
echo "  AlertManager:  http://localhost:9093"
echo ""
echo "📝 Useful commands:"
echo "  View logs:     docker-compose logs -f backend"
echo "  Stop services: docker-compose down"
echo "  Rebuild:       docker-compose build"
echo ""
echo "📖 Documentation:"
echo "  - README.md for complete guide"
echo "  - ARCHITECTURE.md for system design"
echo "  - API documentation at /docs endpoint"
echo ""
echo "Created by CaptainCode for HelixOps Technologies ❤️"
