"""
Metric models for time-series data handling
Created by CaptainCode - HelixOps Technologies
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class MetricType(str, Enum):
    """Metric types supported by HelixMonitor"""
    CPU_USAGE = "cpu_usage_percent"
    MEMORY_USAGE = "memory_usage_bytes"
    DISK_IO = "disk_io_ops"
    NETWORK_TRAFFIC = "network_traffic_bytes"
    HTTP_REQUESTS = "http_requests_total"
    HTTP_LATENCY = "http_request_duration_seconds"
    ERROR_RATE = "error_rate"
    UPTIME = "service_uptime_seconds"


class MetricData(BaseModel):
    """Represents a single metric data point"""
    metric_name: str = Field(..., example="cpu_usage_percent")
    service_id: str = Field(..., example="api-service-1")
    value: float = Field(..., example=45.5)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    labels: Dict[str, str] = Field(default_factory=dict, example={"instance": "host-1"})
    unit: str = Field(default="", example="percent")

    class Config:
        json_schema_extra = {
            "example": {
                "metric_name": "cpu_usage_percent",
                "service_id": "api-service-1",
                "value": 45.5,
                "timestamp": "2026-03-18T10:30:00Z",
                "labels": {"instance": "host-1", "region": "us-east-1"},
                "unit": "percent"
            }
        }


class AggregationFunction(str, Enum):
    """Aggregation functions for metrics"""
    AVG = "avg"
    MAX = "max"
    MIN = "min"
    SUM = "sum"
    RATE = "rate"
    LAST = "last"


class MetricQuery(BaseModel):
    """Query parameters for metrics retrieval"""
    metric_name: str = Field(..., example="cpu_usage_percent")
    service_id: Optional[str] = Field(None, example="api-service-1")
    time_range: str = Field(default="1h", example="1h")  # 5m, 1h, 24h, 7d
    aggregation: AggregationFunction = Field(default=AggregationFunction.AVG)
    step: int = Field(default=60, example=60, ge=1)  # Data point interval in seconds
    
    class Config:
        json_schema_extra = {
            "example": {
                "metric_name": "cpu_usage_percent",
                "service_id": "api-service-1",
                "time_range": "1h",
                "aggregation": "avg",
                "step": 60
            }
        }


class TimeSeriesData(BaseModel):
    """Time-series data response"""
    metric_name: str
    service_id: str
    data_points: List[tuple] = Field(..., example=[[1710758400, 45.5], [1710758460, 47.2]])
    unit: str = ""
    aggregation: AggregationFunction


class MetricStatistics(BaseModel):
    """Statistical summary of metrics over time"""
    metric_name: str
    service_id: str
    min: float
    max: float
    avg: float
    p95: float
    p99: float
    latest: float
    timestamp_range: tuple
