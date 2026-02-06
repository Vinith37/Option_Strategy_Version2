from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncEngine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL = os.getenv("DATABASE_URL")

engine: AsyncEngine | None = None
AsyncSessionLocal: sessionmaker | None = None

Base = declarative_base()

def init_engine():
    global engine, AsyncSessionLocal

    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set")

    engine = create_async_engine(
        DATABASE_URL,
        pool_pre_ping=True,
    )

    AsyncSessionLocal = sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

async def get_db():
    if AsyncSessionLocal is None:
        raise RuntimeError("Database not initialized")

    async with AsyncSessionLocal() as session:
        yield session
