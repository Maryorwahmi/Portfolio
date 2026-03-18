# NovaQueue - Complete API Documentation

**Created by CaptainCode | NovaCore Systems**

## Table of Contents

1. [Authentication](#authentication)
2. [Response Format](#response-format)
3. [Job Endpoints](#job-endpoints)
4. [Queue Endpoints](#queue-endpoints)
5. [Health & Status](#health--status)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [WebSocket Events](#websocket-events)

---

## Authentication

Currently, NovaQueue uses request ID tracking. For production, implement:

- **JWT Bearer Token**: `Authorization: Bearer your_token_here`
- **API Key**: `X-API-Key: your_api_key`

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "timestamp": "2024-03-18T10:30:45.123Z",
  "requestId": "req_a1b2c3d4e5f6g7h8"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "timestamp": "2024-03-18T10:30:45.123Z",
  "requestId": "req_a1b2c3d4e5f6g7h8"
}
```

---

## Job Endpoints

### 1. Create Job

**Endpoint**: `POST /jobs`

**Description**: Creates a new background job for processing.

**Request Body**:
```json
{
  "type": "send_email",
  "payload": {
    "to": "user@example.com",
    "subject": "Welcome",
    "body": "Hello, welcome!"
  },
  "priority": "high",
  "delay": 0,
  "scheduledAt": "2024-03-18T15:30:00Z",
  "cron": null,
  "idempotencyKey": "unique-id-123",
  "metadata": {
    "userId": "user_123",
    "source": "user_signup"
  }
}
```

**Parameters**:
- `type` (required): Job type string (e.g., "send_email")
- `payload` (required): JSON object with job data
- `priority` (optional): "critical" | "high" | "medium" | "low" (default: "medium")
- `delay` (optional): Milliseconds to wait before processing (default: 0)
- `scheduledAt` (optional): ISO 8601 datetime for scheduled execution
- `cron` (optional): Cron expression for recurring jobs
- `idempotencyKey` (optional): Unique key to prevent duplicates
- `metadata` (optional): Custom metadata object

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "job_abc123def456",
    "type": "send_email",
    "payload": { "to": "user@example.com", ... },
    "status": "pending",
    "priority": "high",
    "queue": "high_priority",
    "retries": 0,
    "maxRetries": 3,
    "delay": 0,
    "metadata": { "userId": "user_123", ... },
    "createdAt": "2024-03-18T10:30:45.123Z",
    "updatedAt": "2024-03-18T10:30:45.123Z"
  }
}
```

**HTTP Status Codes**:
- `201 Created`: Job successfully created
- `400 Bad Request`: Missing required fields
- `500 Internal Server Error`: Server error

---

### 2. Get Job Details

**Endpoint**: `GET /jobs/:id`

**Description**: Retrieves detailed information about a specific job.

**Parameters**:
- `id` (path, required): Job ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "job_abc123def456",
    "type": "send_email",
    "payload": { ... },
    "status": "completed",
    "priority": "high",
    "queue": "high_priority",
    "retries": 0,
    "maxRetries": 3,
    "processedAt": "2024-03-18T10:30:50.000Z",
    "completedAt": "2024-03-18T10:30:55.000Z",
    "executionTimeMs": 5000,
    "workerInstanceId": "worker_xyz789",
    "metadata": { ... },
    "createdAt": "2024-03-18T10:30:45.123Z",
    "updatedAt": "2024-03-18T10:30:55.000Z"
  }
}
```

**Job Status Values**:
- `pending`: Job queued, waiting for processing
- `processing`: Currently being processed by a worker
- `completed`: Successfully executed
- `failed`: Execution failed after all retries
- `retrying`: Retrying after a failure
- `delayed`: Waiting for delay/scheduled time
- `cancelled`: Manually cancelled

---

### 3. List Jobs

**Endpoint**: `GET /jobs`

**Description**: Retrieves a paginated list of jobs with optional filtering.

**Query Parameters**:
- `status`: Filter by job status (pending, completed, failed, etc.)
- `type`: Filter by job type (send_email, generate_report, etc.)
- `priority`: Filter by priority (critical, high, medium, low)
- `limit`: Results per page (default: 50, max: 100)
- `offset`: Pagination offset (default: 0)

**Example**:
```
GET /jobs?status=completed&priority=high&limit=20&offset=0
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_abc123def456",
        "type": "send_email",
        "status": "completed",
        "priority": "high",
        ...
      },
      {
        "id": "job_def456ghi789",
        "type": "generate_report",
        "status": "pending",
        "priority": "medium",
        ...
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "page": 1,
      "pages": 8
    }
  }
}
```

---

### 4. Cancel Job

**Endpoint**: `POST /jobs/:id/cancel`

**Description**: Cancels a pending or processing job.

**Parameters**:
- `id` (path, required): Job ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Job cancelled successfully"
  }
}
```

**Errors**:
- `404 Not Found`: Job doesn't exist
- `400 Bad Request`: Job cannot be cancelled (already completed/failed)

---

### 5. Retry Failed Job

**Endpoint**: `POST /jobs/:id/retry`

**Description**: Retries a failed job.

**Parameters**:
- `id` (path, required): Job ID (must be in failed state)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "job_abc123def456",
    "status": "pending",
    "retries": 1,
    ...
  }
}
```

---

### 6. Get Job Logs

**Endpoint**: `GET /jobs/:id/logs`

**Description**: Retrieves event logs for a specific job.

**Parameters**:
- `id` (path, required): Job ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "jobId": "job_abc123def456",
      "status": "pending",
      "message": "Job created",
      "timestamp": "2024-03-18T10:30:45.123Z"
    },
    {
      "id": 2,
      "jobId": "job_abc123def456",
      "status": "processing",
      "message": "Job started processing",
      "timestamp": "2024-03-18T10:30:50.000Z"
    },
    {
      "id": 3,
      "jobId": "job_abc123def456",
      "status": "completed",
      "message": "Job completed successfully",
      "timestamp": "2024-03-18T10:30:55.000Z"
    }
  ]
}
```

---

## Queue Endpoints

### 1. Get All Queue Statistics

**Endpoint**: `GET /queues`

**Description**: Retrieves statistics for all queues and system metrics.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "queues": [
      {
        "name": "critical",
        "pending": 5,
        "dlq": 0
      },
      {
        "name": "high_priority",
        "pending": 23,
        "dlq": 2
      },
      {
        "name": "default",
        "pending": 147,
        "dlq": 5
      },
      {
        "name": "low_priority",
        "pending": 89,
        "dlq": 1
      }
    ],
    "system": {
      "total_jobs": 264,
      "completed": 1250,
      "failed": 45,
      "processing": 8,
      "pending": 264,
      "avg_execution_time": 2500
    },
    "metrics": {
      "totalRequests": 5430,
      "totalJobsCreated": 1359,
      "totalJobsCompleted": 1250,
      "totalJobsFailed": 45,
      "successRate": 0.965
    }
  }
}
```

---

### 2. Get Specific Queue

**Endpoint**: `GET /queues/:name`

**Description**: Retrieves detailed information about a specific queue.

**Parameters**:
- `name`: Queue name (critical, high_priority, default, low_priority)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "name": "high_priority",
    "length": 23,
    "jobs": [
      {
        "jobId": "job_abc123def456",
        "type": "send_email",
        "priority": "high",
        "timestamp": 1710756645123
      },
      ...
    ],
    "timestamp": "2024-03-18T10:30:45.123Z"
  }
}
```

---

### 3. Get Dead Letter Queue

**Endpoint**: `GET /dlq`

**Description**: Retrieves jobs that have failed all retry attempts.

**Query Parameters**:
- `limit`: Maximum items to return (default: 50)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "dlq": [
      {
        "jobId": "job_failed_123",
        "type": "send_email",
        "payload": { "to": "user@example.com" },
        "error": "Maximum retries exceeded",
        "movedAt": "2024-03-18T10:25:30.000Z"
      }
    ],
    "count": 8
  }
}
```

---

## Health & Status

### Health Check

**Endpoint**: `GET /health`

**Description**: Basic health check endpoint.

**Response** (200 OK):
```json
{
  "status": "healthy",
  "service": "novaqueue-api",
  "version": "2.0.0",
  "author": "CaptainCode",
  "timestamp": "2024-03-18T10:30:45.123Z"
}
```

---

### API Documentation

**Endpoint**: `GET /api/docs`

**Description**: Returns available API endpoints documentation.

**Response** (200 OK):
```json
{
  "service": "NovaQueue API",
  "version": "2.0.0",
  "baseUrl": "http://localhost:3000",
  "endpoints": { ... }
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request**:
```json
{
  "success": false,
  "error": "Job type is required",
  "timestamp": "2024-03-18T10:30:45.123Z"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": "Job not found",
  "timestamp": "2024-03-18T10:30:45.123Z"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": "Internal server error",
  "timestamp": "2024-03-18T10:30:45.123Z"
}
```

---

## Rate Limiting

To be implemented in production:

- **Rate Limit**: 1000 requests per minute per IP
- **Headers**:
  - `X-RateLimit-Limit`: Requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## WebSocket Events

(To be implemented in v2.1)

Subscribe to real-time job events:

```javascript
const ws = new WebSocket('ws://localhost:3000/jobs/job_id/events');

ws.onmessage = (event) => {
  const jobEvent = JSON.parse(event.data);
  console.log('Job event:', jobEvent);
};
```

---

**Documentation created by CaptainCode**  
**NovaQueue v2.0.0 | NovaCore Systems**
