from fastapi import FastAPI
from app.api import auth, strategy, health
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="Strategy Backend")

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(strategy.router, prefix="/strategies", tags=["Strategies"])
app.include_router(health.router, tags=["Health"])

from app.core.database import engine, Base

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
