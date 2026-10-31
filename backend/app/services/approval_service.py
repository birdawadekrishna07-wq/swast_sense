import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import HTTPException
from app.core.database import get_supabase_admin
from app.services.audit_service import log_audit_event

logger = logging.getLogger("swasthya_sense.approvals")

class ApprovalService:
    @staticmethod
    async def process_staff_approval(
        staff_id: str, 
        action: str, 
        admin_id: str, 
        remarks: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Server-side approval workflow.
        Never trust a role submitted from frontend registration.
        """
        new_status = {
            "approve": "approved",
            "reject": "rejected",
            "suspend": "suspended"
        }.get(action)
        
        if not new_status:
            raise HTTPException(status_code=400, detail="Invalid action")
            
        admin_client = get_supabase_admin()
        if admin_client:
            # 1. Fetch current staff profile
            current = admin_client.table("staff_profiles").select("*").eq("id", staff_id).single().execute()
            if not current.data:
                raise HTTPException(status_code=404, detail="Staff member record not found")
                
            prev_status = current.data.get("approval_status")
            
            # 2. Update staff profile
            now_iso = datetime.now(timezone.utc).isoformat()
            update_data = {
                "approval_status": new_status,
                "approved_by": admin_id if new_status == "approved" else None,
                "approved_at": now_iso if new_status == "approved" else None,
                "rejection_reason": remarks if new_status in ("rejected", "suspended") else None,
                "updated_at": now_iso
            }
            admin_client.table("staff_profiles").update(update_data).eq("id", staff_id).execute()
            
            # 3. Insert into staff_approvals history table
            admin_client.table("staff_approvals").insert({
                "staff_id": staff_id,
                "reviewer_id": admin_id,
                "previous_status": prev_status,
                "new_status": new_status,
                "remarks": remarks
            }).execute()

            # 4. Notify staff user
            admin_client.table("notifications").insert({
                "user_id": staff_id,
                "title": f"Staff Registration {new_status.capitalize()}",
                "message": f"Your professional account status is now: {new_status.upper()}. {remarks or ''}",
                "type": "approval"
            }).execute()

            await log_audit_event(
                action=f"staff_{action}",
                entity_type="staff_profile",
                user_id=admin_id,
                entity_id=staff_id,
                details={"prev_status": prev_status, "new_status": new_status, "remarks": remarks}
            )

            return {"success": True, "staff_id": staff_id, "status": new_status}
            
        return {"success": True, "staff_id": staff_id, "status": new_status, "mode": "mock"}

approval_service = ApprovalService()
