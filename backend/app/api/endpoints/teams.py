from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum
import uuid

router = APIRouter()

class RoleEnum(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    ANALYST = "analyst"
    VIEWER = "viewer"

class InviteUserSchema(BaseModel):
    email: EmailStr
    role: RoleEnum

class UserRoleSchema(BaseModel):
    user_id: str
    email: str
    role: RoleEnum

# Mock database dictionary for demonstration
team_db = {}

# Dependency to check role hierarchy
def require_role(allowed_roles: List[RoleEnum]):
    async def role_checker(authorization: Optional[str] = Header(None)):
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
        
        token = authorization.split(" ")[1]
        
        # In a real app, verify the JWT token and extract the user's role and organization
        # For demonstration, we assume token == "admin_token"
        user_role = RoleEnum.ADMIN if token == "admin_token" else RoleEnum.VIEWER
        
        if user_role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        return {"user_id": "usr_123", "role": user_role, "org_id": "org_1"}
    
    return role_checker

@router.post("/invite")
async def invite_team_member(
    invite_data: InviteUserSchema,
    current_user: dict = Depends(require_role([RoleEnum.OWNER, RoleEnum.ADMIN]))
):
    """
    Invite a new team member. Requires Owner or Admin privileges.
    """
    invite_id = str(uuid.uuid4())
    org_id = current_user["org_id"]
    
    # Store invite in DB
    if org_id not in team_db:
        team_db[org_id] = []
        
    team_db[org_id].append({
        "invite_id": invite_id,
        "email": invite_data.email,
        "role": invite_data.role,
        "status": "pending"
    })
    
    # Trigger Celery task to send invite email
    # send_invite_email.delay(invite_data.email, invite_id)
    
    return {"status": "success", "message": f"Invite sent to {invite_data.email}"}

@router.get("/members", response_model=List[UserRoleSchema])
async def list_team_members(
    current_user: dict = Depends(require_role([RoleEnum.OWNER, RoleEnum.ADMIN, RoleEnum.ANALYST, RoleEnum.VIEWER]))
):
    """
    List all team members in the organization.
    """
    org_id = current_user["org_id"]
    # Return mock data
    return [
        {"user_id": "usr_1", "email": "owner@company.com", "role": RoleEnum.OWNER},
        {"user_id": "usr_2", "email": "analyst@company.com", "role": RoleEnum.ANALYST}
    ]
