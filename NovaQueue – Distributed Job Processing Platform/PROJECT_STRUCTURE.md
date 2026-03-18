# 📁 NovaQueue Project Structure Reference

**Created by CaptainCode | v2.0.0**

```
novaqueue/
│
├── 📄 README.md                    # Main project documentation
├── 📄 API_DOCS.md                  # Complete API reference
├── 📄 GETTING_STARTED.md           # Step-by-step tutorial
├── 📄 BUILD_SUMMARY.md             # What was built & why
├── 📄 CONTRIBUTING.md              # Development guidelines
├── 📄 LICENSE                      # MIT License
│
├── 📄 package.json                 # Root workspace config
├── 📄 tsconfig.base.json           # TypeScript base config
├── 📄 jest.config.js               # Jest testing configuration
├── 📄 .eslintrc.json               # ESLint linting rules
├── 📄 .prettierrc.json             # Code formatting config
├── 📄 .env.example                 # Environment variables template
├── 📄 .gitignore                   # Git ignore patterns
│
│
├── 🗂️ services/                    # All microservices
│   │
│   ├── 📂 api/                     # ⭐ REST API Service (Port 3000)
│   │   ├── src/
│   │   │   ├── main.ts             # Express server entry point
│   │   │   ├── routes/
│   │   │   │   └── index.ts        # All API endpoints
│   │   │   ├── controllers/        # Request handlers
│   │   │   │   ├── job.controller.ts
│   │   │   │   └── queue.controller.ts
│   │   │   ├── services/           # Business logic
│   │   │   │   ├── redis.service.ts
│   │   │   │   ├── database.service.ts
│   │   │   │   ├── job.service.ts
│   │   │   │   └── metrics.service.ts
│   │   │   ├── database/
│   │   │   │   └── index.ts        # Database initialization
│   │   │   └── __tests__/          # API tests
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── 📂 worker/                  # ⭐ Job Processing Worker
│   │   ├── src/
│   │   │   ├── main.ts             # Worker bootstrap
│   │   │   ├── worker.ts           # Core worker implementation
│   │   │   └── handlers/
│   │   │       └── index.ts        # Job handlers (Email, Report, Webhook)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── 📂 scheduler/               # ⭐ Scheduled Job Processor
│   │   ├── src/
│   │   │   ├── main.ts             # Scheduler bootstrap
│   │   │   └── scheduler.ts        # Scheduling logic
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── 📂 dashboard/               # ⭐ React Monitoring Dashboard (Port 5173)
│       ├── src/
│       │   ├── Dashboard.tsx       # Main React component
│       │   └── main.tsx            # React entry point
│       ├── index.html              # HTML template
│       ├── vite.config.ts          # Vite build config
│       ├── tsconfig.json
│       └── package.json
│
│
├── 🗂️ shared/                      # ⭐ Shared Types & Utilities
│   ├── src/
│   │   ├── types.ts                # TypeScript type definitions
│   │   ├── utils.ts                # Utility functions
│   │   └── index.ts                # Export everything
│   ├── package.json
│   └── tsconfig.json
│
│
├── 🗂️ docker/                      # ⭐ Containerization
│   ├── docker-compose.yml          # 🐳 Main orchestration (6 containers)
│   ├── Dockerfile.api              # API service image
│   ├── Dockerfile.worker           # Worker service image
│   ├── Dockerfile.scheduler        # Scheduler service image
│   ├── Dockerfile.dashboard        # Dashboard UI image
│   └── .dockerignore               # Exclude files from Docker
│
│
├── 🗂️ database/                    # Database schemas & migrations
│   └── (Migrations folder for future use)
│
│
└── 🗂️ .github/                     # GitHub specific
    └── workflows/
        └── ci-cd.yml               # GitHub Actions pipeline
```

---

## 🚀 Service Overview

### API Service (`services/api/`)
**Purpose**: REST API for job submission and management  
**Port**: 3000  
**Technologies**: Express.js, TypeScript, PostgreSQL, Redis  
**Key Endpoints**:
- `POST /jobs` - Create job
- `GET /jobs/:id` - Get job details
- `GET /jobs` - List jobs
- `POST /jobs/:id/retry` - Retry failed job
- `GET /queues` - Queue statistics

### Worker Service (`services/worker/`)
**Purpose**: Process background jobs from queues  
**Technologies**: Node.js, TypeScript, Redis, PostgreSQL  
**Features**:
- Concurrent job processing
- Automatic retry with backoff
- Multiple job handlers
- Health monitoring

### Scheduler Service (`services/scheduler/`)
**Purpose**: Handle delayed and cron-scheduled jobs  
**Technologies**: Node.js, TypeScript, Redis, PostgreSQL  
**Functions**:
- Process delayed jobs
- Queue scheduled jobs
- Manage cron patterns

### Dashboard (`services/dashboard/`)
**Purpose**: Real-time monitoring UI  
**Port**: 5173  
**Technologies**: React, Vite, TypeScript, Axios  
**Features**:
- Live queue statistics
- Job metrics
- System overview
- Auto-refreshing

---

## 🗄️ Data Models

### Jobs Table (PostgreSQL)
```sql
- id (primary key)
- type (job type name)
- payload (JSON data)
- status (pending|processing|completed|failed)
- priority (low|medium|high|critical)
- queue (queue name)
- retries / max_retries
- delay, scheduled_at, cron
- worker_instance_id
- execution_time_ms
- created_at, updated_at
```

### Redis Data Structure
```
queue:{queue_name} - List of job messages
dlq:jobs - Dead letter queue
lock:{key} - Distributed locks
cache:{key} - Temporary cached values
jobs:{jobId} - Job event subscription
```

---

## 🔄 Job Flow

```
1. Client creates job (POST /jobs)
   ↓
2. API validates & stores in PostgreSQL
   ↓
3. Job pushed to Redis queue (by priority)
   ↓
4. Worker polls queues (priority order)
   ↓
5. Worker processes with handler
   ↓
6. Success? → Update to COMPLETED
   ↓
7. Failure? → Retry with backoff
   ↓
8. Max retries exceeded? → Move to DLQ
```

---

## 📊 Environment Variables

**Key Configuration**:
```env
# Services
API_PORT=3000
WORKER_CONCURRENCY=10
SCHEDULER_INTERVAL=10000

# Database
DATABASE_HOST=postgres
DATABASE_NAME=novaqueue

# Redis
REDIS_HOST=redis

# Features
ENABLE_METRICS=true
ENABLE_DASHBOARD=true
```

See `.env.example` for all options.

---

## 🧪 Testing Structure

```
services/api/src/__tests__/
└── api.test.ts - Integration tests for API endpoints
```

Run tests:
```bash
npm run test
npm run test:watch
npm run test:cov
```

---

## 🐳 Docker Setup

**6 Containers**:
1. **postgres** - Database
2. **redis** - Message broker
3. **api** - REST API service
4. **worker** - Job processor
5. **scheduler** - Job scheduler
6. **dashboard** - React UI

**Access Points**:
- API: http://localhost:3000
- Dashboard: http://localhost:5173
- Health: http://localhost:3000/health

**Commands**:
```bash
# Start all
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Scale workers
docker-compose -f docker/docker-compose.yml up -d --scale worker=5

# Stop
docker-compose -f docker/docker-compose.yml down
```

---

## 📚 Documentation Structure

| File | Purpose |
|------|---------|
| `README.md` | Overview, architecture, features |
| `API_DOCS.md` | Complete API reference |
| `GETTING_STARTED.md` | Installation & basic usage |
| `BUILD_SUMMARY.md` | What was built & why |
| `CONTRIBUTING.md` | Development guidelines |

---

## 🛠️ Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Start services (4 terminals)
Terminal 1: npm run api
Terminal 2: npm run worker
Terminal 3: npm run scheduler
Terminal 4: npm run dashboard

# 4. Test API
curl http://localhost:3000/health

# 5. View dashboard
Open http://localhost:5173

# 6. Run tests
npm run test

# 7. Format & lint
npm run lint
```

---

## 🎯 Key Files to Understand First

1. **`services/api/src/main.ts`** - How the API server starts
2. **`services/worker/src/worker.ts`** - How jobs are processed
3. **`services/scheduler/src/scheduler.ts`** - How scheduling works
4. **`shared/src/types.ts`** - All type definitions
5. **`docker/docker-compose.yml`** - Service orchestration
6. **`README.md`** - Complete documentation

---

## 📖 Command Reference

```bash
# Installation & Setup
npm install                         # Install all dependencies
cp .env.example .env               # Create env file

# Development
npm run dev                        # Run all services
npm run api                        # Just API
npm run worker                     # Just Worker
npm run scheduler                  # Just Scheduler
npm run dashboard                  # Just Dashboard

# Building
npm run build                      # Build all services
npm run lint                       # Check code style

# Testing
npm run test                       # Run tests
npm run test:watch                 # Watch mode
npm run test:cov                   # Coverage report

# Docker
docker-compose -f docker/docker-compose.yml up -d    # Start
docker-compose -f docker/docker-compose.yml down     # Stop
docker-compose -f docker/docker-compose.yml logs -f  # Logs
```

---

## ✨ What's Special

- ✅ **Professional TypeScript** - Strict mode enabled
- ✅ **Modular Architecture** - Easy to extend
- ✅ **Production Ready** - Error handling, logging, monitoring
- ✅ **Fully Documented** - 4 comprehensive guides
- ✅ **Containerized** - Docker & compose included
- ✅ **Tested** - Jest setup + test framework
- ✅ **CaptainCode Signature** - Throughout the codebase
- ✅ **Scalable** - Horizontal scaling ready

---

**Created by CaptainCode | NovaCore Systems | v2.0.0**

**Everything you need to run a world-class job queue system!** 🚀
