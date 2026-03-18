## Architecture & Design

**Created by CaptainCode - HelixOps Technologies**

### System Architecture

HelixMonitor follows a **modular, scalable architecture** designed for enterprise-grade observability:

```
Data Collection Layer
    ↓
[Prometheus Scrape] ← [Node Exporter, Custom Exporters, Services]
    ↓
Time-Series Storage
    ↓
[Prometheus TSDB] ← [15-day retention]
    ↓
Processing & Alerting
    ├─ [Alert Manager] → Evaluation Engine
    └─ [FastAPI] → Business Logic
    ↓
Data Access Layer
    ├─ [PostgreSQL] - Structured Data
    ├─ [Redis] - Caching Layer
    └─ [REST APIs]
    ↓
Presentation Layer
    ↓
[React Dashboard] → Visualization
```

### Component Architecture

#### 1. **Metrics Collection Pipeline**

**Collection Flow:**
```
Services expose /metrics 
    ↓
Prometheus scrapes endpoints (every 15s)
    ↓
Metrics stored in TSDB
    ↓
FastAPI ingests via API (alternative)
    ↓
Data available for querying
```

**Supported Scrapers:**
- Prometheus Node Exporter (system metrics)
- Custom Python/Node exporters (app metrics)
- Direct metric endpoints (metrics push)

#### 2. **Data Models**

**Metric Data Model:**
```python
{
  "metric_name": "cpu_usage_percent",
  "service_id": "api-service-1",
  "value": 45.5,
  "timestamp": "2026-03-18T10:30:00Z",
  "labels": {
    "instance": "host-1",
    "region": "us-east-1",
    "environment": "production"
  },
  "unit": "percent"
}
```

**Alert Rule Model:**
```python
{
  "id": "rule_1",
  "name": "High CPU Usage",
  "service_id": "api-service-1",
  "conditions": [
    {
      "metric_name": "cpu_usage_percent",
      "operator": ">",
      "threshold": 85,
      "duration_seconds": 300
    }
  ],
  "notification_config": {
    "channel": "email",
    "recipients": ["ops@helixops.com"]
  },
  "severity": "warning",
  "enabled": true
}
```

#### 3. **Alerting Logic**

**Alert Lifecycle:**
```
Rule Created
    ↓
Metrics Evaluated Against Conditions
    ├─ Condition Met → Alert Triggered
    │   ↓
    │   Notification Sent (Email/Webhook)
    │   ↓
    │   Alert Active
    │   ├─ User Acknowledges → Acknowledged State
    │   └─ User Resolves → Resolved State
    │
    └─ Condition Not Met → Alert Clears
```

**Condition Operators:**
- `>` - Greater than
- `<` - Less than
- `>=` - Greater or equal
- `<=` - Less or equal
- `==` - Equal
- `!=` - Not equal

#### 4. **Service Registry**

**Service Lifecycle:**
```
Register Service
    ↓
Record Heartbeats (periodic ping from service)
    ↓
Evaluate Health Status
    ├─ Recent heartbeat → Healthy
    ├─ Stale heartbeat (>60s) → Offline
    └─ No heartbeat → Unknown
    ↓
Deregister Service (manual)
```

### Scaling Architecture

**Horizontal Scaling:**

```
Multiple Services
    ↓
[Prometheus] ← Scales with scrape targets
    ↓
[FastAPI Cluster] ← Multiple instances behind load balancer
    ├─ API Gateway
    ├─ Metrics Service (stateless)
    ├─ Alert Service (stateless)
    └─ Service Registry (shared state in PostgreSQL)
    ↓
[PostgreSQL] ← Connection pooling (20 connections)
[Redis] ← Replication for HA
    ↓
[Frontend] ← Static builds, CDN deliverable
```

**Scaling Recommendations:**

1. **Prometheus**: Increase scrape targets, use federation for HA
2. **FastAPI**: Auto-scaling based on CPU/memory thresholds
3. **PostgreSQL**: Connection pooling, read replicas for high-load
4. **Redis**: Clustering or Sentinel setup for HA
5. **Frontend**: Serve from CDN, static assets

### Data Flow Diagrams

#### Metric Ingestion Flow

```
Service A (8000/metrics)
    ↓
Prometheus Scraper (15s interval)
    ↓
TSDB Storage
    ↓
Time-series Data
    {timestamp: value, timestamp: value, ...}
    ↓
FastAPI Metrics Service
    ↓
Cache (Redis)
    ↓
API Response / Dashboard
```

#### Alert Evaluation Flow

```
Metric Value Update
    ↓
Alert Service retrieves rule conditions
    ↓
Evaluate each condition
    ├─ CPU > 85 for 5 minutes?
    ├─ Memory < 10%?
    └─ Error rate > 5%?
    ↓
Conditions Met?
    ├─ YES → Create Alert Instance
    │   ├─ Notify via Email
    │   ├─ Notify via Webhook
    │   └─ Store in Alert History
    │
    └─ NO → Check next rule
```

### Security Architecture

**Authentication & Authorization:**
```
API Request
    ↓
[CORS Check]
    ↓
[Rate Limiter] (future)
    ↓
[Auth Middleware] (future)
    ├─ API Key validation
    ├─ JWT verification
    └─ Service account confirmation
    ↓
Route Handler
```

**Data Protection:**
- PostgreSQL: Encrypted connections (SSL)
- Redis: AUTH password
- API: HTTPS/TLS (production)
- Emails: Encrypted SMTP connection

### Fault Tolerance

**High Availability Strategy:**

1. **Prometheus**: Persistent storage with 15-day retention
   - Data survives service restarts
   - Query caching for redundancy

2. **Database Failures**: Connection pooling & automatic retries
   - Detects failed connections
   - Removes from pool, retries healthy connections

3. **Alert Failures**: Deduplication & deferred notifications
   - Prevents alert storms
   - Retry failed notifications

4. **Service Downtime**: Heartbeat detection
   - Services marked offline after 60s no heartbeat
   - Triggers service-down alerts

### Performance Considerations

**Query Optimization:**
- PromQL native functions (avg, max, rate, etc.)
- Redis caching for hot metrics
- Indexed PostgreSQL queries
- Step parameter controls data point density

**Memory Management:**
- Prometheus TSDB compaction (hourly, daily)
- Redis memory limits with eviction policy
- Connection pooling prevents connection leaks
- Cache TTL prevents stale data

**Latency Optimization:**
- Direct Prometheus federation (sub-50ms metadata lookup)
- Redis in-process caching (10-100ms)
- Efficient JSON serialization
- Async/await for I/O operations

### Technology Decisions

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Time-Series DB | Prometheus | Industry standard, powerful query language, built-in scraping |
| Backend API | FastAPI | Modern, async-first, automatic OpenAPI docs |
| Frontend | React + TypeScript | Component-based, type-safe, rich ecosystem |
| Caching | Redis | High-speed in-memory, pub/sub, persistence options |
| Relational DB | PostgreSQL | Reliable, ACID compliance, rich query features |
| Containerization | Docker | Reproducible deployments, isolation, scalability |
| Orchestration | Docker Compose | Simplicity for development, alternative to Kubernetes |

---

**Document Version: 1.0** | Created by CaptainCode
