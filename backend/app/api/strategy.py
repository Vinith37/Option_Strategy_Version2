from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.strategy import Strategy
from app.models.user import User
from app.schemas.strategy import StrategyCreate, StrategyResponse

router = APIRouter()

@router.post("/strategies", response_model=StrategyResponse, status_code=status.HTTP_201_CREATED)
async def create_strategy(
    strategy: StrategyCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    
    new_strategy = Strategy(
        user_id=current_user.id,
        name=strategy.name,
        strategy_type=strategy.strategy_type,
        entry_date=datetime.fromisoformat(strategy.entry_date).date(),
        expiry_date=datetime.fromisoformat(strategy.expiry_date).date(),
        parameters=strategy.parameters or {},
        custom_legs=strategy.custom_legs or [],
        notes=strategy.notes,
        status="current",
        config={
            "parameters": strategy.parameters or {},
            "custom_legs": strategy.custom_legs or [],
        },
    )

    db.add(new_strategy)
    await db.commit()
    await db.refresh(new_strategy)

    return new_strategy

@router.get("/strategies", response_model=list[StrategyResponse])
async def list_strategies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Strategy).where(Strategy.user_id == current_user.id)
    )
    return result.scalars().all()

@router.delete("/strategies/{strategy_id}", status_code=204)
async def delete_strategy(
    strategy_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Strategy).where(
            Strategy.id == strategy_id,
            Strategy.user_id == current_user.id
        )
    )
    strategy = result.scalar_one_or_none()

    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    await db.delete(strategy)
    await db.commit()

    return None

@router.patch("/strategies/{strategy_id}", response_model=StrategyResponse)
async def exit_strategy(
    strategy_id: UUID,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Strategy).where(
            Strategy.id == strategy_id,
            Strategy.user_id == current_user.id
        )
    )
    strategy = result.scalar_one_or_none()

    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    # ---- UPDATE FIELDS ----
    strategy.status = payload.get("status", strategy.status)

    if "exit_date" in payload:
        strategy.exit_date = date.fromisoformat(payload["exit_date"])

    if "actual_profit" in payload:
        strategy.actual_profit = Decimal(str(payload["actual_profit"]))

    if "custom_legs" in payload:
        strategy.custom_legs = payload["custom_legs"]

    if "historical_snapshot" in payload:
        strategy.historical_snapshot = payload["historical_snapshot"]

    await db.commit()
    await db.refresh(strategy)

    return strategy
