from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Request
from fastapi.responses import RedirectResponse
from app.core.oauth import oauth
import os
from app.core.security import create_access_token

from app.core.database import get_db, AsyncSessionLocal
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.user import Register, Login, UserResponse


router = APIRouter(prefix="/auth", tags=["Auth"])


# -----------------------------
# Get current logged-in user
# -----------------------------
@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
    )


# -----------------------------
# Register
# -----------------------------
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

    return UserResponse(
        id=str(new_user.id),
        email=new_user.email,
        name=new_user.name,
    )


# -----------------------------
# Login
# -----------------------------
@router.post("/login")
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

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
        },
    }

@router.get("/google")
async def login_google(request: Request):
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    email = user_info["email"]
    name = user_info.get("name")

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()

        if not user:
            user = User(
                email=email,
                name=name,
                hashed_password=""  # OAuth users don't need password
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

    jwt_token = create_access_token({"sub": str(user.id)})

    frontend_url = os.getenv("FRONTEND_URL")
    return RedirectResponse(
        url=f"{frontend_url}/oauth-success?token={jwt_token}"
    )
