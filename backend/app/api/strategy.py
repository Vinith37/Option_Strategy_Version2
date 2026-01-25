from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()

@router.post("/")
async def save_strategy(payload: dict, db: AsyncSession = Depends(get_db)):
    # save JSON strategy
    return {"status": "saved"}

@router.get("/")
async def list_strategies():
    return []
