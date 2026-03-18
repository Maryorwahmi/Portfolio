"""
Services API endpoints
Created by CaptainCode - HelixOps Technologies
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime

from ...models import Service, ServiceUpdate
from ...services import ServiceRegistry

router = APIRouter(prefix="/api/v1/services", tags=["services"])

# Dependency injection
service_registry = ServiceRegistry()


@router.post("/", summary="Register a service")
async def register_service(service: Service) -> dict:
    """
    Register a new service for monitoring.
    
    - **id**: Unique service identifier
    - **name**: Service name
    - **service_type**: Type of service (api, worker, database, etc.)
    - **metrics_endpoint**: URL where Prometheus can scrape metrics
    """
    result = await service_registry.register_service(service.dict())
    
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    
    return result


@router.get("/", response_model=dict, summary="List all services")
async def list_services() -> dict:
    """
    Get list of all registered services.
    """
    services = await service_registry.list_services()
    
    return {
        "status": "success",
        "count": len(services),
        "services": services,
        "timestamp": datetime.utcnow()
    }


@router.get("/{service_id}", summary="Get service details")
async def get_service(service_id: str) -> dict:
    """
    Get detailed information about a specific service.
    """
    service = await service_registry.get_service(service_id)
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return {
        "status": "success",
        "service": service,
        "timestamp": datetime.utcnow()
    }


@router.get("/{service_id}/health", summary="Get service health")
async def get_service_health(service_id: str) -> dict:
    """
    Get health summary for a specific service.
    """
    health = await service_registry.get_service_health_summary(service_id)
    
    if health.get("status") == "error":
        raise HTTPException(status_code=404, detail=health.get("message"))
    
    return health


@router.put("/{service_id}", summary="Update service")
async def update_service(service_id: str, update: ServiceUpdate) -> dict:
    """
    Update service information.
    """
    result = await service_registry.update_service(service_id, update.dict(exclude_none=True))
    
    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result.get("message"))
    
    return result


@router.delete("/{service_id}", summary="Deregister service")
async def deregister_service(service_id: str) -> dict:
    """
    Remove a service from monitoring.
    """
    result = await service_registry.deregister_service(service_id)
    
    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result.get("message"))
    
    return result


@router.post("/{service_id}/heartbeat", summary="Record heartbeat")
async def record_heartbeat(service_id: str) -> dict:
    """
    Record a heartbeat for a service to indicate it's alive.
    """
    success = await service_registry.record_heartbeat(service_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return {
        "status": "success",
        "message": f"Heartbeat recorded for {service_id}",
        "timestamp": datetime.utcnow()
    }


@router.get("/health/all", summary="Check all services health")
async def check_all_services_health() -> dict:
    """
    Check health status of all registered services.
    """
    health_status = await service_registry.check_service_health()
    
    return {
        "status": "success",
        "health": health_status,
        "timestamp": datetime.utcnow()
    }
