from fastapi import Depends, HTTPException, status, Header
from typing import Optional, List, Dict, Any
from app.core.database import get_supabase_admin, get_supabase_client

class CurrentUser:
    def __init__(self, id: str, email: str, role: str, full_name: Optional[str] = None, is_approved: bool = True):
        self.id = id
        self.email = email
        self.role = role
        self.full_name = full_name
        self.is_approved = is_approved

async def get_current_user(authorization: Optional[str] = Header(None)) -> CurrentUser:
    """
    Validates Supabase JWT or bearer token and retrieves authenticated user profile and role.
    Supports development fallback when testing locally.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization token format",
        )
    
    token = parts[1]
    
    # Check for dev / test mock tokens
    if token.startswith("dev-test-token-"):
        role = token.replace("dev-test-token-", "")
        return CurrentUser(
            id=f"test-id-{role}",
            email=f"{role}@swasthya.internal",
            role=role,
            full_name=f"Verified {role.capitalize()}",
            is_approved=True
        )

    admin_client = get_supabase_admin()
    if admin_client:
        try:
            # Verify user token via Supabase Auth
            user_response = admin_client.auth.get_user(token)
            if not user_response or not user_response.user:
                raise HTTPException(status_code=401, detail="Invalid session token")
            
            user_id = user_response.user.id
            email = user_response.user.email
            
            # Fetch base profile role
            profile_res = admin_client.table("profiles").select("*").eq("id", user_id).single().execute()
            if not profile_res.data:
                raise HTTPException(status_code=403, detail="Profile record not found")
            
            profile = profile_res.data
            role = profile.get("role", "patient")
            full_name = profile.get("full_name", "")
            
            # If staff, verify approval status
            is_approved = True
            if role != "patient":
                staff_res = admin_client.table("staff_profiles").select("approval_status").eq("id", user_id).single().execute()
                if staff_res.data:
                    approval_status = staff_res.data.get("approval_status")
                    if approval_status != "approved":
                        is_approved = False
            
            return CurrentUser(
                id=user_id,
                email=email,
                role=role,
                full_name=full_name,
                is_approved=is_approved
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
            
    # Default fallback when supabase is not connected yet during testing
    return CurrentUser(
        id="demo-user-id",
        email="demo@swasthya-sense.health",
        role="patient",
        full_name="Demo User",
        is_approved=True
    )

def require_roles(allowed_roles: List[str]):
    """FastAPI dependency to enforce role-based access control (RBAC)."""
    async def role_checker(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied for role '{user.role}'. Required: {allowed_roles}"
            )
        if user.role != "patient" and not user.is_approved:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Staff account is pending administrator approval."
            )
        return user
    return role_checker
