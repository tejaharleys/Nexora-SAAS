from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Dict, Any, Optional
from app.schemas.base import ORMBase

class EventCreate(BaseModel):
    event_name: str
    properties: Optional[Dict[str, Any]] = {}
    timestamp: Optional[datetime] = None

class EventResponse(ORMBase):
    id: UUID
    organization_id: UUID
    event_name: str
    properties: Dict[str, Any]
    timestamp: datetime
    processed: bool
