from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.user import User
from app.core.security import hash_password, verify_password

from pydantic import BaseModel, EmailStr, Field


router = APIRouter(prefix="/auth", tags=["Auth"])


# ----------------------
# Pydantic Schemas
# ----------------------

class Register(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=64)


class Login(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


# ----------------------
# Routes
# ----------------------

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: Register,
    db: AsyncSession = Depends(get_db),
):
    # Check if user exists
    result = await db.execute(
        select(User).where(User.email == payload.email)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists",
        )

    # Create user
    new_user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


@router.post("/login", response_model=UserResponse)
async def login(
    payload: Login,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.email == payload.email)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password",
        )

    return user
