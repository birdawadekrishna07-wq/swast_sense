import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Public & Auth Pages
import { LandingPage } from '../pages/landing/LandingPage';
import { FindDoctorsPage } from '../pages/landing/FindDoctorsPage';
import { EmergencyPage } from '../pages/landing/EmergencyPage';
import { PatientSignIn } from '../pages/auth/PatientSignIn';
import { PatientSignUp } from '../pages/auth/PatientSignUp';
import { StaffSignIn } from '../pages/auth/StaffSignIn';
import { StaffSignUp } from '../pages/auth/StaffSignUp';
import { ForgotPassword } from '../pages/auth/ForgotPassword';

// Patient Portal
import { PatientDashboard } from '../pages/patient/PatientDashboard';
import { PatientAppointments } from '../pages/patient/PatientAppointments';
import { PatientMedicalRecords } from '../pages/patient/PatientMedicalRecords';
import { PatientPrescriptions } from '../pages/patient/PatientPrescriptions';
import { PatientMedicineReminders } from '../pages/patient/PatientMedicineReminders';
import { PatientFindDoctors } from '../pages/patient/PatientFindDoctors';
import { PatientAiAssistant } from '../pages/patient/PatientAiAssistant';
import { PatientEmergencyHelp } from '../pages/patient/PatientEmergencyHelp';
import { PatientProfile } from '../pages/patient/PatientProfile';

// Doctor & Staff Portals
import { DoctorDashboard } from '../pages/doctor/DoctorDashboard';
import { DoctorAppointments } from '../pages/doctor/DoctorAppointments';
import { DoctorPrescriptionCreator } from '../pages/doctor/DoctorPrescriptionCreator';
import { DoctorPatients } from '../pages/doctor/DoctorPatients';
import { DoctorAvailability } from '../pages/doctor/DoctorAvailability';
import { NurseDashboard } from '../pages/nurse/NurseDashboard';
import { ReceptionDashboard } from '../pages/reception/ReceptionDashboard';
import { PharmacistDashboard } from '../pages/pharmacist/PharmacistDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/find-doctors" element={<FindDoctorsPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/auth/patient/signin" element={<PatientSignIn />} />
        <Route path="/auth/patient/signup" element={<PatientSignUp />} />
        <Route path="/auth/staff/signin" element={<StaffSignIn />} />
        <Route path="/auth/staff/signup" element={<StaffSignUp />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Patient Portal (Role: patient) */}
      <Route element={<DashboardLayout allowedRoles={['patient']} />}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/patient/records" element={<PatientMedicalRecords />} />
        <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
        <Route path="/patient/reminders" element={<PatientMedicineReminders />} />
        <Route path="/patient/doctors" element={<PatientFindDoctors />} />
        <Route path="/patient/ai-assistant" element={<PatientAiAssistant />} />
        <Route path="/patient/emergency" element={<PatientEmergencyHelp />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
      </Route>

      {/* Doctor Portal (Role: doctor) */}
      <Route element={<DashboardLayout allowedRoles={['doctor']} />}>
        <Route path="/staff/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/staff/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/staff/doctor/prescribe" element={<DoctorPrescriptionCreator />} />
        <Route path="/staff/doctor/patients" element={<DoctorPatients />} />
        <Route path="/staff/doctor/schedule" element={<DoctorAvailability />} />
      </Route>

      {/* Nurse Portal (Role: nurse) */}
      <Route element={<DashboardLayout allowedRoles={['nurse']} />}>
        <Route path="/staff/nurse/dashboard" element={<NurseDashboard />} />
      </Route>

      {/* Receptionist Portal (Role: receptionist) */}
      <Route element={<DashboardLayout allowedRoles={['receptionist']} />}>
        <Route path="/staff/reception/dashboard" element={<ReceptionDashboard />} />
      </Route>

      {/* Pharmacist Portal (Role: pharmacist) */}
      <Route element={<DashboardLayout allowedRoles={['pharmacist']} />}>
        <Route path="/staff/pharmacy/dashboard" element={<PharmacistDashboard />} />
      </Route>

      {/* Admin Portal (Role: admin) */}
      <Route element={<DashboardLayout allowedRoles={['admin']} />}>
        <Route path="/staff/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
