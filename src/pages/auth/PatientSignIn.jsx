import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartPulse, Mail, Lock, Eye, EyeOff, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

export const PatientSignIn = () => {
  const { signInPatient, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('rahul.deshmukh@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInPatient(email, password);
      // Strictly redirect to Patient Dashboard
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid patient login credentials');
    }
  };

  return (
    <div className="min-h-screen py-16 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-50/50 to-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-soft-lg border border-slate-100 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-glow">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-xl font-extrabold text-navy-900">SWASTHYA SENSE</span>
          </Link>
          <h2 className="text-2xl font-bold text-navy-900">Patient Sign In</h2>
          <p className="text-xs text-slate-500">Access your digital health vault, appointments, and prescriptions</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Fast Login Callout */}
        <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-800">
          <div className="font-semibold flex items-center gap-1.5 mb-0.5">
            <UserCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Demo Patient Preloaded</span>
          </div>
          <p className="text-[11px] text-slate-600">Click Sign In below or change credentials to test custom authentication.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs px-3.5 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3.5 py-3 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
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

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>Remember me</span>
            </label>
            <Link to="/auth/forgot-password" className="text-brand-600 hover:underline font-semibold">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-glow flex items-center justify-center gap-2 transition-all disabled:bg-slate-300"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Patient Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Separator */}
        <div className="pt-2 text-center text-xs text-slate-500 space-y-3">
          <p>
            Don't have a patient account?{' '}
            <Link to="/auth/patient/signup" className="text-brand-600 font-bold hover:underline">
              Register as Patient
            </Link>
          </p>
          <div className="pt-2 border-t border-slate-100">
            <Link to="/auth/staff/signin" className="text-teal-700 font-semibold hover:underline text-[11px]">
              Are you a Doctor or Hospital Staff? Sign In here →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
