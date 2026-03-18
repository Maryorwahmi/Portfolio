# HelixMonitor Development Guide

**Created by CaptainCode - HelixOps Technologies**

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 6.0+
- Docker & Docker Compose

### 1. Clone & Setup

```bash
git clone <repo-url>
cd helixmonitor

# Create .env file
cp .env.example .env
```

### 2. Backend Development

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run with reload
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start dev server with HMR
npm run dev
```

### 4. Services (Docker)

```bash
# Start supporting services only
docker-compose up -d postgres redis prometheus alertmanager
```

---

## Project Structure

```
helixmonitor/
├── backend/
│   ├── app/
│   │   ├── models/          # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── api/routes/      # API endpoints
│   │   └── main.py          # FastAPI app
│   ├── tests/               # Pytest tests
│   ├── requirements.txt
│   ├── Dockerfile
│   └── prometheus.yml
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   ├── hooks/           # Custom hooks
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── ARCHITECTURE.md
```

---

## Code Style & Standards

### Python (Backend)

**Black & isort formatting:**
```bash
# Format code
black app/ tests/

# Sort imports
isort app/ tests/
```

**Linting with MyPy:**
```bash
# Type checking
mypy app/
```

**Key conventions:**
- Type hints on all functions
- Docstrings for all modules/classes/functions
- Async/await for I/O operations
- Exception handling with specific exception types

### TypeScript (Frontend)

**ESLint & Prettier:**
```bash
# Format
npm run format

# Lint
npm run lint

# Type check
npm run type-check
```

**Key conventions:**
- Strict `tsconfig.json`
- Component prop interfaces
- Avoid `any` type
- Use hooks pattern

---

## Adding Features

### Add a New Metric Type

1. **Update models** (`backend/app/models/metric.py`):
```python
class MetricType(str, Enum):
    MY_NEW_METRIC = "my_new_metric"
```

2. **Create consuming service** (if needed):
```python
# backend/app/services/my_service.py
class MyService:
    async def process_metric(self, metric_data):
        ...
```

3. **Add API endpoint** (`backend/app/api/routes/metrics.py`):
```python
@router.post("/my-endpoint")
async def my_endpoint(data: MyModel):
    ...
```

4. **Add tests**:
```python
# backend/tests/test_my_feature.py
@pytest.mark.asyncio
async def test_my_feature():
    ...
```

5. **Update dashboard** (if UI needed):
```tsx
// frontend/src/pages/MyFeature.tsx
export default function MyFeature() {
  ...
}
```

### Add a New Alert Channel

1. **Update AlertChannel enum** (`backend/app/models/alert.py`):
```python
class AlertChannel(str, Enum):
    SLACK = "slack"
    PAGERDUTY = "pagerduty"
```

2. **Update notification logic** (`backend/app/services/alert_service.py`):
```python
async def _send_notification(self, alert, rule):
    if channel == "slack":
        await self._send_slack_notification(alert, config)
    elif channel == "pagerduty":
        await self._send_pagerduty_notification(alert, config)
```

3. **Implement notification handler**:
```python
async def _send_slack_notification(self, alert, config):
    # Implementation
    pass
```

---

## Testing Workflow

### Test Pyramid Strategy

```
        △ E2E Tests (few)
       / \
      /   \
     /     \ Integration Tests (moderate)
    /       \
   /_________\ Unit Tests (many)
```

### Writing Tests

**Unit Test Example:**
```python
@pytest.mark.asyncio
async def test_metric_ingestion():
    service = MetricsService()
    result = await service.ingest_metric({...})
    assert result is True
```

**Integration Test Example:**
```python
def test_api_metrics_endpoint():
    client = TestClient(app)
    response = client.post("/api/v1/metrics/ingest", json={...})
    assert response.status_code == 200
```

**Run test suite:**
```bash
# All tests
pytest

# Specific test
pytest tests/test_metrics_service.py::test_metric_ingestion

# With coverage
pytest --cov=app
```

---

## Debugging

### Backend Debugging

**Add breakpoint:**
```python
import pdb; pdb.set_trace()
```

**Or use IDE debugger** in VS Code:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["app.main:app", "--reload"],
      "jinja": true,
      "justMyCode": true
    }
  ]
}
```

### Frontend Debugging

**React DevTools:**
- Install React DevTools extension
- Debug component props/state

**Network debugging:**
- Open DevTools → Network tab
- Check API requests/responses

### Service Debugging

**View logs:**
```bash
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f prometheus
```

---

## Database Migrations

### Using Alembic (if added)

```bash
# Create migration
alembic revision --autogenerate -m "Add new column"

# Run migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## Performance Optimization

### Backend Optimizations

1. **Enable query caching:**
```python
from functools import lru_cache

@lru_cache(maxsize=100)
async def get_metric_stats(metric_id):
    ...
```

2. **Use batch operations:**
```python
# Bad
for metric in metrics:
    db.insert(metric)

# Good
db.insert_many(metrics)
```

3. **Connection pooling:**
```python
DB_POOL_SIZE = 20
DB_POOL_RECYCLE = 3600
```

### Frontend Optimizations

1. **Code splitting:**
```tsx
const Dashboard = lazy(() => import('./pages/Dashboard'))
```

2. **Memoization:**
```tsx
const ServiceCard = memo(({ service }) => ...)
```

3. **Virtualization for large lists:**
```tsx
import { FixedSizeList } from 'react-window'
```

---

## CI/CD Pipeline

### GitHub Actions (sample)

```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Backend Tests
        run: |
          cd backend
          pip install -r requirements.txt
          pytest
      - name: Frontend Build
        run: |
          cd frontend
          npm install
          npm run build
```

---

## Deployment

### Local Docker Build

```bash
docker-compose build
docker-compose up -d
```

### Production Build

```bash
# Build images
docker build -t helixmonitor-backend:1.0.0 ./backend
docker build -t helixmonitor-frontend:1.0.0 ./frontend

# Push to registry
docker push myregistry.azurecr.io/helixmonitor-backend:1.0.0
docker push myregistry.azurecr.io/helixmonitor-frontend:1.0.0
```

---

## Troubleshooting Common Issues

| Problem | Solution |
|---------|----------|
| ModuleNotFoundError | Activate venv: `source venv/bin/activate` |
| Port already in use | `lsof -i :8000` and kill process |
| Database connection refused | Check PostgreSQL is running in docker-compose |
| Frontend won't build | Clear cache: `rm -rf node_modules && npm install` |
| Hot reload not working | Check vite.config.ts port configuration |

---

## Contributing Guidelines

1. **Create feature branch:**
```bash
git checkout -b feature/my-feature
```

2. **Make changes with tests:**
- Write tests first
- Implement feature
- Run tests: `pytest` and `npm test`

3. **Commit with clear messages:**
```bash
git commit -m "Add: new metric type support"
git commit -m "Fix: alert notification timing"
git commit -m "Refactor: metrics service architecture"
```

4. **Push and create PR:**
```bash
git push origin feature/my-feature
```

---

## Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev
- **Prometheus**: https://prometheus.io/docs
- **Docker**: https://docs.docker.com
- **TypeScript**: https://www.typescriptlang.org/docs

---

**Document Version: 1.0** | Created by CaptainCode
