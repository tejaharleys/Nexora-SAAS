from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.organization import PlanType
from app.schemas.base import ORMBase

class OrganizationCreate(BaseModel):
    name: str

class OrganizationResponse(ORMBase):
    id: UUID
    name: str
    plan: PlanType
    created_at: datetime
    # Note: we explicitly don't return the api_key here unless requested specially
