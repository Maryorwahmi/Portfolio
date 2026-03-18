"""
Unit tests for user service
"""
import pytest
from src.schemas import UserCreate, UserUpdate
from src.services import UserService


@pytest.mark.asyncio
async def test_create_user(db):
    """Test user creation"""
    user_data = UserCreate(
        username="newuser",
        email="newuser@example.com",
        password="password123",
        full_name="New User",
    )
    
    user = await UserService.create_user(db, user_data)
    
    assert user.username == "newuser"
    assert user.email == "newuser@example.com"
    assert user.full_name == "New User"
    assert user.is_active is True


@pytest.mark.asyncio
async def test_get_user(db, test_user):
    """Test get user"""
    user = await UserService.get_user(db, test_user.id)
    
    assert user is not None
    assert user.id == test_user.id
    assert user.username == "testuser"


@pytest.mark.asyncio
async def test_get_user_by_email(db, test_user):
    """Test get user by email"""
    user = await UserService.get_user_by_email(db, "test@example.com")
    
    assert user is not None
    assert user.email == "test@example.com"


@pytest.mark.asyncio
async def test_update_user(db, test_user):
    """Test user update"""
    update_data = UserUpdate(
        full_name="Updated Name",
        preferences={"theme": "dark"},
    )
    
    user = await UserService.update_user(db, test_user.id, update_data)
    
    assert user.full_name == "Updated Name"
    assert user.preferences["theme"] == "dark"


@pytest.mark.asyncio
async def test_password_hashing():
    """Test password hashing"""
    password = "mysecurepassword"
    hashed = UserService.hash_password(password)
    
    assert hashed != password
    assert UserService.verify_password(password, hashed) is True
    assert UserService.verify_password("wrongpassword", hashed) is False
