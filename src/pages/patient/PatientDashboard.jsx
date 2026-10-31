import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatDate, formatTime, getStatusBadge } from '../../utils/formatters';
import { 
  Calendar, 
  Pill, 
  FileText, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  Plus, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  AlertCircle,
  ChevronRight,
  Heart,
  Stethoscope
} from 'lucide-react';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [apts, prescs, rems] = await Promise.all([
          api.getAppointments().catch(() => []),
          api.getPrescriptions().catch(() => []),
          api.getReminders().catch(() => [])
        ]);
        setAppointments(apts || []);
        setPrescriptions(prescs || []);
        setReminders(rems || []);
      } catch (e) {
        console.error('Failed loading patient dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleMarkTaken = async (reminderId) => {
    try {
      await api.logReminderStatus(reminderId, 'taken');
      setReminders((prev) =>
        prev.map((r) => (r.id === reminderId ? { ...r, status_today: 'taken' } : r))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const patientDetails = user?.patient_details || {
    blood_group: 'O+',
    allergies: ['Penicillin'],
    conditions: ['Stage 1 Essential Hypertension'],
    emergency_contact: '+91 98200 99887 (Pooja Deshmukh)'
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* 1. Welcome & Quick Health Card Header */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold">
            <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
            <span>Patient Health Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name || 'Rahul'}!
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl">
            Your cardiovascular profile is currently stable. You have 1 upcoming consultation and 2 scheduled medicine doses for today.
          </p>
        </div>

        {/* Quick Emergency Call Button */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/patient/appointments"
            className="px-4 py-2.5 rounded-xl bg-white text-brand-700 font-bold text-xs shadow-sm hover:bg-slate-50 transition-all flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>Book Doctor</span>
          </Link>
          <Link
            to="/patient/emergency"
            className="px-4 py-2.5 rounded-xl bg-rose-500/90 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 border border-rose-400"
          >
            <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
            <span>Emergency 112</span>
          </Link>
        </div>
      </div>

      {/* 2. Medical ID Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Blood Group</span>
          <p className="text-lg font-extrabold text-navy-900 mt-0.5">{patientDetails.blood_group || 'O+'}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Universal Donor</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Condition</span>
          <p className="text-sm font-bold text-navy-900 mt-0.5 truncate">{patientDetails.conditions?.[0] || 'Hypertension'}</p>
          <span className="text-[10px] text-slate-500">Under Treatment</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recorded Allergies</span>
          <p className="text-sm font-bold text-rose-600 mt-0.5 truncate">{patientDetails.allergies?.join(', ') || 'None'}</p>
          <span className="text-[10px] text-rose-500 font-medium">Alerts Clinical Team</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Emergency SOS</span>
          <p className="text-xs font-bold text-navy-900 mt-0.5 truncate">{patientDetails.emergency_contact || '+91 98200 99887'}</p>
          <span className="text-[10px] text-brand-600 font-semibold">Primary Contact</span>
        </div>
      </div>

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Appointments & Prescriptions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upcoming Consultations */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-bold text-navy-900">Upcoming Consultations</h3>
              </div>
              <Link to="/patient/appointments" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {appointments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {appointments.slice(0, 3).map((apt) => {
                  const status = getStatusBadge(apt.status);
                  return (
                    <div key={apt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-navy-900">
                            {apt.doctor?.full_name || apt.doctor_name || 'Dr. Ananya Sharma'}
                          </h4>
                          <p className="text-[11px] text-slate-500">{apt.department?.name || 'Cardiology'} • {apt.reason || 'General Followup'}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-1">
                            <span>📅 {formatDate(apt.appointment_date)}</span>
                            <span>⏰ {formatTime(apt.start_time)}</span>
                            <span className="uppercase font-semibold">({apt.appointment_type?.replace('_', ' ')})</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${status.bg}`}>
                          {status.label}
                        </span>
                        <Link
                          to="/patient/appointments"
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-navy-900 bg-slate-50 hover:bg-slate-100 rounded-lg"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No active appointments scheduled. Click "Book Doctor" to find available specialists.
              </div>
            )}
          </div>

          {/* Active Digital Prescriptions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-navy-900">Active Digital Prescriptions</h3>
              </div>
              <Link to="/patient/prescriptions" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {prescriptions.length > 0 ? (
              <div className="space-y-3">
                {prescriptions.slice(0, 2).map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-navy-900">{p.diagnosis}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-teal-100 text-teal-800">
                          DIGITALLY SIGNED
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{formatDate(p.created_at)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{p.clinical_notes}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {p.items?.map((item, idx) => (
                        <span key={idx} className="text-[10px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
                          💊 {item.medicine_name} ({item.dosage} • {item.frequency})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No active digital prescriptions found.
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Medicine Reminders & Swasthya AI Banner */}
        <div className="space-y-6">
          
          {/* Medicine Reminders Today */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-navy-900">Today's Reminders</h3>
              </div>
              <Link to="/patient/reminders" className="text-xs font-semibold text-brand-600 hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {reminders.map((rem) => (
                <div key={rem.id} className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-navy-900">{rem.medicine_name}</p>
                    <p className="text-[10px] text-slate-500">{rem.dosage} • {formatTime(rem.reminder_time)}</p>
                    <span className="text-[10px] text-amber-700 font-medium">{rem.instructions}</span>
                  </div>
                  <div>
                    {rem.status_today === 'taken' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Taken
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkTaken(rem.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors"
                      >
                        Take
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Swasthya AI Quick Ask Card */}
          <div className="bg-gradient-to-br from-navy-900 to-navy-950 rounded-3xl p-6 text-white shadow-soft space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white shadow-glow">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Ask Swasthya AI</h4>
                <p className="text-[10px] text-slate-400">Available in 5 Indian Languages</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Have questions about your prescription or upcoming doctor appointment? Ask in Hindi, Marathi, Bengali, Assamese or English.
            </p>
            <Link
              to="/patient/ai-assistant"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-glow flex items-center justify-center gap-2 transition-all"
            >
              <span>Launch AI Health Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Medical Records Vault Mini Link */}
          <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-navy-900">Medical Records Vault</h4>
                <p className="text-[10px] text-slate-500">2 files uploaded (Encrypted)</p>
              </div>
            </div>
            <Link
              to="/patient/records"
              className="p-2 text-slate-400 hover:text-navy-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};
