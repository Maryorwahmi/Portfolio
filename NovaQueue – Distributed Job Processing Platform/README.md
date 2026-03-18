# NovaQueue - Distributed Job Processing Platform v2.0

**Created with ❤️ by CaptainCode**  
**Company: NovaCore Systems**

> A production-ready, highly scalable distributed job queue system built with Node.js, Redis, and PostgreSQL.

[![GitHub](https://img.shields.io/badge/GitHub-CaptainCode-blue)](https://github.com/captaincode)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)](https://github.com/captaincode/novaqueue)

## 🎯 Overview

NovaQueue is a distributed job processing platform designed to handle background tasks reliably at scale. It decouples long-running operations from your main application flow while guaranteeing execution reliability through built-in retry mechanisms, failure handling, and comprehensive monitoring.

### Key Features

✨ **Core Capabilities**
- REST API for job submission and management
- Asynchronous job processing with multiple workers
- Priority-based queue management (Critical, High, Medium, Low)
- Automatic retry with exponential backoff
- Dead Letter Queue (DLQ) for failed jobs
- Support for scheduled (delayed) and cron-based jobs
- Job status tracking and lifecycle monitoring

🚀 **Advanced Features**
- Idempotency support (prevent duplicate execution)
- Distributed lock mechanisms for concurrent safety  
- Comprehensive event logging and audit trails
- Real-time monitoring dashboard
- Horizontal scaling with multiple workers
- WebSocket support for job events
- Multi-tenant queue isolation
- Rate limiting and throttling

📊 **Monitoring & Observability**
- Live dashboard displaying queue statistics
- Job execution metrics and performance analytics
- Worker health monitoring with heartbeats
- System-wide metrics export (Prometheus-compatible)
- Detailed job execution logs and event history

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATION                        │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────┐
│                   NovaQueue API Service (REST)                   │
│                                                                   │
│  • Job Creation & Submission      • Status Tracking             │
│  • Queue Management               • Event Publishing             │
│  • Idempotency Handling           • Metrics Collection           │
└────────────┬──────────────────────────────────────────────────┬─┘
             │                                                  │
             ▼                                                  ▼
    ┌──────────────────────┐                          ┌──────────────────┐
    │     Redis Broker     │◄─────────────────────────│  PostgreSQL DB   │
    │                      │                          │                  │
    │  • Queue Storage     │                          │  • Job Records   │
    │  • Pub/Sub System    │                          │  • Event Logs    │
    │  • Cache Layer       │                          │  • Worker Data   │
    └────────┬─────────────┘                          └──────────────────┘
             │
       ┌─────┴─────────────────────────────────────┐
       │                                            │
       ▼                                            ▼
   ┌────────────────────┐                  ┌──────────────────┐
   │  Worker Instances  │                  │   Scheduler      │
   │  (Scalable Pool)   │                  │   Service        │
   │                    │                  │                  │
   │ • Poll Queues      │                  │ • Delayed Tasks  │
   │ • Process Jobs     │                  │ • Cron Jobs      │
   │ • Handle Failures  │                  │ • Job Reschedule │
   └────────────────────┘                  └──────────────────┘
       │
       ▼
   ┌──────────────────────┐
   │  Job Handlers        │
   │  (Custom Logic)      │
   │                      │
   │ • Email Sender       │
   │ • Report Generator   │
   │ • Webhook Notifier   │
   └──────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose (recommended)
- Node.js 18+ (for local development)
- PostgreSQL 14+
- Redis 7+

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/captaincode/novaqueue.git
cd novaqueue

# Copy environment file
cp .env.example .env

# Start all services
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start services individually
npm run api       # Terminal 1 - API Service (port 3000)
npm run worker    # Terminal 2 - Worker Service
npm run scheduler # Terminal 3 - Scheduler Service
npm run dashboard # Terminal 4 - Dashboard (port 5173)
```

## 📖 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
Currently uses request ID tracking. In production, implement JWT or OAuth 2.0.

### Common Response Format
```json
{
  "success": true,
  "data": {...},
  "timestamp": "2024-03-18T10:30:45.123Z",
  "requestId": "req_a1b2c3d4e5f6g7h8"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "timestamp": "2024-03-18T10:30:45.123Z",
  "requestId": "req_a1b2c3d4e5f6g7h8"
}
```

---

## 🔧 Job API Endpoints

### Create Job
```http
POST /jobs
Content-Type: application/json

{
  "type": "send_email",
  "payload": {
    "to": "user@example.com",
    "subject": "Welcome!",
    "body": "Welcome to our service"
  },
  "priority": "high",
  "delay": 0,
  "idempotencyKey": "unique-key-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "job_abc123def456",
    "type": "send_email",
    "status": "pending",
    "priority": "high",
    "createdAt": "2024-03-18T10:30:45.123Z"
  }
}
```

### Get Job
```http
GET /jobs/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "job_abc123def456",
    "type": "send_email",
    "payload": {...},
    "status": "completed",
    "priority": "high",
    "queue": "high_priority",
    "retries": 0,
    "maxRetries": 3,
    "processedAt": "2024-03-18T10:30:50.000Z",
    "completedAt": "2024-03-18T10:30:55.000Z",
    "executionTimeMs": 5000,
    "createdAt": "2024-03-18T10:30:45.123Z",
    "updatedAt": "2024-03-18T10:30:55.000Z"
  }
}
```

### List Jobs
```http
GET /jobs?status=pending&priority=high&limit=50&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [...],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "page": 1,
      "pages": 3
    }
  }
}
```

### Cancel Job
```http
POST /jobs/:id/cancel
```

### Retry Failed Job
```http
POST /jobs/:id/retry
```

### Get Job Logs
```http
GET /jobs/:id/logs
```

---

## 📊 Queue API Endpoints

### Get All Queue Stats
```http
GET /queues
```

### Get Specific Queue
```http
GET /queues/:name
```

Supported queue names:
- `default`
- `high_priority`
- `low_priority`
- `critical`

### Get Dead Letter Queue
```http
GET /dlq?limit=50
```

---

## 💼 Job Types & Examples

### Email Job
```json
{
  "type": "send_email",
  "payload": {
    "to": "user@example.com",
    "cc": ["manager@example.com"],
    "subject": "Welcome",
    "templateId": "welcome-001",
    "variables": {
      "firstName": "John"
    }
  },
  "priority": "high"
}
```

### Report Generation Job
```json
{
  "type": "generate_report",
  "payload": {
    "type": "monthly_sales",
    "period": "2024-03",
    "format": "pdf",
    "email": "analyst@example.com"
  },
  "priority": "medium",
  "delay": 3600000
}
```

### Webhook Notification
```json
{
  "type": "webhook_notification",
  "payload": {
    "url": "https://your-app.com/webhooks/events",
    "data": {
      "event": "user_registered",
      "userId": "user_123",
      "timestamp": "2024-03-18T10:30:45Z"
    }
  },
  "priority": "high",
  "maxRetries": 5
}
```

### Scheduled Job (Delayed)
```json
{
  "type": "send_reminder",
  "payload": {
    "userId": "user_123",
    "message": "Don't forget to complete your profile"
  },
  "priority": "medium",
  "delay": 86400000
}
```

### Cron Job (Daily at 2 AM)
```json
{
  "type": "cleanup_tempfiles",
  "payload": {
    "path": "/tmp/uploads"
  },
  "cron": "0 2 * * *"
}
```

---

## 🔧 Configuration

### Environment Variables

```env
# API Service
API_PORT=3000
API_HOST=0.0.0.0
NODE_ENV=development
LOG_LEVEL=info

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=novaqueue
DATABASE_USER=novaqueue_user
DATABASE_PASSWORD=secure_password
DATABASE_LOGGING=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# Worker
WORKER_CONCURRENCY=10
WORKER_POLL_INTERVAL=1000
WORKER_MAX_RETRIES=3

# Scheduler
SCHEDULER_INTERVAL=10000
SCHEDULER_MAX_DELAY=300000

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090

# Features
ENABLE_DASHBOARD=true
ENABLE_METRICS_EXPORT=true
ENABLE_JOB_EVENTS=true
```

---

## 🔐 Security Best Practices

1. **Change Database Password**: Update `DATABASE_PASSWORD` in production
2. **Change Session Secret**: Update `SESSION_SECRET` for dashboard authentication
3. **Enable HTTPS**: Use a reverse proxy (nginx) with SSL/TLS
4. **Rate Limiting**: Implement rate limiting on API endpoints
5. **Authentication**: Add OAuth2 or JWT for API endpoints
6. **Input Validation**: Sanitize all job payloads
7. **Network Isolation**: Run services on private networks only
8. **Secret Management**: Use environment-specific secret vaults

---

## 📈 Scaling Strategy

### Horizontal Scaling

**Add More Workers:**
```bash
docker-compose up -d --scale worker=5
```

**Load Balancing:**
- Use nginx or HAProxy for API load balancing
- Workers automatically balance via Redis queue

### Vertical Scaling

```env
# Increase worker concurrency
WORKER_CONCURRENCY=20

# Increase database connections
DATABASE_POOL_SIZE=50

# Increase Redis connections
REDIS_MAX_CLIENTS=100
```

### Performance Tuning

1. **Database Indexing**: Ensure indexes on `status`, `created_at`, `priority`
2. **Redis Memory**: Configure `maxmemory` policy
3. **Connection Pooling**: Tune pool sizes based on load
4. **Batch Processing**: Process jobs in batches when possible

---

## 📊 Monitoring & Metrics

### Dashboard URL
```
http://localhost:5173
```

### Prometheus Metrics (Optional)
```
http://localhost:9090/metrics
```

### Key Metrics

- **Jobs Per Second**: Overall throughput
- **Success Rate**: Percentage of completed jobs
- **Average Execution Time**: Mean job duration
- **Queue Depth**: Pending jobs per queue
- **Dead Letter Queue Size**: Failed jobs count
- **Worker Health**: Active workers and uptime

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# Integration tests
npm run test:integration
```

---

## 🤝 Development

### Project Structure
```
novaqueue/
├── services/
│   ├── api/              # REST API service
│   ├── worker/           # Job processing workers
│   ├── scheduler/        # Scheduled job service
│   └── dashboard/        # Monitoring UI
├── shared/               # Shared types & utilities
├── database/             # Migrations & schemas
├── docker/               # Docker configurations
├── .github/workflows/    # CI/CD pipelines
└── README.md
```

### Code Style

- TypeScript for all services
- ESLint + Prettier configuration
- Consistent error handling
- Comprehensive logging

---

## 📝 License

MIT © 2024 NovaCore Systems | Created by CaptainCode

---

## 🙏 Attribution

**Created with ❤️ by CaptainCode**

This project demonstrates enterprise-level job queue architecture with production-ready features including distributed processing, fault tolerance, and comprehensive monitoring.

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/captaincode/novaqueue/issues)
- **Documentation**: See [API_DOCS.md](API_DOCS.md)
- **Contributing**: Pull requests welcome!

---

**Built for NovaCore Systems | v2.0.0 | CaptainCode Signature**
