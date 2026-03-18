# Deployment Guide

Complete guide for deploying the AI Service Platform to production.

## Pre-Deployment Checklist

- [ ] All tests passing: `pytest`
- [ ] No hardcoded secrets in code
- [ ] Environment variables configured
- [ ] Database migrations complete
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] SSL certificates obtained
- [ ] Load testing completed

## Production Environment Variables

Critical variables to set in production:

```bash
# API
ENVIRONMENT=production
DEBUG=False
API_TITLE=Intelligent AI Service Platform

# Database
DATABASE_URL=postgresql://prod_user:strong_password@prod-db-host:5432/ai_platform_prod
DB_ECHO=False

# Security
SECRET_KEY=use-a-strong-random-key  # Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
ALGORITHM=HS256

# External Services
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-west1-gcp

# Scaling
RATE_LIMIT_REQUESTS=1000  # Adjust based on capacity
RATE_LIMIT_PERIOD=60

# Logging
LOG_LEVEL=WARNING
LOG_FILE=/var/log/ai-platform/app.log
```

## Deployment Methods

### Option 1: Docker Compose (Staging/Small Scale)

```bash
# Build images
docker-compose build

# Deploy
docker-compose up -d

# Monitor
docker-compose logs -f api

# Scale workers
docker-compose up -d --scale celery_worker=3
```

### Option 2: Kubernetes (Production/Enterprise)

#### Prerequisites
- Kubernetes cluster (EKS, GKE, AKS)
- kubectl configured
- Docker registry access

#### Create Secrets
```bash
kubectl create secret generic ai-platform-secrets \
  --from-literal=openai-api-key=sk-... \
  --from-literal=pinecone-api-key=... \
  --from-literal=postgres-password=... \
  --from-literal=secret-key=...
```

#### Deploy
```bash
# Create namespace
kubectl create namespace ai-platform

# Apply configurations
kubectl apply -f k8s/ -n ai-platform

# Monitor deployment
kubectl rollout status deployment/api -n ai-platform
```

See `k8s/` directory for Kubernetes manifests.

### Option 3: Traditional VPS/On-Premise

#### Prerequisites
- Ubuntu 20.04+ server
- 4GB+ RAM, 2+ CPU cores
- 20GB+ disk space
- Nginx or Apache
- PostgreSQL 15+
- Redis 7+

#### Setup Steps

```bash
# 1. System updates
sudo apt update && sudo apt upgrade -y

# 2. Install dependencies
sudo apt install -y python3.11 python3-pip postgresql postgresql-contrib redis-server nginx

# 3. Clone repository
git clone <repo-url> /opt/ai-platform
cd /opt/ai-platform

# 4. Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# 5. Install Python packages
pip install -r requirements.txt

# 6. Configure environment
cp .env.example .env
nano .env  # Edit with production values

# 7. Initialize database
python scripts/db_manage.py init

# 8. Create systemd services
# See systemd/ directory

# 9. Start services
sudo systemctl start ai-platform-api
sudo systemctl start ai-platform-worker
sudo systemctl start ai-platform-beat

# 10. Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/ai-platform
sudo ln -s /etc/nginx/sites-available/ai-platform /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

## Database Migration

### PostgreSQL Setup

```bash
# Create database
createdb -U postgres ai_platform_prod

# Create user
createuser ai_user
psql -c "ALTER USER ai_user WITH PASSWORD 'strong_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE ai_platform_prod TO ai_user;"

# Enable extensions
psql -d ai_platform_prod -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
```

### Backup Strategy

```bash
# Daily backup
pg_dump -U ai_user ai_platform_prod > /backups/ai_platform_$(date +%Y%m%d).sql

# Automated backup (cron)
0 2 * * * pg_dump -U ai_user ai_platform_prod | gzip > /backups/ai_platform_$(date +\%Y\%m\%d).sql.gz
```

## SSL/HTTPS Configuration

### Using Let's Encrypt with Nginx

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --nginx -d api.example.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Performance Tuning

### Database Connection Pool
```python
# src/core/database.py
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=20,           # Connections to maintain
    max_overflow=40,        # Additional connections
    pool_recycle=3600,      # Recycle connections hourly
    pool_pre_ping=True,     # Test connections
)
```

### FastAPI Worker Configuration
```bash
# Number of workers = 2 * CPU cores + 1
gunicorn src.main:app --workers 9 --worker-class uvicorn.workers.UvicornWorker
```

### Redis Memory Management
```bash
# Set max memory policy
CONFIG SET maxmemory 2gb
CONFIG SET maxmemory-policy allkeys-lru
```

## Monitoring & Logging

### Prometheus Setup
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ai-platform'
    static_configs:
      - targets: ['localhost:8000']
```

### ELK Stack Setup

```bash
# docker-compose.yml additions
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
  
logstash:
  image: docker.elastic.co/logstash/logstash:8.0.0
  
kibana:
  image: docker.elastic.co/kibana/kibana:8.0.0
```

## Scaling Strategy

### Horizontal Scaling

1. **Load Balancer** (Nginx/HAProxy)
   ```
   Client → Load Balancer → API Instance 1, 2, 3...
   ```

2. **Database Replication**
   - Primary: Write operations
   - Replicas: Read operations
   - Failover: Automatic with Patroni

3. **Redis Cluster**
   - Multiple instances
   - Automatic failover
   - Data persistence (AOF)

4. **Celery Workers**
   Scale based on queue depth:
   ```bash
   celery -A src.celery_app worker -c 10  # 10 concurrent tasks
   ```

### Vertical Scaling

Increase resources for single instance:
- CPU cores: Improves concurrency
- RAM: Larger connection pools
- Network bandwidth: Faster I/O

## Zero-Downtime Deployment

### Blue-Green Deployment

```bash
# 1. Deploy new version to green environment
docker-compose -f docker-compose.green.yml up -d

# 2. Run smoke tests
./scripts/smoke_tests.sh green

# 3. Switch traffic
# Update load balancer to point to green

# 4. Keep blue running as fallback (can rollback quickly)
```

### Rolling Updates (Kubernetes)

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

## Disaster Recovery

### Backup Strategy
```bash
# Daily backups
- Database: PostgreSQL backups
- Code: Git repository
- Configuration: Secrets manager

# Retention
- Daily: 7 days
- Weekly: 4 weeks
- Monthly: 12 months
```

### Recovery Procedure
```bash
# 1. Restore database
psql -U ai_user ai_platform_prod < backup_file.sql

# 2. Verify integrity
python -c "from src.core.database import init_db; init_db()"

# 3. Start services
systemctl start ai-platform-api
systemctl start ai-platform-worker

# 4. Run tests
pytest --tb=short
```

## Security Hardening

### Network Security
- [ ] Firewall rules (only expose ports 80, 443)
- [ ] VPC/Security groups
- [ ] DDoS protection (CloudFlare, AWS Shield)
- [ ] WAF rules

### Application Security
- [ ] Secrets rotation (quarterly)
- [ ] Dependency updates (monthly)
- [ ] Security scanning (SonarQube)
- [ ] Penetration testing (annual)

### Database Security
- [ ] Encryption at rest and in transit
- [ ] Regular backups with encryption
- [ ] Access controls (least privilege)
- [ ] Audit logging

## Rollback Procedure

```bash
# Quick rollback (if deployment fails)
kubectl rollout undo deployment/api -n ai-platform

# Or
docker-compose down
# Deploy previous image version
docker-compose up -d
```

## Post-Deployment Checklist

- [ ] All health checks passing
- [ ] Monitoring alerts configured
- [ ] Logs flowing to centralized system
- [ ] Backups running successfully
- [ ] SSL certificates valid
- [ ] API response times normal
- [ ] Database replication working
- [ ] Cache hit rates acceptable
- [ ] Error rates < 1%
- [ ] Load testing passed

## Support & Troubleshooting

See [Troubleshooting Guide](TROUBLESHOOTING.md) for common issues.

---

**Crafted by CaptainCode** 🚀
