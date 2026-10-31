from typing import Optional, List
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str

class AiChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str = Field(..., min_length=1)
    language: str = Field(default="en", pattern="^(en|hi|mr|bn|as)$")
    patient_context: Optional[str] = None

class AiChatResponse(BaseModel):
    conversation_id: str
    reply: str
    language: str
    is_emergency: bool = False
    disclaimer: str = "Swasthya AI provides general health information and does not replace professional medical advice, diagnosis, or treatment."
    suggested_questions: List[str] = []

class ReportExplanationRequest(BaseModel):
    report_text: str
    language: str = "en"
