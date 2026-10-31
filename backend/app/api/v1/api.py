from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    appointments,
    prescriptions,
    medical_records,
    reminders,
    staff,
    ai,
    admin
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Profiles"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])
api_router.include_router(prescriptions.router, prefix="/prescriptions", tags=["Digital Prescriptions"])
api_router.include_router(medical_records.router, prefix="/records", tags=["Medical Records"])
api_router.include_router(reminders.router, prefix="/reminders", tags=["Medicine Reminders"])
api_router.include_router(staff.router, prefix="/staff", tags=["Staff & Directory"])
api_router.include_router(ai.router, prefix="/ai", tags=["Swasthya AI Assistant"])
api_router.include_router(admin.router, prefix="/admin", tags=["Hospital Administration"])
