"""
Chat service for managing conversations
Crafted by CaptainCode
"""
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from src.models import ChatSession, Message, User
from src.schemas import MessageCreate, ChatSessionCreate
from src.core.redis_client import get_redis_client
from datetime import datetime

logger = logging.getLogger(__name__)


class ChatService:
    """Service for managing chat sessions and messages"""
    
    @staticmethod
    async def create_session(
        db: Session,
        user_id: int,
        session_data: ChatSessionCreate,
    ) -> ChatSession:
        """Create a new chat session"""
        try:
            import uuid
            session = ChatSession(
                user_id=user_id,
                session_hash=str(uuid.uuid4()),
                title=session_data.title or f"Chat {datetime.utcnow().isoformat()}",
                context=session_data.context or {},
            )
            db.add(session)
            db.commit()
            db.refresh(session)
            logger.info(f"Created chat session: {session.id}")
            return session
        except Exception as e:
            logger.error(f"Error creating chat session: {str(e)}")
            raise
    
    @staticmethod
    async def get_session(db: Session, session_id: int, user_id: int) -> Optional[ChatSession]:
        """Get chat session by ID"""
        return db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id,
        ).first()
    
    @staticmethod
    async def get_user_sessions(
        db: Session,
        user_id: int,
        limit: int = 10,
        offset: int = 0,
    ) -> List[ChatSession]:
        """Get all sessions for a user"""
        return db.query(ChatSession).filter(
            ChatSession.user_id == user_id,
        ).order_by(
            ChatSession.created_at.desc()
        ).limit(limit).offset(offset).all()
    
    @staticmethod
    async def add_message(
        db: Session,
        session_id: int,
        message_data: MessageCreate,
    ) -> Message:
        """Add a message to a session"""
        try:
            message = Message(
                session_id=session_id,
                role=message_data.role,
                content=message_data.content,
                metadata=message_data.metadata or {},
            )
            db.add(message)
            db.commit()
            db.refresh(message)
            
            # Update session's updated_at
            session = db.query(ChatSession).get(session_id)
            if session:
                session.updated_at = datetime.utcnow()
                db.commit()
            
            logger.info(f"Added message to session: {session_id}")
            return message
        except Exception as e:
            logger.error(f"Error adding message: {str(e)}")
            raise
    
    @staticmethod
    async def get_session_messages(
        db: Session,
        session_id: int,
        limit: int = 50,
    ) -> List[Message]:
        """Get messages from a session"""
        return db.query(Message).filter(
            Message.session_id == session_id
        ).order_by(
            Message.created_at
        ).limit(limit).all()
    
    @staticmethod
    async def get_recent_context(
        db: Session,
        session_id: int,
        window_size: int = 10,
    ) -> List[Dict[str, str]]:
        """Get recent conversation context for prompt building"""
        messages = db.query(Message).filter(
            Message.session_id == session_id
        ).order_by(
            Message.created_at.desc()
        ).limit(window_size).all()
        
        # Reverse to get chronological order
        messages.reverse()
        
        return [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]
    
    @staticmethod
    async def delete_session(db: Session, session_id: int, user_id: int) -> bool:
        """Delete a chat session"""
        try:
            session = db.query(ChatSession).filter(
                ChatSession.id == session_id,
                ChatSession.user_id == user_id,
            ).first()
            
            if session:
                db.delete(session)
                db.commit()
                logger.info(f"Deleted chat session: {session_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting session: {str(e)}")
            raise
