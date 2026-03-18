"""
Session API endpoints
Crafted by CaptainCode
"""
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.schemas import ChatSessionCreate, ChatSessionUpdate, ChatSessionResponse
from src.services import ChatService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("", response_model=ChatSessionResponse)
async def create_session(
    user_id: int,
    session_data: ChatSessionCreate,
    db: Session = Depends(get_db),
):
    """Create a new chat session"""
    try:
        session = await ChatService.create_session(db, user_id, session_data)
        return ChatSessionResponse.model_validate(session)
    except Exception as e:
        logger.error(f"Error creating session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/{session_id}", response_model=ChatSessionResponse)
async def get_session(
    session_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    """Get a specific chat session"""
    session = await ChatService.get_session(db, session_id, user_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    return ChatSessionResponse.model_validate(session)


@router.get("", response_model=List[ChatSessionResponse])
async def list_user_sessions(
    user_id: int,
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """List all sessions for a user"""
    sessions = await ChatService.get_user_sessions(db, user_id, limit, offset)
    return [ChatSessionResponse.model_validate(s) for s in sessions]


@router.put("/{session_id}", response_model=ChatSessionResponse)
async def update_session(
    session_id: int,
    user_id: int,
    update_data: ChatSessionUpdate,
    db: Session = Depends(get_db),
):
    """Update a chat session"""
    try:
        session = await ChatService.get_session(db, session_id, user_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        
        # Update fields
        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(session, field, value)
        
        db.commit()
        db.refresh(session)
        return ChatSessionResponse.model_validate(session)
    except Exception as e:
        logger.error(f"Error updating session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    """Delete a chat session"""
    success = await ChatService.delete_session(db, session_id, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
