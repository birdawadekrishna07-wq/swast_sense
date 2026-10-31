import logging
from typing import Optional, Dict, Any
from app.core.database import get_supabase_admin

logger = logging.getLogger("swasthya_sense.audit")

async def log_audit_event(
    action: str,
    entity_type: str,
    user_id: Optional[str] = None,
    entity_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
):
    """Securely logs clinical and administrative system activities to the audit_logs table."""
    try:
        admin_client = get_supabase_admin()
        if admin_client:
            payload = {
                "action": action,
                "entity_type": entity_type,
                "user_id": user_id,
                "entity_id": entity_id,
                "details": details or {},
                "ip_address": ip_address
            }
            admin_client.table("audit_logs").insert(payload).execute()
        else:
            logger.info(f"[AUDIT] user={user_id} action={action} entity={entity_type}:{entity_id} details={details}")
    except Exception as e:
        logger.error(f"Failed to record audit log: {e}")
