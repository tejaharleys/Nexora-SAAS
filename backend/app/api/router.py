from fastapi import APIRouter
from app.api.endpoints import auth, events, dashboards, csv_webhook, teams

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(dashboards.router, prefix="/dashboards", tags=["dashboards"])
api_router.include_router(csv_webhook.router, prefix="/ingest", tags=["ingest"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
