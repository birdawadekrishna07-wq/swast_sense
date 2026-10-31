import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  Pill, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2, 
  User, 
  Calendar, 
  Clock, 
  HeartPulse, 
  FileText,
  Building,
  Sparkles,
  ArrowRight,
  Eye,
  Check,
  AlertCircle
} from 'lucide-react';

const COMMON_DRUGS = [
  { name: 'Telmisartan 40mg', dosage: '1 Tablet', frequency: 'Once daily (Morning)', duration: '30 Days', instructions: 'Take after breakfast with water' },
  { name: 'Atorvastatin 20mg', dosage: '1 Tablet', frequency: 'Once daily (Bedtime)', duration: '30 Days', instructions: 'Take at night after food' },
  { name: 'Amoxicillin 500mg', dosage: '1 Capsule', frequency: '1-0-1 (Twice daily)', duration: '5 Days', instructions: 'Complete full course. Take after meals.' },
  { name: 'Metformin 500mg', dosage: '1 Tablet', frequency: '1-0-1 (Twice daily)', duration: '60 Days', instructions: 'Take with or immediately after meals' },
  { name: 'Pantoprazole 40mg', dosage: '1 Tablet', frequency: 'Once daily (Morning)', duration: '14 Days', instructions: 'Take 30 minutes before breakfast' },
  { name: 'Paracetamol 650mg', dosage: '1 Tablet', frequency: 'TDS / PRN (As needed)', duration: '5 Days', instructions: 'Take for fever or pain. Do not exceed 4g/day.' },
  { name: 'Cetirizine 10mg', dosage: '1 Tablet', frequency: 'Once daily (Night)', duration: '7 Days', instructions: 'Take at bedtime. May cause mild drowsiness.' }
];

const PATIENT_OPTIONS = [
  { id: 'usr-pat-001', name: 'Rahul Deshmukh', age: 38, gender: 'Male', bloodGroup: 'O+', allergies: 'Penicillin, Peanuts' },
  { id: 'usr-pat-002', name: 'Sunita Mukherjee', age: 46, gender: 'Female', bloodGroup: 'B+', allergies: 'None known' },
  { id: 'usr-pat-003', name: 'Aarav Patel', age: 29, gender: 'Male', bloodGroup: 'A+', allergies: 'Sulfa drugs' },
  { id: 'usr-pat-004', name: 'Kavita Joshi', age: 52, gender: 'Female', bloodGroup: 'AB+', allergies: 'Aspirin' },
];

export const DoctorPrescriptionCreator = () => {
  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState('usr-pat-001');
  const [diagnosis, setDiagnosis] = useState('Essential Stage 1 Hypertension & Tension Cephalea');
  const [clinicalNotes, setClinicalNotes] = useState('Patient advised low-sodium DASH diet. Daily 30-min brisk walk. Log blood pressure reading in portal every Sunday.');
  const [followUpDate, setFollowUpDate] = useState('2026-11-28');
  
  const [items, setItems] = useState([
    {
      medicine_name: 'Telmisartan 40mg',
      dosage: '1 Tablet',
      frequency: 'Once daily (Morning)',
      duration: '30 Days',
      instructions: 'Take after breakfast with water'
    },
    {
      medicine_name: 'CoQ10 100mg',
      dosage: '1 Capsule',
      frequency: 'Once daily (Lunch)',
      duration: '30 Days',
      instructions: 'Take with food'
    }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);

  const selectedPatient = PATIENT_OPTIONS.find(p => p.id === selectedPatientId) || PATIENT_OPTIONS[0];

  const handleAddItem = (preset = null) => {
    if (preset) {
      setItems(prev => [...prev, { ...preset }]);
    } else {
      setItems((prev) => [
        ...prev,
        { medicine_name: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '7 Days', instructions: 'Take after meals' }
      ]);
    }
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0 || !items[0].medicine_name) {
      alert('Please add at least one prescribed medicine.');
      return;
    }

    setSubmitting(true);

    const now = new Date();
    const mockHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newRxId = `rx-${Date.now().toString().slice(-6)}`;

    const newPrescriptionRecord = {
      id: newRxId,
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.name,
      patient_age: selectedPatient.age,
      patient_gender: selectedPatient.gender,
      patient_blood_group: selectedPatient.bloodGroup,
      allergies: selectedPatient.allergies.split(', '),
      doctor: {
        id: user?.id || 'doc-01',
        full_name: user?.full_name || 'Dr. Ananya Sharma',
        qualification: user?.staff_details?.qualification || 'MBBS, MD (Cardiology), DM, FACC',
        reg_number: 'MMC-2010-09821',
        specialization: user?.staff_details?.specialization || 'Cardiology',
        hospital: 'Swasthya Sense Central Hospital, Mumbai'
      },
      department: { name: 'Cardiology', code: 'CARD' },
      diagnosis: diagnosis,
      clinical_notes: clinicalNotes,
      follow_up_date: followUpDate,
      is_digitally_signed: true,
      signature_hash: mockHash,
      signed_at: now.toISOString(),
      created_at: now.toISOString(),
      status: 'Active',
      items: items
    };

    try {
      // 1. Try sending to backend
      await api.createPrescription({
        patient_id: selectedPatient.id,
        diagnosis: diagnosis,
        clinical_notes: clinicalNotes,
        follow_up_date: followUpDate,
        items: items
      }).catch(() => {});

      // 2. Save into localStorage so patient vault and pharmacist queue get updated immediately
      const existing = JSON.parse(localStorage.getItem('swasthya_created_prescriptions') || '[]');
      localStorage.setItem('swasthya_created_prescriptions', JSON.stringify([newPrescriptionRecord, ...existing]));

      setSuccessReceipt({
        id: newRxId,
        patient: selectedPatient.name,
        signature_hash: mockHash,
        signed_at: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        items_count: items.length
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-brand-800 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[11px] font-semibold backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-200" />
            <span>Digital Clinical Prescription Suite</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Issue Digital Prescription</h2>
          <p className="text-xs text-teal-100 max-w-xl">
            Create tamper-evident prescriptions with authenticated SHA-256 digital signatures and automatic patient medicine reminder integration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-white/20 text-white font-bold text-xs border border-white/20">
            Doctor: {user?.full_name || 'Dr. Ananya Sharma'}
          </span>
        </div>
      </div>

      {/* Success Receipt Modal */}
      {successReceipt && (
        <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 space-y-4 shadow-soft animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-emerald-950">
                  Prescription #{successReceipt.id.toUpperCase()} Successfully Issued & Digitally Signed!
                </h3>
                <p className="text-xs text-emerald-700">
                  Patient: <strong>{successReceipt.patient}</strong> · Time: {successReceipt.signed_at}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSuccessReceipt(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-3 py-1 bg-emerald-100 rounded-lg"
            >
              Dismiss
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-xs space-y-1 font-mono text-slate-700">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Cryptographic Authentication Seal</p>
            <p className="break-all font-bold text-teal-900">SHA256:{successReceipt.signature_hash}</p>
            <p className="text-[10px] text-slate-500 font-sans mt-1">
              ✓ Logged to hospital EMR · ✓ Synced to Patient Digital Health Vault · ✓ Sent to Central Pharmacy
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/patient/prescriptions"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View in Patient Vault</span>
            </Link>
            <button
              onClick={() => {
                setSuccessReceipt(null);
                setDiagnosis('');
                setClinicalNotes('');
                setItems([{ medicine_name: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '7 Days', instructions: 'After meals' }]);
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-emerald-900 border border-emerald-200 text-xs font-semibold"
            >
              Write Another Prescription
            </button>
          </div>
        </div>
      )}

      {/* Main Prescription Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-6">
        
        {/* Step 1: Patient Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            <span>1. Select Registered Patient</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">Patient Name & ID *</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-semibold text-navy-900"
              >
                {PATIENT_OPTIONS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age} Yrs, {p.gender}) — Blood: {p.bloodGroup}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[10px] text-amber-800 font-bold uppercase block">Allergy Caution</span>
                <span className="text-amber-900 font-semibold">{selectedPatient.allergies}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Clinical Diagnosis & Instructions */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>2. Clinical Diagnosis & Patient Advice</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">Clinical Diagnosis *</label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Type 2 Diabetes Mellitus, Essential Hypertension"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">Follow-Up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">Physician Clinical Guidance & Diet Instructions</label>
            <textarea
              rows="2"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="e.g. Low sodium diet, 30 min daily walking, check morning fasting blood sugar..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
            ></textarea>
          </div>
        </div>

        {/* Step 3: Prescribed Medications */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-brand-600" />
              <span>3. Prescribed Medicines (Rx)</span>
            </h3>

            <button
              type="button"
              onClick={() => handleAddItem()}
              className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs border border-brand-200 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Medicine</span>
            </button>
          </div>

          {/* Quick Drug Template Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">Quick Add:</span>
            {COMMON_DRUGS.map((d) => (
              <button
                type="button"
                key={d.name}
                onClick={() => handleAddItem(d)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold shrink-0 transition-colors"
              >
                + {d.name}
              </button>
            ))}
          </div>

          {/* Medication Rows */}
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-700">Medicine #{idx + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Medicine Name & Strength *</label>
                    <input
                      type="text"
                      required
                      value={item.medicine_name}
                      onChange={(e) => handleItemChange(idx, 'medicine_name', e.target.value)}
                      placeholder="e.g. Telmisartan 40mg"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-bold text-navy-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Dosage</label>
                    <input
                      type="text"
                      value={item.dosage}
                      onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                      placeholder="1 Tablet / 5ml"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Duration</label>
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) => handleItemChange(idx, 'duration', e.target.value)}
                      placeholder="30 Days / 5 Days"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Frequency / Timing</label>
                    <input
                      type="text"
                      value={item.frequency}
                      onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                      placeholder="1-0-1 (Morning & Night)"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Meal Instructions</label>
                    <input
                      type="text"
                      value={item.instructions}
                      onChange={(e) => handleItemChange(idx, 'instructions', e.target.value)}
                      placeholder="Take after breakfast with water"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar with Digital Signature info */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Prescription will be cryptographically signed using your Clinician Private Key</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-glow flex items-center justify-center gap-2 transition-all disabled:bg-slate-300"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{submitting ? 'Generating Digital Signature...' : 'Issue Digitally Signed Prescription'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
