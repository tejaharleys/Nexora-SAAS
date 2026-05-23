from fastapi import APIRouter, Depends, HTTPException, Header, Request
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.workers.tasks import process_event
import structlog
import time

logger = structlog.get_logger()
router = APIRouter()

# Pydantic v2 Schema for strict validation
class EventIngestSchema(BaseModel):
    event_name: str = Field(..., description="Name of the event (e.g., user_login)")
    user_id: Optional[str] = Field(None, description="ID of the user who triggered the event")
    latency: Optional[int] = Field(None, description="Latency in milliseconds")
    status: Optional[str] = Field("ok", description="Status of the event (e.g., ok, error)")
    dashboard: Optional[str] = Field(None, description="Dashboard identifier for multi-tenancy")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional properties")

async def verify_api_key(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    api_key = authorization.split(" ")[1]
    
    # In production, query the DB (or Redis cache) to validate the API key
    if not api_key.startswith("sk_"):
        raise HTTPException(status_code=401, detail="Invalid API Key format")
    
    return api_key

@router.post("/", status_code=202)
async def ingest_event(
    event_in: EventIngestSchema,
    request: Request,
    api_key: str = Depends(verify_api_key)
):
    """
    Ingest a new event.
    The event is validated via Pydantic and passed to a Celery background worker for async processing.
    """
    event_payload = event_in.model_dump()
    event_payload["source_ip"] = request.client.host
    event_payload["ingested_at"] = time.time()
    
    logger.info("Received event for ingestion", event=event_payload["event_name"], api_key=api_key[:8])

    # Push to Celery queue (Async processing)
    # process_event.delay(event_payload)
    task = process_event.apply_async(args=[event_payload])
    
    return {
        "status": "queued",
        "task_id": task.id,
        "message": "Event successfully queued for processing"
    }
