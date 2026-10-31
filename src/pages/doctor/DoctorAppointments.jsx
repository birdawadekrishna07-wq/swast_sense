import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { formatDate, formatTime, getStatusBadge } from '../../utils/formatters';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  Search, 
  Pill, 
  Video, 
  Building,
  Filter 
} from 'lucide-react';

export const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([
    {
      id: 'apt-01',
      patient: { full_name: 'Rahul Deshmukh' },
      patient_id: 'usr-pat-001',
      appointment_date: '2026-11-05',
      start_time: '10:00:00',
      end_time: '10:30:00',
      appointment_type: 'in_person',
      status: 'confirmed',
      reason: 'Quarterly cardiovascular checkup & blood pressure review'
    },
    {
      id: 'apt-02',
      patient: { full_name: 'Meena Ghosh' },
      patient_id: 'usr-pat-002',
      appointment_date: '2026-11-05',
      start_time: '10:30:00',
      end_time: '11:00:00',
      appointment_type: 'in_person',
      status: 'pending',
      reason: 'Occasional palpitations and exertional fatigue'
    },
    {
      id: 'apt-03',
      patient: { full_name: 'Arjun Mehta' },
      patient_id: 'usr-pat-003',
      appointment_date: '2026-11-06',
      start_time: '14:00:00',
      end_time: '14:30:00',
      appointment_type: 'online',
      status: 'confirmed',
      reason: 'Echo report interpretation'
    }
  ]);

  const handleStatusChange = (id, newStatus) => {
    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, status: newStatus } : a)
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-navy-900">Doctor Consultation Schedule</h2>
          <p className="text-xs text-slate-500">Manage patient queues, accept bookings, and initiate consultations</p>
        </div>

        <Link
          to="/staff/doctor/prescribe"
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Pill className="w-4 h-4" />
          <span>New Prescription</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
        <div className="divide-y divide-slate-100">
          {appointments.map((apt) => {
            const status = getStatusBadge(apt.status);
            return (
              <div key={apt.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-navy-900">{apt.patient?.full_name}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.bg}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{apt.reason}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                      <span>📅 {formatDate(apt.appointment_date)}</span>
                      <span>⏰ {formatTime(apt.start_time)}</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        {apt.appointment_type === 'online' ? <Video className="w-3.5 h-3.5 text-teal-600" /> : <Building className="w-3.5 h-3.5 text-brand-600" />}
                        {apt.appointment_type === 'online' ? 'Online' : 'In-Person'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  {apt.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(apt.id, 'confirmed')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                    >
                      Accept
                    </button>
                  )}
                  {apt.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(apt.id, 'completed')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                    >
                      Mark Completed
                    </button>
                  )}
                  <Link
                    to="/staff/doctor/prescribe"
                    className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-bold border border-teal-200 transition-colors"
                  >
                    Prescribe
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
