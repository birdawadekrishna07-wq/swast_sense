from fastapi import APIRouter, Depends, HTTPException
from app.schemas.ai import AiChatRequest, AiChatResponse, ReportExplanationRequest
from app.core.security import get_current_user, CurrentUser
from app.services.ai_service import swasthya_ai

router = APIRouter()

@router.post("/chat", response_model=AiChatResponse)
async def chat_with_swasthya_ai(
    payload: AiChatRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Secure Swasthya AI healthcare assistant.
    Features:
    - Multi-language support (en, hi, mr, bn, as)
    - Symptom education and doctor preparation
    - Emergency red-flag triage detection
    - Strict medical safety disclaimers
    - Context-aware assistance
    """
    context = payload.patient_context
    if not context and current_user.full_name:
        context = f"User: {current_user.full_name}, Role: {current_user.role}"

    result = await swasthya_ai.get_response(
        message=payload.message,
        language=payload.language,
        conversation_id=payload.conversation_id,
        patient_context=context
    )
    return AiChatResponse(**result)

@router.post("/explain-report")
async def explain_medical_report(
    payload: ReportExplanationRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Explains complex laboratory & imaging reports in simple, patient-friendly terms."""
    prompt = (
        f"Please explain the following medical report in simple, easy-to-understand language for a patient. "
        f"Explain what the key values mean in everyday terms, provide context without giving a diagnosis, "
        f"and list 3 specific questions the patient can ask their doctor during their next visit:\n\n{payload.report_text}"
    )
    result = await swasthya_ai.get_response(
        message=prompt,
        language=payload.language,
        patient_context=f"User: {current_user.full_name}"
    )
    return result
