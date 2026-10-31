from typing import Optional
from pydantic import BaseModel, Field

class MedicineReminderCreate(BaseModel):
    prescription_id: Optional[str] = None
    medicine_name: str
    dosage: str
    start_date: str
    end_date: Optional[str] = None
    reminder_time: str
    frequency: str
    instructions: Optional[str] = None

class MedicineReminderResponse(BaseModel):
    id: str
    patient_id: str
    prescription_id: Optional[str] = None
    medicine_name: str
    dosage: str
    start_date: str
    end_date: Optional[str] = None
    reminder_time: str
    frequency: str
    instructions: Optional[str] = None
    is_active: bool
    created_at: str

class MedicationLogCreate(BaseModel):
    reminder_id: str
    status: str = Field(..., pattern="^(taken|skipped|missed)$")
    notes: Optional[str] = None
