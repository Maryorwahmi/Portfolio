"""
API Routes Package
Created by CaptainCode
"""

from .metrics import router as metrics_router
from .services import router as services_router
from .alerts import router as alerts_router

__all__ = [
    "metrics_router",
    "services_router",
    "alerts_router",
]
