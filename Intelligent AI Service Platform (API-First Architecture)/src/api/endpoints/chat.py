"""
Chat API endpoints
Crafted by CaptainCode
"""
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.schemas import ChatRequest, ChatResponse, MessageCreate
from src.services import (
    get_ai_service,
    ChatService,
    get_vector_db_service,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["AI Chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
):
    """
    AI Chat endpoint - generate conversational response
    
    Args:
        request: Chat request with message and context
        db: Database session
        
    Returns:
        ChatResponse with AI-generated response
    """
    try:
        ai_service = get_ai_service()
        vector_service = get_vector_db_service()
        
        # Get or create chat session
        session = None
        if request.session_id:
            session = await ChatService.get_session(db, request.session_id, request.user_id)
        
        if not session:
            from src.schemas import ChatSessionCreate
            session_data = ChatSessionCreate(
                title="New Chat",
                context=request.context,
            )
            session = await ChatService.create_session(db, request.user_id, session_data)
        
        # Get conversation context
        context = await ChatService.get_recent_context(db, session.id)
        
        # Generate system prompt
        system_prompt = """You are a helpful, intelligent AI assistant. 
        Provide concise, accurate, and actionable responses.
        Always maintain context from the conversation history."""
        
        # Generate AI response
        ai_response = await ai_service.generate_response(
            message=request.message,
            system_prompt=system_prompt,
            history=context,
        )
        
        # Save user message
        user_msg_data = MessageCreate(role="user", content=request.message)
        user_msg = await ChatService.add_message(db, session.id, user_msg_data)
        
        # Save assistant message
        assistant_msg_data = MessageCreate(
            role="assistant",
            content=ai_response["response"],
            metadata={"tokens_used": ai_response["usage"]["total_tokens"]},
        )
        assistant_msg = await ChatService.add_message(db, session.id, assistant_msg_data)
        
        # Generate embedding for semantic search
        try:
            embedding = await ai_service.generate_embedding(request.message)
            # Store in vector DB
            await vector_service.upsert_vector(
                vector_id=f"msg_{user_msg.id}",
                embedding=embedding,
                metadata={
                    "session_id": session.id,
                    "user_id": request.user_id,
                    "role": "user",
                },
            )
        except Exception as e:
            logger.warning(f"Failed to generate embedding: {str(e)}")
        
        return ChatResponse(
            response=ai_response["response"],
            confidence=ai_response["confidence"],
            session_id=session.id,
            message_id=assistant_msg.id,
            metadata=ai_response["usage"],
        )
    
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
