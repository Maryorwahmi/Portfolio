"""
Pydantic request/response schemas
Crafted by CaptainCode
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr


# ============ USER SCHEMAS ============
class UserBase(BaseModel):
    """Base user schema"""
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    full_name: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = {}


class UserCreate(UserBase):
    """User creation request"""
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """User update request"""
    full_name: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None


class UserResponse(UserBase):
    """User response"""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============ MESSAGE SCHEMAS ============
class MessageCreate(BaseModel):
    """Message creation request"""
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1, max_length=10000)
    metadata: Optional[Dict[str, Any]] = {}


class MessageResponse(BaseModel):
    """Message response"""
    id: int
    role: str
    content: str
    confidence_score: Optional[float] = None
    metadata: Dict[str, Any]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============ CHAT SESSION SCHEMAS ============
class ChatSessionCreate(BaseModel):
    """Chat session creation request"""
    title: Optional[str] = None
    context: Optional[Dict[str, Any]] = {}


class ChatSessionUpdate(BaseModel):
    """Chat session update request"""
    title: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class ChatSessionResponse(BaseModel):
    """Chat session response"""
    id: int
    session_hash: Optional[str]
    title: Optional[str]
    is_active: bool
    context: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []
    
    class Config:
        from_attributes = True


# ============ AI CHAT SCHEMAS ============
class ChatRequest(BaseModel):
    """AI chat request"""
    message: str = Field(..., min_length=1, max_length=10000)
    user_id: int
    session_id: Optional[int] = None
    context: Optional[Dict[str, Any]] = {}


class ChatResponse(BaseModel):
    """AI chat response"""
    response: str
    confidence: float = Field(..., ge=0, le=1)
    suggested_actions: Optional[List[str]] = []
    session_id: int
    message_id: int
    metadata: Dict[str, Any] = {}


# ============ RECOMMENDATION SCHEMAS ============
class RecommendationBase(BaseModel):
    """Base recommendation schema"""
    item_id: str
    item_type: str = Field(..., pattern="^(product|content|action)$")
    item_name: str
    score: float = Field(..., ge=0, le=1)
    reason: Optional[str] = None


class RecommendationCreate(RecommendationBase):
    """Recommendation creation request"""
    metadata: Optional[Dict[str, Any]] = {}


class RecommendationResponse(RecommendationBase):
    """Recommendation response"""
    id: int
    user_id: int
    viewed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class RecommendationsResponse(BaseModel):
    """Multiple recommendations response"""
    user_id: int
    recommendations: List[RecommendationResponse]
    total_count: int
    generated_at: datetime


# ============ AUTHENTICATION SCHEMAS ============
class TokenResponse(BaseModel):
    """Token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class APIKeyResponse(BaseModel):
    """API Key response"""
    id: int
    name: str
    key_hash: str
    is_active: bool
    created_at: datetime
    expires_at: Optional[datetime] = None


# ============ HEALTH & METRICS SCHEMAS ============
class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: datetime
    version: str
    database: str = "ok"
    redis: str = "ok"
    openai: str = "ok"


class MetricsResponse(BaseModel):
    """Metrics response"""
    total_users: int
    total_sessions: int
    total_messages: int
    avg_response_time_ms: float
    requests_per_minute: int
    cache_hit_rate: float
