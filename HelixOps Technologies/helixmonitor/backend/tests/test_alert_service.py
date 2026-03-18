"""
Unit tests for Alert Service
Created by CaptainCode - HelixOps Technologies
"""

import pytest
from app.services import AlertService


@pytest.fixture
def alert_service():
    return AlertService()


@pytest.mark.asyncio
async def test_create_alert_rule(alert_service):
    """Test alert rule creation"""
    rule_data = {
        "name": "High CPU Usage",
        "service_id": "api-service-1",
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
    
    result = await alert_service.create_alert_rule(rule_data)
    
    assert result["status"] == "success"
    assert result["rule"]["name"] == "High CPU Usage"
    assert result["rule"]["service_id"] == "api-service-1"


@pytest.mark.asyncio
async def test_evaluate_alert_rule_triggered(alert_service):
    """Test alert rule evaluation - rule triggered"""
    # Create a rule
    rule_data = {
        "name": "High CPU",
        "service_id": "test-service",
        "conditions": [
            {
                "metric_name": "cpu_usage",
                "operator": ">",
                "threshold": 80,
            }
        ],
        "notification_config": {
            "channel": "email",
            "recipients": ["test@example.com"]
        }
    }
    
    await alert_service.create_alert_rule(rule_data)
    
    # Evaluate with value exceeding threshold
    alerts = await alert_service.evaluate_alert_rules(
        metric_name="cpu_usage",
        service_id="test-service",
        metric_value=90.0
    )
    
    assert len(alerts) > 0
    assert alerts[0]["status"] == "active"


@pytest.mark.asyncio
async def test_evaluate_alert_rule_not_triggered(alert_service):
    """Test alert rule evaluation - rule not triggered"""
    # Create a rule
    rule_data = {
        "name": "High CPU",
        "service_id": "test-service",
        "conditions": [
            {
                "metric_name": "cpu_usage",
                "operator": ">",
                "threshold": 80,
            }
        ],
        "notification_config": {
            "channel": "email",
            "recipients": ["test@example.com"]
        }
    }
    
    await alert_service.create_alert_rule(rule_data)
    
    # Evaluate with value below threshold
    alerts = await alert_service.evaluate_alert_rules(
        metric_name="cpu_usage",
        service_id="test-service",
        metric_value=50.0
    )
    
    assert len(alerts) == 0


@pytest.mark.asyncio
async def test_acknowledge_alert(alert_service):
    """Test alert acknowledgment"""
    # Create and trigger an alert first
    rule_data = {
        "name": "High CPU",
        "service_id": "test-service",
        "conditions": [
            {"metric_name": "cpu_usage", "operator": ">", "threshold": 80}
        ],
        "notification_config": {
            "channel": "email",
            "recipients": ["test@example.com"]
        }
    }
    
    await alert_service.create_alert_rule(rule_data)
    alerts = await alert_service.evaluate_alert_rules(
        metric_name="cpu_usage",
        service_id="test-service",
        metric_value=90.0
    )
    
    alert_id = alerts[0]["id"]
    result = await alert_service.acknowledge_alert(alert_id, "user@example.com")
    
    assert result["status"] == "success"
    assert result["alert"]["status"] == "acknowledged"
