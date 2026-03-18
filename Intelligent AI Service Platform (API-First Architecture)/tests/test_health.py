"""
Unit tests for health and metrics endpoints
"""
import pytest
from fastapi import status


def test_health_check(client):
    """Test health check endpoint"""
    response = client.get("/health")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] in ["ok", "degraded", "error"]
    assert "timestamp" in data
    assert "version" in data


def test_readiness_check(client):
    """Test readiness check endpoint"""
    response = client.get("/ready")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "ready"


def test_metrics(client):
    """Test metrics endpoint"""
    response = client.get("/metrics")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "total_users" in data
    assert "total_sessions" in data
    assert "total_messages" in data
    assert "cache_hit_rate" in data
