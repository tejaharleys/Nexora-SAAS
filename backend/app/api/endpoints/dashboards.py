from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.database import get_db
from app.models.dashboard import Dashboard
from app.schemas.dashboard import DashboardCreate, DashboardResponse
# Assuming we have a get_current_user dependency that extracts user from JWT
# from app.api.deps import get_current_user

router = APIRouter()

# Mock user for now
async def get_current_user():
    class MockUser:
        id = "00000000-0000-0000-0000-000000000000"
        organization_id = "00000000-0000-0000-0000-000000000000"
    return MockUser()

@router.get("/", response_model=List[DashboardResponse])
async def list_dashboards(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    result = await db.execute(select(Dashboard).where(Dashboard.organization_id == current_user.organization_id))
    return result.scalars().all()

@router.post("/", response_model=DashboardResponse)
async def create_dashboard(
    dashboard_in: DashboardCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    dashboard = Dashboard(
        organization_id=current_user.organization_id,
        name=dashboard_in.name,
        layout=dashboard_in.layout,
        created_by=current_user.id
    )
    db.add(dashboard)
    await db.commit()
    await db.refresh(dashboard)
    return dashboard
