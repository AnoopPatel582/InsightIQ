"""
auth.py  (router)
-----------------
HTTP endpoints for authentication:
  POST /api/auth/login   — validate credentials, return JWT
  GET  /api/auth/me      — return current user info (protected)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import LoginRequest, Token, UserOut
from app.services.auth_service import authenticate_user, get_user_by_username
from app.utils.security import create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

# OAuth2PasswordBearer tells FastAPI that tokens come in the
# Authorization: Bearer <token> header.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ---------------------------------------------------------------------------
# Shared dependency — extract + verify the current user from a JWT
# ---------------------------------------------------------------------------
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    FastAPI dependency that validates the Bearer token and returns the User.

    Raises HTTP 401 if the token is missing, expired, or invalid.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    username = decode_access_token(token)
    if username is None:
        raise credentials_exception
    user = get_user_by_username(db, username)
    if user is None:
        raise credentials_exception
    return user


# ---------------------------------------------------------------------------
# POST /api/auth/login
# ---------------------------------------------------------------------------
@router.post(
    "/login",
    response_model=Token,
    summary="Login and receive a JWT",
)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Accepts JSON with `username` and `password`.
    Returns a JWT `access_token` on success, or HTTP 401 on failure.
    """
    user = authenticate_user(db, payload.username, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user.username})
    return Token(access_token=token)


# ---------------------------------------------------------------------------
# GET /api/auth/me
# ---------------------------------------------------------------------------
@router.get(
    "/me",
    response_model=UserOut,
    summary="Return the current authenticated user",
)
def me(current_user=Depends(get_current_user)):
    """Protected endpoint — returns username of the logged-in user."""
    return current_user
