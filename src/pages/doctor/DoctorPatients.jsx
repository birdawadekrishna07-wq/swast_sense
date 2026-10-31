import React, { useState } from 'react';
import { Users, Search, FileText, Pill, Heart, ShieldCheck, ChevronRight } from 'lucide-react';

export const DoctorPatients = () => {
  const [patients] = useState([
    {
      id: 'usr-pat-001',
      name: 'Rahul Deshmukh',
      age: 38,
      gender: 'Male',
      blood_group: 'O+',
      last_visit: '2026-10-25',
      primary_diagnosis: 'Essential Hypertension',
      allergies: ['Penicillin', 'Peanuts'],
      phone: '+91 98230 45678'
    },
    {
      id: 'usr-pat-002',
      name: 'Sunita Mukherjee',
      age: 46,
      gender: 'Female',
      blood_group: 'B+',
      last_visit: '2026-10-18',
      primary_diagnosis: 'Mitral Valve Prolapse (Mild)',
      allergies: ['Sulfa drugs'],
      phone: '+91 98200 88771'
    },
    {
      id: 'usr-pat-003',
      name: 'Aarav Patel',
      age: 29,
      gender: 'Male',
      blood_group: 'A+',
      last_visit: '2026-10-10',
      primary_diagnosis: 'Sinus Tachycardia (Stress induced)',
      allergies: [],
      phone: '+91 98211 44552'
    }
  ]);

  const [search, setSearch] = useState('');

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.primary_diagnosis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-navy-900">Patient Management Directory</h2>
        <p className="text-xs text-slate-500">Authorized clinical access to patient medical histories and diagnoses</p>
      </div>

      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient name, condition, or ID..."
          className="w-full text-xs px-3.5 py-3 pl-10 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <div key={p.id} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                  Blood: {p.blood_group}
                </span>
                <span className="text-[10px] text-slate-400">Last: {p.last_visit}</span>
              </div>
              <h3 className="text-sm font-bold text-navy-900">{p.name}</h3>
              <p className="text-xs text-slate-500">{p.age} Yrs • {p.gender} • {p.phone}</p>
              
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Primary Diagnosis</span>
                <p className="font-semibold text-navy-900">{p.primary_diagnosis}</p>
                {p.allergies.length > 0 && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1">
                    ⚠️ Allergies: {p.allergies.join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Consent Active
              </span>
              <a
                href="#view-vault"
                className="text-teal-700 font-bold hover:underline flex items-center gap-1"
              >
                Inspect Records <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
