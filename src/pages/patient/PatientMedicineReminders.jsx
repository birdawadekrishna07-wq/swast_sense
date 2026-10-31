import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { formatTime } from '../../utils/formatters';
import { 
  Clock, 
  Pill, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  X,
  Activity,
  Bell,
  BellRing,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Check,
  Flame,
  Sun,
  Sunset,
  Moon,
  Info,
  Timer,
  Play
} from 'lucide-react';

const DEFAULT_REMINDERS = [
  {
    id: "rem-01",
    patient_id: "usr-pat-001",
    medicine_name: "Pantoprazole 40mg",
    dosage: "1 Tablet",
    start_date: "2026-10-31",
    end_date: "2026-11-30",
    reminder_time: "07:30:00",
    frequency: "Once daily (Morning)",
    period: "morning",
    instructions: "Take 30 minutes before breakfast on an empty stomach",
    is_active: true,
    status_today: "taken",
    taken_at: "07:35 AM",
    prescribed_by: "Dr. Ananya Sharma (Cardiology)"
  },
  {
    id: "rem-02",
    patient_id: "usr-pat-001",
    medicine_name: "Telmisartan 40mg",
    dosage: "1 Tablet",
    start_date: "2026-10-31",
    end_date: "2026-11-30",
    reminder_time: "08:30:00",
    frequency: "Once daily (Morning)",
    period: "morning",
    instructions: "Take after breakfast with a full glass of water",
    is_active: true,
    status_today: "taken",
    taken_at: "08:40 AM",
    prescribed_by: "Dr. Ananya Sharma (Cardiology)"
  },
  {
    id: "rem-03",
    patient_id: "usr-pat-001",
    medicine_name: "CoQ10 100mg",
    dosage: "1 Capsule",
    start_date: "2026-10-31",
    end_date: "2026-11-30",
    reminder_time: "13:30:00",
    frequency: "Once daily (Lunch)",
    period: "afternoon",
    instructions: "Take with lunch for optimal cellular cardiac support",
    is_active: true,
    status_today: "pending",
    prescribed_by: "Dr. Ananya Sharma (Cardiology)"
  },
  {
    id: "rem-04",
    patient_id: "usr-pat-001",
    medicine_name: "Atorvastatin 20mg",
    dosage: "1 Tablet",
    start_date: "2026-10-31",
    end_date: "2026-11-30",
    reminder_time: "21:30:00",
    frequency: "Once daily (Bedtime)",
    period: "night",
    instructions: "Take at bedtime after dinner. Lipid control.",
    is_active: true,
    status_today: "pending",
    prescribed_by: "Dr. Ananya Sharma (Cardiology)"
  }
];

const PRESET_MEDICINES = [
  { name: 'Telmisartan 40mg', dosage: '1 Tablet', time: '08:30:00', freq: 'Daily', instructions: 'After breakfast with water' },
  { name: 'Metformin 500mg', dosage: '1 Tablet', time: '13:00:00', freq: 'Twice Daily', instructions: 'With meals' },
  { name: 'Vitamin D3 60,000 IU', dosage: '1 Capsule', time: '10:00:00', freq: 'Weekly', instructions: 'With milk or heavy meal' },
  { name: 'Paracetamol 650mg', dosage: '1 Tablet', time: '14:00:00', freq: 'As Needed', instructions: 'Take for fever > 100°F or body ache' },
  { name: 'Atorvastatin 20mg', dosage: '1 Tablet', time: '21:30:00', freq: 'Daily (Night)', instructions: 'Take at night after food' },
  { name: 'Pantoprazole 40mg', dosage: '1 Tablet', time: '07:30:00', freq: 'Daily (Morning)', instructions: '30 mins before breakfast' }
];

function getPeriod(timeStr) {
  if (!timeStr) return 'morning';
  const hour = parseInt(timeStr.split(':')[0], 10);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'night';
}

// ── Web Audio Synthesizer (Realistic Hospital Medical Chime) ───────────────────
let globalAudioCtx = null;

function playMedicalAlarmTone() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!globalAudioCtx || globalAudioCtx.state === 'suspended') {
      globalAudioCtx = new AudioContext();
    }

    const now = globalAudioCtx.currentTime;

    // Pleasant high-clarity 4-chime medical tone: E5 (659Hz) -> G#5 (830Hz) -> B5 (987Hz) -> E6 (1318Hz)
    const tones = [
      { freq: 659.25, time: now },
      { freq: 830.61, time: now + 0.16 },
      { freq: 987.77, time: now + 0.32 },
      { freq: 1318.51, time: now + 0.48 }
    ];

    tones.forEach(({ freq, time }) => {
      const osc = globalAudioCtx.createOscillator();
      const gain = globalAudioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.exponentialRampToValueAtTime(0.35, time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.40);

      osc.connect(gain);
      gain.connect(globalAudioCtx.destination);

      osc.start(time);
      osc.stop(time + 0.45);
    });
  } catch (e) {
    console.warn('Web Audio synthesis error:', e);
  }
}

export const PatientMedicineReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all'); // all, morning, afternoon, night
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Active Ringing Alarm State
  const [ringingAlarm, setRingingAlarm] = useState(null);
  const alarmIntervalRef = useRef(null);

  // Form State
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [reminderTime, setReminderTime] = useState('09:00:00');
  const [frequency, setFrequency] = useState('Daily');
  const [instructions, setInstructions] = useState('Take with water after meals');

  // Load reminders
  useEffect(() => {
    async function loadReminders() {
      try {
        const localSaved = JSON.parse(localStorage.getItem('swasthya_medicine_reminders') || '[]');
        
        let apiData = [];
        try {
          apiData = await api.getReminders();
        } catch (e) {
          apiData = [];
        }

        let combined = [];
        if (Array.isArray(apiData) && apiData.length > 0) {
          combined = [...localSaved, ...apiData];
        } else {
          combined = [...localSaved, ...DEFAULT_REMINDERS];
        }

        const seen = new Set();
        const unique = combined.filter(r => {
          const key = r.id || r.medicine_name;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).map(r => ({
          ...r,
          id: r.id || `rem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          period: r.period || getPeriod(r.reminder_time || r.time),
          status_today: r.status_today || 'pending'
        }));

        setReminders(unique);
      } catch (err) {
        console.error(err);
        setReminders(DEFAULT_REMINDERS);
      } finally {
        setLoading(false);
      }
    }
    loadReminders();

    // Request notification permission if available
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // ── Background Alarm Clock Watcher (Checks every 15 seconds) ─────────────────
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      const currentH = String(now.getHours()).padStart(2, '0');
      const currentM = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentH}:${currentM}`;

      // Check if any reminder matches the current minute and is pending
      const dueReminder = reminders.find(r => {
        if (r.status_today === 'taken' || r.status_today === 'skipped') return false;
        const rTime = (r.reminder_time || r.time || '').slice(0, 5);
        return rTime === currentTimeStr;
      });

      if (dueReminder && !ringingAlarm) {
        triggerAlarm(dueReminder);
      }
    }, 15000);

    return () => clearInterval(clockInterval);
  }, [reminders, ringingAlarm]);

  // Clean up alarm sound on unmount
  useEffect(() => {
    return () => {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
      }
    };
  }, []);

  const triggerAlarm = (reminder) => {
    setRingingAlarm(reminder);
    playMedicalAlarmTone();

    // Repeat alarm chime every 2.5 seconds
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    alarmIntervalRef.current = setInterval(() => {
      playMedicalAlarmTone();
    }, 2500);

    // Desktop browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏰ Medicine Time: ${reminder.medicine_name}`, {
          body: `${reminder.dosage} · ${reminder.instructions || 'Time to take your scheduled dose'}`,
          icon: '/favicon.ico'
        });
      } catch (e) {}
    }
  };

  const stopAlarmSound = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  };

  const dismissAlarm = () => {
    stopAlarmSound();
    setRingingAlarm(null);
  };

  const handleAlarmTakeDose = () => {
    if (ringingAlarm) {
      handleStatus(ringingAlarm.id, 'taken');
    }
    dismissAlarm();
  };

  const handleAlarmSnooze = () => {
    dismissAlarm();
    showToast(`💤 Snoozed for 5 minutes. The alarm will sound again shortly.`);
    setTimeout(() => {
      if (ringingAlarm) {
        triggerAlarm(ringingAlarm);
      }
    }, 5 * 60 * 1000);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const saveToStorage = (updatedList) => {
    setReminders(updatedList);
    localStorage.setItem('swasthya_medicine_reminders', JSON.stringify(updatedList));
  };

  const handleStatus = async (id, status) => {
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    const updated = reminders.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status_today: status,
          taken_at: status === 'taken' ? nowTime : null
        };
      }
      return r;
    });

    saveToStorage(updated);

    try {
      await api.logReminderStatus(id, status);
    } catch (e) {}

    if (status === 'taken') {
      showToast(`🎉 Dose recorded! Logged at ${nowTime}. Adherence streak updated.`);
    } else if (status === 'skipped') {
      showToast('⚠️ Dose marked as skipped. Will alert your next scheduled dose.');
    } else {
      showToast('Dose status reset to pending.');
    }
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete reminder for ${name}?`)) return;
    const updated = reminders.filter(r => r.id !== id);
    saveToStorage(updated);
    showToast(`Reminder for ${name} removed.`);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!medicineName.trim()) return;

    const newRem = {
      id: `rem-custom-${Date.now()}`,
      patient_id: 'usr-pat-001',
      medicine_name: medicineName.trim(),
      dosage: dosage.trim() || '1 Tablet',
      start_date: new Date().toISOString().split('T')[0],
      reminder_time: reminderTime,
      frequency: frequency,
      period: getPeriod(reminderTime),
      instructions: instructions.trim() || 'Take with water after meals',
      status_today: 'pending',
      is_active: true,
      prescribed_by: 'Self-Scheduled Routine'
    };

    const updated = [newRem, ...reminders];
    saveToStorage(updated);

    try {
      await api.addReminder(newRem);
    } catch (e) {}

    showToast(`✅ Reminder for ${newRem.medicine_name} scheduled at ${formatTime(reminderTime)}!`);
    setAddModalOpen(false);
    setMedicineName('');
    setDosage('1 Tablet');
  };

  const handleApplyPreset = (preset) => {
    setMedicineName(preset.name);
    setDosage(preset.dosage);
    setReminderTime(preset.time);
    setFrequency(preset.freq);
    setInstructions(preset.instructions);
  };

  // Immediate Test Alarm with Sound & Modal
  const handleTestAlarm = () => {
    // Pick the first pending reminder or fallback
    const targetRem = reminders.find(r => r.status_today !== 'taken') || reminders[0] || {
      id: 'rem-test',
      medicine_name: 'Telmisartan 40mg',
      dosage: '1 Tablet',
      reminder_time: '08:30:00',
      instructions: 'Take after breakfast with water'
    };
    triggerAlarm(targetRem);
  };

  // Calculations
  const totalCount = reminders.length;
  const takenCount = reminders.filter(r => r.status_today === 'taken').length;
  const pendingCount = reminders.filter(r => r.status_today === 'pending').length;
  const adherencePct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const filteredReminders = reminders.filter(r => {
    if (filterPeriod === 'all') return true;
    return r.period === filterPeriod;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-amber-600 text-white text-xs font-bold shadow-soft-lg flex items-center gap-2 animate-fade-in border border-amber-400">
          <Bell className="w-4 h-4 text-amber-200 animate-bounce" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── LIVE RINGING ALARM POPUP MODAL (WITH SOUND CHIME) ── */}
      {ringingAlarm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-bounce border-2 border-amber-300">
            
            {/* Ringing Bell Animation */}
            <div className="relative mx-auto w-24 h-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
              <span className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping"></span>
              <BellRing className="w-12 h-12 text-white animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-200 bg-white/20 px-3 py-1 rounded-full">
                Medication Alarm Due Now
              </span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white mt-2">
                {ringingAlarm.medicine_name}
              </h3>
              <p className="text-base font-bold text-amber-100">
                Dosage: {ringingAlarm.dosage}
              </p>
              <p className="text-xs text-amber-100 max-w-xs mx-auto leading-relaxed pt-1">
                {ringingAlarm.instructions || 'Take your scheduled dose with water as prescribed.'}
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-200 bg-black/20 px-3 py-1 rounded-lg mt-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Scheduled for {formatTime(ringingAlarm.reminder_time)}</span>
              </div>
            </div>

            {/* Audio Wave Sounding Indicator */}
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-100 bg-white/10 py-1.5 rounded-xl">
              <Volume2 className="w-4 h-4 text-white animate-pulse" />
              <span>Chime Ringing (Audible Alert Playing)</span>
            </div>

            {/* Alarm Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleAlarmTakeDose}
                className="w-full py-3.5 rounded-2xl bg-white text-emerald-800 font-extrabold text-sm shadow-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Take Dose Now (Stop Alarm)</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleAlarmSnooze}
                  className="flex-1 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Snooze (5m)</span>
                </button>
                <button
                  onClick={dismissAlarm}
                  className="flex-1 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 text-amber-100 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Dismiss / Skip</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[11px] font-semibold backdrop-blur-md">
            <Pill className="w-3.5 h-3.5 text-amber-200" />
            <span>Interactive Medication Adherence & Pill Tracker</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Medicine Reminders & Daily Doses</h2>
          <p className="text-xs text-amber-100 max-w-xl">
            Never miss a prescribed dose. Built-in Web Audio chime alarm sounds automatically when medication is due.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleTestAlarm}
            className="px-4 py-2.5 rounded-2xl bg-white text-navy-900 font-extrabold text-xs shadow-glow hover:bg-amber-50 transition-all flex items-center gap-2 shrink-0 group"
          >
            <Volume2 className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            <span>Sound Alarm (Test)</span>
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Reminder</span>
          </button>
        </div>
      </div>

      {/* Dynamic Adherence Summary Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Today's Adherence</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-navy-900">{adherencePct}%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${adherencePct}%` }}
            />
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold pt-1">
            {takenCount} of {totalCount} doses recorded
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">14 Days</p>
          <p className="text-[10px] text-slate-500 font-medium pt-1">
            Consistent timing · 0 missed yesterday
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Pending Doses</span>
            <Clock className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl font-extrabold text-brand-600">{pendingCount}</p>
          <p className="text-[10px] text-brand-700 font-semibold pt-1">
            {pendingCount > 0 ? 'Upcoming today' : 'All doses completed!'}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Alarm Status</span>
            <Volume2 className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-extrabold text-teal-600">Active</p>
          <p className="text-[10px] text-teal-700 font-semibold pt-1">
            Auto-chime enabled on schedule
          </p>
        </div>

      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Scheduled Doses', icon: Clock, count: reminders.length },
          { id: 'morning', label: 'Morning (06:00 - 12:00)', icon: Sun, count: reminders.filter(r => r.period === 'morning').length },
          { id: 'afternoon', label: 'Afternoon (12:00 - 17:00)', icon: Sunset, count: reminders.filter(r => r.period === 'afternoon').length },
          { id: 'night', label: 'Night (17:00 - 23:59)', icon: Moon, count: reminders.filter(r => r.period === 'night').length },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterPeriod(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                filterPeriod === tab.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterPeriod === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reminders List Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-navy-900">Today's Medication Intake Schedule</h3>
            <p className="text-[11px] text-slate-400">Click Take Dose when administered to log your adherence timestamp</p>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Audio Alarm Chime Armed
          </span>
        </div>

        {filteredReminders.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Pill className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-navy-900">No medication scheduled for this time window</p>
            <p className="text-[11px] text-slate-400">Select "All Scheduled Doses" above or add a new custom reminder.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReminders.map((r) => {
              const isTaken = r.status_today === 'taken';
              const isSkipped = r.status_today === 'skipped';

              return (
                <div 
                  key={r.id} 
                  className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all rounded-2xl px-3 ${
                    isTaken ? 'bg-emerald-50/40' : isSkipped ? 'bg-slate-50/60 opacity-70' : 'hover:bg-slate-50/60'
                  }`}
                >
                  
                  {/* Left Medicine Details */}
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      isTaken ? 'bg-emerald-100 text-emerald-700' : 
                      isSkipped ? 'bg-slate-200 text-slate-500' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      <Pill className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-xs font-bold ${isTaken ? 'text-emerald-950' : 'text-navy-900'}`}>
                          {r.medicine_name}
                        </h4>
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {r.dosage}
                        </span>
                        {r.prescribed_by && (
                          <span className="text-[9px] text-slate-400 hidden md:inline">
                            · {r.prescribed_by}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600">{r.instructions || 'Take as advised with water'}</p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1 font-mono font-bold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          {formatTime(r.reminder_time)}
                        </span>
                        <span>· {r.frequency}</span>
                        {isTaken && r.taken_at && (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Logged at {r.taken_at}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    
                    {/* Ring Alarm for this specific medicine button */}
                    {!isTaken && !isSkipped && (
                      <button
                        onClick={() => triggerAlarm(r)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Simulate alarm for this medicine"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Sound</span>
                      </button>
                    )}

                    {isTaken ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-300">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Dose Taken</span>
                        </span>
                        <button
                          onClick={() => handleStatus(r.id, 'pending')}
                          title="Undo Dose"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : isSkipped ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-slate-500" />
                          <span>Skipped</span>
                        </span>
                        <button
                          onClick={() => handleStatus(r.id, 'pending')}
                          title="Undo / Reset"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatus(r.id, 'taken')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Take Dose</span>
                        </button>
                        <button
                          onClick={() => handleStatus(r.id, 'skipped')}
                          className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold border border-slate-200 transition-colors"
                        >
                          Skip
                        </button>
                      </div>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(r.id, r.medicine_name)}
                      className="p-2 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ADD CUSTOM REMINDER MODAL ── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-fade-in relative max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-navy-900">Add Medicine Reminder</h3>
                <p className="text-[11px] text-slate-500">Configure dose schedule and automated alarms</p>
              </div>
              <button 
                onClick={() => setAddModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-navy-900 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Quick Presets:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {PRESET_MEDICINES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-semibold shrink-0 border border-amber-200 transition-colors"
                  >
                    + {preset.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medicine Name & Strength *</label>
                <input
                  type="text"
                  required
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="e.g. Telmisartan 40mg or Metformin 500mg"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold text-navy-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dosage Form *</label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 1 Tablet / 1 Capsule"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alarm Time *</label>
                  <input
                    type="time"
                    required
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dosing Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Daily">Daily (Every day)</option>
                  <option value="Twice Daily">Twice Daily (Morning & Night)</option>
                  <option value="Thrice Daily (TDS)">Thrice Daily (TDS)</option>
                  <option value="Every 8 Hours">Every 8 Hours</option>
                  <option value="Weekly">Weekly</option>
                  <option value="As Needed (PRN)">As Needed (PRN / SOS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Diet / Meal Instructions</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Take after breakfast with water, Avoid dairy"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-glow transition-all"
                >
                  Save & Activate Reminder
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
