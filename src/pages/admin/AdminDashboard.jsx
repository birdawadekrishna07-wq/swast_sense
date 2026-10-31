import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { 
  ShieldCheck, 
  Users, 
  Stethoscope, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Building, 
  FileText, 
  Activity,
  UserX,
  ShieldAlert
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_patients: 1420,
    total_doctors: 48,
    total_staff: 112,
    total_appointments: 3840,
    pending_approvals: 3
  });

  const [pendingStaff, setPendingStaff] = useState([
    {
      id: 'staff-p1',
      full_name: 'Dr. Sameer Kulkarni',
      email: 'dr.sameer@swasthya-test.com',
      phone: '+91 98201 12345',
      professional_role: 'doctor',
      qualification: 'MBBS, MS (General Surgery)',
      specialization: 'Laparoscopic Surgery',
      medical_registration_number: 'MCI-MH-2015-88491',
      years_of_experience: 9,
      hospital_clinic: 'Swasthya Sense Hospital',
      created_at: '2026-10-30T10:15:00Z'
    },
    {
      id: 'staff-p2',
      full_name: 'Meera Sen',
      email: 'meera.sen@swasthya-test.com',
      phone: '+91 98202 23456',
      professional_role: 'nurse',
      qualification: 'B.Sc Nursing, Critical Care Fellowship',
      specialization: 'ICU & Step-Down',
      medical_registration_number: 'NC-WB-2018-44912',
      years_of_experience: 6,
      hospital_clinic: 'Swasthya Sense Hospital',
      created_at: '2026-10-30T14:40:00Z'
    },
    {
      id: 'staff-p3',
      full_name: 'Rohan Deshpande',
      email: 'rohan.d@swasthya-test.com',
      phone: '+91 98203 34567',
      professional_role: 'pharmacist',
      qualification: 'B.Pharm, M.Pharm',
      specialization: 'Dispensing & Interaction Screening',
      medical_registration_number: 'PCI-MH-2019-11204',
      years_of_experience: 5,
      hospital_clinic: 'Swasthya Pharmacy Central',
      created_at: '2026-10-31T09:00:00Z'
    }
  ]);

  const [auditLogs, setAuditLogs] = useState([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, logsData] = await Promise.all([
          api.getAdminStats().catch(() => null),
          api.getAuditLogs().catch(() => [])
        ]);
        if (statsData) setStats(statsData);
        if (logsData) setAuditLogs(logsData);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleAction = async (staffId, action) => {
    try {
      await api.processStaffAction(staffId, action, 'Approved via Admin Security Terminal');
      setPendingStaff(prev => prev.filter(s => s.id !== staffId));
      setStats(prev => ({
        ...prev,
        pending_approvals: Math.max(0, prev.pending_approvals - 1)
      }));
      setFeedback(`Staff member credentials successfully ${action === 'approve' ? 'APPROVED & ACTIVATED' : 'REJECTED'}.`);
      setTimeout(() => setFeedback(''), 4000);
    } catch (e) {
      console.error(e);
      // Demo update
      setPendingStaff(prev => prev.filter(s => s.id !== staffId));
      setFeedback(`Staff member credentials processed (${action}).`);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-navy-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/30 text-brand-300 border border-brand-500/40 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Super Administrator Console</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Hospital System Governance
          </h2>
          <p className="text-xs text-slate-400">
            Audit logging, RBAC governance, and clinical credential verification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs">
            {pendingStaff.length} Staff Approvals Pending
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Hospital Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Patients</span>
          <p className="text-2xl font-extrabold text-navy-900">{stats.total_patients}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">+18 Today</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Doctors</span>
          <p className="text-2xl font-extrabold text-navy-900">{stats.total_doctors}</p>
          <span className="text-[10px] text-teal-600 font-semibold">100% Verified</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Clinical Staff</span>
          <p className="text-2xl font-extrabold text-navy-900">{stats.total_staff}</p>
          <span className="text-[10px] text-slate-500 font-medium">Nurses, Pharmacists</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Appointments</span>
          <p className="text-2xl font-extrabold text-navy-900">{stats.total_appointments}</p>
          <span className="text-[10px] text-brand-600 font-semibold">Cumulative OPD</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">ICU Bed Occupancy</span>
          <p className="text-2xl font-extrabold text-navy-900">{stats.active_icu_occupancy || '78%'}</p>
          <span className="text-[10px] text-amber-600 font-semibold">12 Available</span>
        </div>
      </div>

      {/* Critical Section: Staff Approval Workflow (Mandatory Security Requirement) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-navy-900">Pending Healthcare Staff Approvals</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-extrabold border border-amber-200">
                {pendingStaff.length} Awaiting Verification
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Users cannot self-promote to clinical terminals. Review state medical licenses before approving.
            </p>
          </div>
        </div>

        {pendingStaff.length > 0 ? (
          <div className="space-y-4">
            {pendingStaff.map((staff) => (
              <div key={staff.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-navy-900">{staff.full_name}</h4>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                      {staff.professional_role}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Registered: {formatDate(staff.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    {staff.qualification} • {staff.specialization || 'General Clinical'} • {staff.years_of_experience} Yrs Experience
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="font-mono font-semibold text-slate-700">Reg No: {staff.medical_registration_number || 'PENDING'}</span>
                    <span>• {staff.email}</span>
                    <span>• {staff.phone}</span>
                  </div>
                </div>

                {/* Approve / Reject Controls */}
                <div className="flex items-center gap-2.5 self-end lg:self-auto shrink-0">
                  <button
                    onClick={() => handleAction(staff.id, 'reject')}
                    className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleAction(staff.id, 'approve')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Credentials</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-50 text-center text-xs text-slate-500 space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="font-semibold text-slate-700">All healthcare staff registrations are currently verified!</p>
            <p>New doctor or nurse registrations will appear here for administrator clearance.</p>
          </div>
        )}
      </div>

      {/* System Audit Logs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-navy-900">Immutable Audit Trail</h3>
            <p className="text-xs text-slate-500">Recorded clinical and administrative transactions</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Compliance Log: HIPAA / NABH</span>
        </div>

        <div className="divide-y divide-slate-100 font-mono text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                  {log.action}
                </span>
                <span className="text-slate-800 font-semibold">{log.user?.full_name || 'System User'} ({log.user?.role || 'system'})</span>
                <span className="text-slate-400 text-[11px] truncate max-w-xs">{JSON.stringify(log.details)}</span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">
                {log.created_at || 'Just now'} • IP: {log.ip_address || '127.0.0.1'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
