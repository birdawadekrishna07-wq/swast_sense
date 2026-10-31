import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { SwasthyaAiChat } from '../components/ai/SwasthyaAiChat';

export const DashboardLayout = ({ allowedRoles = [] }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to patient signin by default
    return <Navigate to="/auth/patient/signin" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    if (user.role === 'patient') {
      return <Navigate to="/patient/dashboard" replace />;
    } else {
      return <Navigate to={`/staff/${user.role}/dashboard`} replace />;
    }
  }

  // Helper for header titles
  const getHeaderContext = () => {
    const map = {
      patient: { title: 'Patient Health Portal', subtitle: 'Manage your care, appointments, records, and reminders' },
      doctor: { title: 'Doctor Clinical Workspace', subtitle: 'OPD schedule, consultations, and digital prescriptions' },
      nurse: { title: 'Nurse Inpatient Station', subtitle: 'Vitals tracking, nursing logs, and patient care monitoring' },
      receptionist: { title: 'Front Desk & Reception', subtitle: 'Patient check-in, registration, and OPD queues' },
      pharmacist: { title: 'Pharmacy Station', subtitle: 'Prescription fulfillment and real-time inventory' },
      admin: { title: 'Hospital Executive Administration', subtitle: 'System metrics, staff approvals, and compliance logs' },
    };
    return map[user.role] || { title: 'Swasthya Sense Dashboard', subtitle: 'Connected Healthcare Ecosystem' };
  };

  const { title, subtitle } = getHeaderContext();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
      {/* Floating AI assistant accessible throughout dashboard */}
      <SwasthyaAiChat isFloating={true} />
    </div>
  );
};
