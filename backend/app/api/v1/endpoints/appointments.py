from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from app.core.security import get_current_user, CurrentUser, require_roles
from app.services.appointment_service import appointment_service
from app.core.database import get_supabase_admin
from app.services.audit_service import log_audit_event

router = APIRouter()

@router.post("", response_model=dict)
async def book_appointment(
    payload: AppointmentCreate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Book a new medical appointment with double-booking prevention."""
    patient_id = current_user.id
    res = await appointment_service.create_appointment(payload.model_dump(), patient_id)
    return {"success": True, "appointment": res}

@router.get("", response_model=List[dict])
async def list_appointments(
    current_user: CurrentUser = Depends(get_current_user),
    status: Optional[str] = Query(None)
):
    """Retrieve appointments for the authenticated patient or doctor."""
    admin_client = get_supabase_admin()
    if admin_client:
        query = admin_client.table("appointments").select("*, doctor:doctor_id(full_name), patient:patient_id(full_name), department:department_id(name)")
        if current_user.role == "patient":
            query = query.eq("patient_id", current_user.id)
        elif current_user.role == "doctor":
            query = query.eq("doctor_id", current_user.id)
        elif current_user.role in ("receptionist", "admin"):
            pass # can view all
        else:
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        if status:
            query = query.eq("status", status)
            
        res = query.order("appointment_date", desc=True).execute()
        return res.data or []

    # Demo response
    return [{
        "id": "apt-demo-1",
        "patient_id": current_user.id,
        "doctor_id": "doc-demo-1",
        "appointment_date": "2026-11-05",
        "start_time": "10:00:00",
        "end_time": "10:30:00",
        "appointment_type": "in_person",
        "status": "confirmed",
        "reason": "Quarterly cardiovascular checkup",
        "doctor": {"full_name": "Dr. Ananya Sharma (Cardiologist)"},
        "patient": {"full_name": current_user.full_name or "Rahul Deshmukh"},
        "department": {"name": "Cardiology"}
    }]

@router.patch("/{appointment_id}")
async def update_appointment(
    appointment_id: str,
    payload: AppointmentUpdate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Update appointment status (confirm, cancel, reschedule, complete)."""
    admin_client = get_supabase_admin()
    if admin_client:
        update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
        res = admin_client.table("appointments").update(update_data).eq("id", appointment_id).execute()
        await log_audit_event("appointment_updated", "appointments", current_user.id, appointment_id, update_data)
        return {"success": True, "updated": res.data}

    return {"success": True, "appointment_id": appointment_id, "updated": payload.model_dump()}
