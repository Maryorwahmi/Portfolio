# GETTING STARTED - HelixMonitor

**Created by CaptainCode** | HelixOps Technologies

---

## 🎯 Your First 5 Minutes

### Step 1: Start the Application (2 min)

**On Windows:**
```batch
cd c:\Users\User\Documents\HelixOps Technologies\helixmonitor
quickstart.bat
```

**On macOS/Linux:**
```bash
cd ~/Documents/HelixOps\ Technologies/helixmonitor
bash quickstart.sh
```

**Or manually:**
```bash
docker-compose up -d
```

### Step 2: Open Dashboard (1 min)

Visit these URLs:
- **Dashboard**: http://localhost:5173 ← **START HERE**
- **API Docs**: http://localhost:8000/docs
- **Prometheus**: http://localhost:9090

### Step 3: Explore (2 min)

The dashboard shows:
- **Overview**: System health snapshot with KPIs
- **Services**: Registered services and their status
- **Alerts**: Active and historical alerts

That's it! You have a running monitoring platform! 🎉

---

## 📖 What's Inside?

### Three Main Components

#### 🔷 Backend (FastAPI)
- **Port**: 8000
- **Handles**: Metrics ingestion, queries, alerting, service management
- **Tech**: Python 3.11, FastAPI, PostgreSQL, Redis
- **API Docs**: http://localhost:8000/docs

#### 🔶 Frontend (React)
- **Port**: 5173
- **Shows**: Dashboard with charts, service monitoring, alert management
- **Tech**: React 18, TypeScript, Tailwind CSS
- **Entry Point**: http://localhost:5173

#### 🔹 Infrastructure
- **Prometheus**: Time-series database (port 9090)
- **AlertManager**: Alert routing (port 9093)
- **PostgreSQL**: Data storage
- **Redis**: Caching layer
- **Node Exporter**: System metrics

---

## 🚀 Quick Tasks

### Register Your Service

**Via API (using curl):**
```bash
curl -X POST http://localhost:8000/api/v1/services/ \
  -H "Content-Type: application/json" \
  -d '{
    "id": "my-service",
    "name": "My Service",
    "metrics_endpoint": "http://localhost:8080/metrics",
    "service_type": "api"
  }'
```

**Via Dashboard:**
1. Go to Services page
2. Click "Register Service"
3. Fill in the form
4. Submit

### Send a Metric

**Using Python:**
```python
import requests

requests.post('http://localhost:8000/api/v1/metrics/ingest', json={
    "metric_name": "cpu_usage_percent",
    "service_id": "my-service",
    "value": 45.5,
    "labels": {"instance": "host-1"}
})
```

**Using curl:**
```bash
curl -X POST http://localhost:8000/api/v1/metrics/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "metric_name": "cpu_usage_percent",
    "service_id": "my-service",
    "value": 45.5
  }'
```

### Create an Alert

**Via API:**
```bash
curl -X POST http://localhost:8000/api/v1/alerts/rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "High CPU",
    "service_id": "my-service",
    "conditions": [{
      "metric_name": "cpu_usage_percent",
      "operator": ">",
      "threshold": 80,
      "duration_seconds": 300
    }],
    "notification_config": {
      "channel": "email",
      "recipients": ["ops@mycompany.com"]
    }
  }'
```

---

## 🔧 Configuration

### Environment Variables

Edit `.env` file (important ones):

```bash
# Database
DATABASE_URL=postgresql://helixmonitor:password@postgres:5432/helixmonitor

# Email for alerts
SMTP_HOST=smtp.gmail.com
SMTP_USER=alerts@mycompany.com
SMTP_PASSWORD=your_app_password

# API
PROMETHEUS_URL=http://prometheus:9090
```

### Add Alert Rules

Edit `backend/alert_rules.yml`:

```yaml
groups:
  - name: my_alerts
    rules:
      - alert: MyAlert
        expr: 'metric_name > 100'
        for: 5m
        annotations:
          summary: "My alert triggered"
```

Restart backend for changes to take effect.

---

## 📊 Understanding the Dashboard

### Dashboard Tabs

| Tab | Purpose | Use Case |
|-----|---------|----------|
| **Overview** | System health snapshot | Quick status check |
| **Services** | All registered services | Monitor service status |
| **Services → Detail** | Service-specific metrics | Deep-dive analysis |
| **Alerts** | Active & historical alerts | Alert management |

### Metric Types

**System Metrics (from Prometheus)**
- `cpu_usage_percent` - CPU utilization
- `memory_usage_bytes` - RAM usage
- `disk_io_ops` - Disk operations
- `network_traffic_bytes` - Network I/O

**Custom Metrics (from your apps)**
- `http_request_duration_seconds` - API latency
- `http_requests_total` - Request count
- `error_rate` - Error percentage
- Custom as needed

---

## 🧪 Testing the System

### Check API Health

```bash
# API health
curl http://localhost:8000/health

# Full system status
curl http://localhost:8000/api/v1/status

# List all services
curl http://localhost:8000/api/v1/services/
```

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Test Metrics

```bash
# Send test metric
curl -X POST http://localhost:8000/api/v1/metrics/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "metric_name": "test_metric",
    "service_id": "test-service",
    "value": 42.5
  }'

# Query it back
curl -X POST http://localhost:8000/api/v1/metrics/query \
  -H "Content-Type: application/json" \
  -d '{
    "metric_name": "test_metric",
    "service_id": "test-service",
    "time_range": "1h"
  }'
```

---

## 🛠️ Common Operations

### Restart Services

```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart postgres
```

### View Service Status

```bash
docker-compose ps
```

### Clear Data (WARNING: Deletes everything)

```bash
docker-compose down -v
docker-compose up -d
```

### Update Configuration

```bash
# Edit settings
nano .env

# Restart for changes
docker-compose restart backend
```

### Stop Everything

```bash
docker-compose down

# With volume removal
docker-compose down -v
```

---

## 📚 Learning Resources

### Read These in Order

1. **README.md** (5 min) - Product overview & quick start
2. **This File** (10 min) - Getting started guide
3. **API Documentation** (15 min) - API endpoints reference
4. **ARCHITECTURE.md** (20 min) - How it all works
5. **INTEGRATION.md** (15 min) - How to integrate with your apps
6. **DEVELOPMENT.md** (20 min) - If you want to modify the code

### API Documentation

Interactive API docs available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Code Examples

See `INTEGRATION.md` for:
- Python client examples
- Node.js client examples
- Webhook integration patterns
- Alert automation examples

---

## 🆘 Troubleshooting

### Services Won't Start

**Check logs:**
```bash
docker-compose logs
```

**Common issues:**
- Port already in use: Kill the process on that port
- Docker not running: Start Docker Desktop
- Out of disk space: Free up space or use `docker prune`

### API Returning Errors

**Debug steps:**
```bash
# Check if backend is running
curl http://localhost:8000/health

# Check logs
docker-compose logs backend

# Check database connection
docker-compose logs postgres
```

### Metrics Not Showing

1. Make sure you sent them: Check `curl` response
2. Wait a moment for processing
3. Check Prometheus at http://localhost:9090
4. Query in Prometheus directly

### Alerts Not Firing

1. Check alert rules: POST to `/api/v1/alerts/rules` list
2. Verify threshold values
3. Check if metrics are being collected
4. Review AlertManager logs: `docker-compose logs alertmanager`

---

## 📞 Quick Reference

### Important Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend API | 8000 | http://localhost:8000 |
| Prometheus | 9090 | http://localhost:9090 |
| AlertManager | 9093 | http://localhost:9093 |
| PostgreSQL | 5432 | (internal) |
| Redis | 6379 | (internal) |

### Default Credentials

| Service | User | Password |
|---------|------|----------|
| PostgreSQL | helixmonitor | helixmonitor_secure_password |
| Prometheus | - | (no auth) |
| AlertManager | - | (no auth) |
| Redis | - | (no auth) |

### Key Files

| File | Purpose |
|------|---------|
| `.env` | Configuration |
| `docker-compose.yml` | Service orchestration |
| `backend/requirements.txt` | Python dependencies |
| `frontend/package.json` | Node dependencies |
| `backend/prometheus.yml` | Prometheus config |
| `backend/alertmanager.yml` | Alert routing config |

---

## 🎯 Next Steps

1. ✅ **Verify everything started** - Check dashboard loads
2. ✅ **Register a service** - Add your first service
3. ✅ **Send test metrics** - Verify metrics flow
4. ✅ **Create an alert** - Set up a test alert
5. ✅ **Review documentation** - Read relevant docs
6. ✅ **Integrate with your app** - Use the integration guide
7. ✅ **Monitor in production** - Deploy to your infrastructure

---

## 🎓 Learning Objectives

By exploring HelixMonitor, you'll learn:

- ✅ How modern monitoring platforms work
- ✅ Time-series data collection & storage
- ✅ Alert evaluation & routing
- ✅ Real-time dashboard design
- ✅ Microservices architecture
- ✅ Docker & containerization
- ✅ API design with FastAPI
- ✅ React frontend development

---

## ❤️ Credits

**Created by CaptainCode**  
For HelixOps Technologies  
March 2026

Professional Infrastructure Observability Platform

---

## 📖 Help & Support

**Having issues?**

1. Check logs: `docker-compose logs`
2. Review DEVELOPMENT.md guide
3. Check ARCHITECTURE.md for technical details
4. Read API docs: http://localhost:8000/docs

**Want to contribute?**

See DEVELOPMENT.md for:
- How to set up dev environment
- Code style guidelines
- Testing requirements
- Deployment procedures

---

**You're all set! Start monitoring! 🚀**

*Questions? Check the README.md or documentation files.*
