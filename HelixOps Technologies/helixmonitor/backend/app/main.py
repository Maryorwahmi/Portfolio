"""
HelixMonitor - Infrastructure Observability Platform
FastAPI Main Application
Created by CaptainCode - HelixOps Technologies
"""

import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi
from datetime import datetime
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.api.routes import metrics_router, services_router, alerts_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="HelixMonitor API",
    description="Infrastructure Observability Platform - Real-time monitoring and alerting system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error",
            "timestamp": datetime.utcnow().isoformat()
        }
    )


# Include routers
app.include_router(metrics_router)
app.include_router(services_router)
app.include_router(alerts_router)


@app.get("/", tags=["status"])
async def root():
    """Root endpoint - HelixMonitor API"""
    return {
        "status": "operational",
        "service": "HelixMonitor",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "created_by": "CaptainCode"
    }


@app.get("/health", tags=["status"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "HelixMonitor API"
    }


@app.get("/api/v1/status", tags=["status"])
async def api_status():
    """System status endpoint with component health"""
    return {
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "api": "operational",
            "metrics_service": "operational",
            "alert_service": "operational",
            "service_registry": "operational"
        }
    }


def custom_openapi():
    """Customize OpenAPI schema"""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="HelixMonitor API",
        version="1.0.0",
        description="Infrastructure Observability Platform",
        contact={
            "name": "HelixOps Technologies",
            "url": "https://helixops.com",
        },
        routes=app.routes,
    )
    
    openapi_schema["info"]["x-logo"] = {
        "url": "https://helixops.com/logo.png"
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting HelixMonitor API server...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
