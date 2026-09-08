from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings
from app.db.urls import async_database_url

settings = get_settings()


engine = (
    create_async_engine(async_database_url(settings.database_url), pool_pre_ping=True)
    if settings.database_url
    else None
)
SessionFactory = async_sessionmaker(engine, expire_on_commit=False) if engine else None


async def get_session() -> AsyncGenerator[AsyncSession | None, None]:
    if SessionFactory is None:
        yield None
        return

    async with SessionFactory() as session:
        yield session
