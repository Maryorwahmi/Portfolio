"""
Celery tasks for async operations
Crafted by CaptainCode
"""
import logging
from src.celery_app import celery_app
from src.core.database import SessionLocal
from src.models import Message
from src.services import get_ai_service, get_vector_db_service

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="generate_embedding")
def generate_embedding_task(self, message_id: int):
    """
    Async task to generate and store embedding for a message
    
    Args:
        message_id: ID of the message to embed
    """
    try:
        db = SessionLocal()
        
        # Get message
        message = db.query(Message).get(message_id)
        if not message:
            logger.error(f"Message {message_id} not found")
            return {"status": "error", "message": "Message not found"}
        
        # Generate embedding
        ai_service = get_ai_service()
        embedding = ai_service.generate_embedding(message.content)
        
        # Store in vector DB
        vector_service = get_vector_db_service()
        vector_service.upsert_vector(
            vector_id=f"msg_{message_id}",
            embedding=embedding,
            metadata={
                "session_id": message.session_id,
                "message_id": message_id,
                "role": message.role,
            },
        )
        
        # Update message with embedding metadata
        message.embedding = {"vector": embedding[:5]}  # Store first 5 dims for reference
        db.commit()
        
        logger.info(f"Generated embedding for message {message_id}")
        return {"status": "success", "message_id": message_id}
    
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        raise
    
    finally:
        db.close()


@celery_app.task(bind=True, name="batch_generate_recommendations")
def batch_generate_recommendations_task(self, user_id: int):
    """
    Async task to batch generate recommendations for a user
    
    Args:
        user_id: ID of user
    """
    try:
        from src.services import RecommendationService
        from src.models import User
        
        db = SessionLocal()
        
        # Get user
        user = db.query(User).get(user_id)
        if not user:
            logger.error(f"User {user_id} not found")
            return {"status": "error"}
        
        # Generate recommendations
        ai_service = get_ai_service()
        recs = RecommendationService.generate_recommendations(
            ai_service=ai_service,
            db=db,
            user_id=user_id,
            user_preferences=user.preferences,
        )
        
        logger.info(f"Generated {len(recs)} recommendations for user {user_id}")
        return {"status": "success", "user_id": user_id, "count": len(recs)}
    
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise
    
    finally:
        db.close()


@celery_app.task(name="cleanup_old_sessions")
def cleanup_old_sessions_task():
    """
    Async task to clean up old chat sessions (older than 90 days)
    """
    try:
        from datetime import datetime, timedelta
        from src.models import ChatSession
        
        db = SessionLocal()
        
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        
        old_sessions = db.query(ChatSession).filter(
            ChatSession.created_at < cutoff_date,
            ChatSession.is_active == False,
        ).all()
        
        count = len(old_sessions)
        
        for session in old_sessions:
            db.delete(session)
        
        db.commit()
        
        logger.info(f"Deleted {count} old sessions")
        return {"status": "success", "deleted_count": count}
    
    except Exception as e:
        logger.error(f"Error cleaning up sessions: {str(e)}")
        raise
    
    finally:
        db.close()
