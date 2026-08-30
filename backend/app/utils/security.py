"""
security.py
-----------
Low-level security utilities:
  - Password hashing and verification using bcrypt (via passlib).
  - JWT creation and decoding using python-jose.

Nothing in this module knows about the database or HTTP layer.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------
# CryptContext wraps bcrypt so we can change the algorithm later without
# touching every call site.
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Return the bcrypt hash of a plain-text password."""
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if plain_password matches the stored hash."""
    return _pwd_context.verify(plain_password, hashed_password)


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed JWT.

    Args:
        data: Claims to embed (typically {"sub": username}).
        expires_delta: Optional custom expiry; defaults to settings value.

    Returns:
        Encoded JWT string.
    """
    payload = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload["exp"] = expire
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[str]:
    """
    Decode a JWT and return the username stored in the 'sub' claim.

    Returns None if the token is invalid or expired.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: Optional[str] = payload.get("sub")
        return username
    except JWTError:
        return None
