from typing import List, Optional
from pydantic import BaseModel, Field

class PrescriptionItemCreate(BaseModel):
    medicine_name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None

class PrescriptionCreate(BaseModel):
    patient_id: str
    appointment_id: Optional[str] = None
    diagnosis: str
    clinical_notes: Optional[str] = None
    follow_up_date: Optional[str] = None
    items: List[PrescriptionItemCreate]

class PrescriptionResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    appointment_id: Optional[str] = None
    diagnosis: str
    clinical_notes: Optional[str] = None
    follow_up_date: Optional[str] = None
    is_digitally_signed: bool
    signature_hash: Optional[str] = None
    signed_at: Optional[str] = None
    created_at: str
    items: List[PrescriptionItemCreate] = []
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
