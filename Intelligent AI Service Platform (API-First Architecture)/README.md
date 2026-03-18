# Intelligent AI Service Platform (API-First Architecture)

> A scalable, modular AI-powered backend platform that provides intelligent services via REST APIs. Designed to integrate seamlessly with any product (SaaS apps, e-commerce, dashboards, etc.).

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Product Vision](#product-vision)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Testing](#testing)
- [Monitoring](#monitoring)
- [Contributing](#contributing)

## 🎯 Overview

The **Intelligent AI Service Platform** is a production-ready backend service that brings AI capabilities to any application through well-designed, scalable APIs. It handles:

- **Conversational AI**: Chat endpoints with context awareness
- **Recommendations**: Personalized product, content, and action recommendations
- **Context Management**: Chat history and user preference tracking
- **Semantic Search**: Vector-based memory and retrieval
- **Async Processing**: Background tasks and scheduled jobs

### Key Value Propositions

✅ **Modular Design** - Components work independently or together  
✅ **Plug & Play** - Integrate with any third-party service via REST API  
✅ **Scalable** - Built for high concurrency and throughput  
✅ **Production-Ready** - Error handling, monitoring, and security included  
✅ **Extensible** - Easy to add new AI models and features  

## 🚀 Product Vision

A unified AI backend that:

1. **Accepts** user input (text, context, metadata)
2. **Processes** via AI/ML models and semantic understanding
3. **Returns** structured, actionable responses
4. **Scales** across multiple use cases (chat, recommendations, automation)

### Use Cases

- **Customer Support Chatbots** - Intelligent conversation with context awareness
- **E-Commerce Platforms** - Personalized product recommendations
- **SaaS Applications** - AI-powered user assistance and automation
- **Knowledge Management** - Semantic search and retrieval
- **Content Platforms** - Smart content recommendations

## 🎁 Core Features (MVP)

### 3.1 Conversational AI API (`POST /ai/chat`)

Generate intelligent responses with context awareness.

```json
Request:
{
  "message": "Recommend a product for me",
  "user_id": "123",
  "session_id": 1,
  "context": {
    "history": [],
    "preferences": ["electronics", "outdoor"]
  }
}

Response:
{
  "response": "Based on your preferences, I recommend...",
  "confidence": 0.92,
  "suggested_actions": ["View details", "Add to cart"],
  "session_id": 1,
  "message_id": 45,
  "metadata": {
    "prompt_tokens": 120,
    "completion_tokens": 80,
    "total_tokens": 200
  }
}
```

**Features:**
- Context window (10 recent messages)
- Confidence scoring
- Suggested actions
- Token usage tracking

### 3.2 Recommendation Engine (`GET /ai/recommendations`)

Generate personalized recommendations using AI inference.

```json
Response:
{
  "user_id": 123,
  "recommendations": [
    {
      "item_id": "prod_123",
      "item_type": "product",
      "item_name": "Premium Hiking Backpack",
      "score": 0.95,
      "reason": "Matches your outdoor interests",
      "viewed": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total_count": 5,
  "generated_at": "2024-01-15T10:30:00Z"
}
```

**Features:**
- Behavior-based recommendations
- Multiple item types (product, content, action)
- Confidence scores
- View tracking

### 3.3 Context & Memory Management

Persistent storage and retrieval of:
- Chat history with messages
- User preferences and metadata
- Session context and state
- Vector embeddings for semantic search

### 3.4 Prompt Orchestration Layer

- Dynamic prompt building with context injection
- Structured JSON output enforcement
- Response shaping and validation
- Multi-model support

### 3.5 AI Model Integration

**Primary:**
- OpenAI GPT-4 and GPT-3.5-turbo

**Optional:**
- Hugging Face Transformers (local inference)
- Custom fine-tuned models

### 3.6 API-First Design

- RESTful architecture
- Comprehensive API documentation (Swagger UI)
- Future GraphQL support
- Versioning ready

## 📚 Tech Stack

### Backend Core
- **FastAPI** 0.104+ - Modern async web framework
- **Pydantic** 2.5 - Data validation and serialization
- **SQLAlchemy** 2.0 - ORM for database
- **Uvicorn** - ASGI server

### AI/ML Layer
- **OpenAI API** - Primary LLM provider
- **LangChain** - LLM orchestration (optional)
- **Hugging Face** - Local model support (optional)

### Data Storage
- **PostgreSQL** 15+ - Structured data
- **Redis** 7+ - Caching and sessions
- **Pinecone** - Vector database for semantic search
  - Alternative: Weaviate, FAISS (local)

### Async & Background Tasks
- **Celery** - Task queue
- **Redis** - Message broker and result backend

### DevOps & Infrastructure
- **Docker** & **Docker Compose** - Containerization
- **Kubernetes** - Orchestration (optional)
- **GitHub Actions** - CI/CD pipeline (optional)

### Monitoring & Logging
- **Prometheus** - Metrics collection
- **Grafana** - Visualization
- **ELK Stack** - Centralized logging
  - Elasticsearch, Logstash, Kibana

### Testing
- **Pytest** - Test framework
- **pytest-asyncio** - Async test support
- **HTTPx** - Async HTTP client
- **Locust** - Load testing

## 🏗️ System Architecture

### Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                      │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                  NGINX / API Gateway                         │
│          (Rate limiting, API keys, routing)                │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Routes: /ai/chat, /recommendations, /sessions, etc.  │   │
│  └──────────────┬───────────────────────────────────────┘   │
└─────────────────┼──────────────────────────────────────────┘
                  │
        ┌─────────┴──────────┬──────────────┬──────────────┐
        ▼                    ▼              ▼              ▼
   ┌─────────┐        ┌──────────┐   ┌─────────┐   ┌──────────┐
   │ Service │        │    AI    │   │Database │   │  Vector  │
   │ Layer   ├────────►Service   ├──►│ (Psql)  ├──►│   DB     │
   │         │        │(OpenAI)  │   │         │   │(Pinecone)│
   └────┬────┘        └──────┬───┘   └─────────┘   └──────────┘
        │                    │
        └────────┬───────────┘
                 │
        ┌────────────────────┐
        │   Cache (Redis)    │
        │ - Session mgmt     │
        │ - Rate limits      │
        └────────────────────┘
        
        ┌────────────────────┐
        │  Celery Workers    │
        │ - Embeddings       │
        │ - Recommendations  │
        │ - Cleanup jobs     │
        └────────────────────┘
```

### Data Models

**User**
- id, username, email, hashed_password
- preferences (JSON)
- is_active, created_at, updated_at
- Relationships: sessions, recommendations

**ChatSession**
- id, user_id, session_hash
- title, context, is_active
- Relationships: user, messages

**Message**
- id, session_id, role (user/assistant)
- content, embedding, metadata
- confidence_score, created_at
- Relationships: session

**Recommendation**
- id, user_id, item_id, item_type
- item_name, score, reason
- viewed, created_at
- Relationships: user

**APIKey**
- id, user_id, key_hash, name
- is_active, last_used, expires_at

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Docker & Docker Compose (optional)
- PostgreSQL 15+ (if not using Docker)
- Redis 7+ (if not using Docker)
- OpenAI API key
- Pinecone API key (optional, for vector search)

### Local Setup (Without Docker)

#### 1. Clone and Setup

```bash
# Clone repository
git clone <repo-url>
cd "Intelligent AI Service Platform (API-First Architecture)"

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
# - Set OPENAI_API_KEY
# - Set PINECONE_API_KEY
# - Configure DATABASE_URL for your PostgreSQL
# - Configure REDIS_URL for your Redis instance
```

#### 3. Initialize Database

```bash
# Create database tables
python -c "from src.core.database import init_db; init_db()"
```

#### 4. Run Application

```bash
# Start API server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# In another terminal, start Celery worker
celery -A src.celery_app worker --loglevel=info

# In another terminal, start Celery beat (scheduler)
celery -A src.celery_app beat --loglevel=info
```

Access the API at: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Docker Setup (Recommended)

#### 1. Configure Environment

```bash
# Copy and configure .env file for Docker
cp .env.example .env

# Edit .env with your API keys
```

#### 2. Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

#### 3. Initialize Database

```bash
# Run migrations inside container
docker-compose exec api python -c "from src.core.database import init_db; init_db()"
```

### Verify Installation

```bash
# Check API health
curl http://localhost:8000/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "database": "ok",
  "redis": "ok",
  "openai": "ok"
}
```

## 📖 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
API Key-based authentication via `X-API-Key` header (future implementation).

### Core Endpoints

#### 1. AI Chat API

**Create Chat Session**
```http
POST /sessions
Content-Type: application/json

{
  "title": "Product Inquiry",
  "context": {}
}

Response (201):
{
  "id": 1,
  "session_hash": "abc123...",
  "title": "Product Inquiry",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "messages": []
}
```

**Send Message**
```http
POST /ai/chat
Content-Type: application/json

{
  "message": "What products do you recommend?",
  "user_id": 123,
  "session_id": 1,
  "context": {
    "preferences": ["electronics"]
  }
}

Response (200):
{
  "response": "Based on your preferences...",
  "confidence": 0.95,
  "suggested_actions": ["View products", "Add to cart"],
  "session_id": 1,
  "message_id": 42,
  "metadata": {
    "prompt_tokens": 150,
    "completion_tokens": 100,
    "total_tokens": 250
  }
}
```

**Get Session Messages**
```http
GET /sessions/1

Response (200):
{
  "id": 1,
  "session_hash": "abc123...",
  "title": "Product Inquiry",
  "is_active": true,
  "messages": [
    {
      "id": 41,
      "role": "user",
      "content": "What products...",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 42,
      "role": "assistant",
      "content": "Based on your...",
      "created_at": "2024-01-15T10:31:00Z"
    }
  ]
}
```

#### 2. Recommendations API

**Get Recommendations**
```http
GET /recommendations?user_id=123&limit=10&item_type=product

Response (200):
{
  "user_id": 123,
  "recommendations": [
    {
      "id": 1,
      "item_id": "prod_456",
      "item_type": "product",
      "item_name": "Premium Backpack",
      "score": 0.92,
      "reason": "Matches your interests",
      "viewed": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total_count": 1,
  "generated_at": "2024-01-15T10:30:00Z"
}
```

**Generate Recommendations**
```http
POST /recommendations/generate
Content-Type: application/json

{
  "user_id": 123,
  "preferences": {
    "categories": ["electronics", "outdoor"],
    "budget": "high"
  }
}
```

#### 3. Health & Metrics

**Health Check**
```http
GET /health

Response (200):
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "database": "ok",
  "redis": "ok",
  "openai": "ok"
}
```

**Metrics**
```http
GET /metrics

Response (200):
{
  "total_users": 250,
  "total_sessions": 1500,
  "total_messages": 8000,
  "avg_response_time_ms": 245.5,
  "requests_per_minute": 450,
  "cache_hit_rate": 0.82
}
```

### Complete API Reference

See [API Documentation](docs/API.md) for detailed endpoint specifications.

## ⚙️ Configuration

### Environment Variables

```bash
# API Configuration
API_TITLE=Intelligent AI Service Platform
API_VERSION=1.0.0
DEBUG=False                         # Set to True for development
ENVIRONMENT=production              # development, staging, production

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ai_platform
DB_ECHO=False                       # SQL query logging

# Redis
REDIS_URL=redis://localhost:6379/0

# OpenAI
OPENAI_API_KEY=sk-...              # Required
OPENAI_MODEL=gpt-4                 # or gpt-3.5-turbo

# Pinecone (Vector DB)
PINECONE_API_KEY=...               # Required for semantic search
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=ai-platform-index

# Security
SECRET_KEY=your-secret-key         # Change in production!
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Rate Limiting
RATE_LIMIT_REQUESTS=100            # Per minute
RATE_LIMIT_PERIOD=60               # seconds

# Logging
LOG_LEVEL=INFO                      # DEBUG, INFO, WARNING, ERROR
LOG_FILE=logs/app.log

# Model Configuration
CONTEXT_WINDOW_SIZE=10             # Recent messages to include
EMBEDDING_MODEL=text-embedding-ada-002
SIMILARITY_THRESHOLD=0.7           # For vector search
```

### Database Setup

**PostgreSQL Connection**
```python
# Automatic via docker-compose
DATABASE_URL=postgresql://aiplatform:aiplatform123@postgres:5432/ai_platform
```

**Create Custom Database**
```bash
psql -U postgres -h localhost

CREATE DATABASE ai_platform;
CREATE USER aiplatform WITH PASSWORD 'aiplatform123';
GRANT ALL PRIVILEGES ON DATABASE ai_platform TO aiplatform;
```

## 🐳 Deployment

### Docker Compose (Local/Development)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Access services
# API: http://localhost:8000
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### Kubernetes (Production)

```bash
# Build image
docker build -f docker/Dockerfile -t ai-platform:1.0.0 .

# Push to registry
docker tag ai-platform:1.0.0 your-registry/ai-platform:1.0.0
docker push your-registry/ai-platform:1.0.0

# Deploy to Kubernetes
kubectl apply -f k8s/
```

### Scaling Considerations

- **Horizontal Scaling**: Multiple API instances behind load balancer
- **Database**: Connection pooling (SQLAlchemy pool_size=10, max_overflow=20)
- **Cache**: Redis cluster for high availability
- **Vector DB**: Pinecone handles scaling automatically
- **Workers**: Scale Celery workers based on queue depth

### Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| API Response Time | < 500ms (cached), < 2s (AI) | p99 |
| Throughput | 1000+ req/min | Per instance |
| Cache Hit Rate | > 80% | Typical usage |
| Uptime | 99.9% | SLA ready |

## 🧪 Testing

### Run All Tests

```bash
# Install test dependencies (in requirements-dev.txt)
pip install pytest pytest-asyncio pytest-cov

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_health.py

# Run with verbose output
pytest -v
```

### Test Structure

```
tests/
├── conftest.py              # Fixtures and test setup
├── test_health.py           # Health check tests
├── test_users.py            # User service tests
├── test_sessions.py         # Session tests
├── test_integration.py      # Integration tests
└── __init__.py
```

### Coverage Goals

- Line coverage: > 80%
- Branch coverage: > 75%
- Critical paths: 100%

### Load Testing

```bash
# Install locust
pip install locust

# Create load test file
# See tests/load_test.py

# Run load test
locust -f tests/load_test.py --host=http://localhost:8000
```

## 📊 Monitoring

### Prometheus Metrics

Metrics are exposed at `/metrics` endpoint.

**Key Metrics:**
```
api_request_count{method, endpoint, status}
api_request_duration_seconds{method, endpoint}
database_connection_pool_size
redis_cache_hits_total
chatgpt_api_calls_total{model, status}
```

### Grafana Dashboards

1. **System Overview** - CPU, Memory, Disk usage
2. **API Performance** - Response times, throughput
3. **Database** - Query times, connection pool
4. **AI Metrics** - Token usage, model costs

### Logging

Logs are written to:
- **Console**: Real-time monitoring
- **File**: `logs/app.log` with rotation
- **ELK Stack** (production): Centralized logging

### Alerting

Configure alerts for:
- API response time > 2s
- Error rate > 5%
- Database connection pool saturation
- Cache miss rate > 30%
- OpenAI API quota warnings

## 🔐 Security

### Authentication

- API Key-based (future)
- JWT tokens (future)
- User sessions via Redis

### Data Protection

- Passwords hashed with bcrypt
- Database encryption at rest
- API HTTPS enforcement (production)
- Input validation via Pydantic

### Rate Limiting

- Per-user limits (100 req/min)
- IP-based fallback
- Redis-backed implementation

### CORS

Configured for specific origins (see `src/main.py`).

## 📈 Advanced Features

### 7.1 Vector Search (Semantic Memory)

Store message embeddings and retrieve relevant context:

```python
# Generate embedding
embedding = await ai_service.generate_embedding(message)

# Store in vector DB
await vector_service.upsert_vector(
    vector_id=f"msg_{message_id}",
    embedding=embedding,
    metadata={"session_id": session_id}
)

# Query similar messages
similar = await vector_service.query_vectors(
    embedding=embedding,
    top_k=5
)
```

### 7.2 Caching Strategy

Three-tier caching:

1. **In-Memory**: FastAPI response caching
2. **Redis**: Session and embedding cache
3. **Vector DB**: Semantic search results

### 7.3 Background Jobs

Async tasks via Celery:
- Embedding generation
- Recommendation computation
- Old session cleanup

### 7.4 Structured Output

AI responses are validated and structured:

```python
{
  "response": "Your answer here",
  "confidence": 0.92,
  "suggested_actions": ["Action 1", "Action 2"],
  "metadata": {"tokens": 250}
}
```

## 🤝 Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and test: `pytest`
3. Commit: `git commit -am 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Create Pull Request

### Code Style

- Follow PEP 8
- Use type hints
- Docstrings for all functions
- Run linting: `pylint src/`

### Pre-commit Checks

```bash
# Install pre-commit hooks
pre-commit install

# Run checks
pre-commit run --all-files
```

## 📦 Project Structure

```
.
├── src/
│   ├── __init__.py
│   ├── main.py                      # FastAPI app
│   ├── celery_app.py                # Celery config
│   ├── tasks.py                     # Async tasks
│   ├── core/
│   │   ├── config.py                # Settings
│   │   ├── database.py              # DB setup
│   │   ├── logging.py               # Logging config
│   │   ├── redis_client.py          # Redis wrapper
│   │   └── __init__.py
│   ├── models/
│   │   ├── database.py              # ORM models
│   │   └── __init__.py
│   ├── schemas/
│   │   ├── schemas.py               # Pydantic schemas
│   │   └── __init__.py
│   ├── services/
│   │   ├── ai_service.py            # AI operations
│   │   ├── vector_db_service.py     # Vector search
│   │   ├── chat_service.py          # Chat logic
│   │   ├── recommendation_service.py # Recommendations
│   │   ├── user_service.py          # User management
│   │   └── __init__.py
│   ├── api/
│   │   ├── middleware.py            # Custom middleware
│   │   ├── endpoints/
│   │   │   ├── chat.py              # Chat routes
│   │   │   ├── sessions.py          # Session routes
│   │   │   ├── recommendations.py   # Recommendation routes
│   │   │   ├── health.py            # Health/metrics routes
│   │   │   └── __init__.py
│   │   └── __init__.py
│   └── utils/
│       └── helpers.py               # Utility functions
├── tests/
│   ├── conftest.py                  # Test config
│   ├── test_health.py               # Health tests
│   ├── test_users.py                # User tests
│   ├── test_sessions.py             # Session tests
│   ├── test_integration.py          # Integration tests
│   └── __init__.py
├── docker/
│   └── Dockerfile                   # Docker image
├── docker-compose.yml               # Services config
├── requirements.txt                 # Dependencies
├── .env.example                     # Env template
├── .env.local                       # Local config
├── README.md                        # This file
├── pytest.ini                       # Pytest config
└── .gitignore
```

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 🤙 Support

- **Documentation**: [docs/](docs/)
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## 🏆 Highlights

### Senior-Level Architecture Signals

✅ **Modular Service Layer** - Separation of concerns  
✅ **Async/Await Patterns** - Non-blocking operations  
✅ **Comprehensive Error Handling** - Graceful degradation  
✅ **Type Hints** - Full type safety with Pydantic  
✅ **Database Indexing** - Query optimization  
✅ **Vector Search Integration** - Semantic understanding  
✅ **Caching Strategy** - Multi-tier caching  
✅ **Background Jobs** - Async task processing  
✅ **Monitoring & Logging** - Production observability  
✅ **Containerization** - Docker/K8s ready  
✅ **API Documentation** - Swagger/OpenAPI  
✅ **Test Coverage** - Unit & Integration tests  

---

**Built with ❤️ for the AI-powered future**

**Crafted by CaptainCode** 🚀
