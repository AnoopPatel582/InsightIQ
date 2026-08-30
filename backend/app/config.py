"""
config.py
---------
Loads environment variables from backend/.env (or the system environment)
and exposes them as a single Settings object used throughout the application.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend/ directory so the app works when run from
# either the project root or the backend/ directory.
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)


class Settings:
    """Central configuration object. Add new settings here."""

    # MySQL connection string — override via DATABASE_URL in .env
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://root:@localhost:3306/insightiq",
    )

    # JWT secret key — must be set to a long random value in production
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-me")

    # JWT algorithm (HS256 is standard for symmetric secrets)
    ALGORITHM: str = "HS256"

    # Minutes until an access token expires
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )

    # Seeded admin credentials — used only to create the first user on startup
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "insightiq2026")


# Export a single shared instance
settings = Settings()
