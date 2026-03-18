#!/usr/bin/env python
"""
Utility scripts for database management
Crafted by CaptainCode
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.database import init_db, drop_db


def init_database():
    """Initialize database with all tables"""
    print("Initializing database...")
    try:
        init_db()
        print("✓ Database initialized successfully")
    except Exception as e:
        print(f"✗ Error initializing database: {str(e)}")
        sys.exit(1)


def reset_database():
    """Drop all tables and reinitialize"""
    print("WARNING: This will delete all data!")
    confirm = input("Type 'yes' to continue: ")
    
    if confirm != "yes":
        print("Cancelled")
        return
    
    print("Dropping database...")
    try:
        drop_db()
        print("✓ Database dropped")
        
        print("Reinitializing database...")
        init_db()
        print("✓ Database reinitialized successfully")
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        sys.exit(1)


def create_test_user():
    """Create a test user in the database"""
    from src.core.database import SessionLocal
    from src.services import UserService
    from src.schemas import UserCreate
    
    db = SessionLocal()
    
    try:
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="password123",
            full_name="Test User",
        )
        
        user = UserService.create_user(db, user_data)
        print(f"✓ Test user created: {user.username} (ID: {user.id})")
        print(f"  Email: {user.email}")
    except Exception as e:
        print(f"✗ Error creating test user: {str(e)}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Database management utilities")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    subparsers.add_parser("init", help="Initialize database")
    subparsers.add_parser("reset", help="Drop and reinitialize database")
    subparsers.add_parser("test-user", help="Create test user")
    
    args = parser.parse_args()
    
    if args.command == "init":
        init_database()
    elif args.command == "reset":
        reset_database()
    elif args.command == "test-user":
        create_test_user()
    else:
        parser.print_help()
