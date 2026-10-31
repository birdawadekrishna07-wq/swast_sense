import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatDate, formatTime, getStatusBadge } from '../../utils/formatters';
import { 
  Users, 
  Calendar, 
  Clock, 
  Pill, 
  CheckCircle2, 
  Stethoscope, 
  ArrowRight, 
  Search, 
  Activity, 
  ChevronRight,
  FileCheck
} from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDoctorData() {
      try {
        const apts = await api.getAppointments();
        setAppointments(apts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctorData();
  }, []);

  const stats = [
    { label: "Today's Consultations", count: 8, icon: Calendar, color: 'text-brand-600 bg-brand-50' },
    { label: "Pending Requests", count: 3, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: "Total Active Patients", count: 142, icon: Users, color: 'text-teal-600 bg-teal-50' },
    { label: "Completed This Month", count: 96, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold">
            <Stethoscope className="w-3.5 h-3.5 text-teal-200" />
            <span>Consultant Physician Terminal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dr. {user?.full_name?.replace('Dr. ', '') || 'Ananya Sharma'}
          </h2>
          <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
            Chief Cardiologist • Department of Cardiology • OPD Hall 4B
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/staff/doctor/prescribe"
            className="px-5 py-3 rounded-xl bg-white text-teal-900 font-bold text-xs shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Pill className="w-4 h-4 text-teal-600" />
            <span>Issue Digital Prescription</span>
          </Link>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-soft space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
                <div className={`p-2 rounded-xl ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-navy-900">{s.count}</p>
            </div>
          );
        })}
      </div>

      {/* Consultations List & Patient Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Today's Consultation Schedule */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold text-navy-900">Today's OPD Queue</h3>
            </div>
            <Link to="/staff/doctor/appointments" className="text-xs font-semibold text-teal-700 hover:underline">
              View All Appointments →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              { id: 'apt-01', patient_name: 'Rahul Deshmukh', time: '10:00 AM', type: 'In-Person', reason: 'Hypertension Followup', status: 'confirmed' },
              { id: 'apt-02', patient_name: 'Meena Ghosh', time: '10:30 AM', type: 'In-Person', reason: 'Palpitations & Shortness of breath', status: 'confirmed' },
              { id: 'apt-03', patient_name: 'Arjun Mehta', time: '11:00 AM', type: 'Online', reason: 'ECG Report Review', status: 'pending' },
              { id: 'apt-04', patient_name: 'Kavita Joshi', time: '11:30 AM', type: 'In-Person', reason: 'Post-CABG Routine Check', status: 'confirmed' }
            ].map((apt) => {
              const status = getStatusBadge(apt.status);
              return (
                <div key={apt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center shrink-0 text-xs">
                      {apt.time.split(' ')[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-navy-900">{apt.patient_name}</h4>
                      <p className="text-[11px] text-slate-500">{apt.reason} • <span className="font-semibold text-slate-700">{apt.type}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${status.bg}`}>
                      {status.label}
                    </span>
                    <Link
                      to="/staff/doctor/prescribe"
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
                    >
                      Prescribe
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Quick Clinical Shortcuts */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-navy-900">Clinical Shortcuts</h3>
            
            <div className="space-y-2.5">
              <Link
                to="/staff/doctor/prescribe"
                className="w-full p-3 rounded-2xl bg-teal-50/70 border border-teal-200 hover:bg-teal-100 text-teal-900 flex items-center justify-between text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Pill className="w-4 h-4 text-teal-600" />
                  <span>Issue Digital Prescription</span>
                </div>
                <ChevronRight className="w-4 h-4 text-teal-600" />
              </Link>

              <Link
                to="/staff/doctor/patients"
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 flex items-center justify-between text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-600" />
                  <span>Patient Medical Records Directory</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/staff/doctor/schedule"
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 flex items-center justify-between text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span>Adjust Availability & Slots</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-bold">Medical Council Protocol:</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Every digital prescription created in Swasthya Sense is stamped with a SHA-256 cryptographic signature that verifies your physician credentials and locks the prescription against unauthorized edits.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
