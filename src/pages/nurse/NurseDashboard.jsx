import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity, Heart, Users, Clock, CheckCircle2, Pill, FileText,
  AlertCircle, Plus, Thermometer, Droplets, Wind, Eye, Edit3,
  Save, X, ChevronRight, Calendar, Bell, ClipboardList, UserCheck,
  LayoutDashboard, Stethoscope, TrendingUp, AlertTriangle, Info
} from 'lucide-react';

const TABS = [
  { id: 'overview',   label: 'Overview',          icon: LayoutDashboard },
  { id: 'vitals',     label: 'Patient Vitals',    icon: Activity },
  { id: 'medications',label: 'Medication Records', icon: Pill },
  { id: 'notes',      label: 'Nursing Notes',      icon: ClipboardList },
  { id: 'schedule',   label: 'Shift Schedule',     icon: Calendar },
];

const INITIAL_PATIENTS = [
  {
    id: 'bed-101', bed_no: 'ICU-Bed 04', patient_name: 'Aarav Patel', age: 29, gender: 'Male',
    bp: '122/78', heart_rate: '74', temp: '98.4', spo2: '99', weight: '68 kg',
    status: 'Stable', status_color: 'emerald',
    doctor: 'Dr. Ananya Sharma', ward: 'ICU',
    doctor_instructions: 'Monitor vitals every 2 hours; continue IV fluids 100 ml/hr. Restrict oral intake.',
    allergies: 'Penicillin', diagnosis: 'Post-op Appendectomy',
    medications: [
      { name: 'Ceftriaxone 1g IV', due: '16:00', status: 'Due', route: 'IV' },
      { name: 'Pantoprazole 40mg', due: '08:00', status: 'Given', route: 'IV' },
      { name: 'Tramadol 50mg', due: '20:00', status: 'Scheduled', route: 'IV' },
    ],
    last_updated: '14:30', admission: '2026-10-30',
  },
  {
    id: 'bed-102', bed_no: 'Ward 3B - Bed 12', patient_name: 'Sunita Mukherjee', age: 46, gender: 'Female',
    bp: '138/88', heart_rate: '82', temp: '99.2', spo2: '96', weight: '72 kg',
    status: 'Observation', status_color: 'amber',
    doctor: 'Dr. Vikram Sengupta', ward: 'General Ward 3B',
    doctor_instructions: 'Administer Paracetamol if temp exceeds 99.5°F. Restrict sodium diet. Mobilise q4h.',
    allergies: 'None known', diagnosis: 'Hypertensive Crisis',
    medications: [
      { name: 'Telmisartan 40mg', due: '20:00', status: 'Scheduled', route: 'PO' },
      { name: 'Amlodipine 5mg', due: '08:00', status: 'Given', route: 'PO' },
      { name: 'Paracetamol 650mg', due: 'PRN', status: 'PRN', route: 'PO' },
    ],
    last_updated: '13:45', admission: '2026-10-31',
  },
  {
    id: 'bed-103', bed_no: 'Post-Op - Bed 02', patient_name: 'Kavita Joshi', age: 52, gender: 'Female',
    bp: '118/74', heart_rate: '68', temp: '98.6', spo2: '98', weight: '65 kg',
    status: 'Recovering', status_color: 'blue',
    doctor: 'Dr. Priya Nair', ward: 'Post-Op Recovery',
    doctor_instructions: 'Incentive spirometry every hour. Oral sips permitted. Ambulate twice daily with support.',
    allergies: 'Sulfa drugs', diagnosis: 'Post Lap Cholecystectomy',
    medications: [
      { name: 'Pantoprazole 40mg', due: '08:00', status: 'Given', route: 'IV' },
      { name: 'Ondansetron 4mg', due: 'PRN', status: 'PRN', route: 'IV' },
      { name: 'Ketorolac 30mg', due: '18:00', status: 'Scheduled', route: 'IV' },
    ],
    last_updated: '15:10', admission: '2026-10-31',
  },
];

const NURSING_NOTES = [
  { id: 'n1', patient: 'Aarav Patel', bed: 'ICU-Bed 04', time: '14:30', type: 'Vitals', note: 'BP stable at 122/78. SpO2 99% on room air. IV site intact, no signs of phlebitis. Patient alert and cooperative.', nurse: 'Nurse Sunita Rao' },
  { id: 'n2', patient: 'Sunita Mukherjee', bed: 'Ward 3B - Bed 12', time: '13:45', type: 'Assessment', note: 'Patient restless. Temp 99.2°F – monitoring closely. PRN Paracetamol held pending physician confirmation. BP slightly elevated 138/88.', nurse: 'Nurse Sunita Rao' },
  { id: 'n3', patient: 'Kavita Joshi', bed: 'Post-Op - Bed 02', time: '15:10', type: 'Procedure', note: 'Incentive spirometry performed x3. Patient tolerating oral sips of water. Ambulated 10 metres with nurse assistance. No dizziness reported.', nurse: 'Nurse Sunita Rao' },
];

const SHIFT_SCHEDULE = [
  { time: '07:00', task: 'Shift handover & patient briefing', done: true },
  { time: '07:30', task: 'Morning vitals round – all 3 patients', done: true },
  { time: '08:00', task: 'Administer morning medications', done: true },
  { time: '09:00', task: 'Wound dressing – Kavita Joshi (Post-Op Bed 02)', done: true },
  { time: '10:00', task: 'Doctor rounds assistance – Dr. Ananya Sharma', done: true },
  { time: '11:00', task: 'Incentive spirometry – Kavita Joshi', done: true },
  { time: '12:00', task: 'Noon vitals – Aarav Patel (ICU)', done: false },
  { time: '13:00', task: 'Nutrition assessment – Sunita Mukherjee', done: false },
  { time: '14:00', task: 'Vitals round – all patients', done: false },
  { time: '15:00', task: 'Pre-shift documentation & MAR completion', done: false },
  { time: '15:30', task: 'Handover to evening shift', done: false },
];

const statusColors = {
  emerald: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', header: 'bg-emerald-500' },
  amber:   { badge: 'bg-amber-50 text-amber-700 border-amber-200',   header: 'bg-amber-500' },
  blue:    { badge: 'bg-blue-50 text-blue-700 border-blue-200',      header: 'bg-blue-500' },
};

const medStatusColors = {
  'Given':     'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Due':       'bg-rose-50 text-rose-700 border-rose-200',
  'Scheduled': 'bg-slate-50 text-slate-600 border-slate-200',
  'PRN':       'bg-purple-50 text-purple-700 border-purple-200',
};

export const NurseDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== tab) {
      setTab(urlTab);
    } else if (!urlTab && tab !== 'overview') {
      setTab('overview');
    }
  }, [searchParams]);

  const handleSelectTab = (newTab) => {
    setTab(newTab);
    if (newTab === 'overview') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: newTab });
    }
  };
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [notes, setNotes] = useState(NURSING_NOTES);
  const [editingVitals, setEditingVitals] = useState(null);
  const [vitalForm, setVitalForm] = useState({});
  const [newNote, setNewNote] = useState({ patient: '', type: 'Vitals', note: '' });
  const [toast, setToast] = useState('');
  const [tasks, setTasks] = useState(SHIFT_SCHEDULE);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const startEditVitals = (p) => {
    setEditingVitals(p.id);
    setVitalForm({ bp: p.bp, heart_rate: p.heart_rate, temp: p.temp, spo2: p.spo2 });
  };

  const saveVitals = (patientId) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, ...vitalForm, last_updated: timeStr } : p));
    setEditingVitals(null);
    showToast('Vitals updated and logged to EMR successfully.');
  };

  const markMedGiven = (patientId, medName) => {
    setPatients(prev => prev.map(p => {
      if (p.id !== patientId) return p;
      return { ...p, medications: p.medications.map(m => m.name === medName ? { ...m, status: 'Given' } : m) };
    }));
    showToast(`${medName} marked as administered.`);
  };

  const addNote = () => {
    if (!newNote.patient || !newNote.note.trim()) return;
    const now = new Date();
    setNotes(prev => [{ id: `n${Date.now()}`, ...newNote, time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), nurse: user?.full_name || 'Nurse on Duty', bed: '' }, ...prev]);
    setNewNote({ patient: '', type: 'Vitals', note: '' });
    showToast('Nursing note added to patient record.');
  };

  const toggleTask = (idx) => setTasks(prev => prev.map((t, i) => i === idx ? { ...t, done: !t.done } : t));

  const dueMeds = patients.flatMap(p => p.medications.filter(m => m.status === 'Due').map(m => ({ ...m, patient: p.patient_name, bed: p.bed_no })));
  const doneTasks = tasks.filter(t => t.done).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[11px] font-semibold">
              <Activity className="w-3.5 h-3.5 text-teal-200" /> Nurse Station Terminal
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{user?.full_name || 'Nurse Sunita Rao'}, RN</h2>
            <p className="text-xs text-teal-100">Shift: Morning (07:00 – 15:30) · Active Wards: ICU, Ward 3B, Post-Op</p>
          </div>
          <div className="flex items-center gap-3">
            {dueMeds.length > 0 && (
              <span className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 animate-pulse">
                <Bell className="w-4 h-4" /> {dueMeds.length} Med{dueMeds.length > 1 ? 's' : ''} Due Now
              </span>
            )}
            <span className="px-3.5 py-1.5 rounded-xl bg-white/20 text-white font-bold text-xs border border-white/20">
              {patients.length} Patients Under Care
            </span>
          </div>
        </div>

        {/* Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { label: 'Assigned Patients', value: patients.length, color: 'bg-white/10' },
            { label: 'Meds Due Now', value: dueMeds.length, color: dueMeds.length ? 'bg-rose-500/40' : 'bg-white/10' },
            { label: 'Tasks Complete', value: `${doneTasks}/${tasks.length}`, color: 'bg-white/10' },
            { label: 'Pending Notes', value: notes.length, color: 'bg-white/10' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-2xl p-3 border border-white/10`}>
              <p className="text-[10px] text-teal-200 font-semibold uppercase">{s.label}</p>
              <p className="text-xl font-extrabold text-white mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => handleSelectTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${tab === t.id ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {dueMeds.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-rose-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Medications Due Now</h4>
              {dueMeds.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-white rounded-xl px-3 py-2 border border-rose-100">
                  <span className="font-semibold text-navy-900">{m.name} <span className="text-slate-400 font-normal">· {m.patient} ({m.bed})</span></span>
                  <button onClick={() => markMedGiven(patients.find(p => p.patient_name === m.patient)?.id, m.name)} className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px]">Mark Given</button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {patients.map(p => {
              const sc = statusColors[p.status_color] || statusColors.emerald;
              return (
                <div key={p.id} className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden flex flex-col">
                  <div className={`h-1.5 w-full ${sc.header}`} />
                  <div className="p-5 space-y-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{p.bed_no}</span>
                        <h4 className="text-sm font-bold text-navy-900 mt-1">{p.patient_name}</h4>
                        <p className="text-[11px] text-slate-400">{p.age}y · {p.gender} · {p.diagnosis}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${sc.badge}`}>{p.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[['BP', p.bp + ' mmHg', 'text-rose-600'], ['HR', p.heart_rate + ' bpm', 'text-amber-600'], ['Temp', p.temp + ' °F', 'text-blue-600'], ['SpO2', p.spo2 + '%', 'text-teal-600']].map(([label, val, color]) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{label}</p>
                          <p className={`text-xs font-extrabold ${color} mt-0.5`}>{val}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-blue-50 rounded-xl p-2.5 border border-blue-100 text-[11px] text-slate-700">
                      <p className="font-bold text-blue-700 text-[10px] mb-0.5">Dr. Instructions</p>
                      {p.doctor_instructions}
                    </div>
                    <p className="text-[10px] text-slate-400">Last updated: {p.last_updated} · Dr: {p.doctor}</p>
                  </div>
                  <div className="px-5 pb-4 flex gap-2">
                    <button onClick={() => { handleSelectTab('vitals'); startEditVitals(p); }} className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" /> Update Vitals
                    </button>
                    <button onClick={() => handleSelectTab('notes')} className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Add Note
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VITALS TAB ── */}
      {tab === 'vitals' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-navy-900">Patient Vitals Monitor & Update</h3>
          {patients.map(p => {
            const isEditing = editingVitals === p.id;
            const sc = statusColors[p.status_color] || statusColors.emerald;
            return (
              <div key={p.id} className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">{p.bed_no}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sc.badge}`}>{p.status}</span>
                    </div>
                    <h4 className="text-sm font-bold text-navy-900 mt-1">{p.patient_name} · {p.age}y · {p.gender}</h4>
                    <p className="text-[11px] text-slate-400">Last updated: {p.last_updated} · Attending: {p.doctor}</p>
                  </div>
                  {!isEditing ? (
                    <button onClick={() => startEditVitals(p)} className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" /> Edit Vitals
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => saveVitals(p.id)} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Save</button>
                      <button onClick={() => setEditingVitals(null)} className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { key: 'bp', label: 'Blood Pressure (mmHg)', placeholder: '120/80' },
                      { key: 'heart_rate', label: 'Heart Rate (bpm)', placeholder: '72' },
                      { key: 'temp', label: 'Temperature (°F)', placeholder: '98.6' },
                      { key: 'spo2', label: 'SpO2 (%)', placeholder: '98' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">{f.label}</label>
                        <input
                          className="w-full mt-1 px-3 py-2 text-xs border border-teal-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 font-mono font-bold"
                          value={vitalForm[f.key] || ''}
                          onChange={e => setVitalForm(v => ({ ...v, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: Droplets, label: 'Blood Pressure', value: p.bp + ' mmHg', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
                      { icon: Heart, label: 'Heart Rate', value: p.heart_rate + ' bpm', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
                      { icon: Thermometer, label: 'Temperature', value: p.temp + ' °F', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
                      { icon: Wind, label: 'SpO2', value: p.spo2 + '%', color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
                    ].map((v, i) => {
                      const Icon = v.icon;
                      return (
                        <div key={i} className={`p-3 rounded-2xl border ${v.bg}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon className={`w-3.5 h-3.5 ${v.color}`} />
                            <p className="text-[10px] font-bold text-slate-500 uppercase">{v.label}</p>
                          </div>
                          <p className={`text-base font-extrabold ${v.color}`}>{v.value}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-blue-700 mb-1">Doctor Instructions</p>
                  <p className="text-xs text-slate-700">{p.doctor_instructions}</p>
                </div>
                {p.allergies !== 'None known' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <p className="text-[11px] text-amber-800 font-semibold">Allergy Alert: {p.allergies}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── MEDICATIONS TAB ── */}
      {tab === 'medications' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-navy-900">Medication Administration Records (MAR)</h3>
          {patients.map(p => (
            <div key={p.id} className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-navy-900">{p.patient_name}</h4>
                  <p className="text-[11px] text-slate-400">{p.bed_no} · {p.diagnosis} · Allergies: <span className="text-amber-700 font-semibold">{p.allergies}</span></p>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-lg">{p.ward}</span>
              </div>
              <div className="space-y-2">
                {p.medications.map((m, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Pill className="w-4 h-4 text-teal-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-navy-900">{m.name}</p>
                        <p className="text-[10px] text-slate-400">Route: {m.route} · Scheduled: {m.due}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${medStatusColors[m.status] || medStatusColors['Scheduled']}`}>{m.status}</span>
                      {m.status !== 'Given' && m.status !== 'PRN' && (
                        <button onClick={() => markMedGiven(p.id, m.name)} className="text-[11px] px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold">
                          Mark Given
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── NOTES TAB ── */}
      {tab === 'notes' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-4">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2"><Plus className="w-4 h-4 text-teal-600" /> Add Nursing Note</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">Patient</label>
                <select value={newNote.patient} onChange={e => setNewNote(n => ({ ...n, patient: e.target.value }))} className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50">
                  <option value="">Select patient...</option>
                  {patients.map(p => <option key={p.id} value={p.patient_name}>{p.patient_name} ({p.bed_no})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">Note Type</label>
                <select value={newNote.type} onChange={e => setNewNote(n => ({ ...n, type: e.target.value }))} className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50">
                  {['Vitals', 'Assessment', 'Procedure', 'Medication', 'Patient Education', 'Incident', 'Handover'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">Clinical Note</label>
              <textarea rows={3} value={newNote.note} onChange={e => setNewNote(n => ({ ...n, note: e.target.value }))} placeholder="Enter detailed nursing observation..." className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 resize-none" />
            </div>
            <button onClick={addNote} disabled={!newNote.patient || !newNote.note.trim()} className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 disabled:bg-slate-300">
              <Save className="w-3.5 h-3.5" /> Save Note to EMR
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-3">
            <h3 className="text-sm font-bold text-navy-900">Nursing Notes Log</h3>
            {notes.map(n => (
              <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-navy-900">{n.patient}</span>
                    {n.bed && <span className="text-[10px] text-slate-400">{n.bed}</span>}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">{n.type}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{n.time} · {n.nurse}</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">{n.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SCHEDULE TAB ── */}
      {tab === 'schedule' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2"><Calendar className="w-4 h-4 text-teal-600" /> Today's Shift Schedule</h3>
            <span className="text-xs text-slate-500">{doneTasks}/{tasks.length} tasks complete</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
            <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${(doneTasks / tasks.length) * 100}%` }} />
          </div>
          <div className="space-y-2">
            {tasks.map((t, i) => (
              <div key={i} onClick={() => toggleTask(i)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${t.done ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${t.done ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span className="text-[11px] font-bold text-slate-400 font-mono w-12 shrink-0">{t.time}</span>
                <span className={`text-xs ${t.done ? 'text-slate-400 line-through' : 'text-navy-900 font-medium'}`}>{t.task}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
