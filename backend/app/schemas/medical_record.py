from typing import Optional, List
from pydantic import BaseModel, Field

class MedicalRecordCreate(BaseModel):
    patient_id: str
    record_type: str = Field(..., pattern="^(diagnosis|lab_report|imaging|consultation_note|general)$")
    title: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    is_confidential: bool = False

class MedicalRecordResponse(BaseModel):
    id: str
    patient_id: str
    created_by: str
    record_type: str
    title: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    is_confidential: bool = False
    created_at: str
