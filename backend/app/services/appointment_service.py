import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException
from app.core.database import get_supabase_admin, get_supabase_client
from app.services.audit_service import log_audit_event

logger = logging.getLogger("swasthya_sense.appointments")

class AppointmentService:
    @staticmethod
    async def create_appointment(data: Dict[str, Any], patient_id: str) -> Dict[str, Any]:
        doctor_id = data["doctor_id"]
        apt_date = data["appointment_date"]
        start_time = data["start_time"]
        
        admin_client = get_supabase_admin()
        if admin_client:
            # 1. Double-booking check: verify if doctor is already booked at that date & time
            existing = admin_client.table("appointments")\
                .select("id, status")\
                .eq("doctor_id", doctor_id)\
                .eq("appointment_date", apt_date)\
                .eq("start_time", start_time)\
                .not_.in_("status", ["cancelled", "rejected"])\
                .execute()
                
            if existing.data and len(existing.data) > 0:
                raise HTTPException(
                    status_code=409, 
                    detail="This appointment slot is already booked for this doctor. Please select another time or doctor."
                )

            # 2. Insert new appointment
            payload = {
                "patient_id": patient_id,
                "doctor_id": doctor_id,
                "department_id": data.get("department_id"),
                "appointment_date": apt_date,
                "start_time": start_time,
                "end_time": data["end_time"],
                "appointment_type": data.get("appointment_type", "in_person"),
                "status": "pending",
                "reason": data.get("reason"),
                "symptoms": data.get("symptoms")
            }
            res = admin_client.table("appointments").insert(payload).execute()
            if not res.data:
                raise HTTPException(status_code=500, detail="Failed to create appointment")
            
            created = res.data[0]
            
            # 3. Create in-app notification for the doctor
            admin_client.table("notifications").insert({
                "user_id": doctor_id,
                "title": "New Appointment Request",
                "message": f"A new consultation request has been scheduled for {apt_date} at {start_time}.",
                "type": "appointment",
                "link": f"/staff/doctor/dashboard"
            }).execute()

            await log_audit_event(
                action="appointment_created",
                entity_type="appointment",
                user_id=patient_id,
                entity_id=created["id"],
                details={"doctor_id": doctor_id, "date": apt_date, "time": start_time}
            )
            return created

        # Return mock structured response for testing/demo
        mock_id = "demo-apt-001"
        await log_audit_event("appointment_created_demo", "appointment", patient_id, mock_id)
        return {
            "id": mock_id,
            "patient_id": patient_id,
            **data,
            "status": "pending"
        }

appointment_service = AppointmentService()
