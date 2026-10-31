from typing import Optional, List
from pydantic import BaseModel, Field

class AppointmentCreate(BaseModel):
    doctor_id: str
    department_id: Optional[str] = None
    appointment_date: str = Field(..., description="YYYY-MM-DD")
    start_time: str = Field(..., description="HH:MM:SS")
    end_time: str = Field(..., description="HH:MM:SS")
    appointment_type: str = Field(default="in_person", pattern="^(in_person|online)$")
    reason: Optional[str] = None
    symptoms: Optional[str] = None

class AppointmentUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(pending|confirmed|completed|cancelled|rejected|rescheduled)$")
    appointment_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    notes: Optional[str] = None
    cancel_reason: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    department_id: Optional[str] = None
    appointment_date: str
    start_time: str
    end_time: str
    appointment_type: str
    status: str
    reason: Optional[str] = None
    symptoms: Optional[str] = None
    notes: Optional[str] = None
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    department_name: Optional[str] = None
