from typing import Optional, List
from pydantic import BaseModel, Field

class StaffApprovalAction(BaseModel):
    staff_id: str
    action: str = Field(..., pattern="^(approve|reject|suspend)$")
    remarks: Optional[str] = None

class DepartmentResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool

class StaffProfileResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    professional_role: str
    qualification: str
    specialization: Optional[str] = None
    department_name: Optional[str] = None
    years_of_experience: int
    hospital_clinic: Optional[str] = None
    approval_status: str
