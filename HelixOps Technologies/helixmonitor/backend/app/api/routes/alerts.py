"""
Alerts API endpoints
Created by CaptainCode - HelixOps Technologies
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime

from ...models import Alert, AlertRule, AlertStatus
from ...services import AlertService

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])

# Dependency injection
alert_service = AlertService()


@router.post("/rules", summary="Create alert rule")
async def create_alert_rule(rule: AlertRule) -> dict:
    """
    Create a new alert rule.
    
    Alert rules define conditions that trigger notifications when metric thresholds are exceeded.
    """
    result = await alert_service.create_alert_rule(rule.dict())
    
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    
    return result


@router.get("/rules", summary="List alert rules")
async def list_alert_rules(service_id: Optional[str] = Query(None)) -> dict:
    """
    Get all alert rules, optionally filtered by service.
    """
    rules = [r for r in alert_service.alert_rules.values()]
    
    if service_id:
        rules = [r for r in rules if r.get("service_id") == service_id]
    
    return {
        "status": "success",
        "count": len(rules),
        "rules": rules,
        "timestamp": datetime.utcnow()
    }


@router.get("/", summary="Get active alerts")
async def get_active_alerts(service_id: Optional[str] = Query(None)) -> dict:
    """
    Get currently active alerts, optionally filtered by service.
    """
    alerts = await alert_service.get_active_alerts(service_id)
    
    return {
        "status": "success",
        "count": len(alerts),
        "alerts": alerts,
        "timestamp": datetime.utcnow()
    }


@router.get("/history", summary="Get alert history")
async def get_alert_history(
    service_id: Optional[str] = Query(None),
    days: int = Query(7, ge=1, le=90)
) -> dict:
    """
    Get alert history for the specified number of days.
    """
    history = await alert_service.get_alert_history(service_id, days)
    
    return {
        "status": "success",
        "count": len(history),
        "history": history,
        "days": days,
        "timestamp": datetime.utcnow()
    }


@router.post("/{alert_id}/acknowledge", summary="Acknowledge alert")
async def acknowledge_alert(
    alert_id: str,
    acknowledged_by: str = Query(...)
) -> dict:
    """
    Acknowledge an active alert.
    """
    result = await alert_service.acknowledge_alert(alert_id, acknowledged_by)
    
    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result.get("message"))
    
    return result


@router.post("/{alert_id}/resolve", summary="Resolve alert")
async def resolve_alert(alert_id: str) -> dict:
    """
    Manually resolve an active alert.
    """
    result = await alert_service.resolve_alert(alert_id)
    
    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result.get("message"))
    
    return result


@router.get("/{alert_id}", summary="Get alert details")
async def get_alert_details(alert_id: str) -> dict:
    """
    Get detailed information about a specific alert.
    """
    for alert in list(alert_service.active_alerts.values()) + alert_service.alert_history:
        if alert.get("id") == alert_id:
            return {
                "status": "success",
                "alert": alert,
                "timestamp": datetime.utcnow()
            }
    
    raise HTTPException(status_code=404, detail="Alert not found")
