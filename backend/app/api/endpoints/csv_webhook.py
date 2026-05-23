from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File, Request
from typing import Optional, Dict, Any
from app.workers.tasks import process_event
import structlog
import time
import csv
import io
import uuid

logger = structlog.get_logger()
router = APIRouter()

async def verify_api_key(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    api_key = authorization.split(" ")[1]
    if not api_key.startswith("sk_"):
        raise HTTPException(status_code=401, detail="Invalid API Key format")
    return api_key

@router.post("/csv")
async def upload_csv(
    file: UploadFile = File(...),
    api_key: str = Depends(verify_api_key)
):
    """
    Ingest historical events via CSV upload.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    content = await file.read()
    csv_data = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(csv_data))
    
    queued_count = 0
    for row in reader:
        event_payload = {
            "event_name": row.get("event_name", "csv_import"),
            "user_id": row.get("user_id", None),
            "latency": int(row.get("latency", 0)) if row.get("latency") else None,
            "status": row.get("status", "ok"),
            "metadata": {"source": "csv_import", **row},
            "ingested_at": time.time()
        }
        process_event.apply_async(args=[event_payload])
        queued_count += 1
        
    return {"status": "success", "queued_events": queued_count}

@router.post("/webhook/stripe")
async def stripe_webhook(
    request: Request,
    api_key: str = Depends(verify_api_key)
):
    """
    Stripe Webhook Receiver
    """
    payload = await request.json()
    event_type = payload.get("type", "stripe_event")
    
    event_payload = {
        "event_name": f"stripe_{event_type}",
        "user_id": payload.get("data", {}).get("object", {}).get("customer"),
        "latency": None,
        "status": "ok",
        "metadata": payload,
        "ingested_at": time.time()
    }
    
    process_event.apply_async(args=[event_payload])
    return {"status": "received"}

@router.post("/webhook/shopify")
async def shopify_webhook(
    request: Request,
    x_shopify_topic: str = Header(...),
    api_key: str = Depends(verify_api_key)
):
    """
    Shopify Webhook Receiver
    """
    payload = await request.json()
    
    event_payload = {
        "event_name": f"shopify_{x_shopify_topic.replace('/', '_')}",
        "user_id": str(payload.get("customer", {}).get("id")) if payload.get("customer") else None,
        "latency": None,
        "status": "ok",
        "metadata": payload,
        "ingested_at": time.time()
    }
    
    process_event.apply_async(args=[event_payload])
    return {"status": "received"}
