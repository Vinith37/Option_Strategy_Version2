from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_db
from app.api.auth import AsyncSession
from app.models.user import User
from sqlalchemy import select
from app.core.security import hash_password, verify_password
from pydantic import StringConstraints
from typing_extensions import Annotated

router = APIRouter()

from pydantic import BaseModel, EmailStr, constr

class Register(BaseModel):
    name: str
    email: EmailStr
    password: Annotated[str, StringConstraints(min_length=6, max_length=64)]

class Login(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
