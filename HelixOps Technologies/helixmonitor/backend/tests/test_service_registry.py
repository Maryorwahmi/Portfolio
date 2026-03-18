"""
Unit tests for Service Registry
Created by CaptainCode - HelixOps Technologies
"""

import pytest
from app.services import ServiceRegistry


@pytest.fixture
def service_registry():
    return ServiceRegistry()


@pytest.mark.asyncio
async def test_register_service(service_registry):
    """Test service registration"""
    service_data = {
        "id": "api-service-1",
        "name": "Main API",
        "service_type": "api",
        "description": "Primary REST API",
        "metrics_endpoint": "http://localhost:8000/metrics"
    }
    
    result = await service_registry.register_service(service_data)
    
    assert result["status"] == "success"
    assert result["service"]["id"] == "api-service-1"


@pytest.mark.asyncio
async def test_register_duplicate_service(service_registry):
    """Test registering a service that already exists"""
    service_data = {
        "id": "api-service-1",
        "name": "Main API",
        "service_type": "api",
        "metrics_endpoint": "http://localhost:8000/metrics"
    }
    
    # First registration should succeed
    result = await service_registry.register_service(service_data)
    assert result["status"] == "success"
    
    # Second registration should fail
    result = await service_registry.register_service(service_data)
    assert result["status"] == "error"


@pytest.mark.asyncio
async def test_list_services(service_registry):
    """Test listing services"""
    # Register multiple services
    for i in range(3):
        service_data = {
            "id": f"service-{i}",
            "name": f"Service {i}",
            "metrics_endpoint": f"http://localhost:800{i}/metrics"
        }
        await service_registry.register_service(service_data)
    
    services = await service_registry.list_services()
    
    assert len(services) == 3


@pytest.mark.asyncio
async def test_record_heartbeat(service_registry):
    """Test recording service heartbeat"""
    # Register a service
    service_data = {
        "id": "test-service",
        "name": "Test Service",
        "metrics_endpoint": "http://localhost:8080/metrics"
    }
    await service_registry.register_service(service_data)
    
    # Record heartbeat
    result = await service_registry.record_heartbeat("test-service")
    
    assert result is True
    
    # Verify service status is healthy
    service = await service_registry.get_service("test-service")
    assert service["status"] == "healthy"


@pytest.mark.asyncio
async def test_check_service_health(service_registry):
    """Test checking service health"""
    # Register services
    for i in range(2):
        service_data = {
            "id": f"service-{i}",
            "name": f"Service {i}",
            "metrics_endpoint": f"http://localhost:800{i}/metrics"
        }
        await service_registry.register_service(service_data)
    
    # Record heartbeat for one service
    await service_registry.record_heartbeat("service-0")
    
    # Check health
    health = await service_registry.check_service_health()
    
    assert health["service-0"] in ["healthy", "unknown"]
    assert health["service-1"] == "unknown"
