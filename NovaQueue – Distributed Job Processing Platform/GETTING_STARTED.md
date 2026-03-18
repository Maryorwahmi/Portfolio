# NovaQueue - Getting Started Guide

**By CaptainCode | NovaCore Systems**

## Table of Contents
1. [Installation](#installation)
2. [Running Locally](#running-locally)
3. [Running with Docker](#running-with-docker)
4. [Basic Usage](#basic-usage)
5. [Creating Custom Job Handlers](#creating-custom-job-handlers)
6. [Troubleshooting](#troubleshooting)

---

## Installation

### Prerequisites Check
```bash
node --version  # Should be v18 or higher
npm --version   # Should be v9 or higher
docker --version  # For Docker setup
```

### Clone & Setup
```bash
# Clone repository
git clone https://github.com/captaincode/novaqueue.git
cd novaqueue

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

---

## Running Locally

### Terminal 1 - API Service
```bash
npm run api
# Server runs on http://localhost:3000
```

### Terminal 2 - Worker Service
```bash
npm run worker
# Worker polls queues every 1000ms
```

### Terminal 3 - Scheduler Service
```bash
npm run scheduler
# Scheduler runs every 10 seconds
```

### Terminal 4 - Dashboard (Optional)
```bash
npm run dashboard
# Dashboard runs on http://localhost:5173
```

---

## Running with Docker

### Quickstart
```bash
# Start all services
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/docker-compose.yml down
```

### Access Services
- **API**: http://localhost:3000
- **Dashboard**: http://localhost:5173
- **Health Check**: http://localhost:3000/health

### Database Access
```bash
docker exec -it novaqueue-postgres psql -U novaqueue_user -d novaqueue
```

---

## Basic Usage

### 1. Create a Job

```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "type": "send_email",
    "payload": {
      "to": "user@example.com",
      "subject": "Hello",
      "body": "Welcome to NovaQueue!"
    },
    "priority": "high"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "job_xyz123",
    "type": "send_email",
    "status": "pending",
    "createdAt": "2024-03-18T10:30:45.123Z"
  }
}
```

### 2. Check Job Status

```bash
curl http://localhost:3000/jobs/job_xyz123
```

### 3. Create Delayed Job

```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "type": "send_reminder",
    "payload": { "userId": "user_123" },
    "delay": 3600000,
    "priority": "medium"
  }'
```

**Note**: `delay` is in milliseconds (3600000 = 1 hour)

### 4. Create Scheduled Job

```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cleanup_temp",
    "payload": {},
    "scheduledAt": "2024-03-18T23:00:00Z",
    "priority": "low"
  }'
```

### 5. View Queue Stats

```bash
curl http://localhost:3000/queues
```

### 6. View Dead Letter Queue

```bash
curl http://localhost:3000/dlq
```

---

## Creating Custom Job Handlers

### Step 1: Create Handler File

Create `services/worker/src/handlers/custom.handler.ts`:

```typescript
import { Job, JobResult, JobHandler } from '@shared/types';
import { Logger } from '@shared/utils';

export class DataProcessingHandler implements JobHandler {
  private logger = new Logger('DataProcessingHandler');

  async handle(job: Job): Promise<JobResult> {
    const { data, format } = job.payload;

    this.logger.debug(`Processing data in ${format} format`);

    try {
      // Your custom logic here
      const processedData = this.transformData(data, format);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        data: {
          jobId: job.id,
          processedRows: processedData.length,
          completedAt: new Date().toISOString()
        },
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Data processing failed: ${(error as Error).message}`);
    }
  }

  canHandle(jobType: string): boolean {
    return jobType === 'process_data';
  }

  private transformData(data: any, format: string): any[] {
    // Transform logic
    return Array.isArray(data) ? data : [data];
  }
}
```

### Step 2: Register Handler

Update `services/worker/src/handlers/index.ts`:

```typescript
import { DataProcessingHandler } from './custom.handler';

export function registerJobHandlers(worker: WorkerProcess): void {
  // ... existing handlers ...
  
  worker.registerHandler('process_data', new DataProcessingHandler());
}
```

### Step 3: Submit Jobs

```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "type": "process_data",
    "payload": {
      "data": [1, 2, 3, 4, 5],
      "format": "csv"
    },
    "priority": "high"
  }'
```

---

## Advanced Examples

### Idempotent Job

```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "type": "charge_payment",
    "payload": {
      "userId": "user_123",
      "amount": 9999
    },
    "idempotencyKey": "payment_2024_03_18_001",
    "priority": "critical"
  }'
```

### Job with Metadata

```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "type": "send_email",
    "payload": { "to": "user@example.com" },
    "metadata": {
      "userId": "user_123",
      "source": "user_signup",
      "tags": ["welcome", "onboarding"],
      "createdBy": "signup_flow"
    }
  }'
```

---

## Troubleshooting

### API Not Responding

```bash
# Check if API is running
curl http://localhost:3000/health

# Check logs
npm run api  # See console output

# Check ports
lsof -i :3000
```

### Workers Not Processing Jobs

```bash
# Check if Redis is accessible
redis-cli ping

# Check queue stats
curl http://localhost:3000/queues

# View worker logs
npm run worker
```

### Database Connection Issues

```bash
# Check PostgreSQL connection
psql -h localhost -U novaqueue_user -d novaqueue

# Reset database (WARNING: Deletes all data)
npm run db:migrate
```

### Docker Issues

```bash
# Check container status
docker ps

# View logs
docker logs novaqueue-api
docker logs novaqueue-worker

# Rebuild images
docker-compose -f docker/docker-compose.yml build --no-cache
```

---

## Performance Tips

1. **Batch Operations**: Create multiple jobs in a single loop rather than sequential requests

2. **Optimize Handlers**: Keep job handlers fast (< 30 seconds)

3. **Monitor Queues**: Keep DLQ size small - investigate failed jobs

4. **Scale Workers**: Add workers when queue depth grows
```bash
docker-compose -f docker/docker-compose.yml up -d --scale worker=5
```

5. **Use Appropriate Priority**: Reserve HIGH/CRITICAL for important jobs

---

## Next Steps

- Read [API Documentation](API_DOCS.md)
- Explore [Architecture Documentation](README.md)
- Create custom job handlers for your use case
- Set up monitoring with the dashboard
- Deploy to production using Docker

---

**Happy job processing! 🚀**  
**Created by CaptainCode | NovaCore Systems**
