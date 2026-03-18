"""
Integration tests for API endpoints
Created by CaptainCode - HelixOps Technologies
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_root_endpoint(client):
    """Test root endpoint"""
    response = client.get("/")
    
    assert response.status_code == 200
    assert response.json()["status"] == "operational"


def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get("/health")
    
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_api_status_endpoint(client):
    """Test API status endpoint"""
    response = client.get("/api/v1/status")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "components" in data


def test_ingest_metric(client):
    """Test metric ingestion endpoint"""
    metric_data = {
        "metric_name": "cpu_usage_percent",
        "service_id": "test-service",
        "value": 45.5,
        "labels": {"instance": "host-1"}
    }
    
    response = client.post("/api/v1/metrics/ingest", json=metric_data)
    
    assert response.status_code == 200
    assert response.json()["status"] == "success"


def test_register_service(client):
    """Test service registration endpoint"""
    service_data = {
        "id": "api-service-1",
        "name": "Main API Service",
        "service_type": "api",
        "metrics_endpoint": "http://localhost:8000/metrics",
    }
    
    response = client.post("/api/v1/services/", json=service_data)
    
    assert response.status_code == 200
    assert response.json()["status"] == "success"


def test_list_services(client):
    """Test listing services endpoint"""
    response = client.get("/api/v1/services/")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "services" in data


def test_create_alert_rule(client):
    """Test alert rule creation endpoint"""
    # First register a service
    service_data = {
        "id": "test-service",
        "name": "Test Service",
        "metrics_endpoint": "http://localhost:8000/metrics",
    }
    client.post("/api/v1/services/", json=service_data)
    
    # Create alert rule
    rule_data = {
        "name": "High CPU Usage",
        "service_id": "test-service",
        "conditions": [
            {
                "metric_name": "cpu_usage_percent",
                "operator": ">",
                "threshold": 85,
                "duration_seconds": 300
            }
        ],
        "notification_config": {
            "channel": "email",
            "recipients": ["ops@helixops.com"]
        },
        "severity": "warning"
    }
    
    response = client.post("/api/v1/alerts/rules", json=rule_data)
    
    assert response.status_code == 200
    assert response.json()["status"] == "success"


def test_get_active_alerts(client):
    """Test getting active alerts endpoint"""
    response = client.get("/api/v1/alerts/")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "alerts" in data
