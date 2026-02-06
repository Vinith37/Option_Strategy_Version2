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
frontend_url = os.getenv("FRONTEND_URL", "").strip()
allowed_origins = [
    "http://localhost:5173",   # local dev
    "http://127.0.0.1:5173",
]

if frontend_url:
    parsed = urlparse(frontend_url)
    if parsed.scheme and parsed.netloc:
        allowed_origins.append(f"{parsed.scheme}://{parsed.netloc}")
    else:
        allowed_origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
