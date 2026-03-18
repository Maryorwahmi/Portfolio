# API Integration Guide

**Created by CaptainCode - HelixOps Technologies**

## Integrating with HelixMonitor

### Authentication

Currently, HelixMonitor uses **no authentication** (open endpoints). This is suitable for internal deployments. For production, implement API key or OAuth2.

### Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://api.helixops.com`

All endpoints are under `/api/v1/`.

---

## Integration Examples

### Example 1: Send Metrics from Your Application

**Python:**
```python
import requests
import time
from datetime import datetime

class HelixMonitorClient:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api/v1"
    
    def send_metric(self, metric_name, service_id, value, labels=None):
        """Send a metric to HelixMonitor"""
        payload = {
            "metric_name": metric_name,
            "service_id": service_id,
            "value": value,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "labels": labels or {}
        }
        
        response = requests.post(
            f"{self.api_url}/metrics/ingest",
            json=payload
        )
        return response.json()
    
    def register_service(self, service_id, name, metrics_endpoint):
        """Register a service"""
        payload = {
            "id": service_id,
            "name": name,
            "metrics_endpoint": metrics_endpoint,
            "service_type": "api"
        }
        
        response = requests.post(
            f"{self.api_url}/services/",
            json=payload
        )
        return response.json()
    
    def record_heartbeat(self, service_id):
        """Record a heartbeat"""
        response = requests.post(
            f"{self.api_url}/services/{service_id}/heartbeat"
        )
        return response.json()

# Usage
client = HelixMonitorClient()

# Register service
client.register_service(
    "my-api",
    "My API Service",
    "http://localhost:8000/metrics"
)

# Send metrics
client.send_metric(
    "request_duration_ms",
    "my-api",
    145.5,
    labels={"endpoint": "/api/users"}
)

# Record heartbeat
client.record_heartbeat("my-api")
```

**Node.js:**
```javascript
const axios = require('axios');

class HelixMonitorClient {
  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.apiUrl = `${baseUrl}/api/v1`;
  }

  async sendMetric(metricName, serviceId, value, labels = {}) {
    const payload = {
      metric_name: metricName,
      service_id: serviceId,
      value: value,
      timestamp: new Date().toISOString(),
      labels: labels
    };

    const response = await axios.post(
      `${this.apiUrl}/metrics/ingest`,
      payload
    );
    return response.data;
  }

  async registerService(serviceId, name, metricsEndpoint) {
    const payload = {
      id: serviceId,
      name: name,
      metrics_endpoint: metricsEndpoint,
      service_type: 'api'
    };

    const response = await axios.post(
      `${this.apiUrl}/services/`,
      payload
    );
    return response.data;
  }

  async recordHeartbeat(serviceId) {
    const response = await axios.post(
      `${this.apiUrl}/services/${serviceId}/heartbeat`
    );
    return response.data;
  }
}

// Usage
const client = new HelixMonitorClient();

// Register service
await client.registerService(
  'my-api',
  'My API Service',
  'http://localhost:8000/metrics'
);

// Send metric
await client.sendMetric(
  'request_duration_ms',
  'my-api',
  145.5,
  { endpoint: '/api/users' }
);

// Record heartbeat
await client.recordHeartbeat('my-api');
```

### Example 2: Create Alert Rules

```bash
curl -X POST http://localhost:8000/api/v1/alerts/rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "High API Latency",
    "service_id": "my-api",
    "severity": "warning",
    "conditions": [
      {
        "metric_name": "http_request_duration_seconds",
        "operator": ">",
        "threshold": 1.0,
        "duration_seconds": 300
      }
    ],
    "notification_config": {
      "channel": "email",
      "recipients": ["alerts@mycompany.com"]
    }
  }'
```

### Example 3: Query Metrics

```bash
# Query CPU metrics for last hour
curl -X POST http://localhost:8000/api/v1/metrics/query \
  -H "Content-Type: application/json" \
  -d '{
    "metric_name": "cpu_usage_percent",
    "service_id": "my-api",
    "time_range": "1h",
    "aggregation": "avg"
  }'

# Get statistics
curl "http://localhost:8000/api/v1/metrics/statistics?metric_name=cpu_usage_percent&service_id=my-api&time_range=1h"
```

### Example 4: Monitor Service Health

```python
import requests
import json
from datetime import datetime

def monitor_service_health():
    """Continuous health monitoring example"""
    base_url = "http://localhost:8000/api/v1"
    
    # Get all services
    response = requests.get(f"{base_url}/services/")
    services = response.json()["services"]
    
    for service in services:
        service_id = service["id"]
        
        # Get health summary
        response = requests.get(f"{base_url}/services/{service_id}/health")
        health = response.json()
        
        # Check status
        if health["status"] == "critical":
            print(f"🚨 CRITICAL: {service_id} - {health}")
        elif health["status"] == "warning":
            print(f"⚠️  WARNING: {service_id} - {health}")
        else:
            print(f"✅ OK: {service_id} - {health}")

# Run monitoring
monitor_service_health()
```

### Example 5: Alert Management

```javascript
async function handleAlerts() {
  const client = new HelixMonitorClient();
  
  // Get active alerts
  const response = await axios.get(
    'http://localhost:8000/api/v1/alerts/?service_id=my-api'
  );
  const alerts = response.data.alerts;
  
  for (const alert of alerts) {
    console.log(`Alert: ${alert.message} (${alert.severity})`);
    
    // Auto-acknowledge warning severity
    if (alert.severity === 'warning') {
      await axios.post(
        `http://localhost:8000/api/v1/alerts/${alert.id}/acknowledge`,
        null,
        { params: { acknowledged_by: 'automation' } }
      );
      console.log(`Acknowledged: ${alert.id}`);
    }
    
    // Escalate critical alerts
    if (alert.severity === 'critical') {
      await sendPagerDutyAlert(alert);
    }
  }
}
```

---

## Webhook Integration

### Setting Up Webhooks

Configure webhook notifications in alert rules:

```json
{
  "notification_config": {
    "channel": "webhook",
    "webhook_url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
  }
}
```

### Webhook Payload Format

When an alert triggers, HelixMonitor POSTs to your webhook:

```json
{
  "alert_id": "alert_123",
  "rule_id": "rule_456",
  "service_id": "api-service-1",
  "severity": "critical",
  "status": "active",
  "message": "High CPU usage detected",
  "metric_name": "cpu_usage_percent",
  "metric_value": 92.5,
  "triggered_at": "2026-03-18T10:30:00Z",
  "timestamp": "2026-03-18T10:30:00Z"
}
```

### Example: Slack Integration

```python
def slack_webhook_handler(alert_data):
    """Convert HelixMonitor alert to Slack message"""
    
    severity_colors = {
        'critical': '#ff0000',  # Red
        'warning': '#ffaa00',   # Orange
        'info': '#0099ff'       # Blue
    }
    
    slack_message = {
        "attachments": [
            {
                "color": severity_colors.get(alert_data['severity'], '#cccccc'),
                "title": alert_data['message'],
                "text": f"Service: {alert_data['service_id']}",
                "fields": [
                    {
                        "title": "Metric",
                        "value": f"{alert_data['metric_name']}: {alert_data['metric_value']}",
                        "short": True
                    },
                    {
                        "title": "Severity",
                        "value": alert_data['severity'].upper(),
                        "short": True
                    }
                ],
                "ts": int(datetime.fromisoformat(alert_data['triggered_at']).timestamp())
            }
        ]
    }
    
    return slack_message
```

---

## Best Practices

### 1. **Metric Naming**
- Use snake_case: `cpu_usage_percent`
- Include unit type: `_percent`, `_seconds`, `_bytes`
- Be descriptive: `http_request_duration_seconds` not `req_time`

### 2. **Service Registration**
- Register services on startup
- Use unique, lowercase service IDs
- Include meaningful metadata

### 3. **Alert Rules**
- Set reasonable thresholds based on historical data
- Use duration to prevent flaky alerts
- Create escalation paths (warning → critical)

### 4. **Metric Collection**
- Collect metrics at consistent intervals
- Include relevant labels for filtering
- Avoid high-cardinality labels (unbounded values)

### 5. **Error Handling**
```python
try:
    client.send_metric(...)
except requests.ConnectionError:
    # Fallback: log locally, retry later
    log_metric_locally(...)
except requests.Timeout:
    # Network slow: implement backoff
    retry_with_backoff(...)
except Exception as e:
    # Unknown error: log and continue
    logger.error(f"Failed to send metric: {e}")
```

---

## Rate Limiting (Future)

Once implemented, expect rate limits:
- **100 requests/minute** per API key
- **1000 metrics/minute** ingestion rate
- Retry-After header will be provided

---

## Support & Resources

- **API Docs**: http://localhost:8000/docs
- **Status Page**: http://status.helixops.com
- **Documentation**: https://docs.helixops.com

---

**Document Version: 1.0** | Created by CaptainCode
