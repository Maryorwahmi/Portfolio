"""
Service Registry - Manage monitored services
Created by CaptainCode - HelixOps Technologies
"""

import logging
import asyncio
from typing import Dict, Optional, List, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class ServiceRegistry:
    """
    Registry for managing monitored services.
    Maintains service metadata and health status.
    """

    def __init__(self, heartbeat_timeout: int = 60):
        """
        Initialize service registry
        
        Args:
            heartbeat_timeout: Timeout in seconds for service heartbeats
        """
        self.services: Dict[str, Dict] = {}
        self.heartbeat_timeout = heartbeat_timeout
        self.service_health: Dict[str, Dict] = {}
        logger.info("ServiceRegistry initialized")

    async def register_service(self, service_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register a new service for monitoring
        
        Args:
            service_data: Service information
            
        Returns:
            Registered service
        """
        try:
            service_id = service_data.get("id")
            
            if service_id in self.services:
                logger.warning(f"Service {service_id} already registered")
                return {"status": "error", "message": "Service already registered"}
            
            service = {
                "id": service_id,
                "name": service_data.get("name"),
                "service_type": service_data.get("service_type", "custom"),
                "description": service_data.get("description"),
                "metrics_endpoint": service_data.get("metrics_endpoint"),
                "status": "unknown",
                "metadata": service_data.get("metadata", {}),
                "created_at": datetime.utcnow().isoformat(),
                "last_heartbeat": None,
                "tags": service_data.get("tags", []),
            }
            
            self.services[service_id] = service
            logger.info(f"Registered service: {service_id}")
            
            return {"status": "success", "service": service}
            
        except Exception as e:
            logger.error(f"Error registering service: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def update_service(
        self,
        service_id: str,
        update_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update service information
        
        Args:
            service_id: Service ID
            update_data: Fields to update
            
        Returns:
            Updated service
        """
        try:
            if service_id not in self.services:
                return {"status": "error", "message": "Service not found"}
            
            service = self.services[service_id]
            
            # Update allowed fields
            for key in ["name", "description", "metrics_endpoint", "tags"]:
                if key in update_data:
                    service[key] = update_data[key]
            
            logger.info(f"Updated service: {service_id}")
            return {"status": "success", "service": service}
            
        except Exception as e:
            logger.error(f"Error updating service: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def deregister_service(self, service_id: str) -> Dict[str, Any]:
        """
        Deregister a service
        
        Args:
            service_id: Service ID
            
        Returns:
            Operation result
        """
        try:
            if service_id not in self.services:
                return {"status": "error", "message": "Service not found"}
            
            del self.services[service_id]
            if service_id in self.service_health:
                del self.service_health[service_id]
            
            logger.info(f"Deregistered service: {service_id}")
            return {"status": "success", "message": "Service deregistered"}
            
        except Exception as e:
            logger.error(f"Error deregistering service: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def get_service(self, service_id: str) -> Optional[Dict]:
        """Get service by ID"""
        return self.services.get(service_id)

    async def list_services(self) -> List[Dict]:
        """List all registered services"""
        return list(self.services.values())

    async def record_heartbeat(self, service_id: str) -> bool:
        """
        Record a heartbeat for a service
        
        Args:
            service_id: Service ID
            
        Returns:
            Success status
        """
        try:
            if service_id not in self.services:
                logger.warning(f"Heartbeat received for unknown service: {service_id}")
                return False
            
            service = self.services[service_id]
            service["last_heartbeat"] = datetime.utcnow().isoformat()
            service["status"] = "healthy"
            
            logger.debug(f"Heartbeat recorded for service: {service_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error recording heartbeat: {str(e)}")
            return False

    async def check_service_health(self) -> Dict[str, str]:
        """
        Check health of all services based on heartbeats
        
        Returns:
            Dictionary of service health status
        """
        try:
            health_status = {}
            cutoff_time = datetime.utcnow() - timedelta(seconds=self.heartbeat_timeout)
            
            for service_id, service in self.services.items():
                last_beat = service.get("last_heartbeat")
                
                if not last_beat:
                    health_status[service_id] = "unknown"
                else:
                    beat_time = datetime.fromisoformat(last_beat)
                    if beat_time < cutoff_time:
                        health_status[service_id] = "offline"
                    else:
                        health_status[service_id] = "healthy"
            
            logger.info(f"Service health check completed: {health_status}")
            return health_status
            
        except Exception as e:
            logger.error(f"Error checking service health: {str(e)}")
            return {}

    async def get_service_health_summary(self, service_id: str) -> Dict[str, Any]:
        """
        Get detailed health summary for a service
        
        Args:
            service_id: Service ID
            
        Returns:
            Health summary
        """
        try:
            if service_id not in self.services:
                return {"status": "error", "message": "Service not found"}
            
            service = self.services[service_id]
            
            summary = {
                "service_id": service_id,
                "name": service.get("name"),
                "status": service.get("status"),
                "last_heartbeat": service.get("last_heartbeat"),
                "uptime_percent": 99.9,  # Mock value
                "cpu_usage": 45.5,  # Mock value
                "memory_usage": 62.3,  # Mock value
                "error_rate": 0.5,  # Mock value
                "request_rate": 1500,  # Mock value
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting health summary: {str(e)}")
            return {"status": "error", "message": str(e)}
