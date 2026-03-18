"""
Middleware for rate limiting, authentication, logging
Crafted by CaptainCode
"""
import logging
import time
from typing import Callable
from fastapi import Request, HTTPException, status
from src.core.redis_client import get_redis_client

logger = logging.getLogger(__name__)


class RateLimitMiddleware:
    """Rate limiting middleware using Redis"""
    
    def __init__(
        self,
        app,
        requests_per_minute: int = 100,
    ):
        self.app = app
        self.requests_per_minute = requests_per_minute
        self.redis_client = get_redis_client()
    
    async def __call__(self, request: Request, call_next: Callable):
        """Check rate limits before processing request"""
        
        # Get client identifier (IP or API key)
        client_id = request.headers.get("X-API-Key") or request.client.host
        
        # Rate limit key
        rate_limit_key = f"rate_limit:{client_id}"
        
        try:
            # Check current request count
            current = int(self.redis_client.get(rate_limit_key) or 0)
            
            if current >= self.requests_per_minute:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded",
                )
            
            # Increment counter
            self.redis_client.incr(rate_limit_key)
            self.redis_client.expire(rate_limit_key, 60)
        
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Rate limit check failed: {str(e)}")
        
        return await call_next(request)


class LoggingMiddleware:
    """Request/response logging middleware"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, request: Request, call_next: Callable):
        """Log request and response"""
        
        start_time = time.time()
        
        # Log request
        logger.info(f"{request.method} {request.url.path}")
        
        # Process request
        response = await call_next(request)
        
        # Calculate process time
        process_time = time.time() - start_time
        
        # Log response
        logger.info(
            f"{request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Time: {process_time:.3f}s"
        )
        
        # Add timing header
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
