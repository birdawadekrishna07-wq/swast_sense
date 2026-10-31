import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Pill,
  Bell,
  Clock,
  Sparkles,
  MapPin,
  ShieldAlert,
  User,
  Users,
  Stethoscope,
  Activity,
  ClipboardList,
  Package,
  ShieldCheck,
  Building,
  LogOut,
  ChevronRight,
  HeartPulse
} from 'lucide-react';

export const Sidebar = () => {
  const { user, signOut, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role || 'patient';
  const currentFullPath = location.pathname + location.search;

  // Role Navigation Items
  const navItemsMap = {
    patient: [
      { name: 'Overview', path: '/patient/dashboard', icon: LayoutDashboard },
      { name: 'My Appointments', path: '/patient/appointments', icon: Calendar },
      { name: 'Find Doctors', path: '/patient/doctors', icon: Stethoscope },
      { name: 'Medical Records', path: '/patient/records', icon: FileText },
      { name: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
      { name: 'Medicine Reminders', path: '/patient/reminders', icon: Clock },
      { name: 'Swasthya AI', path: '/patient/ai-assistant', icon: Sparkles, badge: 'AI' },
      { name: 'Emergency Help', path: '/patient/emergency', icon: ShieldAlert, alert: true },
      { name: 'My Profile', path: '/patient/profile', icon: User },
    ],
    doctor: [
      { name: 'Overview', path: '/staff/doctor/dashboard', icon: LayoutDashboard },
      { name: 'Consultations', path: '/staff/doctor/appointments', icon: Calendar },
      { name: 'Issue Prescription', path: '/staff/doctor/prescribe', icon: Pill },
      { name: 'Patient Directory', path: '/staff/doctor/patients', icon: Users },
      { name: 'Availability Schedule', path: '/staff/doctor/schedule', icon: Clock },
    ],
    nurse: [
      { name: 'Nurse Station', path: '/staff/nurse/dashboard', icon: LayoutDashboard },
      { name: 'Patient Vitals', path: '/staff/nurse/dashboard?tab=vitals', icon: Activity },
      { name: 'Medication Records', path: '/staff/nurse/dashboard?tab=medications', icon: Pill },
      { name: 'Nursing Notes', path: '/staff/nurse/dashboard?tab=notes', icon: ClipboardList },
      { name: 'Shift Schedule', path: '/staff/nurse/dashboard?tab=schedule', icon: Calendar },
    ],
    receptionist: [
      { name: 'Front Desk', path: '/staff/reception/dashboard', icon: LayoutDashboard },
      { name: 'Book Appointment', path: '/staff/reception/dashboard', icon: Calendar },
      { name: 'Patient Check-In', path: '/staff/reception/dashboard', icon: ClipboardList },
    ],
    pharmacist: [
      { name: 'Pharmacy Station', path: '/staff/pharmacy/dashboard', icon: LayoutDashboard },
      { name: 'Prescription Queue', path: '/staff/pharmacy/dashboard?tab=prescriptions', icon: Pill },
      { name: 'Medicine Stock', path: '/staff/pharmacy/dashboard?tab=inventory', icon: Package },
      { name: 'Dispensing Log', path: '/staff/pharmacy/dashboard?tab=dispensed', icon: ShieldCheck },
    ],
    admin: [
      { name: 'Hospital Overview', path: '/staff/admin/dashboard', icon: LayoutDashboard },
      { name: 'Staff Approvals', path: '/staff/admin/dashboard', icon: ShieldCheck, badge: 'Pending' },
      { name: 'Department Directory', path: '/staff/admin/dashboard', icon: Building },
      { name: 'System Audit Logs', path: '/staff/admin/dashboard', icon: ClipboardList },
    ]
  };

  const navItems = navItemsMap[role] || navItemsMap.patient;

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    switchRole(newRole);
    if (newRole === 'patient') {
      navigate('/patient/dashboard');
    } else {
      navigate(`/staff/${newRole}/dashboard`);
    }
  };

  return (
    <aside className="w-64 bg-navy-950 text-slate-300 flex flex-col flex-shrink-0 h-screen sticky top-0 border-r border-navy-800 z-30">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-navy-800 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white shadow-glow">
            <HeartPulse className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-base font-extrabold text-white tracking-tight flex items-center gap-1">
              <span>SWASTHYA</span>
              <span className="text-brand-400">SENSE</span>
            </div>
            <p className="text-[9px] uppercase font-semibold tracking-wider text-slate-400">
              {role.toUpperCase()} PORTAL
            </p>
          </div>
        </NavLink>
      </div>

      {/* Role Switcher Sandbox / Demo Dropdown */}
      <div className="p-3 mx-3 my-2 bg-navy-900/90 rounded-xl border border-navy-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Switch View (Tester)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </div>
        <select
          value={role}
          onChange={handleRoleChange}
          className="w-full text-xs font-medium bg-navy-950 text-slate-200 border border-navy-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
        >
          <option value="patient">👤 Patient View</option>
          <option value="doctor">🩺 Doctor View</option>
          <option value="nurse">💉 Nurse View</option>
          <option value="receptionist">📋 Receptionist View</option>
          <option value="pharmacist">💊 Pharmacist View</option>
          <option value="admin">🛡️ Hospital Admin View</option>
        </select>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isItemActive = item.path.includes('?')
            ? currentFullPath === item.path
            : location.pathname === item.path && (!location.search || location.search === '?tab=overview');

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isItemActive
                    ? 'bg-brand-600 text-white font-semibold shadow-glow'
                    : 'text-slate-400 hover:text-white hover:bg-navy-900/80'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${item.alert ? 'text-rose-400' : ''}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-500/30 text-brand-300 border border-brand-500/40">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Profile Summary & Logout */}
      <div className="p-3 border-t border-navy-800 bg-navy-900/40">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-navy-900/80 border border-navy-800 mb-2">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'}
            alt={user?.full_name || 'User'}
            className="w-9 h-9 rounded-full object-cover border border-slate-700"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Demo User'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || 'user@swasthya.internal'}</p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 rounded-lg border border-rose-900/40 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
};
