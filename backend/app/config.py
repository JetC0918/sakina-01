"""
Application configuration using Pydantic Settings.
Loads environment variables from .env file.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Supabase
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str

    # Database (Supabase PostgreSQL)
    DATABASE_URL: str

    # Gemini AI
    GEMINI_API_KEY: str

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ALLOWED_ORIGINS: Optional[str] = None

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()


settings = get_settings()
