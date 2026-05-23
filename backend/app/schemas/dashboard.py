from pydantic import BaseModel
from uuid import UUID
from typing import Dict, Any, List, Optional
from app.schemas.base import ORMBase

class WidgetCreate(BaseModel):
    widget_type: str
    query_config: Dict[str, Any]
    position: Dict[str, Any]

class WidgetResponse(ORMBase, WidgetCreate):
    id: UUID
    dashboard_id: UUID

class DashboardCreate(BaseModel):
    name: str
    layout: Optional[Dict[str, Any]] = {}

class DashboardResponse(ORMBase, DashboardCreate):
    id: UUID
    organization_id: UUID
    created_by: UUID
    widgets: List[WidgetResponse] = []
