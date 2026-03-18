"""
Recommendations API endpoints
Crafted by CaptainCode
"""
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.schemas import RecommendationResponse, RecommendationsResponse
from src.services import RecommendationService, get_ai_service
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("", response_model=RecommendationsResponse)
async def get_recommendations(
    user_id: int,
    item_type: str = Query(None, description="Filter by item type: product, content, action"),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Get recommendations for a user"""
    try:
        recs = await RecommendationService.get_user_recommendations(
            db=db,
            user_id=user_id,
            limit=limit,
            item_type=item_type,
            viewed=False,
        )
        
        return RecommendationsResponse(
            user_id=user_id,
            recommendations=[RecommendationResponse.model_validate(r) for r in recs],
            total_count=len(recs),
            generated_at=datetime.utcnow(),
        )
    except Exception as e:
        logger.error(f"Error fetching recommendations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/generate")
async def generate_recommendations(
    user_id: int,
    preferences: dict = None,
    db: Session = Depends(get_db),
):
    """Generate new recommendations using AI"""
    try:
        ai_service = get_ai_service()
        
        recs = await RecommendationService.generate_recommendations(
            ai_service=ai_service,
            db=db,
            user_id=user_id,
            user_preferences=preferences or {},
        )
        
        return {
            "user_id": user_id,
            "recommendations": [RecommendationResponse.model_validate(r) for r in recs],
            "total_count": len(recs),
            "generated_at": datetime.utcnow(),
        }
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/{recommendation_id}/view")
async def mark_recommendation_viewed(
    recommendation_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    """Mark a recommendation as viewed"""
    try:
        success = await RecommendationService.mark_viewed(
            db=db,
            recommendation_id=recommendation_id,
            user_id=user_id,
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recommendation not found",
            )
        
        return {"success": True, "recommendation_id": recommendation_id}
    except Exception as e:
        logger.error(f"Error marking recommendation viewed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
