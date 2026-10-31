import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Swasthya Sense" in data["app"]

def test_departments_endpoint():
    response = client.get("/api/v1/staff/departments")
    assert response.status_code == 200
    departments = response.json()
    assert len(departments) >= 5
    codes = [d["code"] for d in departments]
    assert "CARD" in codes
    assert "GENM" in codes

def test_ai_emergency_keyword_triage():
    # Prompt containing critical cardiac emergency
    payload = {
        "message": "I have sudden severe crushing chest pain and shortness of breath",
        "language": "en"
    }
    headers = {"Authorization": "Bearer dev-test-token-patient"}
    response = client.post("/api/v1/ai/chat", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["is_emergency"] is True
    assert "112" in data["reply"]
    assert "disclaimer" in data

def test_ai_multilingual_response():
    # Prompt in Hindi for diabetes guidance
    payload = {
        "message": "मधुमेह में क्या आहार लेना चाहिए?",
        "language": "hi"
    }
    headers = {"Authorization": "Bearer dev-test-token-patient"}
    response = client.post("/api/v1/ai/chat", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "hi"
    assert data["is_emergency"] is False
    assert "चिकित्सा" in data["disclaimer"]

def test_unauthorized_staff_approval_action():
    # Patient attempting admin action must be rejected with 403 Forbidden
    payload = {
        "staff_id": "some-id",
        "action": "approve"
    }
    headers = {"Authorization": "Bearer dev-test-token-patient"}
    response = client.post("/api/v1/admin/staff-action", json=payload, headers=headers)
    assert response.status_code == 403
