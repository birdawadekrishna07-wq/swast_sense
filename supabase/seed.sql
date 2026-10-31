-- ==============================================================================
-- SWASTHYA SENSE: Initial Seed Data
-- ==============================================================================

-- 1. DEPARTMENTS
INSERT INTO public.departments (id, name, code, description, icon) VALUES
('d1111111-1111-1111-1111-111111111111', 'Cardiology', 'CARD', 'Comprehensive cardiac care, diagnosis of heart conditions and vascular management.', 'HeartPulse'),
('d2222222-2222-2222-2222-222222222222', 'Neurology', 'NEUR', 'Advanced neurological diagnostics, brain and nerve disorders, stroke rehabilitation.', 'Brain'),
('d3333333-3333-3333-3333-333333333333', 'Orthopedics', 'ORTH', 'Bone, joint, spine disorders, sports injuries, joint replacement surgery.', 'Bone'),
('d4444444-4444-4444-4444-444444444444', 'General Medicine', 'GENM', 'Primary care, adult medicine, seasonal illnesses, and chronic health management.', 'Stethoscope'),
('d5555555-5555-5555-5555-555555555555', 'Pediatrics', 'PED', 'Compassionate pediatric healthcare, child immunizations, and developmental tracking.', 'Baby'),
('d6666666-6666-6666-6666-666666666666', 'Dermatology', 'DERM', 'Clinical skin treatments, cosmetic dermatology, allergy testing, and laser therapies.', 'Activity'),
('d7777777-7777-7777-7777-777777777777', 'Gynecology & Obstetrics', 'GYN', 'Maternal health, prenatal care, women wellness, and reproductive health.', 'UserCheck')
ON CONFLICT (name) DO NOTHING;

-- 2. HOSPITAL SETTINGS
INSERT INTO public.hospital_settings (key, value, description) VALUES
('hospital_profile', '{
    "name": "Swasthya Sense Multispecialty Hospital & Research Center",
    "tagline": "Connected Healthcare. Smarter Living.",
    "phone": "+91 (020) 2555-0199",
    "emergency_phone": "112",
    "ambulance_direct": "+91 98200-11200",
    "email": "care@swasthya-sense.health",
    "address": "42 Healthway Boulevard, Medical Enclave",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "pincode": "400001",
    "operating_hours": "24 Hours Emergency & IPD | OPD: 8:00 AM - 8:00 PM",
    "ai_assistant_enabled": true
}'::jsonb, 'General hospital metadata and emergency contacts'),

('pharmacy_inventory_alerts', '{
    "threshold": 25,
    "notify_email": "pharmacy@swasthya-sense.health"
}'::jsonb, 'Threshold settings for medicine inventory alerts')
ON CONFLICT (key) DO NOTHING;
