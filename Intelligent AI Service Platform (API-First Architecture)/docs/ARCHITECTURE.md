# System Architecture

Deep dive into the architecture and design patterns of the Intelligent AI Service Platform.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  Web Apps | Mobile Apps | Third-party Integrations | Dashboard   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/HTTPS REST API
┌────────────────────────▼────────────────────────────────────────┐
│                   API GATEWAY LAYER                              │
│  Nginx | Load Balancing | Rate Limiting | SSL Termination       │
└────────────────────────┬────────────────────────────────────────┘
                         │ 
┌────────────────────────▼────────────────────────────────────────┐
│                 WEB APPLICATION LAYER                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │               FastAPI Application                          │ │
│  │  • Request handling                                        │ │
│  │  • Input validation (Pydantic)                            │ │
│  │  • Route handling                                         │ │
│  │  • Response formatting                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼────────┐  ┌──▼──────────────┐
│ BUSINESS     │  │  AI SERVICE   │  │  CACHE LAYER   │
│ LOGIC LAYER  │  │  LAYER        │  │  (Redis)       │
│              │  │               │  │                │
│ • Chat       │  │ • LLM Model   │  │ • Session      │
│ • Recommend  │  │ • Embeddings  │  │ • Cache        │
│ • Context    │  │ • Orchestr.   │  │ • Rate Limit   │
└───────┬──────┘  └──────┬────────┘  └────┬────────────┘
        │                │                │
        │         ┌──────▼────────┐       │
        │         │  EXTERNAL AI  │       │
        │         │  (OpenAI)     │       │
        │         └───────────────┘       │
        │                                  │
└───────┼──────────────────────────────────┘
        │
┌───────▼──────────────────────────────────────┐
│          DATA PERSISTENCE LAYER              │
│  ┌─────────────┐  ┌──────────────┐          │
│  │ PostgreSQL  │  │   Pinecone   │          │
│  │             │  │ (Vector DB)  │          │
│  │ • Users     │  │              │          │
│  │ • Sessions  │  │ • Embeddings │          │
│  │ • Messages  │  │ • Search     │          │
│  │ • Recs      │  └──────────────┘          │
│  └─────────────┘                           │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│     ASYNC PROCESSING LAYER                   │
│  ┌─────────────┐  ┌──────────────────┐      │
│  │  Celery     │  │  Redis Broker    │      │
│  │             │  │                  │      │
│  │ • Tasks     │  │ • Queue Mgmt     │      │
│  │ • Scheduler │  │ • Result Store   │      │
│  └─────────────┘  └──────────────────┘      │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│    MONITORING & OBSERVABILITY                │
│  ┌─────────────┐  ┌──────────────────┐      │
│  │ Prometheus  │  │  Grafana/ELK     │      │
│  │             │  │                  │      │
│  │ • Metrics   │  │ • Dashboards     │      │
│  │ • Alerts    │  │ • Log Analysis   │      │
│  └─────────────┘  └──────────────────┘      │
└──────────────────────────────────────────────┘
```

## Core Components

### 1. API Gateway Layer

**Responsibilities:**
- Request routing
- SSL/TLS termination
- Rate limiting
- Load balancing
- Request/response logging

**Technology:** Nginx

```nginx
upstream api_backend {
    server api1:8000;
    server api2:8000;
    server api3:8000;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;
    
    location / {
        proxy_pass http://api_backend;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
```

### 2. FastAPI Application Layer

**Responsibilities:**
- HTTP request handling
- Route mapping
- Dependency injection
- Error handling
- Response serialization

**Key Components:**
```python
# src/main.py
app = FastAPI()

# Include routers
app.include_router(chat_router, prefix="/ai")
app.include_router(sessions_router)
app.include_router(recommendations_router)
app.include_router(health_router)
```

### 3. Business Logic Layer

**Services:**
```
ChatService
├── create_session()
├── add_message()
├── get_session_messages()
└── get_recent_context()

RecommendationService
├── create_recommendation()
├── get_user_recommendations()
└── generate_recommendations()

UserService
├── create_user()
├── get_user()
├── update_user()
└── delete_user()
```

### 4. AI Service Layer

**Integrations:**
- OpenAI GPT-4 / GPT-3.5
- Hugging Face (optional)
- LangChain (optional)

**Functions:**
```python
AIService
├── generate_response()       # Chat completions
├── extract_structured_data() # JSON extraction
└── generate_embedding()      # Vector embeddings

VectorDBService
├── upsert_vector()         # Store embeddings
├── query_vectors()         # Semantic search
└── delete_vector()         # Remove embeddings
```

### 5. Data Persistence Layer

**PostgreSQL Schema:**
```sql
users
├── id (PK)
├── username (UNIQUE)
├── email (UNIQUE)
├── hashed_password
├── preferences (JSON)
└── timestamps

chat_sessions
├── id (PK)
├── user_id (FK)
├── session_hash
├── context (JSON)
└── messages (relationship)

messages
├── id (PK)
├── session_id (FK)
├── role (user/assistant)
├── content
├── embedding (JSON)
└── metadata (JSON)

recommendations
├── id (PK)
├── user_id (FK)
├── item_id
├── item_type
├── score
└── reason
```

**Indexes:**
```sql
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_session_user ON chat_sessions(user_id);
CREATE INDEX idx_message_session ON messages(session_id);
CREATE INDEX idx_rec_user ON recommendations(user_id);
```

### 6. Cache Layer (Redis)

**Data Stored:**
```
session:{session_id}         → Chat session data
user:{user_id}:preferences   → User preferences
rate_limit:{user_id}         → Request counts
cache:{key}                  → Response cache
embedding:{msg_id}           → Vector embeddings
```

**TTL Settings:**
```python
SESSION_TTL = 7 * 24 * 60 * 60      # 7 days
USER_PREF_TTL = 30 * 60             # 30 minutes
RATE_LIMIT_TTL = 60                 # 1 minute
CACHE_TTL = 1 * 60 * 60             # 1 hour
```

### 7. Async Processing (Celery)

**Task Types:**
```python
@celery_app.task
def generate_embedding_task(message_id):
    # Generate and store embedding

@celery_app.task
def batch_generate_recommendations_task(user_id):
    # Generate recommendations for user

@celery_app.task(name='cleanup_old_sessions')
def cleanup_old_sessions_task():
    # Delete sessions older than 90 days
```

## Design Patterns

### 1. Repository Pattern
```python
class ChatService:
    @staticmethod
    def get_session(db: Session, session_id: int):
        # Abstraction over database queries
        return db.query(ChatSession).filter(...).first()
```

### 2. Dependency Injection
```python
def chat_endpoint(
    request: ChatRequest,
    db: Session = Depends(get_db),  # Injected
    ai_service = Depends(get_ai_service),  # Injected
):
    # Use injected dependencies
    pass
```

### 3. Service Locator
```python
ai_service = get_ai_service()  # Get singleton instance
redis_client = get_redis_client()  # Get singleton instance
```

### 4. Factory Pattern
```python
def get_ai_service() -> AIService:
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()  # Create on first call
    return _ai_service
```

### 5. Strategy Pattern
```python
# Different response strategies
if use_cache:
    response = await cache_service.get(key)
elif use_vector_search:
    response = await vector_db.query_similar(embedding)
else:
    response = await ai_service.generate_response()
```

## Data Flow Examples

### Chat Flow
```
1. Client sends: POST /ai/chat
2. FastAPI validates input (Pydantic)
3. ChatService creates/retrieves session
4. ChatService fetches context (recent messages)
5. AIService generates response (OpenAI)
6. Response is validated
7. Messages stored in PostgreSQL
8. Embedding generated async (Celery background task)
9. Embedding stored in Pinecone
10. Response returned to client (< 2s)
```

### Recommendation Flow
```
1. Client requests: GET /recommendations?user_id=123
2. Check Redis cache for recommendations
3. If cache miss:
   a. Load user preferences from PostgreSQL
   b. Load user behavior data
   c. Call RecommendationService
   d. AIService generates recommendations
   e. Store in PostgreSQL
   f. Cache in Redis (1 hour TTL)
4. Return recommendations sorted by score
```

### Vector Search Flow
```
1. Message received and saved to PostgreSQL
2. Celery task queued to generate embedding
3. AIService generates embedding vector
4. Vector upserted to Pinecone with metadata
5. Later, for semantic search:
   a. User query converted to embedding
   b. Pinecone queries similar vectors
   c. Relevant context retrieved
   d. Context used in AI prompt
```

## Scalability Considerations

### Horizontal Scaling

**API Instances:**
- Stateless design allows multiple instances
- Load balancer distributes traffic
- Share database and cache (external services)

**Database:**
- Read replicas for SELECT queries
- Write primary for INSERT/UPDATE/DELETE
- Connection pooling to limit connections

**Workers:**
- Multiple Celery workers for async tasks
- Independent task processing
- Auto-scaling based on queue depth

### Vertical Scaling

- Increase CPU: Better concurrency
- Increase RAM: Larger connection pools, more cache
- Increase Network: Faster I/O operations

### Performance Optimization

```python
# Connection pooling
pool_size=20      # Maintain 20 connections
max_overflow=40   # Allow burst to 60

# Query optimization
db.query().filter(...).first()  # Efficient filtering
db.query().limit(100).all()     # Pagination

# Caching strategy
@cache(minutes=30)
async def get_user_preferences(user_id):
    # Cache results for 30 minutes
    pass
```

## Error Handling & Resilience

### Graceful Degradation
```python
try:
    embedding = await ai_service.generate_embedding(text)
except Exception as e:
    logger.warning(f"Embedding failed: {e}")
    # Continue without embedding
    embedding = None
```

### Circuit Breaker Pattern
```python
# If OpenAI fails repeatedly, use fallback
if openai_failures > 5:
    use_fallback_model()
```

### Retry Logic
```python
@retry(max_attempts=3, backoff=exponential)
async def call_openai_api():
    # Retry with exponential backoff
    pass
```

## Security Architecture

### Authentication & Authorization
```
User → Validates credentials → Issues JWT token
JWT token → Included in request headers
Middleware → Validates JWT before processing
```

### Rate Limiting
```
Request → Redis rate limit check
Count > limit? → Return 429 Too Many Requests
Count ≤ limit? → Increment counter → Process request
```

### Input Validation
```python
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    # Pydantic validates at request boundary
```

## Testing Architecture

### Unit Tests
```python
# Test individual functions/methods
def test_password_hashing():
    pwd = UserService.hash_password("secret")
    assert UserService.verify_password("secret", pwd)
```

### Integration Tests
```python
# Test components working together
def test_chat_flow():
    session = create_session()
    response = send_message(session)
    assert response.status_code == 200
```

### Load Testing
```python
# Test under concurrent load
locust -f tests/load_test.py --host=http://localhost:8000
```

## Deployment Architecture

### Development
```
Local Machine
├── Python venv
├── PostgreSQL (Docker)
├── Redis (Docker)
└── API server (FastAPI)
```

### Production (Docker Compose)
```
Docker Compose
├── PostgreSQL container
├── Redis container
├── API container (replicated)
├── Celery worker containers
└── Celery beat container
```

### Production (Kubernetes)
```
Kubernetes Cluster
├── API deployment (multiple replicas)
├── Worker deployment (auto-scaling)
├── PostgreSQL StatefulSet
├── Redis cluster
└── Monitoring stack
```

## Monitoring Architecture

### Metrics Collection
```
FastAPI App
→ Prometheus scraper
→ Prometheus server
→ Grafana dashboards
```

### Logging
```
FastAPI App
→ Logs to file/stdout
→ Beat collects logs
→ Logstash processes
→ Elasticsearch stores
→ Kibana visualizes
```

### Alerting
```
Prometheus alerts
→ Alert rules evaluate
→ Conditions met
→ Send to Alertmanager
→ Slack/Email notifications
```

## Future Enhancements

- GraphQL API alongside REST
- WebSocket support for real-time chat
- Multi-tenancy support
- Custom model fine-tuning
- Advanced analytics dashboard
- Mobile SDKs
- A/B testing framework

---

**Crafted by CaptainCode** 🚀
