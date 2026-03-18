"""
Recommendation Service
Crafted by CaptainCode
"""
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from src.models import Recommendation, User
from src.schemas import RecommendationCreate, RecommendationResponse

logger = logging.getLogger(__name__)


class RecommendationService:
    """Service for generating and managing recommendations"""
    
    @staticmethod
    async def create_recommendation(
        db: Session,
        user_id: int,
        rec_data: RecommendationCreate,
    ) -> Recommendation:
        """Create a recommendation"""
        try:
            recommendation = Recommendation(
                user_id=user_id,
                item_id=rec_data.item_id,
                item_type=rec_data.item_type,
                item_name=rec_data.item_name,
                score=rec_data.score,
                reason=rec_data.reason,
                metadata=rec_data.metadata or {},
            )
            db.add(recommendation)
            db.commit()
            db.refresh(recommendation)
            logger.info(f"Created recommendation: {recommendation.id}")
            return recommendation
        except Exception as e:
            logger.error(f"Error creating recommendation: {str(e)}")
            raise
    
    @staticmethod
    async def get_user_recommendations(
        db: Session,
        user_id: int,
        limit: int = 10,
        item_type: Optional[str] = None,
        viewed: Optional[bool] = None,
    ) -> List[Recommendation]:
        """Get recommendations for a user"""
        query = db.query(Recommendation).filter(Recommendation.user_id == user_id)
        
        if item_type:
            query = query.filter(Recommendation.item_type == item_type)
        
        if viewed is not None:
            query = query.filter(Recommendation.viewed == viewed)
        
        return query.order_by(
            Recommendation.score.desc()
        ).limit(limit).all()
    
    @staticmethod
    async def mark_viewed(
        db: Session,
        recommendation_id: int,
        user_id: int,
    ) -> bool:
        """Mark recommendation as viewed"""
        try:
            rec = db.query(Recommendation).filter(
                Recommendation.id == recommendation_id,
                Recommendation.user_id == user_id,
            ).first()
            
            if rec:
                rec.viewed = True
                db.commit()
                logger.info(f"Marked recommendation {recommendation_id} as viewed")
                return True
            return False
        except Exception as e:
            logger.error(f"Error marking recommendation viewed: {str(e)}")
            raise
    
    @staticmethod
    async def generate_recommendations(
        ai_service,
        db: Session,
        user_id: int,
        user_preferences: Dict[str, Any],
        behavior_data: Optional[Dict[str, Any]] = None,
    ) -> List[Recommendation]:
        """
        Generate recommendations using AI
        
        Args:
            ai_service: AI service instance
            db: Database session
            user_id: User ID
            user_preferences: User preferences/interests
            behavior_data: Historical behavior data
            
        Returns:
            List of generated recommendations
        """
        try:
            # Build prompt for AI
            prompt = f"""Generate personalized recommendations based on:
            User Preferences: {user_preferences}
            Behavior Data: {behavior_data or {}}
            
            Return recommendations as JSON with fields:
            - item_id (string)
            - item_type (product/content/action)
            - item_name (string)
            - score (0-1)
            - reason (string)
            
            Generate 5 diverse recommendations."""
            
            # Get AI recommendations
            ai_response = await ai_service.generate_response(prompt)
            
            # Parse and save recommendations
            # (In production, would parse JSON from AI response)
            recommendations = []
            
            logger.info(f"Generated recommendations for user {user_id}")
            return recommendations
        
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            raise
