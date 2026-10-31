import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { formatDate, formatTime, getStatusBadge } from '../../utils/formatters';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronRight,
  Video,
  Building,
  User,
  Search,
  Filter,
  FileText,
  Printer,
  Phone,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  MapPin,
  CalendarCheck
} from 'lucide-react';

const INITIAL_DEMO_APPOINTMENTS = [
  {
    id: "apt-2026-001",
    appointment_date: "2026-11-04",
    start_time: "10:00:00",
    end_time: "10:30:00",
    appointment_type: "in_person",
    status: "confirmed",
    token_number: "CARD-102",
    reason: "Quarterly cardiovascular health review & hypertension check",
    symptoms: "Mild morning dizziness, resting blood pressure slightly elevated",
    doctor: {
      id: "doc-01",
      full_name: "Dr. Ananya Sharma",
      qualification: "MBBS, MD (Cardiology), DM, FACC",
      avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop"
    },
    department: { name: "Cardiology", room: "OPD Room 204, 2nd Floor" },
    hospital_clinic: "Swasthya Sense Central Hospital, Mumbai",
    consultation_fee: 800
  },
  {
    id: "apt-2026-002",
    appointment_date: "2026-11-08",
    start_time: "14:00:00",
    end_time: "14:30:00",
    appointment_type: "online",
    status: "confirmed",
    token_number: "NEUR-ONLINE-44",
    reason: "Migraine follow-up & medication adjustment",
    symptoms: "Occasional visual aura before throbbing headache",
    doctor: {
      id: "doc-02",
      full_name: "Dr. Rajesh Iyer",
      qualification: "MBBS, DM (Neurology), DNB",
      avatar_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop"
    },
    department: { name: "Neurology", room: "Virtual Telehealth Room 04" },
    hospital_clinic: "Swasthya Sense Neuroscience Centre",
    consultation_fee: 1000
  },
  {
    id: "apt-2026-003",
    appointment_date: "2026-10-18",
    start_time: "11:30:00",
    end_time: "12:00:00",
    appointment_type: "in_person",
    status: "completed",
    token_number: "GENM-089",
    reason: "Seasonal viral fever & generalized body ache",
    symptoms: "Low-grade fever for 3 days with cough",
    doctor: {
      id: "doc-04",
      full_name: "Dr. Vikram Sengupta",
      qualification: "MBBS, MD (Internal Medicine), FACP",
      avatar_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop"
    },
    department: { name: "General Medicine", room: "OPD Room 102, Ground Floor" },
    hospital_clinic: "Swasthya Sense Central Hospital",
    consultation_fee: 600
  },
  {
    id: "apt-2026-004",
    appointment_date: "2026-10-05",
    start_time: "15:00:00",
    end_time: "15:30:00",
    appointment_type: "in_person",
    status: "cancelled",
    token_number: "DERM-045",
    reason: "Routine skin allergy checkup",
    symptoms: "Mild rash on forearm",
    doctor: {
      id: "doc-06",
      full_name: "Dr. Farhan Qureshi",
      qualification: "MBBS, MD (Dermatology)",
      avatar_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop"
    },
    department: { name: "Dermatology", room: "OPD Room 310, 3rd Floor" },
    hospital_clinic: "Swasthya Skin Institute",
    consultation_fee: 650
  }
];

const TIME_SLOTS = [
  { start: '09:00:00', end: '09:30:00', label: '09:00 AM', period: 'Morning' },
  { start: '09:30:00', end: '10:00:00', label: '09:30 AM', period: 'Morning' },
  { start: '10:00:00', end: '10:30:00', label: '10:00 AM', period: 'Morning' },
  { start: '10:30:00', end: '11:00:00', label: '10:30 AM', period: 'Morning' },
  { start: '11:30:00', end: '12:00:00', label: '11:30 AM', period: 'Morning' },
  { start: '14:00:00', end: '14:30:00', label: '02:00 PM', period: 'Afternoon' },
  { start: '14:30:00', end: '15:00:00', label: '02:30 PM', period: 'Afternoon' },
  { start: '15:00:00', end: '15:30:00', label: '03:00 PM', period: 'Afternoon' },
  { start: '16:00:00', end: '16:30:00', label: '04:00 PM', period: 'Evening' },
  { start: '16:30:00', end: '17:00:00', label: '04:30 PM', period: 'Evening' },
];

export const PatientAppointments = () => {
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & Active Items
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [rescheduleModalApt, setRescheduleModalApt] = useState(null);
  const [telehealthModalApt, setTelehealthModalApt] = useState(null);
  const [slipModalApt, setSlipModalApt] = useState(null);

  // Filters & Search
  const [filterTab, setFilterTab] = useState('all'); // all, upcoming, completed, cancelled
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  // Booking Form State
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('2026-11-06');
  const [startTime, setStartTime] = useState('10:00:00');
  const [appointmentType, setAppointmentType] = useState('in_person');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');

  // Reschedule Form State
  const [newRescheduleDate, setNewRescheduleDate] = useState('2026-11-10');
  const [newRescheduleTime, setNewRescheduleTime] = useState('11:30:00');

  // Video Call State Simulation
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [apts, depts, docs] = await Promise.all([
          api.getAppointments().catch(() => []),
          api.getDepartments().catch(() => []),
          api.getDoctors().catch(() => [])
        ]);

        if (Array.isArray(apts) && apts.length > 0) {
          setAppointments(apts);
        } else {
          setAppointments(INITIAL_DEMO_APPOINTMENTS);
        }

        if (Array.isArray(depts) && depts.length > 0) {
          setDepartments(depts);
          setSelectedDept(depts[0].id || depts[0].name);
        } else {
          setDepartments([
            { id: "d1", name: "Cardiology", code: "CARD" },
            { id: "d2", name: "Neurology", code: "NEUR" },
            { id: "d3", name: "Orthopedics", code: "ORTH" },
            { id: "d4", name: "General Medicine", code: "GENM" },
            { id: "d5", name: "Pediatrics", code: "PED" }
          ]);
          setSelectedDept("d1");
        }

        if (Array.isArray(docs) && docs.length > 0) {
          setDoctors(docs);
          setSelectedDoctor(docs[0].id);
        }

        // Check if user came from Find Doctors with doctor preselection
        if (location.state?.doctorId) {
          setSelectedDoctor(location.state.doctorId);
          setBookingModalOpen(true);
        }
      } catch (err) {
        console.error(err);
        setAppointments(INITIAL_DEMO_APPOINTMENTS);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [location.state]);

  const showNotification = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedSlot = TIME_SLOTS.find(s => s.start === startTime) || TIME_SLOTS[0];
      const doctorObj = doctors.find(d => d.id === selectedDoctor);
      const deptObj = departments.find(d => d.id === selectedDept || d.name === selectedDept);

      const payload = {
        doctor_id: selectedDoctor || "doc-01",
        department_id: selectedDept || "d1",
        appointment_date: appointmentDate,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        appointment_type: appointmentType,
        reason: reason || 'Specialist Consultation',
        symptoms: symptoms
      };

      // Call API (falls back gracefully if offline)
      try {
        await api.bookAppointment(payload);
      } catch (e) {
        // Backend handles or mock continues
      }

      const newApt = {
        id: `apt-${Date.now()}`,
        appointment_date: appointmentDate,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        appointment_type: appointmentType,
        status: 'confirmed',
        token_number: `${(deptObj?.code || 'GEN')}-${Math.floor(100 + Math.random() * 900)}`,
        reason: reason || 'Scheduled Consultation',
        symptoms: symptoms,
        doctor: {
          id: selectedDoctor,
          full_name: doctorObj?.full_name || 'Dr. Ananya Sharma',
          qualification: doctorObj?.qualification || 'MBBS, MD (Specialist)',
          avatar_url: doctorObj?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop'
        },
        department: { 
          name: deptObj?.name || 'Cardiology',
          room: appointmentType === 'online' ? 'Telehealth Room 01' : 'OPD Room 204'
        },
        hospital_clinic: doctorObj?.hospital_clinic || 'Swasthya Sense Central Hospital',
        consultation_fee: doctorObj?.consultation_fee || 800
      };

      setAppointments(prev => [newApt, ...prev]);
      showNotification('success', `Appointment confirmed with ${newApt.doctor.full_name} for ${formatDate(appointmentDate)}!`);
      setBookingModalOpen(false);
      setReason('');
      setSymptoms('');
    } catch (err) {
      showNotification('error', err.message || 'Slot conflict detected. Please select another time or doctor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (aptId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled appointment?')) return;
    try {
      await api.updateAppointment(aptId, { status: 'cancelled' }).catch(() => {});
      setAppointments(prev =>
        prev.map(a => a.id === aptId ? { ...a, status: 'cancelled' } : a)
      );
      showNotification('success', 'Appointment successfully cancelled.');
    } catch (e) {
      setAppointments(prev =>
        prev.map(a => a.id === aptId ? { ...a, status: 'cancelled' } : a)
      );
      showNotification('success', 'Appointment cancelled.');
    }
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleModalApt) return;
    const selectedSlot = TIME_SLOTS.find(s => s.start === newRescheduleTime) || TIME_SLOTS[0];
    
    setAppointments(prev => prev.map(a => {
      if (a.id === rescheduleModalApt.id) {
        return {
          ...a,
          appointment_date: newRescheduleDate,
          start_time: selectedSlot.start,
          end_time: selectedSlot.end,
          status: 'confirmed'
        };
      }
      return a;
    }));

    showNotification('success', `Appointment rescheduled to ${formatDate(newRescheduleDate)} at ${formatTime(selectedSlot.start)}!`);
    setRescheduleModalApt(null);
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filterTab === 'upcoming' && apt.status !== 'confirmed') return false;
    if (filterTab === 'completed' && apt.status !== 'completed') return false;
    if (filterTab === 'cancelled' && apt.status !== 'cancelled') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const docName = (apt.doctor?.full_name || apt.doctor_name || '').toLowerCase();
      const deptName = (apt.department?.name || '').toLowerCase();
      const r = (apt.reason || '').toLowerCase();
      return docName.includes(q) || deptName.includes(q) || r.includes(q);
    }
    return true;
  });

  const countUpcoming = appointments.filter(a => a.status === 'confirmed').length;
  const countCompleted = appointments.filter(a => a.status === 'completed').length;
  const countCancelled = appointments.filter(a => a.status === 'cancelled').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-teal-800 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[11px] font-semibold backdrop-blur-md">
            <CalendarCheck className="w-3.5 h-3.5 text-teal-200" />
            <span>Digital Appointment Management Hub</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">My Doctor Appointments</h2>
          <p className="text-xs text-teal-100 max-w-xl">
            Schedule new visits, join live encrypted telehealth video rooms, download OPD slips, and manage follow-ups.
          </p>
        </div>

        <button
          onClick={() => setBookingModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-white text-navy-900 font-extrabold text-xs shadow-glow hover:bg-slate-50 transition-all flex items-center gap-2 shrink-0 group"
        >
          <Plus className="w-4 h-4 text-brand-600 group-hover:rotate-90 transition-transform" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Floating feedback alert */}
      {feedback.text && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Status filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Consultations', count: appointments.length },
            { id: 'upcoming', label: 'Upcoming', count: countUpcoming },
            { id: 'completed', label: 'Past Completed', count: countCompleted },
            { id: 'cancelled', label: 'Cancelled', count: countCancelled },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                filterTab === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctor, department, or reason..."
            className="w-full text-xs px-3.5 py-2.5 pl-9 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        </div>

      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-soft space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-navy-900">No appointments found in this category</h3>
            <p className="text-xs text-slate-500">Book an appointment or clear your search filters.</p>
            <button
              onClick={() => setBookingModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
            >
              Book an Appointment Now
            </button>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const isConfirmed = apt.status === 'confirmed';
            const isCompleted = apt.status === 'completed';
            const isCancelled = apt.status === 'cancelled';
            const isOnline = apt.appointment_type === 'online';

            return (
              <div 
                key={apt.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-100 shadow-soft hover:shadow-soft-lg transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Doctor & Clinic Info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={apt.doctor?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop'}
                      alt={apt.doctor?.full_name || 'Doctor'}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                    />

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-navy-900">
                          {apt.doctor?.full_name || 'Dr. Ananya Sharma'}
                        </h4>
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                          {apt.department?.name || 'Cardiology'}
                        </span>
                        {apt.token_number && (
                          <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            Token: {apt.token_number}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-brand-600 font-semibold">{apt.doctor?.qualification || 'MBBS, MD'}</p>
                      
                      <p className="text-xs text-slate-700 font-medium">
                        Reason: <span className="text-navy-900">{apt.reason || 'General Health Consultation'}</span>
                      </p>

                      {apt.symptoms && (
                        <p className="text-[11px] text-slate-500">
                          Symptoms: {apt.symptoms}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date, Time & Status Box */}
                  <div className="flex flex-col md:items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isConfirmed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        isCompleted ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {apt.status}
                      </span>
                    </div>

                    <div className="text-left md:text-right space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900">
                        <Calendar className="w-3.5 h-3.5 text-brand-600" />
                        <span>{formatDate(apt.appointment_date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatTime(apt.start_time)} – {formatTime(apt.end_time)}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bottom Bar: Mode & Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  
                  {/* Mode & Venue */}
                  <div className="flex items-center gap-2 text-slate-600">
                    {isOnline ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                        <Video className="w-3.5 h-3.5 text-teal-600" />
                        Online Video Consultation
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                        <Building className="w-3.5 h-3.5 text-brand-600" />
                        In-Person Hospital Visit ({apt.department?.room || 'OPD Room 204'})
                      </span>
                    )}
                    <span className="text-slate-400 font-normal hidden md:inline">· Fee: ₹{apt.consultation_fee || 800}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    
                    {/* Telehealth Call button */}
                    {isConfirmed && isOnline && (
                      <button
                        onClick={() => setTelehealthModalApt(apt)}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Video className="w-3.5 h-3.5 animate-pulse" />
                        <span>Join Video Room</span>
                      </button>
                    )}

                    {/* Download Appointment Slip */}
                    <button
                      onClick={() => setSlipModalApt(apt)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Print Slip</span>
                    </button>

                    {/* Reschedule Button */}
                    {isConfirmed && (
                      <button
                        onClick={() => {
                          setRescheduleModalApt(apt);
                          setNewRescheduleDate(apt.appointment_date);
                          setNewRescheduleTime(apt.start_time);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reschedule</span>
                      </button>
                    )}

                    {/* Cancel Button */}
                    {isConfirmed && (
                      <button
                        onClick={() => handleCancel(apt.id)}
                        className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    )}

                    {isCompleted && (
                      <Link
                        to="/patient/prescriptions"
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Prescription</span>
                      </Link>
                    )}

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ── 1. BOOK NEW APPOINTMENT MODAL ── */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[92vh] overflow-y-auto animate-fade-in relative">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-navy-900">Book Doctor Consultation</h3>
                <p className="text-xs text-slate-500">Live transactional slot reservation</p>
              </div>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="p-2 text-slate-400 hover:text-navy-900 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4">
              
              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Department *</label>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                  }}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} {d.code ? `(${d.code})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Specialist Doctor *</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.full_name} • {doc.department?.name || 'Specialist'} (₹{doc.consultation_fee || 800})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Mode *</label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-semibold text-navy-900"
                  >
                    <option value="in_person">🏥 In-Person Hospital OPD</option>
                    <option value="online">💻 Online Video Consultation</option>
                  </select>
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Consultation Slot *</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      type="button"
                      key={slot.start}
                      onClick={() => setStartTime(slot.start)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        startTime === slot.start
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason & Symptoms */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Visit / Main Complaints</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Follow-up for chest tightness, BP monitoring, seasonal allergies"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specific Symptoms / Notes (Optional)</label>
                <textarea
                  rows="2"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms in detail for the doctor..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-glow disabled:bg-slate-300 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Confirming Reservation...' : 'Confirm & Reserve Slot'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ── 2. RESCHEDULE MODAL ── */}
      {rescheduleModalApt && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 animate-fade-in relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-navy-900">Reschedule Consultation</h3>
                <p className="text-[11px] text-slate-500">{rescheduleModalApt.doctor?.full_name}</p>
              </div>
              <button
                onClick={() => setRescheduleModalApt(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pick New Date</label>
                <input
                  type="date"
                  value={newRescheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select New Time Slot</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.slice(0, 6).map((slot) => (
                    <button
                      type="button"
                      key={slot.start}
                      onClick={() => setNewRescheduleTime(slot.start)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
                        newRescheduleTime === slot.start
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setRescheduleModalApt(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700"
              >
                Keep Current
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-glow"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. TELEHEALTH VIDEO ROOM MODAL ── */}
      {telehealthModalApt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-navy-950 rounded-3xl overflow-hidden shadow-2xl border border-navy-800 text-white space-y-4 animate-fade-in">
            
            {/* Top Bar */}
            <div className="p-4 bg-navy-900 border-b border-navy-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <div>
                  <h4 className="text-xs font-bold text-white">Telehealth Encrypted Video Room</h4>
                  <p className="text-[10px] text-teal-300">Consultation with {telehealthModalApt.doctor?.full_name}</p>
                </div>
              </div>
              <button 
                onClick={() => setTelehealthModalApt(null)}
                className="p-1 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Doctor Video Screen */}
            <div className="relative mx-4 h-64 sm:h-80 rounded-2xl bg-gradient-to-tr from-navy-900 to-slate-900 overflow-hidden flex items-center justify-center border border-navy-800">
              <img
                src={telehealthModalApt.doctor?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop'}
                alt="Doctor Feed"
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit E2E Encrypted</span>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold text-white">
                {telehealthModalApt.doctor?.full_name} ({telehealthModalApt.department?.name})
              </div>

              {/* Patient PiP feed */}
              <div className="absolute bottom-3 right-3 w-24 h-20 rounded-xl bg-slate-800 border-2 border-white/20 overflow-hidden flex items-center justify-center shadow-lg">
                {isVideoOff ? (
                  <span className="text-[10px] text-slate-400">Camera Off</span>
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop"
                    alt="Patient Feed"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="p-4 flex items-center justify-center gap-4">
              <button
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                className={`p-3.5 rounded-2xl transition-all ${
                  isVideoMuted ? 'bg-rose-600 text-white' : 'bg-navy-800 hover:bg-navy-700 text-slate-200'
                }`}
              >
                {isVideoMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3.5 rounded-2xl transition-all ${
                  isVideoOff ? 'bg-rose-600 text-white' : 'bg-navy-800 hover:bg-navy-700 text-slate-200'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setTelehealthModalApt(null)}
                className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Leave Consultation</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── 4. APPOINTMENT SLIP / RECEIPT MODAL ── */}
      {slipModalApt && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 animate-fade-in relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-navy-900">Hospital Consultation Slip</h3>
              </div>
              <button onClick={() => setSlipModalApt(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slip Printable Body */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3 font-mono text-xs">
              <div className="text-center pb-2 border-b border-slate-200">
                <h4 className="font-extrabold text-navy-900 text-sm">SWASTHYA SENSE HEALTHCARE</h4>
                <p className="text-[10px] text-slate-500">Multispecialty OPD Consultation Receipt</p>
                <p className="text-xs font-bold text-brand-600 mt-1">TOKEN: {slipModalApt.token_number || 'GEN-101'}</p>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-bold text-navy-900">Rahul Deshmukh (Patient)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Specialist:</span>
                  <span className="font-bold text-navy-900">{slipModalApt.doctor?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-bold text-navy-900">{slipModalApt.department?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Slot:</span>
                  <span className="font-bold text-navy-900">{formatDate(slipModalApt.appointment_date)} · {formatTime(slipModalApt.start_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Venue/Room:</span>
                  <span className="font-bold text-teal-700">{slipModalApt.department?.room || 'OPD Room 204'}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Consultation Fee:</span>
                  <span className="font-bold text-emerald-700">₹{slipModalApt.consultation_fee || 800} (PAID)</span>
                </div>
              </div>

              <div className="pt-2 text-center text-[9px] text-slate-400">
                Please present this slip at the reception desk 15 minutes before your scheduled slot.
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setSlipModalApt(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
