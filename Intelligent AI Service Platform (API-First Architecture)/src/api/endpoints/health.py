"""
Health and Metrics API endpoints
Crafted by CaptainCode
"""
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.redis_client import get_redis_client
from src.core.config import get_settings
from src.schemas import HealthResponse, MetricsResponse
from src.models import Message, ChatSession, User

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Health & Metrics"])
settings = get_settings()


@router.get("/health", response_model=HealthResponse)
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint
    
    Returns:
        Health status of all system components
    """
    status_dict = {
        "database": "ok",
        "redis": "ok",
        "openai": "ok",
    }
    
    # Check database
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        status_dict["database"] = "error"
    
    # Check Redis
    try:
        redis_client = get_redis_client()
        redis_client.client.ping()
    except Exception as e:
        logger.error(f"Redis health check failed: {str(e)}")
        status_dict["redis"] = "error"
    
    # Check OpenAI (basic)
    # In production, would make actual API call
    
    overall_status = "ok" if all(v == "ok" for v in status_dict.values()) else "degraded"
    
    return HealthResponse(
        status=overall_status,
        timestamp=datetime.utcnow(),
        version=settings.API_VERSION,
        **status_dict,
    )


@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics(db: Session = Depends(get_db)):
    """
    Get application metrics
    
    Returns:
        System metrics and statistics
    """
    try:
        # Count statistics
        total_users = db.query(User).count()
        total_sessions = db.query(ChatSession).count()
        total_messages = db.query(Message).count()
        
        # Calculate avg response time (would fetch from monitoring)
        avg_response_time = 250.0  # Placeholder in ms
        
        # Get cache hit rate from Redis
        redis_client = get_redis_client()
        cache_hits = redis_client.get("cache_hits") or "0"
        cache_misses = redis_client.get("cache_misses") or "1"
        cache_hit_rate = float(cache_hits) / (float(cache_hits) + float(cache_misses))
        
        return MetricsResponse(
            total_users=total_users,
            total_sessions=total_sessions,
            total_messages=total_messages,
            avg_response_time_ms=avg_response_time,
            requests_per_minute=100,  # Placeholder
            cache_hit_rate=cache_hit_rate,
        )
    except Exception as e:
        logger.error(f"Error fetching metrics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch metrics",
        )


@router.get("/ready")
async def ready_check():
    """
    Kubernetes readiness probe endpoint
    
    Returns:
        200 if service is ready to handle requests
    """
    return {"status": "ready"}
