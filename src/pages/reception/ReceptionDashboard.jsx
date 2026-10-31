import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Search, 
  Plus, 
  UserCheck, 
  Stethoscope, 
  ClipboardList 
} from 'lucide-react';

export const ReceptionDashboard = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState([
    { token: 'T-101', patient: 'Rahul Deshmukh', doctor: 'Dr. Ananya Sharma (Cardio)', time: '10:00 AM', status: 'Checked In', type: 'In-Person' },
    { token: 'T-102', patient: 'Meena Ghosh', doctor: 'Dr. Ananya Sharma (Cardio)', time: '10:30 AM', status: 'Waiting', type: 'In-Person' },
    { token: 'T-103', patient: 'Deepak Varma', doctor: 'Dr. Rajesh Iyer (Neuro)', time: '10:45 AM', status: 'Checked In', type: 'In-Person' },
    { token: 'T-104', patient: 'Arjun Mehta', doctor: 'Dr. Ananya Sharma (Cardio)', time: '11:00 AM', status: 'Scheduled', type: 'Online' },
    { token: 'T-105', patient: 'Kavita Joshi', doctor: 'Dr. Priya Nair (Ortho)', time: '11:15 AM', status: 'Waiting', type: 'In-Person' }
  ]);

  const [checkedNotice, setCheckedNotice] = useState('');

  const handleCheckIn = (token) => {
    setQueue(prev =>
      prev.map(q => q.token === token ? { ...q, status: 'Checked In' } : q)
    );
    setCheckedNotice(`Token ${token} checked in and sent to Doctor OPD queue.`);
    setTimeout(() => setCheckedNotice(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold">
            <ClipboardList className="w-3.5 h-3.5 text-blue-200" />
            <span>Front Desk & Queue Reception</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {user?.full_name || 'Front Desk Officer'}
          </h2>
          <p className="text-xs text-blue-100">
            OPD Terminal 1 • Central Registration & Triage Desk
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-white text-navy-900 font-bold text-xs shadow-sm">
            5 In Queue • 3 In Consultation
          </span>
        </div>
      </div>

      {checkedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{checkedNotice}</span>
        </div>
      )}

      {/* OPD Live Token Queue */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-navy-900">Today's Live OPD Queue</h3>
            <p className="text-xs text-slate-500">Fast check-in and room triage</p>
          </div>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Live Token Display Active
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {queue.map((item) => (
            <div key={item.token} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center shrink-0 text-xs border border-blue-200">
                  {item.token}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-900">{item.patient}</h4>
                  <p className="text-[11px] text-slate-600">{item.doctor}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Time: {item.time} • Mode: {item.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  item.status === 'Checked In' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {item.status}
                </span>

                {item.status !== 'Checked In' ? (
                  <button
                    onClick={() => handleCheckIn(item.token)}
                    className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    Check In Patient
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <UserCheck className="w-4 h-4" /> Ready for OPD
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
