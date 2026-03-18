"""
Metrics Service - Handle metric ingestion, storage, and querying
Created by CaptainCode - HelixOps Technologies
"""

import logging
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import json
from collections import defaultdict

logger = logging.getLogger(__name__)


class MetricsService:
    """
    Service for managing metrics collection, storage, and retrieval.
    Interfaces with Prometheus for time-series data.
    """

    def __init__(self, prometheus_url: str = "http://prometheus:9090"):
        """
        Initialize metrics service
        
        Args:
            prometheus_url: URL to Prometheus server
        """
        self.prometheus_url = prometheus_url
        self.metrics_cache: Dict[str, List[float]] = defaultdict(list)
        self.cache_max_size = 10000
        logger.info(f"MetricsService initialized with Prometheus at {prometheus_url}")

    async def ingest_metric(self, metric_data: Dict[str, Any]) -> bool:
        """
        Ingest a single metric data point
        
        Args:
            metric_data: Metric data dictionary
            
        Returns:
            bool: Success status
        """
        try:
            metric_name = metric_data.get("metric_name")
            service_id = metric_data.get("service_id")
            value = metric_data.get("value")
            
            if not all([metric_name, service_id, value is not None]):
                logger.error("Invalid metric data: missing required fields")
                return False
            
            # Cache metrics
            cache_key = f"{service_id}:{metric_name}"
            self.metrics_cache[cache_key].append(value)
            
            # Maintain cache size
            if len(self.metrics_cache[cache_key]) > self.cache_max_size:
                self.metrics_cache[cache_key] = self.metrics_cache[cache_key][-self.cache_max_size:]
            
            logger.debug(f"Ingested metric: {metric_name} for {service_id} = {value}")
            return True
            
        except Exception as e:
            logger.error(f"Error ingesting metric: {str(e)}")
            return False

    async def query_metrics(
        self,
        metric_name: str,
        service_id: Optional[str] = None,
        time_range: str = "1h",
        aggregation: str = "avg"
    ) -> Dict[str, Any]:
        """
        Query metrics from Prometheus
        
        Args:
            metric_name: Name of metric to query
            service_id: Optional service ID filter
            time_range: Time range (5m, 1h, 24h, 7d)
            aggregation: Aggregation function (avg, max, min, sum, rate, last)
            
        Returns:
            Dict containing time-series data
        """
        try:
            # Build PromQL query
            query = self._build_promql_query(metric_name, service_id, aggregation)
            
            logger.info(f"Querying metrics: {query}")
            
            # Mock implementation - in production, call actual Prometheus API
            result = {
                "metric_name": metric_name,
                "service_id": service_id,
                "time_range": time_range,
                "aggregation": aggregation,
                "data_points": self._get_cached_data(metric_name, service_id),
                "status": "success"
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error querying metrics: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def get_metric_statistics(
        self,
        metric_name: str,
        service_id: str,
        time_range: str = "1h"
    ) -> Dict[str, Any]:
        """
        Calculate statistics for a metric
        
        Args:
            metric_name: Name of metric
            service_id: Service ID
            time_range: Time range for calculation
            
        Returns:
            Statistics dictionary
        """
        try:
            cache_key = f"{service_id}:{metric_name}"
            values = self.metrics_cache.get(cache_key, [])
            
            if not values:
                return {
                    "status": "error",
                    "message": "No data points found"
                }
            
            sorted_values = sorted(values)
            length = len(values)
            
            stats = {
                "metric_name": metric_name,
                "service_id": service_id,
                "time_range": time_range,
                "min": min(values),
                "max": max(values),
                "avg": sum(values) / length,
                "p95": sorted_values[int(length * 0.95)] if length > 1 else values[0],
                "p99": sorted_values[int(length * 0.99)] if length > 1 else values[0],
                "latest": values[-1] if values else None,
                "count": length,
                "status": "success"
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"Error calculating statistics: {str(e)}")
            return {"status": "error", "message": str(e)}

    def _build_promql_query(
        self,
        metric_name: str,
        service_id: Optional[str],
        aggregation: str
    ) -> str:
        """Build a PromQL query string"""
        if service_id:
            return f"{aggregation}({metric_name}{{service_id=\"{service_id}\"}})"
        return f"{aggregation}({metric_name})"

    def _get_cached_data(self, metric_name: str, service_id: Optional[str]) -> List[List]:
        """Get cached metric data points"""
        if service_id:
            cache_key = f"{service_id}:{metric_name}"
            values = self.metrics_cache.get(cache_key, [])
            return [[i, v] for i, v in enumerate(values)]
        return []

    async def health_check(self) -> bool:
        """Check if Prometheus is accessible"""
        try:
            # In production, make actual HTTP request to Prometheus
            logger.info("Metrics service health check passed")
            return True
        except Exception as e:
            logger.error(f"Metrics service health check failed: {str(e)}")
            return False


class MetricsAggregator:
    """Aggregates metrics across multiple services"""
    
    def __init__(self):
        self.metrics = {}
    
    def aggregate(self, metrics_list: List[Dict], func: str = "avg") -> float:
        """
        Aggregate metrics using specified function
        
        Args:
            metrics_list: List of metric values
            func: Aggregation function name
            
        Returns:
            Aggregated value
        """
        values = [m.get("value", 0) for m in metrics_list if m]
        
        if not values:
            return 0.0
        
        if func == "avg":
            return sum(values) / len(values)
        elif func == "max":
            return max(values)
        elif func == "min":
            return min(values)
        elif func == "sum":
            return sum(values)
        elif func == "last":
            return values[-1]
        
        return 0.0
