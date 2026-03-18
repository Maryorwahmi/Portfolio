"""
User Service for user management
Crafted by CaptainCode
"""
import logging
from typing import Optional
from sqlalchemy.orm import Session
from src.models import User
from src.schemas import UserCreate, UserUpdate
from passlib.context import CryptContext

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    """Service for user management"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    async def create_user(
        db: Session,
        user_data: UserCreate,
    ) -> User:
        """Create a new user"""
        try:
            # Check if user exists
            existing = db.query(User).filter(
                (User.email == user_data.email) | 
                (User.username == user_data.username)
            ).first()
            
            if existing:
                raise ValueError("User already exists")
            
            user = User(
                username=user_data.username,
                email=user_data.email,
                full_name=user_data.full_name,
                hashed_password=UserService.hash_password(user_data.password),
                preferences=user_data.preferences or {},
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Created user: {user.id}")
            return user
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating user: {str(e)}")
            raise
    
    @staticmethod
    async def get_user(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    async def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    async def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username"""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    async def update_user(
        db: Session,
        user_id: int,
        user_data: UserUpdate,
    ) -> Optional[User]:
        """Update user"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return None
            
            update_data = user_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(user, field, value)
            
            db.commit()
            db.refresh(user)
            logger.info(f"Updated user: {user_id}")
            return user
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating user: {str(e)}")
            raise
    
    @staticmethod
    async def delete_user(db: Session, user_id: int) -> bool:
        """Delete user"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                db.delete(user)
                db.commit()
                logger.info(f"Deleted user: {user_id}")
                return True
            return False
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting user: {str(e)}")
            raise
