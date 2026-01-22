# backend/app/core/config.py

from __future__ import annotations

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Absolute path to backend/.env
ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    DB_URL: str
    AI_KEY: str
    BASEBALL_UPSTREAM_URL: str = "https://api.hirefraction.com/api/test/baseball"

    app_name: str = Field(default="fraction-backend")
    cors_origins: list[str] = Field(default_factory=list)

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        extra="ignore",
        case_sensitive=False,
    )


settings = Settings()

