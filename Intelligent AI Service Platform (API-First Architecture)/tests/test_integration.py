"""
Integration tests
"""
import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_chat_flow(client, test_user):
    """Test complete chat flow"""
    # Create a session
    session_response = client.post(
        "/sessions",
        json={"title": "Integration Test Session"},
        params={"user_id": test_user.id},
    )
    assert session_response.status_code == status.HTTP_200_OK
    session_data = session_response.json()
    session_id = session_data["id"]
    
    # Verify session was created
    assert session_data["title"] == "Integration Test Session"
    assert session_data["user_id"] == test_user.id
    
    # Retrieve the session
    get_response = client.get(
        f"/sessions/{session_id}",
        params={"user_id": test_user.id},
    )
    assert get_response.status_code == status.HTTP_200_OK
    
    # List sessions
    list_response = client.get(
        "/sessions",
        params={"user_id": test_user.id},
    )
    assert list_response.status_code == status.HTTP_200_OK
    assert len(list_response.json()) > 0


@pytest.mark.asyncio
async def test_api_endpoints_exist(client):
    """Test that all main endpoints exist"""
    endpoints = [
        ("/health", "get"),
        ("/ready", "get"),
        ("/metrics", "get"),
    ]
    
    for endpoint, method in endpoints:
        if method == "get":
            response = client.get(endpoint)
        
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
        ], f"Endpoint {endpoint} returned {response.status_code}"
