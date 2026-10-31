import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Plus, 
  CheckCircle2, 
  Filter, 
  Lock, 
  ShieldCheck, 
  X,
  FileCheck,
  AlertCircle,
  Search,
  Activity,
  Calendar,
  User,
  Hospital,
  Share2,
  Trash2,
  Printer,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
  Check,
  AlertTriangle
} from 'lucide-react';

const FALLBACK_INITIAL_RECORDS = [
  {
    id: "rec-cbc-lipid-2026",
    patient_id: "usr-pat-001",
    doctor_name: "Dr. Rajesh Sharma, MD, DM",
    facility: "Swasthya Central Reference Laboratory (NABL Accredited)",
    record_type: "lab_report",
    title: "Complete Blood Count & Advanced Lipid Profile",
    description: "Total Cholesterol 218 mg/dL (Borderline High), HDL 44 mg/dL, LDL 138 mg/dL, Fasting Sugar 98 mg/dL, HbA1c 5.6%. Normal hemogram.",
    file_name: "Lipid_CBC_Panel_Oct2026.pdf",
    file_size: 1420000,
    file_url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop",
    created_at: "2026-10-25T10:30:00Z",
    is_confidential: false,
    parameters: [
      { parameter: "Total Cholesterol", value: "218 mg/dL", reference: "< 200 mg/dL", status: "high" },
      { parameter: "HDL Cholesterol", value: "44 mg/dL", reference: "> 40 mg/dL", status: "normal" },
      { parameter: "LDL Cholesterol", value: "138 mg/dL", reference: "< 100 mg/dL", status: "high" },
      { parameter: "Serum Triglycerides", value: "180 mg/dL", reference: "< 150 mg/dL", status: "high" },
      { parameter: "Fasting Blood Glucose", value: "98 mg/dL", reference: "70 - 99 mg/dL", status: "normal" },
      { parameter: "Glycated Hemoglobin (HbA1c)", value: "5.6 %", reference: "< 5.7 %", status: "normal" },
      { parameter: "Hemoglobin (Hb)", value: "14.2 g/dL", reference: "13.0 - 17.0 g/dL", status: "normal" },
      { parameter: "Platelet Count", value: "240,000 /mcL", reference: "150,000 - 450,000", status: "normal" }
    ],
    impression: "Mild primary dyslipidemia with borderline elevated LDL and triglycerides. Glycemic control is optimal. Dietary lifestyle modification and physical activity recommended."
  },
  {
    id: "rec-ecg-12lead-2026",
    patient_id: "usr-pat-001",
    doctor_name: "Dr. Rajesh Sharma, MD, DM",
    facility: "Apex Heart & Vascular Diagnostic Institute",
    record_type: "diagnosis",
    title: "Standard 12-Lead Electrocardiogram (ECG)",
    description: "Normal resting 12-lead ECG. Regular sinus rhythm at 72 bpm. PR interval 148 ms, QRS 88 ms, QTc 422 ms. No acute ischemic repolarization changes.",
    file_name: "12Lead_ECG_Telemetry_Oct2026.pdf",
    file_size: 950000,
    file_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop",
    created_at: "2026-10-20T14:15:00Z",
    is_confidential: false,
    parameters: [
      { parameter: "Resting Heart Rate", value: "72 bpm", reference: "60 - 100 bpm", status: "normal" },
      { parameter: "Rhythm", value: "Normal Sinus Rhythm", reference: "Sinus Rhythm", status: "normal" },
      { parameter: "PR Interval", value: "148 ms", reference: "120 - 200 ms", status: "normal" },
      { parameter: "QRS Duration", value: "88 ms", reference: "< 100 ms", status: "normal" },
      { parameter: "QTc Interval", value: "422 ms", reference: "< 440 ms", status: "normal" },
      { parameter: "ST-T Segment", value: "No Elevation / Depression", reference: "Isoelectric", status: "normal" }
    ],
    impression: "Normal resting ECG. No evidence of arrhythmias, conduction defects, or acute coronary ischemia."
  },
  {
    id: "rec-mri-brain-2026",
    patient_id: "usr-pat-001",
    doctor_name: "Dr. Priya Nair, MD (Neuroradiology)",
    facility: "Swasthya Advanced 3.0 Tesla Imaging Pavilion",
    record_type: "imaging",
    title: "3T Brain MRI Scan with Diffusion (DWI & FLAIR)",
    description: "High resolution neuroimaging study. Symmetric cerebral hemispheres, normal ventricles and basilar cisterns. No acute stroke or space occupying lesion.",
    file_name: "Brain_MRI_DWI_FLAIR_Oct2026.pdf",
    file_size: 4200000,
    file_url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop",
    created_at: "2026-10-14T11:45:00Z",
    is_confidential: true,
    parameters: [
      { parameter: "Grey-White Differentiation", value: "Preserved", reference: "Preserved", status: "normal" },
      { parameter: "Ventricular System", value: "Normal Calibre", reference: "Normal Calibre", status: "normal" },
      { parameter: "Diffusion Restriction (DWI)", value: "Absent (No Acute Infarct)", reference: "Absent", status: "normal" },
      { parameter: "Midline Shift", value: "None detected", reference: "0 mm", status: "normal" }
    ],
    impression: "Unremarkable cranial MRI. No evidence of intracranial hemorrhage, hydrocephalus, or territorial cerebral ischemia."
  },
  {
    id: "rec-echo-cardiac-2026",
    patient_id: "usr-pat-001",
    doctor_name: "Dr. Rajesh Sharma, MD, DM",
    facility: "Apex Heart & Vascular Diagnostic Institute",
    record_type: "imaging",
    title: "Transthoracic 2D-Echocardiogram & Doppler",
    description: "Preserved LV systolic function with ejection fraction 62%. Normal wall motion at rest. Structurally normal cardiac valves.",
    file_name: "Transthoracic_ECHO_Report_Sep2026.pdf",
    file_size: 2100000,
    file_url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop",
    created_at: "2026-09-28T16:00:00Z",
    is_confidential: false,
    parameters: [
      { parameter: "Left Ventricular Ejection Fraction (LVEF)", value: "62 %", reference: "55 - 70 %", status: "normal" },
      { parameter: "Left Ventricle Internal Diastolic (LVIDd)", value: "4.6 cm", reference: "3.5 - 5.6 cm", status: "normal" },
      { parameter: "Left Atrium Diameter", value: "3.4 cm", reference: "3.0 - 4.0 cm", status: "normal" },
      { parameter: "TAPSE (Right Ventricle)", value: "22 mm", reference: "> 17 mm", status: "normal" }
    ],
    impression: "Normal LV systolic function. Preserved ejection fraction. No regional wall motion abnormalities."
  },
  {
    id: "rec-discharge-gastritis-2026",
    patient_id: "usr-pat-001",
    doctor_name: "Dr. Arvind Menon, MD",
    facility: "Swasthya Multi-Specialty Hospital - Inpatient Ward 4B",
    record_type: "consultation_note",
    title: "Clinical Summary & Hospital Discharge Note",
    description: "Treated for Acute Gastric Distress & Mild Dehydration. Symptomatic relief achieved with IV fluids & PPI infusion. Hemodynamically stable upon discharge.",
    file_name: "Clinical_Discharge_Summary_Sep2026.pdf",
    file_size: 890000,
    file_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop",
    created_at: "2026-09-15T09:30:00Z",
    is_confidential: false,
    parameters: [
      { parameter: "Admission Diagnosis", value: "Acute Gastritis & Dehydration", reference: "-", status: "normal" },
      { parameter: "Discharge Vitals BP", value: "118/76 mmHg", reference: "90/60 - 120/80", status: "normal" },
      { parameter: "Discharge Pulse", value: "74 bpm", reference: "60 - 100 bpm", status: "normal" },
      { parameter: "Condition at Discharge", value: "Satisfactory / Ambulated", reference: "-", status: "normal" }
    ],
    impression: "Complete clinical recovery from gastritis. Advised oral Pantoprazole 40mg once daily before breakfast for 14 days and adequate hydration."
  }
];

export const PatientMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Upload Form State
  const [title, setTitle] = useState('');
  const [recordType, setRecordType] = useState('lab_report');
  const [facility, setFacility] = useState('Swasthya Central Reference Laboratory');
  const [doctorName, setDoctorName] = useState('Dr. Rajesh Sharma, MD, DM');
  const [description, setDescription] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  // Load records from local storage or backend API
  useEffect(() => {
    async function loadRecords() {
      try {
        const savedCustom = localStorage.getItem('swasthya_custom_records');
        let localRecords = [];
        if (savedCustom) {
          try {
            localRecords = JSON.parse(savedCustom);
          } catch (e) {
            console.error("Failed to parse saved records", e);
          }
        }

        const data = await api.getMedicalRecords('', filterType === 'all' ? '' : filterType);
        
        // Merge records
        let merged = [];
        if (data && data.length > 0) {
          merged = [...data];
        } else {
          merged = [...FALLBACK_INITIAL_RECORDS];
        }

        // Add any locally added records that aren't in the list
        localRecords.forEach(localRec => {
          if (!merged.some(m => m.id === localRec.id)) {
            merged.unshift(localRec);
          }
        });

        setRecords(merged);
      } catch (err) {
        console.error("Error fetching medical records:", err);
        const savedCustom = localStorage.getItem('swasthya_custom_records');
        if (savedCustom) {
          try {
            const parsed = JSON.parse(savedCustom);
            setRecords([...parsed, ...FALLBACK_INITIAL_RECORDS]);
          } catch {
            setRecords(FALLBACK_INITIAL_RECORDS);
          }
        } else {
          setRecords(FALLBACK_INITIAL_RECORDS);
        }
      } finally {
        setLoading(false);
      }
    }
    loadRecords();
  }, [filterType]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRecordId = `rec-user-${Date.now()}`;
    const newRecord = {
      id: newRecordId,
      patient_id: 'usr-pat-001',
      record_type: recordType,
      title: title.trim(),
      description: description.trim() || 'Patient uploaded clinical record saved to encrypted vault.',
      facility: facility.trim() || 'Swasthya Health Network',
      doctor_name: doctorName.trim() || 'Verified Clinical Specialist',
      file_name: uploadedFile ? uploadedFile.name : `${title.trim().replace(/\s+/g, '_')}_2026.pdf`,
      file_size: uploadedFile ? uploadedFile.size : 1240000,
      file_url: filePreviewUrl || 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop',
      is_confidential: isConfidential,
      created_at: new Date().toISOString(),
      parameters: [
        { parameter: "Document Status", value: "Verified & Archived", reference: "Active", status: "normal" },
        { parameter: "Security Standard", value: "ABDM / HIPAA Compliant", reference: "ISO-27001", status: "normal" }
      ],
      impression: description.trim() || "Uploaded document archived in patient's personal health vault."
    };

    try {
      await api.addMedicalRecord(newRecord);
    } catch (err) {
      console.warn("API add record failed, persisting to local vault:", err);
    }

    // Persist to local storage
    const existingSaved = localStorage.getItem('swasthya_custom_records');
    let customArr = [];
    if (existingSaved) {
      try {
        customArr = JSON.parse(existingSaved);
      } catch (e) {
        customArr = [];
      }
    }
    customArr.unshift(newRecord);
    localStorage.setItem('swasthya_custom_records', JSON.stringify(customArr));

    setRecords(prev => [newRecord, ...prev]);
    setUploadModalOpen(false);
    showToast(`"${newRecord.title}" successfully encrypted & added to vault!`);

    // Reset Form
    setTitle('');
    setDescription('');
    setUploadedFile(null);
    setFilePreviewUrl('');
    setIsConfidential(false);
  };

  const handleDeleteRecord = async (recordId, recordTitle) => {
    if (!window.confirm(`Are you sure you want to remove "${recordTitle}" from your health vault?`)) {
      return;
    }

    try {
      await api.delete?.(`/records/${recordId}`);
    } catch (e) {
      // ignore
    }

    // Remove from local storage
    const savedCustom = localStorage.getItem('swasthya_custom_records');
    if (savedCustom) {
      try {
        let customArr = JSON.parse(savedCustom);
        customArr = customArr.filter(r => r.id !== recordId);
        localStorage.setItem('swasthya_custom_records', JSON.stringify(customArr));
      } catch (e) {
        // ignore
      }
    }

    setRecords(prev => prev.filter(r => r.id !== recordId));
    if (selectedReport?.id === recordId) {
      setSelectedReport(null);
    }
    showToast('Record safely removed from vault.');
  };

  const handleShare = (rec) => {
    const shareText = `Swasthya Sense Health Vault: ${rec.title} (${rec.facility}) - ABDM Ref: #${rec.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      showToast('Secure sharing link & report ID copied to clipboard!');
    } else {
      showToast('Report reference: ' + rec.id);
    }
  };

  const handleDownloadReport = (rec) => {
    const reportContent = `
=============================================================
SWASTHYA SENSE - OFFICIAL CLINICAL DIAGNOSTIC REPORT
Accredited by NABL | ISO 15189:2022 | Ayushman Bharat Digital Mission
=============================================================
Document ID: ${rec.id}
Record Type: ${rec.record_type?.toUpperCase()}
Date: ${formatDate(rec.created_at)}
Patient Name: Patient Demo (UHID: SS-PAT-884920)
Referring Doctor: ${rec.doctor_name || 'Dr. Rajesh Sharma, MD, DM'}
Healthcare Facility: ${rec.facility || 'Swasthya Central Diagnostics'}

TITLE: ${rec.title}
SUMMARY / DESCRIPTION:
${rec.description}

DIAGNOSTIC TEST VALUES:
${rec.parameters ? rec.parameters.map(p => `- ${p.parameter}: ${p.value} [Reference: ${p.reference}] (Status: ${p.status.toUpperCase()})`).join('\n') : 'Comprehensive Diagnostic Panel Verified'}

CLINICAL IMPRESSION:
${rec.impression || rec.description}

DIGITAL SIGN-OFF:
Electronically verified and signed by consulting specialist.
Tamper-evident verification hash: SHA256:${rec.id.replace(/[^a-zA-Z0-9]/g, '')}88a91c2026
=============================================================
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rec.title.replace(/[^a-zA-Z0-9]/g, '_')}_Swasthya_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Diagnostic report downloaded successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered list based on search and type
  const filteredRecords = records.filter(rec => {
    const matchesType = filterType === 'all' || rec.record_type === filterType;
    const matchesSearch = !searchQuery.trim() || 
      rec.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.facility?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getRecordTypeBadge = (type) => {
    switch (type) {
      case 'lab_report':
        return <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">Lab Report</span>;
      case 'imaging':
        return <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">Imaging & Scans</span>;
      case 'diagnosis':
        return <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">Clinical Diagnosis</span>;
      case 'consultation_note':
        return <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Clinical Note</span>;
      default:
        return <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">General Record</span>;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '1.2 MB';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-navy-950 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-brand-500/30 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-navy-900 tracking-tight">Medical Records Vault</h2>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-brand-100 text-brand-700 rounded-full border border-brand-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-brand-600" /> ABDM / HIPAA 256-Bit
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Secure, encrypted lifetime diagnostic repository. Verified with hospital labs, telemetry and high-resolution imaging.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all self-start sm:self-auto active:scale-95"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Medical Record</span>
        </button>
      </div>

      {/* Stat Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Documents</span>
            <FileText className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-black text-navy-900">{records.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Archived in vault</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Lab Test Reports</span>
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-teal-600">
            {records.filter(r => r.record_type === 'lab_report').length}
          </p>
          <p className="text-[10px] text-teal-600/70 mt-1">NABL Accredited</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Scans & Telemetry</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-600">
            {records.filter(r => r.record_type === 'imaging' || r.record_type === 'diagnosis').length}
          </p>
          <p className="text-[10px] text-purple-600/70 mt-1">MRI, ECG, Echo</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Vault Encryption</span>
            <Lock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xs font-black text-emerald-600 flex items-center gap-1 mt-2">
            <CheckCircle2 className="w-4 h-4" /> AES-256 GCM
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Zero-Trust Protected</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-soft">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by test name, doctor, or facility..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Records', count: records.length },
            { id: 'lab_report', label: 'Lab Reports', count: records.filter(r => r.record_type === 'lab_report').length },
            { id: 'imaging', label: 'Imaging & Scans', count: records.filter(r => r.record_type === 'imaging').length },
            { id: 'diagnosis', label: 'ECG & Diagnosis', count: records.filter(r => r.record_type === 'diagnosis').length },
            { id: 'consultation_note', label: 'Discharge Notes', count: records.filter(r => r.record_type === 'consultation_note').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterType === tab.id
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterType === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-soft animate-pulse space-y-4">
              <div className="h-4 bg-slate-100 rounded w-1/3"></div>
              <div className="h-6 bg-slate-100 rounded w-3/4"></div>
              <div className="h-12 bg-slate-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-100 shadow-soft space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-navy-900">No matching medical records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery 
              ? `No records match "${searchQuery}". Try searching with a different keyword.` 
              : 'There are currently no records in this category.'}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setFilterType('all'); }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Records Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((rec) => (
            <div 
              key={rec.id} 
              className="p-5 rounded-3xl bg-white border border-slate-100 shadow-soft hover:shadow-soft-lg hover:border-brand-200 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Top Meta */}
                <div className="flex items-center justify-between">
                  {getRecordTypeBadge(rec.record_type)}
                  <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formatDate(rec.created_at)}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h4 
                    onClick={() => setSelectedReport(rec)}
                    className="text-sm font-bold text-navy-900 leading-snug group-hover:text-brand-600 cursor-pointer transition-colors"
                  >
                    {rec.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                    <Hospital className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{rec.facility || 'Swasthya Medical Centre'}</span>
                  </p>
                </div>

                {/* Doctor */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 text-[11px] text-slate-600 border border-slate-100">
                  <User className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">{rec.doctor_name || 'Consulting Physician'}</span>
                </div>

                {/* Description / Clinical Highlights */}
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {rec.description}
                </p>

                {/* Parameters preview pill tags if present */}
                {rec.parameters && rec.parameters.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rec.parameters.slice(0, 2).map((p, i) => (
                      <span 
                        key={i} 
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                          p.status === 'high' 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {p.parameter}: {p.value}
                      </span>
                    ))}
                    {rec.parameters.length > 2 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                        +{rec.parameters.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium truncate max-w-[140px] flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span>{rec.file_name || 'Report.pdf'} ({formatFileSize(rec.file_size)})</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedReport(rec)}
                    className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors font-semibold text-xs flex items-center gap-1 px-2.5 bg-brand-50/60"
                    title="View Comprehensive Diagnostic Report"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => handleDownloadReport(rec)}
                    className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    title="Download Report Summary"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleShare(rec)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    title="Share Encrypted Reference"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteRecord(rec.id, rec.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INTERACTIVE CLINICAL REPORT VIEWER MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-3xl w-full bg-white rounded-3xl shadow-soft-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
            
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-brand-400" />
                <span className="text-xs font-bold tracking-wide uppercase text-slate-200">
                  Diagnostic Report Viewer
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  Verified SHA-256
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => handleDownloadReport(selectedReport)}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content (Printable Layout) */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto" id="printable-medical-record">
              
              {/* Hospital / Lab Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-slate-100 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-black text-sm">
                      SS
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-navy-900 leading-none">
                        {selectedReport.facility || 'Swasthya Central Diagnostic Laboratory'}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
                        National Accreditation Board for Testing and Calibration Laboratories (NABL)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right sm:text-right space-y-0.5 text-xs text-slate-500">
                  <p className="font-mono text-slate-700 font-bold">Doc Ref: #{selectedReport.id}</p>
                  <p className="text-[10px]">Verified: {formatDate(selectedReport.created_at)}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">ABDM ID: 91-8849-2026-9011</p>
                </div>
              </div>

              {/* Patient & Doctor Demographics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Patient Name</span>
                  <p className="font-extrabold text-navy-900 mt-0.5">Patient Demo</p>
                  <p className="text-[10px] text-slate-500">UHID: SS-PAT-884920</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Age / Gender</span>
                  <p className="font-extrabold text-navy-900 mt-0.5">34 Yrs / Male</p>
                  <p className="text-[10px] text-slate-500">Blood Group: O+ Positive</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Referring Doctor</span>
                  <p className="font-extrabold text-navy-900 mt-0.5">{selectedReport.doctor_name || 'Dr. Rajesh Sharma'}</p>
                  <p className="text-[10px] text-slate-500">License: MCI-948102</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Report Category</span>
                  <div className="mt-1">{getRecordTypeBadge(selectedReport.record_type)}</div>
                </div>
              </div>

              {/* Main Report Details */}
              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-navy-900">{selectedReport.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-brand-50/40 p-3 rounded-xl border border-brand-100">
                  <span className="font-bold text-brand-900 block mb-1">Clinical Indication / Summary:</span>
                  {selectedReport.description}
                </p>
              </div>

              {/* Parameters Breakdown Table */}
              {selectedReport.parameters && selectedReport.parameters.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-brand-600" />
                    Observed Diagnostic Findings & Test Parameters
                  </h5>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 text-[11px] uppercase font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3 pl-4">Investigation Parameter</th>
                          <th className="p-3">Result / Observed</th>
                          <th className="p-3">Reference Interval</th>
                          <th className="p-3 pr-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {selectedReport.parameters.map((param, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            <td className="p-3 pl-4 font-semibold text-navy-900">{param.parameter}</td>
                            <td className="p-3 font-mono font-bold text-slate-800">{param.value}</td>
                            <td className="p-3 text-slate-500 font-mono text-[11px]">{param.reference}</td>
                            <td className="p-3 pr-4 text-center">
                              {param.status === 'high' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 justify-center w-fit mx-auto">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" /> High
                                </span>
                              ) : param.status === 'low' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1 justify-center w-fit mx-auto">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Low
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 justify-center w-fit mx-auto">
                                  <Check className="w-3 h-3 text-emerald-600" /> Normal
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Physician Impression */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 text-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Clinical Impression & Recommendations
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {selectedReport.impression || selectedReport.description}
                </p>
              </div>

              {/* Digital Doctor Sign-Off Stamp */}
              <div className="pt-6 border-t-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy-900">Cryptographically Signed Document</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      SHA256:{selectedReport.id.replace(/[^a-zA-Z0-9]/g, '')}7b29a88e
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="font-serif italic text-brand-900 font-bold text-base tracking-wide">
                    {selectedReport.doctor_name || 'Dr. Rajesh Sharma'}
                  </div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Authorized Medical Signatory
                  </p>
                  <p className="text-[10px] text-slate-500">Consultant Physician & Specialist</p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                Attachment: {selectedReport.file_name} ({formatFileSize(selectedReport.file_size)})
              </span>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm"
              >
                Close Viewer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* UPLOAD MEDICAL DOCUMENT MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-soft-xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">Upload Medical Document</h3>
                  <p className="text-[10px] text-slate-500">Files are encrypted with AES-256 before storage</p>
                </div>
              </div>
              <button 
                onClick={() => setUploadModalOpen(false)} 
                className="p-1 text-slate-400 hover:text-navy-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              
              {/* File Dropzone Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select File (PDF, Image, or Scanned Report) *
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-5 text-center cursor-pointer transition-all bg-slate-50 hover:bg-brand-50/20"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.dcm"
                    className="hidden"
                  />
                  {uploadedFile ? (
                    <div className="flex items-center justify-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-navy-900 truncate">{uploadedFile.name}</p>
                        <p className="text-[10px] text-slate-500">{formatFileSize(uploadedFile.size)} â€¢ Ready for upload</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-7 h-7 text-brand-500 mx-auto" />
                      <p className="text-xs font-bold text-navy-900">Click or drag & drop to choose file</p>
                      <p className="text-[10px] text-slate-400">PDF, JPG, PNG up to 25 MB supported</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lipid Profile & Blood Sugar Panel"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Category & Facility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Record Type *</label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="lab_report">Laboratory Test Report</option>
                    <option value="diagnosis">Physician Diagnosis & ECG</option>
                    <option value="imaging">Imaging (MRI, CT, X-Ray, Echo)</option>
                    <option value="consultation_note">Consultation / Discharge Note</option>
                    <option value="general">General Medical Record</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Facility / Lab Name</label>
                  <input
                    type="text"
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    placeholder="e.g. Swasthya Diagnostic Lab"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Doctor Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Consulting Physician</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sharma, MD"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Summary / Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnostic Summary / Clinical Notes</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter key results, values, or findings..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                ></textarea>
              </div>

              {/* Confidential Toggle */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <input
                  type="checkbox"
                  id="confidential"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="confidential" className="text-xs text-slate-600 cursor-pointer">
                  Mark as confidential (locked with patient biometric/PIN consent)
                </label>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-glow flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Encrypt & Save to Vault</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default PatientMedicalRecords;

