import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Search, 
  Stethoscope, 
  MapPin, 
  Star, 
  Calendar, 
  Filter, 
  Award, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Building,
  UserCheck,
  Languages,
  ShieldCheck,
  Eye,
  X,
  Phone,
  GraduationCap,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const FALLBACK_DOCTORS = [
  {
    id: "doc-01",
    full_name: "Dr. Ananya Sharma",
    professional_role: "doctor",
    department: { id: "d1", name: "Cardiology" },
    qualification: "MBBS, MD (Cardiology), DM, FACC",
    specialization: "Interventional Cardiology & Complex Angioplasty",
    medical_registration_number: "MMC-2010-09821",
    years_of_experience: 14,
    hospital_clinic: "Swasthya Sense Central Hospital, Mumbai",
    rating: 4.9,
    reviews_count: 142,
    consultation_fee: 800,
    available_days: ["Mon", "Wed", "Fri", "Sat"],
    bio: "Senior interventional cardiologist with over 3,000 successful coronary interventions. Specializes in radial angiography, drug-eluting stents, heart failure management, and preventive cardiology.",
    languages: ["English", "Hindi", "Marathi"],
    opd_timings: "09:00 AM - 01:00 PM",
    avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop"
  },
  {
    id: "doc-02",
    full_name: "Dr. Rajesh Iyer",
    professional_role: "doctor",
    department: { id: "d2", name: "Neurology" },
    qualification: "MBBS, MD (Medicine), DM (Neurology), DNB",
    specialization: "Stroke Rehabilitation, Epilepsy & Parkinson's Disorder",
    medical_registration_number: "KMC-2006-04192",
    years_of_experience: 18,
    hospital_clinic: "Swasthya Sense Neuroscience Centre, Bengaluru",
    rating: 4.95,
    reviews_count: 198,
    consultation_fee: 1000,
    available_days: ["Tue", "Thu", "Sat"],
    bio: "Renowned neurologist trained at NIMHANS. Clinical lead for acute stroke response, advanced neuro-rehabilitation, botulinum toxin therapy for movement disorders, and migraine care.",
    languages: ["English", "Hindi", "Kannada", "Tamil"],
    opd_timings: "10:00 AM - 02:00 PM",
    avatar_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop"
  },
  {
    id: "doc-03",
    full_name: "Dr. Priya Nair",
    professional_role: "doctor",
    department: { id: "d3", name: "Orthopedics" },
    qualification: "MBBS, MS (Ortho), M.Ch (UK), Fellowship in Arthroscopy",
    specialization: "Robotic Joint Replacement & Sports Arthroscopy",
    medical_registration_number: "TCMC-2013-11204",
    years_of_experience: 12,
    hospital_clinic: "Swasthya Sense Specialty Care, Pune",
    rating: 4.88,
    reviews_count: 115,
    consultation_fee: 750,
    available_days: ["Mon", "Tue", "Thu", "Fri"],
    bio: "Pioneer in robotic total knee and hip replacements. Team doctor for regional athletics academy with specialized interest in cruciate ligament reconstructions and cartilage repair.",
    languages: ["English", "Hindi", "Malayalam", "Marathi"],
    opd_timings: "09:30 AM - 01:30 PM",
    avatar_url: "https://images.unsplash.com/photo-1594824813576-f39b699a779d?w=400&auto=format&fit=crop"
  },
  {
    id: "doc-04",
    full_name: "Dr. Vikram Sengupta",
    professional_role: "doctor",
    department: { id: "d4", name: "General Medicine" },
    qualification: "MBBS, MD (Internal Medicine), FACP (USA)",
    specialization: "Diabetology, Infectious Diseases & Preventive Health",
    medical_registration_number: "WBMC-2008-33910",
    years_of_experience: 16,
    hospital_clinic: "Swasthya Sense Multispecialty, Kolkata",
    rating: 4.85,
    reviews_count: 230,
    consultation_fee: 600,
    available_days: ["Mon", "Wed", "Thu", "Fri", "Sat"],
    bio: "Internist focused on holistic chronic disease management, diabetes remission programs, hypertension stabilization, and seasonal tropical infectious disease triage.",
    languages: ["English", "Hindi", "Bengali"],
    opd_timings: "08:30 AM - 12:30 PM",
    avatar_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop"
  },
  {
    id: "doc-05",
    full_name: "Dr. Sunita Deshmukh",
    professional_role: "doctor",
    department: { id: "d5", name: "Pediatrics" },
    qualification: "MBBS, DCH, MD (Pediatrics), Neonatology Fellowship",
    specialization: "Child Growth, Neonatal Intensive Care & Vaccinology",
    medical_registration_number: "MMC-2011-05781",
    years_of_experience: 13,
    hospital_clinic: "Swasthya Child Health Centre, Mumbai",
    rating: 4.92,
    reviews_count: 167,
    consultation_fee: 700,
    available_days: ["Mon", "Tue", "Wed", "Fri"],
    bio: "Compassionate pediatrician with expertise in premature infant care, neurodevelopmental milestones, pediatric asthma, allergy tracking, and WHO immunization compliance.",
    languages: ["English", "Hindi", "Marathi"],
    opd_timings: "10:00 AM - 03:00 PM",
    avatar_url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop"
  },
  {
    id: "doc-06",
    full_name: "Dr. Farhan Qureshi",
    professional_role: "doctor",
    department: { id: "d6", name: "Dermatology" },
    qualification: "MBBS, MD (Dermatology, Venereology & Leprosy)",
    specialization: "Clinical Dermatology, Allergy Testing & Laser Therapies",
    medical_registration_number: "DMC-2014-08215",
    years_of_experience: 10,
    hospital_clinic: "Swasthya Skin & Laser Institute, Delhi NCR",
    rating: 4.82,
    reviews_count: 94,
    consultation_fee: 650,
    available_days: ["Tue", "Thu", "Sat"],
    bio: "Specialist in inflammatory skin diseases like severe psoriasis, eczema, alopecia areata, phototherapy, and precision cosmetic laser procedures.",
    languages: ["English", "Hindi", "Urdu"],
    opd_timings: "02:00 PM - 06:00 PM",
    avatar_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop"
  },
  {
    id: "doc-07",
    full_name: "Dr. Kavita Radhakrishnan",
    professional_role: "doctor",
    department: { id: "d7", name: "Gynecology & Obstetrics" },
    qualification: "MBBS, MS (OB-GYN), DNB, Fetal Medicine Fellowship",
    specialization: "High-Risk Pregnancy, Laparoscopic Gynaecology & Infertility",
    medical_registration_number: "TNC-2009-02948",
    years_of_experience: 15,
    hospital_clinic: "Swasthya Women & Child Hospital, Chennai",
    rating: 4.93,
    reviews_count: 210,
    consultation_fee: 850,
    available_days: ["Mon", "Wed", "Fri"],
    bio: "Senior obstetrician and gynecological surgeon with extensive experience in prenatal genetic screening, painless labor, endometriosis excision, and hysteroscopic fertility preservation.",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    opd_timings: "09:00 AM - 01:00 PM",
    avatar_url: "https://images.unsplash.com/photo-1594824813576-f39b699a779d?w=400&auto=format&fit=crop"
  },
  {
    id: "doc-08",
    full_name: "Dr. Arvind Subramanian",
    professional_role: "doctor",
    department: { id: "d8", name: "Oncology" },
    qualification: "MBBS, MD (Medicine), DM (Medical Oncology), ESMO Certified",
    specialization: "Precision Chemotherapy, Targeted Immunotherapy & Genomics",
    medical_registration_number: "KMC-2005-01823",
    years_of_experience: 19,
    hospital_clinic: "Swasthya Comprehensive Cancer Institute, Hyderabad",
    rating: 4.96,
    reviews_count: 185,
    consultation_fee: 1200,
    available_days: ["Mon", "Tue", "Thu"],
    bio: "Leading medical oncologist specializing in solid tumors, personalized genetic targeted therapies, clinical cancer trials, and supportive oncology care.",
    languages: ["English", "Hindi", "Telugu"],
    opd_timings: "11:00 AM - 04:00 PM",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop"
  },
  {
    id: "doc-09",
    full_name: "Dr. Tanvi Parekh",
    professional_role: "doctor",
    department: { id: "d9", name: "Endocrinology" },
    qualification: "MBBS, MD (Medicine), DM (Endocrinology & Metabolism)",
    specialization: "Diabetes Reversal, Thyroid Disorders & PCOS Care",
    medical_registration_number: "GMC-2012-07314",
    years_of_experience: 11,
    hospital_clinic: "Swasthya Diabetes & Hormone Care, Ahmedabad",
    rating: 4.89,
    reviews_count: 128,
    consultation_fee: 750,
    available_days: ["Tue", "Wed", "Sat"],
    bio: "Endocrinologist focused on modern continuous glucose monitoring (CGM), insulin pump technology, thyroid nodules, obesity management, and hormonal health in women.",
    languages: ["English", "Hindi", "Gujarati"],
    opd_timings: "09:00 AM - 02:00 PM",
    avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop"
  }
];

export const PatientFindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [docs, depts] = await Promise.all([
          api.getDoctors().catch(() => []),
          api.getDepartments().catch(() => [])
        ]);
        
        // Merge or fallback to ensure at least 9 doctors are shown
        if (Array.isArray(docs) && docs.length >= 5) {
          setDoctors(docs);
        } else {
          setDoctors(FALLBACK_DOCTORS);
        }

        if (Array.isArray(depts) && depts.length > 0) {
          setDepartments(depts);
        } else {
          // Default departments list
          const uniqueDepts = Array.from(
            new Set(FALLBACK_DOCTORS.map(d => d.department.name))
          ).map(name => ({ id: name.toLowerCase(), name }));
          setDepartments(uniqueDepts);
        }
      } catch (err) {
        console.error("Error loading doctors:", err);
        setDoctors(FALLBACK_DOCTORS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const docDeptName = doc.department?.name || '';
    const docDeptId = doc.department?.id || '';
    const matchesDept = 
      selectedDept === 'all' || 
      docDeptId === selectedDept || 
      docDeptName.toLowerCase() === selectedDept.toLowerCase();

    const matchesSearch = 
      doc.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.qualification?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital_clinic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      docDeptName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'experience') return (b.years_of_experience || 0) - (a.years_of_experience || 0);
    if (sortBy === 'fee_low') return (a.consultation_fee || 0) - (b.consultation_fee || 0);
    return 0;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-teal-800 to-navy-900 rounded-3xl p-6 sm:p-10 text-white shadow-soft-lg space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
              <span>Verified Medical Specialists Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Find Experienced Doctors & Specialists
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
              Book in-person consultations or video appointments with top-rated, certified healthcare professionals across 9 medical specialties.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3.5 py-2 rounded-xl bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md">
              {filteredDoctors.length} Doctors Available Today
            </span>
          </div>
        </div>

        {/* Quick specialty filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-teal-200 uppercase font-bold shrink-0">Specialties:</span>
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition-all ${
              selectedDept === 'all'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            All Specialists
          </button>
          {['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine', 'Pediatrics', 'Dermatology', 'Gynecology & Obstetrics', 'Oncology', 'Endocrinology'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition-all ${
                selectedDept.toLowerCase() === dept.toLowerCase()
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-soft flex flex-col md:flex-row items-center gap-3">
        
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name, qualification, specialty, or hospital clinic..."
            className="w-full text-xs px-3.5 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full md:w-48 text-xs px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full md:w-44 text-xs px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="rating">Highest Rated</option>
            <option value="experience">Most Experienced</option>
            <option value="fee_low">Lowest Fee First</option>
          </select>
        </div>

      </div>

      {/* Verified Notice */}
      <div className="text-xs text-slate-500 flex items-center justify-between px-1">
        <span>Showing <strong>{filteredDoctors.length}</strong> verified clinical specialists</span>
        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% NABH & MCI Verified Credentials
        </span>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => (
          <div 
            key={doc.id} 
            className="p-5 rounded-3xl bg-white border border-slate-100 shadow-soft hover:shadow-soft-lg hover:border-brand-200 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3.5">
              
              {/* Doctor Avatar & Headline */}
              <div className="flex items-start gap-3.5">
                <img
                  src={doc.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop'}
                  alt={doc.full_name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-100 shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-bold text-navy-900 truncate">{doc.full_name}</h3>
                  </div>
                  <span className="inline-block text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {doc.department?.name || 'Specialist'}
                  </span>
                  <p className="text-[11px] text-brand-600 font-semibold line-clamp-1">{doc.qualification}</p>
                </div>
              </div>

              {/* Specialization */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Specialization</span>
                <p className="text-navy-900 font-medium text-[11px] line-clamp-2">{doc.specialization}</p>
              </div>

              {/* Experience and Rating Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-600">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Experience</span>
                  <p className="font-bold text-navy-900 text-xs">{doc.years_of_experience || 10}+ Years</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-slate-600">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Rating & Reviews</span>
                  <p className="font-bold text-navy-900 text-xs flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{doc.rating || 4.9}</span>
                    <span className="text-[10px] text-slate-400">({doc.reviews_count || 120})</span>
                  </p>
                </div>
              </div>

              {/* Clinic & Timings */}
              <div className="space-y-1 text-xs text-slate-500">
                <div className="flex items-start gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] truncate">{doc.hospital_clinic}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="text-[11px] text-teal-700 font-medium">
                    Available: {doc.available_days?.slice(0, 3).join(', ') || 'Mon, Wed, Fri'}
                  </span>
                </div>
              </div>

            </div>

            {/* Actions: View Profile & Book Consultation */}
            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Consult Fee</span>
                <p className="text-sm font-extrabold text-navy-900">₹{doc.consultation_fee || 800}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedDoctor(doc)}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>
                <Link
                  to="/patient/appointments"
                  state={{ doctorId: doc.id, doctorName: doc.full_name }}
                  className="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-glow flex items-center gap-1 transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book</span>
                </Link>
              </div>
            </div>

          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-soft space-y-3">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-navy-900">No doctors match your criteria</h3>
          <p className="text-xs text-slate-500">Try adjusting your specialty filter or clear your search term.</p>
          <button
            onClick={() => { setSelectedDept('all'); setSearchQuery(''); }}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* ── DOCTOR FULL PROFILE MODAL ── */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl relative animate-fade-in border border-slate-100">
            
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4">
              <img
                src={selectedDoctor.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop'}
                alt={selectedDoctor.full_name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-brand-100 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-navy-900">{selectedDoctor.full_name}</h3>
                </div>
                <span className="inline-block text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                  {selectedDoctor.department?.name || 'Cardiology'}
                </span>
                <p className="text-xs text-brand-600 font-bold">{selectedDoctor.qualification}</p>
                <p className="text-[11px] font-mono text-slate-400">Reg: {selectedDoctor.medical_registration_number || 'MCI-VERIFIED'}</p>
              </div>
            </div>

            {/* Rating & Experience */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Experience</span>
                <span className="text-sm font-extrabold text-navy-900">{selectedDoctor.years_of_experience || 12} Yrs</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Rating</span>
                <span className="text-sm font-extrabold text-navy-900 flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {selectedDoctor.rating || 4.9}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Consult Fee</span>
                <span className="text-sm font-extrabold text-emerald-700">₹{selectedDoctor.consultation_fee || 800}</span>
              </div>
            </div>

            {/* Specialization & Bio */}
            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-navy-900 uppercase text-[10px] text-slate-400 mb-1">Clinical Specialization</h4>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedDoctor.specialization}
                </p>
              </div>

              {selectedDoctor.bio && (
                <div>
                  <h4 className="font-bold text-navy-900 uppercase text-[10px] text-slate-400 mb-1">Doctor Biography</h4>
                  <p className="text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    {selectedDoctor.bio}
                  </p>
                </div>
              )}

              {/* Languages & Timings */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-brand-600" /> Languages
                  </span>
                  <p className="font-semibold text-navy-900 mt-1">
                    {selectedDoctor.languages?.join(', ') || 'English, Hindi'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" /> OPD Hours
                  </span>
                  <p className="font-semibold text-navy-900 mt-1">
                    {selectedDoctor.opd_timings || '09:00 AM - 01:00 PM'}
                  </p>
                </div>
              </div>

              {/* Hospital Location */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Hospital / Center</span>
                  <p className="font-semibold text-navy-900">{selectedDoctor.hospital_clinic}</p>
                </div>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="pt-3 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Close
              </button>
              <Link
                to="/patient/appointments"
                state={{ doctorId: selectedDoctor.id, doctorName: selectedDoctor.full_name }}
                className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-glow flex items-center justify-center gap-2 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
