import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Phone, Mail, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-12 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-navy-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white shadow-glow">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">SWASTHYA SENSE</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Empowering proactive healthcare with trusted clinical care, digital health vault, smart appointments, and multi-lingual AI assistance.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-800 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>NABH & HIPAA Aligned Architecture</span>
              </div>
            </div>
          </div>

          {/* Patient Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Patient Portal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/auth/patient/signin" className="hover:text-white transition-colors">Patient Sign In</Link></li>
              <li><Link to="/auth/patient/signup" className="hover:text-white transition-colors">Register as Patient</Link></li>
              <li><Link to="/patient/appointments" className="hover:text-white transition-colors">Book Doctor Appointment</Link></li>
              <li><Link to="/patient/records" className="hover:text-white transition-colors">Medical Records Vault</Link></li>
              <li><Link to="/patient/reminders" className="hover:text-white transition-colors">Medicine Reminders</Link></li>
              <li><Link to="/patient/ai-assistant" className="hover:text-white transition-colors">Swasthya AI Assistant</Link></li>
            </ul>
          </div>

          {/* Healthcare Staff */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Clinical Staff</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/auth/staff/signin" className="hover:text-white transition-colors">Doctor & Staff Login</Link></li>
              <li><Link to="/auth/staff/signup" className="hover:text-white transition-colors">Staff Registration</Link></li>
              <li><Link to="/staff/doctor/dashboard" className="hover:text-white transition-colors">Doctor Workspace</Link></li>
              <li><Link to="/staff/nurse/dashboard" className="hover:text-white transition-colors">Nurse Station</Link></li>
              <li><Link to="/staff/reception/dashboard" className="hover:text-white transition-colors">Front Desk & Queue</Link></li>
              <li><Link to="/staff/admin/dashboard" className="hover:text-white transition-colors">Hospital Admin</Link></li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">Emergency & Triage</h4>
            <div className="space-y-2.5 text-sm text-slate-400">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <Phone className="w-4 h-4" />
                <span>National Emergency: 112</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400" />
                <span>Ambulance: +91 98200-11200</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>care@swasthya-sense.health</span>
              </div>
              <div className="flex items-start gap-2 pt-1 text-xs">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>Swasthya Sense Central Hospital, Mumbai, Maharashtra 400001</span>
              </div>
            </div>
          </div>

        </div>

        {/* Regulatory Disclaimer & Bottom row */}
        <div className="pt-8 space-y-4">
          <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 text-xs text-slate-400 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-300">Medical Safety & AI Advisory:</strong> Swasthya Sense and Swasthya AI provide general healthcare informational resources, digital medical records management, and clinical administrative workflow automation. Swasthya AI is an educational assistance system and does not independently provide medical diagnoses, treatment decisions, or emergency medical dispatch. In case of acute chest discomfort, sudden trauma, or acute respiratory distress, immediately call 112 or visit your nearest Emergency Department.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-4">
            <p>© {new Date().getFullYear()} Swasthya Sense Technologies Pvt Ltd. All rights reserved.</p>
            <div className="flex items-center gap-6 mt-3 sm:mt-0">
              <a href="#privacy" className="hover:text-slate-300">Privacy Policy</a>
              <a href="#terms" className="hover:text-slate-300">Terms of Service</a>
              <a href="#security" className="hover:text-slate-300">Security Architecture</a>
              <a href="#hipaa" className="hover:text-slate-300">Compliance</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
