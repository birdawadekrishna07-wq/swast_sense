from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

class PatientRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: EmailStr
    phone: str = Field(..., min_length=8)
    password: str = Field(..., min_length=6)
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    emergency_contact: Optional[str] = None
    accept_terms: bool = True

class StaffRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: EmailStr
    phone: str = Field(..., min_length=8)
    password: str = Field(..., min_length=6)
    employee_id: str
    professional_role: str = Field(..., pattern="^(doctor|nurse|receptionist|pharmacist|admin)$")
    department_id: Optional[str] = None
    qualification: str
    specialization: Optional[str] = None
    medical_registration_number: Optional[str] = None
    years_of_experience: int = 0
    hospital_clinic: Optional[str] = "Swasthya Central Hospital"
    professional_address: Optional[str] = None
    accept_terms: bool = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfileResponse(BaseModel):
    id: str
    email: str
    role: str
    full_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    approval_status: Optional[str] = None
    is_active: bool = True
