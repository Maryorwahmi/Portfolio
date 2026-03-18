"""
Unit tests for Metrics Service
Created by CaptainCode - HelixOps Technologies
"""

import pytest
import asyncio
from app.services import MetricsService


@pytest.fixture
def metrics_service():
    return MetricsService(prometheus_url="http://prometheus:9090")


@pytest.mark.asyncio
async def test_ingest_metric(metrics_service):
    """Test metric ingestion"""
    metric_data = {
        "metric_name": "cpu_usage_percent",
        "service_id": "test-service",
        "value": 45.5,
        "labels": {"instance": "test-host"}
    }
    
    result = await metrics_service.ingest_metric(metric_data)
    assert result is True


@pytest.mark.asyncio
async def test_ingest_invalid_metric(metrics_service):
    """Test ingestion of invalid metric"""
    metric_data = {
        "metric_name": "cpu_usage_percent",
        # Missing required fields
    }
    
    result = await metrics_service.ingest_metric(metric_data)
    assert result is False


@pytest.mark.asyncio
async def test_query_metrics(metrics_service):
    """Test metric querying"""
    # First ingest some data
    metric_data = {
        "metric_name": "cpu_usage_percent",
        "service_id": "test-service",
        "value": 45.5,
    }
    await metrics_service.ingest_metric(metric_data)
    
    # Query the metrics
    result = await metrics_service.query_metrics(
        metric_name="cpu_usage_percent",
        service_id="test-service"
    )
    
    assert result["status"] == "success"
    assert result["metric_name"] == "cpu_usage_percent"


@pytest.mark.asyncio
async def test_get_metric_statistics(metrics_service):
    """Test metric statistics calculation"""
    # Ingest multiple data points
    for value in [40, 45, 50, 55, 60]:
        await metrics_service.ingest_metric({
            "metric_name": "cpu_usage_percent",
            "service_id": "test-service",
            "value": value,
        })
    
    result = await metrics_service.get_metric_statistics(
        metric_name="cpu_usage_percent",
        service_id="test-service"
    )
    
    assert result["status"] == "success"
    assert result["min"] == 40
    assert result["max"] == 60
    assert result["avg"] == 50


@pytest.mark.asyncio
async def test_health_check(metrics_service):
    """Test service health check"""
    result = await metrics_service.health_check()
    assert result is True
