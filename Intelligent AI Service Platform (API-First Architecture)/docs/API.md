# API Documentation

Complete API reference for the Intelligent AI Service Platform.

## Base URL

```
http://localhost:8000
```

## Authentication

API authentication will use API keys (coming soon).

For now, requests are open. In production, add header:
```
X-API-Key: your-api-key
```

## Response Format

All responses follow this format:

### Success Response (200-201)
```json
{
  "data": {...},
  "status": "success",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response (4xx, 5xx)
```json
{
  "error": "Error message",
  "status": "error",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## API Endpoints

### Sessions Management

#### Create Session
```http
POST /sessions?user_id={user_id}
Content-Type: application/json

{
  "title": "Session Title",
  "context": {}
}

Response: 200 OK
{
  "id": 1,
  "session_hash": "uuid-string",
  "title": "Session Title",
  "is_active": true,
  "context": {},
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "messages": []
}
```

#### Get Session
```http
GET /sessions/{session_id}?user_id={user_id}

Response: 200 OK
```

#### List User Sessions
```http
GET /sessions?user_id={user_id}&limit=10&offset=0

Response: 200 OK
[
  {
    "id": 1,
    "title": "Session 1",
    ...
  }
]
```

#### Update Session
```http
PUT /sessions/{session_id}?user_id={user_id}
Content-Type: application/json

{
  "title": "New Title",
  "is_active": true,
  "context": {}
}
```

#### Delete Session
```http
DELETE /sessions/{session_id}?user_id={user_id}

Response: 204 No Content
```

### AI Chat

#### Send Message / Get Response
```http
POST /ai/chat
Content-Type: application/json

{
  "message": "What products do you recommend?",
  "user_id": 123,
  "session_id": 1,
  "context": {
    "preferences": ["electronics"],
    "budget": "high"
  }
}

Response: 200 OK
{
  "response": "Based on your preferences, I recommend...",
  "confidence": 0.95,
  "suggested_actions": [
    "View details",
    "Add to wishlist",
    "Compare prices"
  ],
  "session_id": 1,
  "message_id": 42,
  "metadata": {
    "prompt_tokens": 150,
    "completion_tokens": 100,
    "total_tokens": 250
  }
}
```

**Parameters:**
- `message` (required): User message (max 10000 chars)
- `user_id` (required): User ID
- `session_id` (optional): Chat session ID
- `context` (optional): Additional context for AI

**Response Fields:**
- `response`: AI-generated response
- `confidence`: Confidence score (0-1)
- `suggested_actions`: Array of recommended next actions
- `metadata`: API usage information

### Recommendations

#### Get Recommendations
```http
GET /recommendations?user_id={user_id}&limit=10&item_type=product

Response: 200 OK
{
  "user_id": 123,
  "recommendations": [
    {
      "id": 1,
      "item_id": "prod_456",
      "item_type": "product",
      "item_name": "Premium Backpack",
      "score": 0.92,
      "reason": "Matches your outdoor interests",
      "viewed": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total_count": 1,
  "generated_at": "2024-01-15T10:30:00Z"
}
```

**Query Parameters:**
- `user_id` (required): User ID
- `limit` (optional, default: 10): Number of recommendations (1-100)
- `item_type` (optional): Filter by type (product, content, action)

#### Generate Recommendations
```http
POST /recommendations/generate
Content-Type: application/json

{
  "user_id": 123,
  "preferences": {
    "categories": ["electronics", "outdoor"],
    "price_range": [100, 1000],
    "brand_preferences": ["Sony", "Canon"]
  }
}

Response: 200 OK
{
  "user_id": 123,
  "recommendations": [...],
  "total_count": 5,
  "generated_at": "2024-01-15T10:30:00Z"
}
```

#### Mark Recommendation Viewed
```http
POST /recommendations/{recommendation_id}/view?user_id={user_id}

Response: 200 OK
{
  "success": true,
  "recommendation_id": 1
}
```

### Health & Metrics

#### Health Check
```http
GET /health

Response: 200 OK
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "database": "ok",
  "redis": "ok",
  "openai": "ok"
}
```

**Status Values:**
- `ok`: All systems operational
- `degraded`: Some services unhealthy
- `error`: Critical service failure

#### Metrics
```http
GET /metrics

Response: 200 OK
{
  "total_users": 250,
  "total_sessions": 1500,
  "total_messages": 8000,
  "avg_response_time_ms": 245.5,
  "requests_per_minute": 450,
  "cache_hit_rate": 0.82
}
```

#### Readiness Check
```http
GET /ready

Response: 200 OK
{
  "status": "ready"
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 204 | No Content | Successful deletion |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid auth |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Error | Server error |
| 503 | Unavailable | Service unavailable |

## Rate Limiting

Rate limits are applied per user/API key:
- **Limit**: 100 requests per minute
- **Header**: `X-RateLimit-Remaining`

When limit exceeded:
```json
{
  "detail": "Rate limit exceeded",
  "retry_after": 30
}
```

## Pagination

List endpoints support pagination:

```http
GET /sessions?user_id=123&limit=20&offset=40
```

**Parameters:**
- `limit`: Items per page (default: 10, max: 100)
- `offset`: Items to skip (default: 0)

## Filtering

Recommendations endpoint supports filtering:

```http
GET /recommendations?user_id=123&item_type=product&limit=5
```

## Sorting

Message history is sorted by timestamp (ascending).
Recommendations are sorted by score (descending).

## Data Types

### User
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "preferences": {},
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Message
```json
{
  "id": 1,
  "role": "user",
  "content": "Hello AI!",
  "confidence_score": null,
  "metadata": {},
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Recommendation
```json
{
  "id": 1,
  "item_id": "prod_123",
  "item_type": "product",
  "item_name": "Product Name",
  "score": 0.92,
  "reason": "Why recommended",
  "viewed": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

## Examples

### Python
```python
import requests

BASE_URL = "http://localhost:8000"

# Send message
response = requests.post(
    f"{BASE_URL}/ai/chat",
    json={
        "message": "Hello!",
        "user_id": 1,
        "session_id": 1
    }
)

result = response.json()
print(result["response"])
```

### cURL
```bash
curl -X POST http://localhost:8000/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello!",
    "user_id": 1,
    "session_id": 1
  }'
```

### JavaScript/Node.js
```javascript
const response = await fetch('http://localhost:8000/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Hello!',
    user_id: 1,
    session_id: 1
  })
});

const data = await response.json();
console.log(data.response);
```

## WebSocket Support (Future)

For real-time chat, WebSocket support is planned:

```javascript
ws = new WebSocket('ws://localhost:8000/ws/chat/session/1');

ws.onmessage = (event) => {
  console.log(event.data);
};

ws.send(JSON.stringify({
  message: 'Hello!',
  user_id: 1
}));
```

## Changelog

### v1.0.0
- Initial release
- Chat endpoints
- Recommendations
- Session management
- Health monitoring

---

**Crafted by CaptainCode** 🚀
