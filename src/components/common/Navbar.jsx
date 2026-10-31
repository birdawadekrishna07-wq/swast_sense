import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HeartPulse, 
  User, 
  Stethoscope, 
  ShieldAlert, 
  Menu, 
  X, 
  ChevronDown, 
  Sparkles, 
  LayoutDashboard,
  LogOut 
} from 'lucide-react';

export const Navbar = () => {
  const { user, signOut, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'patient') return '/patient/dashboard';
    return `/staff/${user.role}/dashboard`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight text-navy-900">SWASTHYA</span>
                <span className="text-2xl font-extrabold tracking-tight text-brand-600">SENSE</span>
              </div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-600">Smart Healthcare Ecosystem</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors">
              Home
            </Link>
            <Link to="/find-doctors" className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors">
              Find Doctors
            </Link>
            <Link to="/patient/ai-assistant" className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-500" />
              Swasthya AI
            </Link>
            <Link to="/emergency" className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Emergency 112
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to {user.role.toUpperCase()} Dashboard</span>
                </Link>
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Patient Login Button */}
                <Link
                  to="/auth/patient/signin"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Patient Login</span>
                </Link>

                {/* Staff Portal Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-navy-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>Doctor & Staff</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {authDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-soft-lg border border-slate-100 p-2 z-50"
                      onClick={() => setAuthDropdownOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-slate-100 text-xs font-semibold text-slate-600 uppercase">
                        Healthcare Personnel
                      </div>
                      <Link
                        to="/auth/staff/signin"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded-lg"
                      >
                        <Stethoscope className="w-4 h-4 text-teal-500" />
                        <span>Doctor & Staff Sign In</span>
                      </Link>
                      <Link
                        to="/auth/staff/signup"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded-lg"
                      >
                        <User className="w-4 h-4 text-brand-500" />
                        <span>Register Staff Account</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Get Started Button */}
                <Link
                  to="/auth/patient/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 rounded-lg shadow-sm transition-all shadow-glow"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-navy-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/find-doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Find Doctors
          </Link>
          <Link
            to="/patient/ai-assistant"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-brand-600 hover:bg-brand-50"
          >
            Swasthya AI Assistant
          </Link>
          <Link
            to="/emergency"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-bold text-rose-600 bg-rose-50"
          >
            Emergency 112
          </Link>
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <Link
              to="/auth/patient/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-brand-600 bg-brand-50 border border-brand-200"
            >
              Patient Sign In
            </Link>
            <Link
              to="/auth/staff/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100"
            >
              Doctor & Staff Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
