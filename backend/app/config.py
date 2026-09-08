from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "SIH 2026 Airfare APIx"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    database_url: str | None = None
    database_url_unpooled: str | None = None
    serpapi_api_key: str | None = None
    serpapi_base_url: str = "https://serpapi.com/search.json"
    cors_origins: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=("backend/.env", "backend/.env.local", ".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
