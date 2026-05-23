import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, UUID, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from app.models.base import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), index=True)
    event_name = Column(String, index=True, nullable=False)
    properties = Column(JSONB, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    processed = Column(Boolean, default=False)
