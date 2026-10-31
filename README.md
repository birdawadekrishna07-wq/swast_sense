# SWASTHYA SENSE (स्वास्थ्य सेंस)
### Smart Full-Stack Healthcare Management & Clinical Ecosystem

Swasthya Sense is a production-grade, advanced healthcare platform connecting patients, doctors, nurses, receptionists, pharmacists, and hospital administrators. It features two segregated authentication systems, role-based dashboards, cryptographically signed digital prescriptions, transactional double-booking prevention, automated pill reminders, encrypted medical vaults, and a multilingual clinical AI assistant (**Swasthya AI**).

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, React Router v6 |
| **Backend** | Python 3.14+, FastAPI, Pydantic v2, Uvicorn, Google Gemini API, Pytest |
| **Database** | Supabase PostgreSQL (20 Normalized Tables, Row Level Security, Triggers) |
| **Security** | SHA-256 Prescription Signatures, RBAC, Admin Staff Clearance Gatekeeper, Private Buckets |
| **AI Assistant** | Swasthya AI (English, Hindi, Marathi, Bengali, Assamese) with Emergency Triage Filter |

---

## 🌟 Key Functional Portals & Features

### 1. Dual-Portal Authentication & Access
- **Patient Portal (`/auth/patient/signin`, `/auth/patient/signup`)**:
  - Direct entry to `/patient/dashboard`
  - Zero access to clinical administration terminals
- **Doctor & Staff Portal (`/auth/staff/signin`, `/auth/staff/signup`)**:
  - Professional registration (Employee ID, Medical Reg No, Qualification, Department)
  - **Mandatory Server-Side Clearance Gatekeeper**: Registrations remain in `pending` status until authorized by a Hospital Administrator.
  - Role-specific redirects:
    - Doctor: `/staff/doctor/dashboard`
    - Nurse: `/staff/nurse/dashboard`
    - Receptionist: `/staff/reception/dashboard`
    - Pharmacist: `/staff/pharmacy/dashboard`
    - Administrator: `/staff/admin/dashboard`

### 2. Clinical Digital Prescriptions & Pill Reminders
- Doctor-created prescriptions with patient details, diagnosis, dosage frequency (`1-0-1`), duration, and instructions.
- Authenticated with a SHA-256 cryptographic signature hash (`SHA256:AUTHENTICATED`).
- Prescribed medications automatically generate **Medicine Reminders** in the patient's portal with "Mark Taken" adherence logs.

### 3. Smart Appointment Booking
- Transactional reservation engine prevents double-booking across doctors and time slots.
- Status workflows: Pending → Confirmed → Completed / Cancelled / Rescheduled.

### 4. Swasthya AI Healthcare Assistant
- Multilingual assistance in **English, हिन्दी (Hindi), मराठी (Marathi), বাংলা (Bengali), and অসমীয়া (Assamese)**.
- Explains complex lab test terminology in simple patient language.
- Helps patients prepare questions for upcoming physician visits.
- **Emergency Triage Red Flag Detector**: Detects acute red-flag symptoms (chest pain, shortness of breath, sudden numbness) and triggers high-visibility warnings directing the user to dial 112 immediately.

### 5. Emergency Care (India 112)
- One-touch National Emergency Helpline (**112**) click-to-dial.
- Digital Emergency Medical Card displaying Blood Group, Known Allergies, and Primary Next-of-Kin Contact.
- 24/7 Ambulance Dispatch direct line and nearby Hospital ER triage locator.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ & pip

### 1. Backend Setup (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Install Python requirements
pip install -r requirements.txt
pip install email-validator

# Run automated tests
python -m pytest tests/test_api.py -v

# Start FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at: `http://localhost:8000/docs`

### 2. Frontend Setup (React & Vite)
```bash
# In the root directory (swasthya-sense)
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🗄️ Supabase PostgreSQL Setup

1. Create a new project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/20261031_initial_schema.sql` and run it to create all 20 tables, triggers, and RLS policies.
4. Open `supabase/seed.sql` and run it to load verified hospital departments, sample verified specialists, and hospital emergency parameters.
5. Create storage buckets in Supabase:
   - `medical-documents` (Private)
   - `prescriptions` (Private)
   - `profile-pictures` (Public)
6. Add your Supabase credentials to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

---

## 🧪 Interactive Evaluator Role Switcher
In the sidebar of any dashboard, an interactive **"Switch View (Tester)"** dropdown allows instant, one-click switching between:
- 👤 **Patient View**
- 🩺 **Doctor View**
- 💉 **Nurse View**
- 📋 **Receptionist View**
- 💊 **Pharmacist View**
- 🛡️ **Hospital Admin View** (where pending staff registrations can be approved or rejected with real-time audit logging)

---

## 🔒 Security & Compliance
- **Row Level Security (RLS)** enabled across all 20 tables.
- Server-side cryptographic signing on all clinical digital prescriptions.
- Private storage buckets with 60-second expiring signed URLs.
- Zero-trust staff approval workflow preventing unauthorized privilege escalation.
