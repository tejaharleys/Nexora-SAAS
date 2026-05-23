from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from app.models.user import UserRole
from app.schemas.base import ORMBase

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(ORMBase, UserBase):
    id: UUID
    role: UserRole
    organization_id: UUID
    created_at: datetime
