from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path

from app.api import auth, strategy, health
from app.core.database import engine, Base


# --------------------
# Load environment variables
# --------------------
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)


# --------------------
# FastAPI app
# --------------------
app = FastAPI(
    title="Strategy Backend",
    version="1.0.0",
)


# --------------------
# CORS (React / Vite)
# --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://frontend-green-five-44.vercel.app",
        "http://localhost:5173",   # local dev
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------
# Routers
# --------------------
app.include_router(auth.router)
app.include_router(strategy.router, prefix="/api")
app.include_router(health.router)


# --------------------
# Startup: create tables
# --------------------
@app.on_event("startup")
async def on_startup() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
