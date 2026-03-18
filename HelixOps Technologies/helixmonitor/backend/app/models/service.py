"""
Service models for monitored services
Created by CaptainCode - HelixOps Technologies
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ServiceType(str, Enum):
    """Types of services to monitor"""
    API = "api"
    WORKER = "worker"
    DATABASE = "database"
    CACHE = "cache"
    MESSAGE_QUEUE = "message_queue"
    CUSTOM = "custom"


class ServiceStatus(str, Enum):
    """Current health status of a service"""
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    UNKNOWN = "unknown"
    OFFLINE = "offline"


class ServiceMetadata(BaseModel):
    """Metadata for a service"""
    team: str = Field(default="DevOps", example="Backend Team")
    environment: str = Field(default="production", example="production")
    region: str = Field(default="us-east-1", example="us-east-1")
    version: str = Field(default="1.0.0", example="1.0.0")


class Service(BaseModel):
    """Service registration model"""
    id: str = Field(..., example="api-service-1")
    name: str = Field(..., example="Main API Service")
    service_type: ServiceType = Field(default=ServiceType.API)
    description: Optional[str] = Field(None, example="Primary REST API for HelixOps")
    metrics_endpoint: HttpUrl = Field(..., example="http://localhost:8000/metrics")
    status: ServiceStatus = Field(default=ServiceStatus.UNKNOWN)
    metadata: ServiceMetadata = Field(default_factory=ServiceMetadata)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_heartbeat: Optional[datetime] = None
    tags: List[str] = Field(default_factory=list, example=["backend", "critical"])

    class Config:
        json_schema_extra = {
            "example": {
                "id": "api-service-1",
                "name": "Main API Service",
                "service_type": "api",
                "description": "Primary REST API for HelixOps",
                "metrics_endpoint": "http://localhost:8000/metrics",
                "status": "healthy",
                "metadata": {
                    "team": "Backend Team",
                    "environment": "production",
                    "region": "us-east-1",
                    "version": "1.0.0"
                },
                "tags": ["backend", "critical"]
            }
        }


class ServiceUpdate(BaseModel):
    """Update service information"""
    name: Optional[str] = None
    service_type: Optional[ServiceType] = None
    description: Optional[str] = None
    metrics_endpoint: Optional[HttpUrl] = None
    tags: Optional[List[str]] = None


class ServiceHealth(BaseModel):
    """Service health summary"""
    service_id: str
    status: ServiceStatus
    uptime_percent: float = Field(..., ge=0, le=100)
    last_heartbeat: datetime
    cpu_usage: float
    memory_usage: float
    error_rate: float
    request_rate: float
