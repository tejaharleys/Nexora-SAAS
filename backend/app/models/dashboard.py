import uuid
from sqlalchemy import Column, String, UUID, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.models.base import Base

class Dashboard(Base):
    __tablename__ = "dashboards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), index=True)
    name = Column(String, nullable=False)
    layout = Column(JSONB, default=dict)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    widgets = relationship("Widget", back_populates="dashboard")

class Widget(Base):
    __tablename__ = "widgets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    dashboard_id = Column(UUID(as_uuid=True), ForeignKey("dashboards.id"), index=True)
    widget_type = Column(String, nullable=False)
    query_config = Column(JSONB, default=dict)
    position = Column(JSONB, default=dict)

    dashboard = relationship("Dashboard", back_populates="widgets")
