import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HeartPulse, 
  Stethoscope, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Briefcase
} from 'lucide-react';

export const StaffSignIn = () => {
  const { signInStaff, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('dr.ananya@swasthya-sense.health');
  const [password, setPassword] = useState('doctorPass123');
  const [role, setRole] = useState('doctor');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRoleChange = (e) => {
    const selected = e.target.value;
    setRole(selected);
    const emailMap = {
      doctor: 'dr.ananya@swasthya-sense.health',
      nurse: 'nurse.sunita@swasthya-sense.health',
      receptionist: 'reception@swasthya-sense.health',
      pharmacist: 'pharmacy@swasthya-sense.health',
      admin: 'admin@swasthya-sense.health'
    };
    setEmail(emailMap[selected] || 'staff@swasthya-sense.health');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await signInStaff(email, password, role);
      // Role-based redirection
      const redirectMap = {
        doctor: '/staff/doctor/dashboard',
        nurse: '/staff/nurse/dashboard',
        receptionist: '/staff/reception/dashboard',
        pharmacist: '/staff/pharmacy/dashboard',
        admin: '/staff/admin/dashboard'
      };
      navigate(redirectMap[role] || '/staff/doctor/dashboard');
    } catch (err) {
      setError(err.message || 'Staff authentication failed');
    }
  };

  return (
    <div className="min-h-screen py-16 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-100 via-white to-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-soft-lg border border-slate-200 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-brand-600 flex items-center justify-center text-white shadow-glow">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold text-navy-900">SWASTHYA SENSE</span>
          </Link>
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold uppercase tracking-wider">
            Clinical & Hospital Terminal
          </div>
          <h2 className="text-2xl font-bold text-navy-900">Doctor & Staff Login</h2>
          <p className="text-xs text-slate-500">Access authorized medical records and hospital workflows</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Security Notice */}
        <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-tight text-slate-700">
            <strong>Server-Side Enforced:</strong> Doctor and staff accounts require authorized administrative approval. Select your role to sign into your terminal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Professional Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Professional Role *</label>
            <div className="relative">
              <select
                value={role}
                onChange={handleRoleChange}
                className="w-full text-xs px-3.5 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium cursor-pointer"
              >
                <option value="doctor">Doctor / Consultant (MD/MS/MBBS)</option>
                <option value="nurse">Nurse / Critical Care Staff</option>
                <option value="receptionist">Receptionist / Front Desk Officer</option>
                <option value="pharmacist">Pharmacist / Drug Dispensary</option>
                <option value="admin">Hospital Super Administrator</option>
              </select>
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@swasthya-sense.health"
                className="w-full text-xs px-3.5 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3.5 py-3 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-glow flex items-center justify-center gap-2 transition-all disabled:bg-slate-300"
          >
            <span>{loading ? 'Authenticating Staff...' : `Access ${role.toUpperCase()} Workspace`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        <div className="pt-2 text-center text-xs text-slate-500 space-y-3">
          <p>
            Need to register a healthcare staff account?{' '}
            <Link to="/auth/staff/signup" className="text-teal-700 font-bold hover:underline">
              Submit Staff Credentials
            </Link>
          </p>
          <div className="pt-2 border-t border-slate-100">
            <Link to="/auth/patient/signin" className="text-brand-600 font-semibold hover:underline text-[11px]">
              ← Looking for Patient Sign In? Click here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
