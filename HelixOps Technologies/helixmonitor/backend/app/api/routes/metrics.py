"""
Metrics API endpoints
Created by CaptainCode - HelixOps Technologies
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
from datetime import datetime

from ...models import MetricData, MetricQuery, TimeSeriesData, MetricStatistics
from ...services import MetricsService

router = APIRouter(prefix="/api/v1/metrics", tags=["metrics"])

# Dependency injection
metrics_service = MetricsService()


@router.post("/ingest", summary="Ingest a metric data point")
async def ingest_metric(metric_data: MetricData) -> dict:
    """
    Ingest a single metric data point into the system.
    
    - **metric_name**: Name of the metric (e.g., cpu_usage_percent)
    - **service_id**: Service identifier
    - **value**: Numeric metric value
    - **timestamp**: Timestamp of the metric (UTC)
    """
    success = await metrics_service.ingest_metric(metric_data.dict())
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to ingest metric")
    
    return {
        "status": "success",
        "message": f"Metric {metric_data.metric_name} ingested",
        "timestamp": datetime.utcnow()
    }


@router.post("/query", response_model=dict, summary="Query metrics")
async def query_metrics(query: MetricQuery) -> dict:
    """
    Query metrics for specified time range and aggregation.
    
    Supported time ranges: 5m, 1h, 24h, 7d
    Aggregation functions: avg, max, min, sum, rate, last
    """
    result = await metrics_service.query_metrics(
        metric_name=query.metric_name,
        service_id=query.service_id,
        time_range=query.time_range,
        aggregation=query.aggregation.value
    )
    
    return result


@router.get(
    "/statistics",
    response_model=dict,
    summary="Get metric statistics"
)
async def get_metric_statistics(
    metric_name: str = Query(..., description="Metric name"),
    service_id: str = Query(..., description="Service ID"),
    time_range: str = Query("1h", description="Time range")
) -> dict:
    """
    Get statistical summary of a metric including min, max, avg, p95, p99.
    """
    result = await metrics_service.get_metric_statistics(
        metric_name=metric_name,
        service_id=service_id,
        time_range=time_range
    )
    
    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result.get("message"))
    
    return result


@router.get("/health", summary="Health check")
async def health_check() -> dict:
    """Check if metrics service is healthy"""
    healthy = await metrics_service.health_check()
    
    if not healthy:
        raise HTTPException(status_code=503, detail="Metrics service unavailable")
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "service": "metrics"
    }
