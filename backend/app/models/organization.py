import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, UUID
from app.models.base import Base
import enum

class PlanType(str, enum.Enum):
    FREE = "FREE"
    PRO = "PRO"
    ENTERPRISE = "ENTERPRISE"

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, index=True)
    api_key = Column(String, unique=True, index=True, default=lambda: f"nx_{uuid.uuid4().hex}")
    plan = Column(Enum(PlanType), default=PlanType.FREE)
    created_at = Column(DateTime, default=datetime.utcnow)
