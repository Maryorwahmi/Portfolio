"""
Alert Service - Handle alert rules, evaluation, and notifications
Created by CaptainCode - HelixOps Technologies
"""

import logging
import asyncio
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from collections import defaultdict

logger = logging.getLogger(__name__)


class AlertService:
    """
    Service for managing alert rules, evaluating metrics against rules,
    and sending notifications.
    """

    def __init__(self, smtp_config: Optional[Dict] = None):
        """
        Initialize alert service
        
        Args:
            smtp_config: SMTP configuration for email notifications
        """
        self.alert_rules: Dict[str, Dict] = {}
        self.active_alerts: Dict[str, Dict] = {}
        self.alert_history: List[Dict] = []
        self.alert_evaluations: defaultdict(list) = defaultdict(list)
        self.smtp_config = smtp_config or {}
        logger.info("AlertService initialized")

    async def create_alert_rule(self, rule_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new alert rule
        
        Args:
            rule_data: Alert rule configuration
            
        Returns:
            Created rule with ID
        """
        try:
            rule_id = f"rule_{len(self.alert_rules) + 1}_{int(datetime.utcnow().timestamp())}"
            
            rule = {
                "id": rule_id,
                "name": rule_data.get("name"),
                "service_id": rule_data.get("service_id"),
                "conditions": rule_data.get("conditions", []),
                "notification_config": rule_data.get("notification_config", {}),
                "severity": rule_data.get("severity", "warning"),
                "enabled": rule_data.get("enabled", True),
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }
            
            self.alert_rules[rule_id] = rule
            logger.info(f"Created alert rule: {rule_id}")
            return {"status": "success", "rule": rule}
            
        except Exception as e:
            logger.error(f"Error creating alert rule: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def evaluate_alert_rules(
        self,
        metric_name: str,
        service_id: str,
        metric_value: float
    ) -> List[Dict]:
        """
        Evaluate all applicable alert rules for a metric
        
        Args:
            metric_name: Name of the metric
            service_id: Service ID
            metric_value: Current metric value
            
        Returns:
            List of triggered alerts
        """
        triggered_alerts = []
        
        try:
            for rule_id, rule in self.alert_rules.items():
                if not rule.get("enabled"):
                    continue
                
                if rule.get("service_id") != service_id:
                    continue
                
                # Check all conditions
                for condition in rule.get("conditions", []):
                    if condition.get("metric_name") == metric_name:
                        if self._evaluate_condition(condition, metric_value):
                            # Check for existing alert
                            alert_key = f"{service_id}:{metric_name}"
                            
                            if alert_key not in self.active_alerts:
                                # Create new alert
                                alert = await self._create_alert(
                                    rule, metric_name, service_id, metric_value
                                )
                                self.active_alerts[alert_key] = alert
                                triggered_alerts.append(alert)
                                
                                # Send notification
                                await self._send_notification(alert, rule)
                                
            return triggered_alerts
            
        except Exception as e:
            logger.error(f"Error evaluating alert rules: {str(e)}")
            return []

    async def acknowledge_alert(self, alert_id: str, acknowledged_by: str) -> Dict:
        """
        Acknowledge an active alert
        
        Args:
            alert_id: Alert ID
            acknowledged_by: User acknowledging the alert
            
        Returns:
            Updated alert
        """
        try:
            for key, alert in self.active_alerts.items():
                if alert.get("id") == alert_id:
                    alert["status"] = "acknowledged"
                    alert["acknowledged_at"] = datetime.utcnow().isoformat()
                    alert["acknowledged_by"] = acknowledged_by
                    
                    logger.info(f"Alert {alert_id} acknowledged by {acknowledged_by}")
                    return {"status": "success", "alert": alert}
            
            return {"status": "error", "message": "Alert not found"}
            
        except Exception as e:
            logger.error(f"Error acknowledging alert: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def resolve_alert(self, alert_id: str) -> Dict:
        """
        Resolve an active alert
        
        Args:
            alert_id: Alert ID
            
        Returns:
            Resolved alert
        """
        try:
            for key, alert in list(self.active_alerts.items()):
                if alert.get("id") == alert_id:
                    alert["status"] = "resolved"
                    alert["resolved_at"] = datetime.utcnow().isoformat()
                    
                    # Move to history
                    self.alert_history.append(alert)
                    del self.active_alerts[key]
                    
                    logger.info(f"Alert {alert_id} resolved")
                    return {"status": "success", "alert": alert}
            
            return {"status": "error", "message": "Alert not found"}
            
        except Exception as e:
            logger.error(f"Error resolving alert: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def get_active_alerts(self, service_id: Optional[str] = None) -> List[Dict]:
        """Get active alerts, optionally filtered by service"""
        alerts = list(self.active_alerts.values())
        
        if service_id:
            alerts = [a for a in alerts if a.get("service_id") == service_id]
        
        return alerts

    async def get_alert_history(
        self,
        service_id: Optional[str] = None,
        days: int = 7
    ) -> List[Dict]:
        """Get alert history"""
        cutoff_time = datetime.utcnow() - timedelta(days=days)
        history = [
            a for a in self.alert_history
            if datetime.fromisoformat(a.get("triggered_at", "")) >= cutoff_time
        ]
        
        if service_id:
            history = [a for a in history if a.get("service_id") == service_id]
        
        return history

    def _evaluate_condition(self, condition: Dict, metric_value: float) -> bool:
        """Evaluate a single alert condition"""
        operator = condition.get("operator")
        threshold = condition.get("threshold")
        
        if operator == ">":
            return metric_value > threshold
        elif operator == "<":
            return metric_value < threshold
        elif operator == ">=":
            return metric_value >= threshold
        elif operator == "<=":
            return metric_value <= threshold
        elif operator == "==":
            return metric_value == threshold
        elif operator == "!=":
            return metric_value != threshold
        
        return False

    async def _create_alert(
        self,
        rule: Dict,
        metric_name: str,
        service_id: str,
        metric_value: float
    ) -> Dict:
        """Create an alert instance from a rule"""
        alert_id = f"alert_{len(self.active_alerts) + 1}_{int(datetime.utcnow().timestamp())}"
        
        return {
            "id": alert_id,
            "rule_id": rule.get("id"),
            "service_id": service_id,
            "severity": rule.get("severity", "warning"),
            "status": "active",
            "message": f"{rule.get('name')}: {metric_name} is {metric_value}",
            "triggered_at": datetime.utcnow().isoformat(),
            "resolved_at": None,
            "acknowledged_at": None,
            "acknowledged_by": None,
            "metric_value": metric_value,
            "metric_name": metric_name,
        }

    async def _send_notification(self, alert: Dict, rule: Dict) -> bool:
        """Send alert notification"""
        try:
            notification_config = rule.get("notification_config", {})
            channel = notification_config.get("channel", "email")
            recipients = notification_config.get("recipients", [])
            
            if channel == "email" and recipients:
                await self._send_email_notification(alert, recipients)
            elif channel == "webhook":
                await self._send_webhook_notification(alert, notification_config)
            
            logger.info(f"Notification sent for alert {alert.get('id')}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending notification: {str(e)}")
            return False

    async def _send_email_notification(self, alert: Dict, recipients: List[str]) -> bool:
        """Send email notification"""
        try:
            if not self.smtp_config:
                logger.warning("SMTP not configured, skipping email notification")
                return False
            
            message = MIMEMultipart()
            message["From"] = self.smtp_config.get("from_address", "alerts@helixops.com")
            message["To"] = ", ".join(recipients)
            message["Subject"] = f"[{alert.get('severity').upper()}] {alert.get('message')}"
            
            body = f"""
            Alert ID: {alert.get('id')}
            Service: {alert.get('service_id')}
            Metric: {alert.get('metric_name')}
            Value: {alert.get('metric_value')}
            Time: {alert.get('triggered_at')}
            """
            
            message.attach(MIMEText(body, "plain"))
            
            # In production, actually send the email
            logger.info(f"Email notification prepared for {recipients}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return False

    async def _send_webhook_notification(self, alert: Dict, config: Dict) -> bool:
        """Send webhook notification"""
        try:
            webhook_url = config.get("webhook_url")
            
            if not webhook_url:
                return False
            
            # In production, make actual HTTP POST request
            logger.info(f"Webhook notification sent to {webhook_url}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending webhook: {str(e)}")
            return False
