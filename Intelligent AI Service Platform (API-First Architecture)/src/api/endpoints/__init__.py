"""
API endpoints __init__ file
"""
from src.api.endpoints.chat import router as chat_router
from src.api.endpoints.sessions import router as sessions_router
from src.api.endpoints.recommendations import router as recommendations_router
from src.api.endpoints.health import router as health_router

__all__ = [
    "chat_router",
    "sessions_router",
    "recommendations_router",
    "health_router",
]
