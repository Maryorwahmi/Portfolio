"""
Redis client configuration and utilities
Crafted by CaptainCode
"""
import json
from typing import Any, Optional
import redis
from src.core.config import get_settings

settings = get_settings()


class RedisClient:
    """Redis client wrapper with common operations"""
    
    def __init__(self):
        """Initialize Redis connection"""
        self.client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    
    def get(self, key: str) -> Optional[str]:
        """Get value by key"""
        return self.client.get(key)
    
    def get_json(self, key: str) -> Optional[dict]:
        """Get and parse JSON value"""
        value = self.get(key)
        if value:
            return json.loads(value)
        return None
    
    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        """Set value with optional expiration"""
        return self.client.set(key, value, ex=ex)
    
    def set_json(self, key: str, value: dict, ex: Optional[int] = None) -> bool:
        """Set JSON value"""
        return self.set(key, json.dumps(value), ex=ex)
    
    def delete(self, key: str) -> int:
        """Delete key"""
        return self.client.delete(key)
    
    def exists(self, key: str) -> bool:
        """Check if key exists"""
        return self.client.exists(key) > 0
    
    def incr(self, key: str, amount: int = 1) -> int:
        """Increment value"""
        return self.client.incr(key, amount)
    
    def expire(self, key: str, seconds: int) -> bool:
        """Set expiration on key"""
        return self.client.expire(key, seconds)
    
    def lpush(self, key: str, *values: str) -> int:
        """Push values to list"""
        return self.client.lpush(key, *values)
    
    def lrange(self, key: str, start: int = 0, end: int = -1) -> list:
        """Get range from list"""
        return self.client.lrange(key, start, end)
    
    def clear(self, pattern: str = "*"):
        """Clear keys matching pattern"""
        keys = self.client.keys(pattern)
        if keys:
            self.client.delete(*keys)
    
    def close(self):
        """Close Redis connection"""
        self.client.close()


# Singleton instance
redis_client: Optional[RedisClient] = None


def get_redis_client() -> RedisClient:
    """Get Redis client instance"""
    global redis_client
    if redis_client is None:
        redis_client = RedisClient()
    return redis_client
