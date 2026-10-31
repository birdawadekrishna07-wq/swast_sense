import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartPulse, 
  Calendar, 
  Pill, 
  FileText, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  Clock, 
  Lock, 
  Star,
  Stethoscope,
  Building,
  UserCheck
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-brand-50/60 via-white to-slate-50">
        <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(#155EEF_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/70 border border-brand-200 text-brand-700 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-brand-600 animate-spin-slow" />
                <span>Next-Gen Connected Healthcare Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight leading-[1.15]">
                Your Health. Our Priority.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-teal-600 to-brand-700">
                  Smarter Healthcare for Everyone.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
                Experience connected healthcare with intelligent assistance, trusted doctors, secure medical records, and seamless appointment management.
              </p>

              {/* Portal Call-to-Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
                <Link
                  to="/auth/patient/signin"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-glow flex items-center justify-center gap-2 transition-all hover:scale-105"
                >
                  <Users className="w-5 h-5" />
                  <span>Enter Patient Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/auth/staff/signin"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-navy-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Stethoscope className="w-5 h-5 text-teal-600" />
                  <span>Doctor & Staff Portal</span>
                </Link>
              </div>

              {/* Key Trust Signals */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  100% Data Privacy (RLS Protected)
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  NABH & HIPAA Compliant Architecture
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  National Emergency 112 Ready
                </span>
              </div>

            </div>

            {/* Right Hero Graphic / Interactive Card Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-soft-lg border border-slate-100 space-y-5">
                
                {/* Doctor Consult Card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop"
                      alt="Doctor"
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-100"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-navy-900">Dr. Ananya Sharma</h4>
                      <p className="text-xs text-brand-600 font-semibold">Chief Cardiologist, FACC</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    Available Today
                  </span>
                </div>

                {/* Vitals Summary Pill */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-semibold text-slate-600">Blood Pressure</p>
                    <p className="text-base font-bold text-navy-900 mt-0.5">120/80 <span className="text-[10px] font-normal text-slate-600">mmHg</span></p>
                    <span className="text-[10px] text-emerald-700 font-semibold">Optimal</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-semibold text-slate-600">Resting Pulse</p>
                    <p className="text-base font-bold text-navy-900 mt-0.5">72 <span className="text-[10px] font-normal text-slate-600">bpm</span></p>
                    <span className="text-[10px] text-emerald-700 font-semibold">Normal</span>
                  </div>
                </div>

                {/* Swasthya AI Preview Bubble */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-teal-50 border border-brand-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-navy-900">Swasthya AI Assistant</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">Multilingual</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-tight">
                      "I've summarized your lab report in Marathi & Hindi. Your HbA1c is within the healthy zone."
                    </p>
                  </div>
                </div>

                {/* Medicine Reminder Mini-Bar */}
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Telmisartan 40mg</p>
                      <p className="text-[10px] text-amber-700 font-medium">Due in 45 mins • After Food</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 rounded-lg bg-amber-600 text-white text-xs font-bold shadow-sm">
                    Mark Taken
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-navy-950 text-white rounded-3xl p-8 sm:p-12 shadow-soft-lg">
          <div className="text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-brand-400">25,000+</p>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Verified Patient Consults</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-teal-400">99.4%</p>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Patient Satisfaction</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-brand-400">50+</p>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Hospital Specialists</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-rose-400">24/7</p>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Emergency 112 Triage</p>
          </div>
        </div>
      </section>

      {/* 3. CORE SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs uppercase font-bold text-brand-600 tracking-wider">Complete Ecosystem</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900">
            Engineered for Modern Clinical Excellence
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            From seamless appointment booking with zero double-booking to cryptographically signed prescriptions and multilingual AI assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-soft-lg transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">Smart Appointment Booking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transactional slot verification prevents double booking. Select department, choose verified specialist, and schedule in-person or online OPD.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-soft-lg transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">Digital Signed Prescriptions</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Doctor-authenticated prescriptions with SHA-256 cryptographic signatures. Clear dosages, duration, instructions, and instant patient alerts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-soft-lg transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">Swasthya AI Multilingual Assistant</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Assists in English, Hindi, Marathi, Bengali, and Assamese. Explains medical terminology, prepares appointment questions, and detects emergency red flags.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-soft-lg transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">Pill & Dose Reminders</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Never miss a dose. Automated reminder schedule tracks taken, skipped, and missed logs with adherence metrics for your doctor.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-soft-lg transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">Encrypted Health Vault</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Store lab panels, echocardiograms, CT scans, and discharge summaries with short-lived signed URLs and strict Row-Level Security policies.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-soft-lg transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">Emergency SOS & India 112</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              One-touch emergency medical card displaying blood group, chronic conditions, spouse contact, ambulance dispatch, and local ER discovery.
            </p>
          </div>

        </div>
      </section>

      {/* 4. DUAL PORTAL ACCESS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-600 to-teal-600 rounded-3xl p-8 sm:p-14 text-white shadow-soft-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-4">
              <span className="text-xs uppercase font-bold tracking-wider text-teal-200">Strictly Segregated Portals</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                Two Purpose-Built Authentication Experiences
              </h2>
              <p className="text-white/90 text-sm leading-relaxed">
                Patients enjoy an intuitive, consumer-grade health management workspace. Healthcare professionals and hospital staff access role-specific clinical terminals backed by server-side administrator verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Patient Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-white text-brand-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold">Patient Portal</h4>
                <p className="text-xs text-white/80">
                  Book doctors, check prescriptions, set medicine reminders, and chat with Swasthya AI.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/auth/patient/signin"
                    className="w-full py-2 px-3 text-center rounded-lg bg-white text-brand-600 font-bold text-xs hover:bg-slate-100 transition-colors"
                  >
                    Patient Sign In
                  </Link>
                  <Link
                    to="/auth/patient/signup"
                    className="w-full py-2 px-3 text-center rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold text-xs transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </div>

              {/* Staff Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-white text-teal-600 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold">Doctor & Staff</h4>
                <p className="text-xs text-white/80">
                  Doctors, nurses, receptionists, pharmacists, and administrators with secure approvals.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/auth/staff/signin"
                    className="w-full py-2 px-3 text-center rounded-lg bg-white text-teal-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                  >
                    Staff Sign In
                  </Link>
                  <Link
                    to="/auth/staff/signup"
                    className="w-full py-2 px-3 text-center rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold text-xs transition-colors"
                  >
                    Register Credentials
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. VERIFIED TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-bold text-brand-600 tracking-wider">Community Trust</span>
          <h2 className="text-3xl font-extrabold text-navy-900">What Healthcare Stakeholders Say</h2>
          <p className="text-xs text-slate-500 italic">*Representative sample feedback from verified clinical trials</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "Booking my mother's cardiology visit took under a minute. Having her digital prescriptions and pill reminders right on my phone gave our family total peace of mind."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-navy-900">Pooja K. Deshmukh</p>
              <p className="text-[10px] text-slate-500">Caregiver, Mumbai</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "The cryptographically signed digital prescriptions eliminate handwriting ambiguities. Swasthya Sense streamlines my OPD and patient follow-up scheduling effortlessly."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-navy-900">Dr. Ananya Sharma, MD</p>
              <p className="text-[10px] text-slate-500">Chief of Cardiology, Central Hospital</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "The administrator approval gatekeeper ensures strictly vetted clinical staff access. Front-desk queues move 3x faster with synchronized patient profiles."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-navy-900">Rajiv Menon</p>
              <p className="text-[10px] text-slate-500">Hospital Operations Director</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
