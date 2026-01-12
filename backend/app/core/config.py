from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    OPENAI_API_KEY: str | None = None
    BASEBALL_UPSTREAM_URL: str = "https://api.hirefraction.com/api/test/baseball"

    class Config:
        env_file = ".env"

settings = Settings()
