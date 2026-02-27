"""Application configuration module."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings loaded from environment variables."""

    database_url: str = "postgresql://username:password@localhost/masjid_food_scheduler"
    secret_key: str = "change_me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    cors_origins: list[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Return cached settings object."""

    return Settings()
