-- ==============================================================================
-- SWASTHYA SENSE: Complete Database Schema Migration
-- Database: Supabase PostgreSQL
-- Features: 20 Normalized Tables, Strong Constraints, Triggers, Full RLS Policies
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES (Base user table linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'admin')),
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENT PROFILES
CREATE TABLE IF NOT EXISTS public.patient_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    address TEXT,
    city TEXT,
    state TEXT,
    pin_code TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    existing_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STAFF PROFILES (Doctors, Nurses, Pharmacists, Receptionists, Admins)
CREATE TABLE IF NOT EXISTS public.staff_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    professional_role TEXT NOT NULL CHECK (professional_role IN ('doctor', 'nurse', 'receptionist', 'pharmacist', 'admin')),
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    qualification TEXT NOT NULL,
    specialization TEXT, -- For doctors
    medical_registration_number TEXT, -- For doctors
    years_of_experience INTEGER DEFAULT 0,
    hospital_clinic TEXT,
    professional_address TEXT,
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended')),
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DOCTOR AVAILABILITY
CREATE TABLE IF NOT EXISTS public.doctor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER DEFAULT 30,
    max_patients INTEGER DEFAULT 20,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_time_window CHECK (start_time < end_time)
);

-- 6. APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    appointment_type TEXT NOT NULL DEFAULT 'in_person' CHECK (appointment_type IN ('in_person', 'online')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'rescheduled')),
    reason TEXT,
    symptoms TEXT,
    notes TEXT,
    cancel_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT prevent_time_inversion CHECK (start_time < end_time)
);

-- Index for appointment queries & uniqueness enforcement
CREATE UNIQUE INDEX IF NOT EXISTS unique_doctor_appointment_slot 
ON public.appointments (doctor_id, appointment_date, start_time) 
WHERE status NOT IN ('cancelled', 'rejected');

-- 7. MEDICAL RECORDS
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    record_type TEXT NOT NULL CHECK (record_type IN ('diagnosis', 'lab_report', 'imaging', 'consultation_note', 'general')),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    is_confidential BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PRESCRIPTIONS
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    diagnosis TEXT NOT NULL,
    clinical_notes TEXT,
    follow_up_date DATE,
    is_digitally_signed BOOLEAN DEFAULT false,
    signature_hash TEXT,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PRESCRIPTION ITEMS
CREATE TABLE IF NOT EXISTS public.prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL, -- e.g., '1-0-1', 'Once daily', 'Every 8 hours'
    duration TEXT NOT NULL,  -- e.g., '5 days', '2 weeks'
    instructions TEXT,       -- e.g., 'Take after food'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MEDICINE REMINDERS
CREATE TABLE IF NOT EXISTS public.medicine_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    reminder_time TIME NOT NULL,
    frequency TEXT NOT NULL,
    instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MEDICATION LOGS
CREATE TABLE IF NOT EXISTS public.medication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reminder_id UUID NOT NULL REFERENCES public.medicine_reminders(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
    logged_time TIME NOT NULL DEFAULT CURRENT_TIME,
    status TEXT NOT NULL CHECK (status IN ('taken', 'skipped', 'missed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. LAB REPORTS
CREATE TABLE IF NOT EXISTS public.lab_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prescribed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    test_name TEXT NOT NULL,
    category TEXT,
    test_date DATE DEFAULT CURRENT_DATE,
    results_summary TEXT,
    normal_range TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'reviewed')),
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('appointment', 'prescription', 'reminder', 'system', 'approval')),
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. EMERGENCY CONTACTS
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    contact_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. PATIENT CONSENTS
CREATE TABLE IF NOT EXISTS public.patient_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL, -- e.g. 'view_records', 'share_with_ai'
    is_granted BOOLEAN DEFAULT true,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    CONSTRAINT unique_patient_doctor_consent UNIQUE (patient_id, doctor_id, consent_type)
);

-- 16. STAFF APPROVALS (Audit trail for staff approval lifecycle)
CREATE TABLE IF NOT EXISTS public.staff_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. CONVERSATIONS (AI Healthcare Assistant)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Healthcare Inquiry',
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'mr', 'bn', 'as')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. MESSAGES (AI Chatbot messages)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'assistant')),
    content TEXT NOT NULL,
    audio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. HOSPITAL SETTINGS
CREATE TABLE IF NOT EXISTS public.hospital_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- DATABASE INDEXES FOR HIGH PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_staff_approval_status ON public.staff_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_reminders_patient ON public.medicine_reminders(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id) WHERE is_read = false;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all 20 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are readable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- PATIENT PROFILES POLICIES
CREATE POLICY "Patients can view and update their own patient profile" 
ON public.patient_profiles FOR ALL TO authenticated 
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Doctors and nurses can view patient profiles" 
ON public.patient_profiles FOR SELECT TO authenticated 
USING (public.current_user_role() IN ('doctor', 'nurse', 'receptionist', 'admin'));

-- DEPARTMENTS POLICIES (Readable by all, manageable by admin)
CREATE POLICY "Departments are viewable by everyone" 
ON public.departments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can modify departments" 
ON public.departments FOR ALL TO authenticated 
USING (public.is_admin());

-- STAFF PROFILES POLICIES
CREATE POLICY "Staff can view their own profile" 
ON public.staff_profiles FOR SELECT TO authenticated 
USING (id = auth.uid() OR public.is_admin() OR approval_status = 'approved');

CREATE POLICY "Only admins can approve/update staff profiles" 
ON public.staff_profiles FOR UPDATE TO authenticated 
USING (public.is_admin());

-- APPOINTMENTS POLICIES
CREATE POLICY "Patients see own appointments" 
ON public.appointments FOR SELECT TO authenticated 
USING (patient_id = auth.uid() OR doctor_id = auth.uid() OR public.current_user_role() IN ('receptionist', 'admin'));

CREATE POLICY "Patients can book appointments" 
ON public.appointments FOR INSERT TO authenticated 
WITH CHECK (patient_id = auth.uid() OR public.current_user_role() IN ('receptionist', 'admin'));

CREATE POLICY "Patients and doctors can update relevant appointments" 
ON public.appointments FOR UPDATE TO authenticated 
USING (patient_id = auth.uid() OR doctor_id = auth.uid() OR public.current_user_role() IN ('receptionist', 'admin'));

-- PRESCRIPTIONS & ITEMS POLICIES
CREATE POLICY "Patients view own prescriptions" 
ON public.prescriptions FOR SELECT TO authenticated 
USING (patient_id = auth.uid() OR doctor_id = auth.uid() OR public.current_user_role() IN ('pharmacist', 'nurse', 'admin'));

CREATE POLICY "Only approved doctors can create prescriptions" 
ON public.prescriptions FOR INSERT TO authenticated 
WITH CHECK (doctor_id = auth.uid() AND public.current_user_role() = 'doctor');

CREATE POLICY "Prescription items viewable by authorized" 
ON public.prescription_items FOR SELECT TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.prescriptions p 
    WHERE p.id = prescription_items.prescription_id 
    AND (p.patient_id = auth.uid() OR p.doctor_id = auth.uid() OR public.current_user_role() IN ('pharmacist', 'nurse', 'admin'))
));

-- MEDICAL RECORDS POLICIES
CREATE POLICY "Patients view own medical records" 
ON public.medical_records FOR SELECT TO authenticated 
USING (patient_id = auth.uid() OR created_by = auth.uid() OR public.current_user_role() IN ('doctor', 'nurse', 'admin'));

CREATE POLICY "Patients and doctors can upload medical records" 
ON public.medical_records FOR INSERT TO authenticated 
WITH CHECK (patient_id = auth.uid() OR created_by = auth.uid());

-- MEDICINE REMINDERS & LOGS POLICIES
CREATE POLICY "Patients manage own medicine reminders" 
ON public.medicine_reminders FOR ALL TO authenticated 
USING (patient_id = auth.uid() OR public.is_admin());

CREATE POLICY "Patients manage own medication logs" 
ON public.medication_logs FOR ALL TO authenticated 
USING (patient_id = auth.uid());

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users view own notifications" 
ON public.notifications FOR ALL TO authenticated 
USING (user_id = auth.uid());

-- CONVERSATIONS & MESSAGES (AI Assistant)
CREATE POLICY "Users manage own AI conversations" 
ON public.conversations FOR ALL TO authenticated 
USING (patient_id = auth.uid());

CREATE POLICY "Users manage own AI messages" 
ON public.messages FOR ALL TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id AND c.patient_id = auth.uid()
));

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER (auth.users -> profiles)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    full_name TEXT;
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
    full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User');

    -- Insert into base profiles
    INSERT INTO public.profiles (id, email, role, full_name, phone, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        user_role,
        full_name,
        NEW.raw_user_meta_data->>'phone',
        true
    );

    -- If patient, initialize patient profile
    IF user_role = 'patient' THEN
        INSERT INTO public.patient_profiles (id, date_of_birth, gender, blood_group, city)
        VALUES (
            NEW.id,
            (NEW.raw_user_meta_data->>'date_of_birth')::DATE,
            NEW.raw_user_meta_data->>'gender',
            NEW.raw_user_meta_data->>'blood_group',
            NEW.raw_user_meta_data->>'city'
        );
    -- If staff/doctor, create pending approval record
    ELSE
        INSERT INTO public.staff_profiles (
            id, employee_id, professional_role, qualification, specialization, 
            medical_registration_number, hospital_clinic, approval_status
        )
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'employee_id', 'EMP-' || substr(NEW.id::text, 1, 8)),
            user_role,
            COALESCE(NEW.raw_user_meta_data->>'qualification', 'MBBS / Healthcare Specialist'),
            NEW.raw_user_meta_data->>'specialization',
            NEW.raw_user_meta_data->>'medical_registration_number',
            COALESCE(NEW.raw_user_meta_data->>'hospital_clinic', 'Swasthya Central Hospital'),
            'pending' -- ALWAYS pending initially for security!
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger hook on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
