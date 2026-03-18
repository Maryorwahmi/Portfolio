# HelixMonitor - Infrastructure Observability Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Proprietary-green)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen)

**Created by CaptainCode** - HelixOps Technologies

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

HelixMonitor is an **enterprise-grade infrastructure observability platform** designed to provide real-time visibility into system health, application performance, and infrastructure metrics. Built as a mini-alternative to premium tools like Datadog, HelixMonitor enables engineering teams to monitor, visualize, and respond to infrastructure events with professional-grade reliability.

### Key Capabilities

- **Real-time Metrics Collection** - Collect system and application metrics with sub-second precision
- **Time-Series Storage** - Efficient storage and querying of metrics using industry-standard Prometheus
- **Interactive Dashboards** - Modern React-based UI for metrics visualization and analysis
- **Intelligent Alerting** - Rule-based alerts with multiple notification channels
- **Service Monitoring** - Track health status and performance of distributed services
- **Scalable Architecture** - Horizontally scalable metrics collection and processing

---

## ✨ Features

### MVP Features (Implemented)

✅ **Metrics Collection & Ingestion**
- CPU, Memory, Disk I/O, Network metrics
- API latency and request rate tracking
- Error rate and uptime monitoring
- Custom application metrics support

✅ **Time-Series Database**
- Prometheus integration for metrics storage
- Efficient data compression and retention policies
- Sub-minute query latency
- Historical data analysis (5m to 7d+ time ranges)

✅ **System Health Dashboard**
- Real-time metric visualization with charts
- Service health overview
- Performance trends
- Time-range selection (5m, 1h, 24h, 7d)

✅ **Alerting System**
- Rule-based alert evaluation
- Multiple severity levels (info, warning, critical)
- Email and webhook notifications
- Alert acknowledgment and manual resolution

✅ **Service Management**
- Service registration and deregistration
- Heartbeat monitoring
- Health status tracking
- Service metadata management

✅ **Docker Orchestration**
- Complete docker-compose setup
- Health checks for all services
- Persistent data volumes
- Network isolation

✅ **Testing Framework**
- Unit tests for all services
- Integration tests for API endpoints
- Mock data and fixtures
- Async test support

### Advanced Features (Stretch)

🔲 Distributed tracing with OpenTelemetry
🔲 Log aggregation (ELK stack)
🔲 ML-based anomaly detection
🔲 Multi-tenant support
🔲 RBAC and API authentication
🔲 Custom exporter framework

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  (Kubernetes, AWS, Application Servers, Databases)          │
└────────┬────────┬────────┬────────┬──────────────────────────┘
         │        │        │        │
         ▼        ▼        ▼        ▼
    ┌────────────────────────────────────┐
    │  Prometheus Scrape Layer           │
    │  (Node Exporter, Custom Exporters) │
    └────┬───────────────────────────┬───┘
         │                           │
         ▼                           ▼
    ┌─────────────────────────────────────┐
    │  Prometheus Time-Series DB          │
    │  (Metrics Storage & Evaluation)     │
    └────┬────────────────────────────┬───┘
         │                            │
    ┌────▼──────────┐           ┌────▼──────────┐
    │ AlertManager  │           │  FastAPI      │
    │ (Alerting)    │           │  Backend      │
    └────┬──────────┘           │               │
         │                    ┌─┴───────────┐   │
         │                    │ Redis Cache │   │
         │                    │ PostgreSQL  │   │
         │                    └─────────────┘   │
         │                      │               │
         └──────────┬───────────┴───────────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │  React Dashboard         │
        │  (Port 5173)             │
        └──────────────────────────┘
```

### Component Details

#### **Metrics Collection & Storage**
- **Prometheus**: Time-series metrics database with built-in scraping
- **Node Exporter**: System-level metrics (CPU, memory, disk, network)
- **Custom Exporters**: Application-specific metrics via `/metrics` endpoints
- **Retention**: 15-day retention policy (configurable)

#### **Backend Services** (FastAPI)
- **API Gateway**: RESTful APIs for metrics querying, service management
- **Metrics Service**: Ingestion, aggregation, and statistical analysis
- **Alert Service**: Rule evaluation and notification dispatch
- **Service Registry**: Service metadata and health status tracking

#### **Data Layer**
- **PostgreSQL**: Structured data (services, alert rules, configurations)
- **Redis**: Caching layer and real-time metrics buffer
- **Prometheus TSDB**: Time-series metrics storage

#### **Alerting**
- **AlertManager**: Rule evaluation and alert lifecycle management
- **Notification Channels**: Email (primary), Webhooks (extensible)

#### **Frontend** (React + TypeScript)
- **Dashboard**: Real-time metrics visualization
- **Services View**: Registered services and health status
- **Alerts View**: Active and historical alert management

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose (v20.10+)
- Python 3.11+ (for local development)
- Node.js 18+ (for frontend development)
- Git

### Option 1: Docker Compose (Recommended)

```bash
# Clone and navigate to project
cd helixmonitor

# Start all services
docker-compose up -d

# Verify all services are running
docker-compose ps

# Check logs
docker-compose logs -f backend
```

**Access the application:**
- ✅ Dashboard: http://localhost:5173
- ✅ API Docs: http://localhost:8000/docs
- ✅ Prometheus: http://localhost:9090
- ✅ AlertManager: http://localhost:9093

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📡 API Documentation

### Base URL
- Production: `http://api.helixops.com/api/v1`
- Development: `http://localhost:8000/api/v1`

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Core Endpoints

#### Metrics Endpoints

**Ingest Metric**
```bash
POST /api/v1/metrics/ingest

Request:
{
  "metric_name": "cpu_usage_percent",
  "service_id": "api-service-1",
  "value": 45.5,
  "timestamp": "2026-03-18T10:30:00Z",
  "labels": {"instance": "host-1"}
}

Response:
{
  "status": "success",
  "message": "Metric cpu_usage_percent ingested",
  "timestamp": "2026-03-18T10:30:00Z"
}
```

**Query Metrics**
```bash
POST /api/v1/metrics/query

Request:
{
  "metric_name": "cpu_usage_percent",
  "service_id": "api-service-1",
  "time_range": "1h",
  "aggregation": "avg",
  "step": 60
}

Response:
{
  "metric_name": "cpu_usage_percent",
  "service_id": "api-service-1",
  "time_range": "1h",
  "aggregation": "avg",
  "data_points": [[1710758400, 45.5], [1710758460, 47.2], ...]
}
```

**Get Statistics**
```bash
GET /api/v1/metrics/statistics?metric_name=cpu_usage_percent&service_id=api-service-1&time_range=1h

Response:
{
  "metric_name": "cpu_usage_percent",
  "service_id": "api-service-1",
  "min": 35.2,
  "max": 78.5,
  "avg": 56.3,
  "p95": 72.1,
  "p99": 76.8,
  "latest": 52.3,
  "timestamp_range": ["2026-03-18T09:30:00Z", "2026-03-18T10:30:00Z"]
}
```

#### Service Management Endpoints

**Register Service**
```bash
POST /api/v1/services/

Request:
{
  "id": "api-service-1",
  "name": "Main API Service",
  "service_type": "api",
  "description": "Primary REST API",
  "metrics_endpoint": "http://localhost:8000/metrics",
  "tags": ["backend", "critical"]
}

Response:
{
  "status": "success",
  "service": { ... }
}
```

**List Services**
```bash
GET /api/v1/services/

Response:
{
  "status": "success",
  "count": 4,
  "services": [ ... ]
}
```

**Get Service Health**
```bash
GET /api/v1/services/{service_id}/health

Response:
{
  "service_id": "api-service-1",
  "name": "Main API Service",
  "status": "healthy",
  "uptime_percent": 99.9,
  "cpu_usage": 45.5,
  "memory_usage": 62.3,
  "error_rate": 0.5,
  "request_rate": 1500,
  "last_heartbeat": "2026-03-18T10:30:00Z"
}
```

#### Alert Management Endpoints

**Create Alert Rule**
```bash
POST /api/v1/alerts/rules

Request:
{
  "name": "High CPU Usage",
  "service_id": "api-service-1",
  "severity": "warning",
  "conditions": [
    {
      "metric_name": "cpu_usage_percent",
      "operator": ">",
      "threshold": 85.0,
      "duration_seconds": 300
    }
  ],
  "notification_config": {
    "channel": "email",
    "recipients": ["ops@helixops.com"]
  }
}

Response:
{
  "status": "success",
  "rule": { ... }
}
```

**Get Active Alerts**
```bash
GET /api/v1/alerts/?service_id=api-service-1

Response:
{
  "status": "success",
  "count": 2,
  "alerts": [ ... ]
}
```

**Acknowledge Alert**
```bash
POST /api/v1/alerts/{alert_id}/acknowledge?acknowledged_by=operator@helixops.com

Response:
{
  "status": "success",
  "alert": {
    "id": "alert_123",
    "status": "acknowledged",
    "acknowledged_by": "operator@helixops.com",
    "acknowledged_at": "2026-03-18T10:32:00Z"
  }
}
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in project root:

```bash
# FastAPI
ENVIRONMENT=production
DEBUG=false
API_TITLE=HelixMonitor

# Prometheus
PROMETHEUS_URL=http://prometheus:9090
PROMETHEUS_RETENTION=15d

# Database
DATABASE_URL=postgresql://helixmonitor:password@postgres:5432/helixmonitor
DATABASE_POOL_SIZE=20
DATABASE_POOL_RECYCLE=3600

# Redis
REDIS_URL=redis://redis:6379/0
REDIS_MAX_CONNECTIONS=50

# Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@helixops.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_ADDRESS=alerts@helixops.com

# Alert Settings
ALERT_EVALUATION_INTERVAL=15  # seconds
ALERT_RETENTION_DAYS=30
ALERT_BATCH_SIZE=100

# Service Health
SERVICE_HEARTBEAT_TIMEOUT=60  # seconds
SERVICE_HEALTH_CHECK_INTERVAL=30

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

### Prometheus Configuration

Edit `backend/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'api-service'
    scrape_interval: 10s
    static_configs:
      - targets: ['localhost:8000']
```

### Alert Rules

Edit `backend/alert_rules.yml` to define custom alert rules:

```yaml
groups:
  - name: custom_alerts
    rules:
      - alert: MyCustomAlert
        expr: 'my_metric > 100'
        for: 5m
        annotations:
          summary: "My custom alert"
```

---

## 📦 Deployment

### Production Deployment Checklist

- [ ] Environment variables configured in `.env`
- [ ] SMTP credentials validated
- [ ] Database backups configured
- [ ] Redis persistence enabled
- [ ] Prometheus retention policy set
- [ ] Health checks passing for all containers
- [ ] Logs aggregated to centralized system
- [ ] Rate limiting configured
- [ ] CORS origins whitelisted
- [ ] SSL/TLS certificates installed

### Kubernetes Deployment

Helm charts available in `k8s/` directory (optional):

```bash
helm install helixmonitor ./k8s/helm/helixmonitor \
  --namespace monitoring \
  --values values.yaml
```

### Health Check Endpoints

```bash
# API Health
curl http://localhost:8000/health

# System Status
curl http://localhost:8000/api/v1/status

# Prometheus Health
curl http://localhost:9090/-/healthy

# AlertManager Health
curl http://localhost:9093/-/healthy
```

---

## 🧪 Testing

### Run All Tests

```bash
cd backend

# Unit tests
pytest tests/ -m unit -v

# Integration tests
pytest tests/ -m integration -v

# All tests with coverage
pytest tests/ --cov=app --cov-report=html
```

### Specific Test Suites

```bash
# Test metrics service
pytest tests/test_metrics_service.py -v

# Test alert service
pytest tests/test_alert_service.py -v

# Test API endpoints
pytest tests/test_api.py -v

# Test service registry
pytest tests/test_service_registry.py -v
```

### Load Testing

```bash
# Using Apache Bench
ab -n 10000 -c 100 http://localhost:8000/api/v1/status

# Using wrk
wrk -t12 -c400 -d30s http://localhost:8000/metrics/query
```

---

## 🔍 Metrics Reference

### System Metrics

| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `cpu_usage_percent` | Gauge | % | CPU utilization |
| `memory_usage_bytes` | Gauge | bytes | RAM consumption |
| `disk_io_ops` | Counter | ops/s | Disk I/O operations |
| `network_traffic_bytes` | Counter | bytes | Network I/O |

### Application Metrics

| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `http_requests_total` | Counter | count | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | seconds | Request latency |
| `error_rate` | Gauge | % | Error rate percentage |
| `service_uptime_seconds` | Gauge | seconds | Service uptime |

### Custom Labels

All metrics support custom labels for multi-dimensional analysis:

```python
{
  "instance": "host-1",
  "region": "us-east-1",
  "environment": "production",
  "version": "1.0.0"
}
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Prometheus not scraping metrics**
```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Verify service is exposing metrics
curl http://localhost:8000/metrics
```

**Issue: Alerts not firing**
```bash
# Check AlertManager status
curl http://localhost:9093/api/v1/alerts

# Verify alert rules
curl http://localhost:9090/api/v1/rules
```

**Issue: Redis connection timeout**
```bash
# Test Redis connectivity
redis-cli -h redis ping

# Check Redis memory
redis-cli info memory
```

**Issue: Database connection errors**
```bash
# Test database connectivity
psql -h postgres -U helixmonitor -d helixmonitor -c "SELECT version();"

# Check connection pool
docker exec helixmonitor-postgres psql -U helixmonitor -c "SELECT count(*) FROM pg_stat_activity;"
```

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
export LOG_LEVEL=DEBUG

# View debug logs
docker-compose logs -f backend | grep DEBUG
```

---

## 📊 Performance Metrics

### Expected Performance

| Metric | Target | Note |
|--------|--------|------|
| Metrics Ingest Latency | < 100ms | P95 |
| Metrics Query Latency | < 500ms | P95 (1 hour range) |
| Alert Evaluation | < 5s | Per rule |
| Dashboard Load Time | < 2s | Cold cache |
| API Response Time | < 200ms | P95 |

### Optimization Tips

1. **Increase Prometheus scrape interval** if load is high
2. **Configure Redis caching** for frequently queried metrics
3. **Adjust TSDB retention** based on disk capacity
4. **Scale workers** horizontally for high metric volumes
5. **Enable query caching** in Prometheus configuration

---

## 📝 License & Attribution

**HelixMonitor v1.0.0**

Created with ❤️ by **CaptainCode** for **HelixOps Technologies**

All rights reserved. Proprietary software.

---

## 📞 Support & Contact

For issues, feature requests, or support:

- **Email**: support@helixops.com
- **Docs**: https://docs.helixops.com/helixmonitor
- **Issues**: Report via platform dashboard

---

## 🎗️ Changelog

### v1.0.0 (2026-03-18)
- ✅ Initial release with MVP features
- ✅ Prometheus integration
- ✅ React dashboard
- ✅ Alert management
- ✅ Service registry
- ✅ Docker deployment
- ✅ Comprehensive test suite

---

**Keep monitoring. Stay operational. 🚀**

*Built by CaptainCode | Powered by HelixOps Technologies*
