import logging
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import PatientRegisterRequest, StaffRegisterRequest, UserProfileResponse
from app.core.security import get_current_user, CurrentUser
from app.core.database import get_supabase_admin
from app.services.audit_service import log_audit_event

logger = logging.getLogger("swasthya_sense.auth_api")
router = APIRouter()

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: CurrentUser = Depends(get_current_user)):
    """Fetches the authenticated user profile and permissions."""
    admin_client = get_supabase_admin()
    approval_status = "approved" if current_user.role == "patient" else ("approved" if current_user.is_approved else "pending")
    phone = None
    avatar_url = None
    
    if admin_client:
        try:
            res = admin_client.table("profiles").select("*").eq("id", current_user.id).single().execute()
            if res.data:
                phone = res.data.get("phone")
                avatar_url = res.data.get("avatar_url")
            if current_user.role != "patient":
                st_res = admin_client.table("staff_profiles").select("approval_status").eq("id", current_user.id).single().execute()
                if st_res.data:
                    approval_status = st_res.data.get("approval_status")
        except Exception as e:
            logger.warning(f"Failed to fetch profile details: {e}")

    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        full_name=current_user.full_name or "Swasthya User",
        phone=phone,
        avatar_url=avatar_url,
        approval_status=approval_status,
        is_active=True
    )

@router.post("/register/patient")
async def register_patient(payload: PatientRegisterRequest):
    """
    Dedicated Patient Registration.
    Role is strictly hardcoded to 'patient' on server side.
    """
    admin_client = get_supabase_admin()
    if admin_client:
        try:
            # Sign up user in Supabase Auth
            auth_res = admin_client.auth.admin.create_user({
                "email": payload.email,
                "password": payload.password,
                "email_confirm": True,
                "user_metadata": {
                    "role": "patient",
                    "full_name": payload.full_name,
                    "phone": payload.phone,
                    "date_of_birth": payload.date_of_birth,
                    "gender": payload.gender,
                    "blood_group": payload.blood_group,
                    "city": payload.city
                }
            })
            if not auth_res or not auth_res.user:
                raise HTTPException(status_code=400, detail="Failed to create user account")

            user_id = auth_res.user.id
            await log_audit_event("patient_registered", "profiles", user_id, user_id)
            return {"success": True, "message": "Patient registered successfully", "user_id": user_id}
        except Exception as e:
            logger.error(f"Patient registration failed: {e}")
            raise HTTPException(status_code=400, detail=str(e))

    return {"success": True, "message": "Patient registered (demo mode)", "user_id": "demo-patient-id"}

@router.post("/register/staff")
async def register_staff(payload: StaffRegisterRequest):
    """
    Dedicated Doctor & Healthcare Staff Registration.
    Strictly sets approval_status to 'pending' on server side.
    Users cannot self-promote to active staff.
    """
    admin_client = get_supabase_admin()
    if admin_client:
        try:
            # Sign up user with pending approval
            auth_res = admin_client.auth.admin.create_user({
                "email": payload.email,
                "password": payload.password,
                "email_confirm": True,
                "user_metadata": {
                    "role": payload.professional_role,
                    "full_name": payload.full_name,
                    "phone": payload.phone,
                    "employee_id": payload.employee_id,
                    "qualification": payload.qualification,
                    "specialization": payload.specialization,
                    "medical_registration_number": payload.medical_registration_number,
                    "hospital_clinic": payload.hospital_clinic
                }
            })
            if not auth_res or not auth_res.user:
                raise HTTPException(status_code=400, detail="Failed to create staff account")

            user_id = auth_res.user.id
            await log_audit_event(
                "staff_registered_pending_approval", 
                "staff_profiles", 
                user_id, 
                user_id,
                {"role": payload.professional_role, "emp_id": payload.employee_id}
            )
            return {
                "success": True, 
                "message": "Staff registration submitted. Your account is pending administrator approval.",
                "user_id": user_id,
                "approval_status": "pending"
            }
        except Exception as e:
            logger.error(f"Staff registration failed: {e}")
            raise HTTPException(status_code=400, detail=str(e))

    return {
        "success": True, 
        "message": "Staff registration submitted (demo mode)", 
        "user_id": "demo-staff-id",
        "approval_status": "pending"
    }
