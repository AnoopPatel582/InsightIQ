"""
auth_service.py
---------------
Business logic for user authentication:
  - Look up a user by username.
  - Verify credentials and return the user.
  - Seed the default admin account on startup.

This module talks to the database but knows nothing about HTTP or JWT.
"""

from sqlalchemy.orm import Session

from app.models import User
from app.utils.security import hash_password, verify_password
from app.config import settings


def get_user_by_username(db: Session, username: str) -> User | None:
    """Fetch a User row by username, or return None if not found."""
    return db.query(User).filter(User.username == username).first()


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    """
    Verify username + password.

    Returns the User object on success, or None if credentials are wrong.
    """
    user = get_user_by_username(db, username)
    if user is None:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_default_admin(db: Session) -> None:
    """
    Create the admin account if it does not already exist.

    Called once at application startup so the app is usable immediately
    after a fresh database setup.
    """
    if get_user_by_username(db, settings.ADMIN_USERNAME) is None:
        admin = User(
            username=settings.ADMIN_USERNAME,
            hashed_password=hash_password(settings.ADMIN_PASSWORD),
        )
        db.add(admin)
        db.commit()
