"""
Unit tests for chat endpoints
"""
import pytest
from fastapi import status
from src.schemas import ChatSessionCreate, MessageCreate


@pytest.mark.asyncio
async def test_create_session(client, test_user):
    """Test session creation"""
    response = client.post(
        "/sessions",
        json={"title": "Test Session"},
        params={"user_id": test_user.id},
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Test Session"
    assert data["user_id"] == test_user.id


@pytest.mark.asyncio
async def test_get_sessions(client, test_user):
    """Test getting user sessions"""
    # Create session first
    create_response = client.post(
        "/sessions",
        json={"title": "Test Session"},
        params={"user_id": test_user.id},
    )
    
    # Get sessions
    response = client.get(
        "/sessions",
        params={"user_id": test_user.id},
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) > 0


@pytest.mark.asyncio
async def test_delete_session(client, test_user, db):
    """Test session deletion"""
    from src.services import ChatService
    
    # Create session
    session_data = ChatSessionCreate(title="Delete Test")
    session = await ChatService.create_session(db, test_user.id, session_data)
    
    # Delete it
    response = client.delete(
        f"/sessions/{session.id}",
        params={"user_id": test_user.id},
    )
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
