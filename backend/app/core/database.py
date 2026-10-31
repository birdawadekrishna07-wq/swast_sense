import logging
from typing import Optional
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("swasthya_sense.db")

supabase_anon: Optional[Client] = None
supabase_admin: Optional[Client] = None

def get_supabase_client() -> Optional[Client]:
    """Returns the standard anonymous client for end-user authenticated queries."""
    global supabase_anon
    if supabase_anon is None:
        try:
            if settings.SUPABASE_URL and not settings.SUPABASE_URL.startswith("https://placeholder"):
                supabase_anon = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        except Exception as e:
            logger.warning(f"Supabase anon client initialization skipped or pending valid config: {e}")
    return supabase_anon

def get_supabase_admin() -> Optional[Client]:
    """Returns the privileged admin client for server-side role validation and approvals."""
    global supabase_admin
    if supabase_admin is None:
        try:
            if settings.SUPABASE_URL and not settings.SUPABASE_URL.startswith("https://placeholder"):
                supabase_admin = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        except Exception as e:
            logger.warning(f"Supabase admin client initialization skipped or pending valid config: {e}")
    return supabase_admin
