import os
from celery import Celery
from app.core.config import settings

# Initialize Celery
celery_app = Celery(
    "nexora_workers",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.workers.tasks"]
)

# Optional configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,
)

# Celery Beat Schedule (Cron Jobs)
celery_app.conf.beat_schedule = {
    "evaluate-alerts-every-minute": {
        "task": "app.workers.tasks.evaluate_alerts",
        "schedule": 60.0,  # Run every 60 seconds
    },
}
