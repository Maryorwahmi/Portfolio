"""
Alert models for alerting system
Created by CaptainCode - HelixOps Technologies
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class AlertSeverity(str, Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class AlertConditionOperator(str, Enum):
    """Operators for alert conditions"""
    GREATER_THAN = ">"
    LESS_THAN = "<"
    EQUALS = "=="
    NOT_EQUALS = "!="
    GREATER_EQUAL = ">="
    LESS_EQUAL = "<="


class AlertChannel(str, Enum):
    """Alert notification channels"""
    EMAIL = "email"
    WEBHOOK = "webhook"
    SLACK = "slack"


class AlertStatus(str, Enum):
    """Alert state"""
    ACTIVE = "active"
    RESOLVED = "resolved"
    ACKNOWLEDGED = "acknowledged"
    SILENCED = "silenced"


class AlertCondition(BaseModel):
    """Single condition in an alert rule"""
    metric_name: str = Field(..., example="cpu_usage_percent")
    operator: AlertConditionOperator = Field(default=AlertConditionOperator.GREATER_THAN)
    threshold: float = Field(..., example=85.0)
    duration_seconds: int = Field(default=300, example=300, ge=1)


class NotificationConfig(BaseModel):
    """Configuration for alert notifications"""
    channel: AlertChannel = Field(default=AlertChannel.EMAIL)
    recipients: List[str] = Field(..., example=["ops@helixops.com"])
    webhook_url: Optional[str] = None


class AlertRule(BaseModel):
    """Alert rule definition"""
    id: Optional[str] = None
    name: str = Field(..., example="High CPU Usage")
    description: Optional[str] = Field(None, example="Alert when CPU exceeds 85% for 5 minutes")
    service_id: str = Field(..., example="api-service-1")
    severity: AlertSeverity = Field(default=AlertSeverity.WARNING)
    conditions: List[AlertCondition] = Field(..., min_items=1)
    notification_config: NotificationConfig
    enabled: bool = Field(default=True)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "High CPU Usage",
                "description": "Alert when CPU exceeds 85% for 5 minutes",
                "service_id": "api-service-1",
                "severity": "warning",
                "conditions": [
                    {
                        "metric_name": "cpu_usage_percent",
                        "operator": ">",
                        "threshold": 85.0,
                        "duration_seconds": 300
                    }
                ],
                "notification_config": {
                    "channel": "email",
                    "recipients": ["ops@helixops.com"]
                },
                "enabled": True
            }
        }


class Alert(BaseModel):
    """Active alert instance"""
    id: str
    rule_id: str
    service_id: str
    severity: AlertSeverity
    status: AlertStatus = Field(default=AlertStatus.ACTIVE)
    message: str
    triggered_at: datetime
    resolved_at: Optional[datetime] = None
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    metric_value: float
    metric_name: str


class AlertHistory(BaseModel):
    """Alert occurrence history"""
    rule_id: str
    service_id: str
    triggered_at: datetime
    resolved_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    metric_value: float
    notification_sent: bool
