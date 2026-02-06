from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from urllib.parse import urlparse
import os

from app.api import auth, strategy, health
from app.core.database import engine, Base, init_engine


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
allowed_origins = [
    "https://frontend-green-five-44.vercel.app",
    "http://localhost:5173",   # local dev
    "http://127.0.0.1:5173",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


# --------------------
# Root route (health)
# --------------------
@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "Strategy Backend",
    }


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
async def on_startup():
    init_engine()
