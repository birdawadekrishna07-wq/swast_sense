import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HeartPulse, 
  Stethoscope, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Briefcase, 
  Award, 
  Building, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export const StaffSignUp = () => {
  const { signUpStaff, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    employee_id: '',
    professional_role: 'doctor',
    department: 'Cardiology',
    qualification: '',
    specialization: '',
    medical_registration_number: '',
    years_of_experience: 5,
    hospital_clinic: 'Swasthya Sense Central Hospital, Mumbai',
    professional_address: '',
    accept_terms: false
  });

  const [error, setError] = useState('');
  const [submittedPending, setSubmittedPending] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.accept_terms) {
      setError('You must accept the healthcare compliance regulations');
      return;
    }

    try {
      const res = await signUpStaff(formData);
      if (res.pendingApproval) {
        setSubmittedPending(true);
      }
    } catch (err) {
      setError(err.message || 'Staff registration request failed');
    }
  };

  if (submittedPending) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-soft-lg border border-slate-200 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900">Registration Pending Approval</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Thank you, <strong>{formData.full_name}</strong>. In accordance with clinical security protocols, your application for <strong>{formData.professional_role.toUpperCase()}</strong> has been submitted to Hospital Administration.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1 text-slate-700">
            <p><strong>Employee ID:</strong> {formData.employee_id || 'PENDING'}</p>
            <p><strong>Registration No:</strong> {formData.medical_registration_number || 'N/A'}</p>
            <p><strong>Verification Status:</strong> <span className="text-amber-600 font-bold">Pending Review</span></p>
          </div>
          <div className="pt-2 space-y-2">
            <Link
              to="/staff/admin/dashboard"
              className="block w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-navy-900 hover:bg-navy-800 transition-colors"
            >
              Simulate: Review as Admin Officer →
            </Link>
            <Link
              to="/auth/staff/signin"
              className="block w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-navy-900"
            >
              Return to Staff Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-teal-50/40 via-white to-slate-50">
      <div className="max-w-3xl w-full bg-white rounded-3xl p-8 sm:p-10 shadow-soft-lg border border-slate-200 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-brand-600 flex items-center justify-center text-white shadow-glow">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold text-navy-900">SWASTHYA SENSE</span>
          </Link>
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold uppercase tracking-wider">
            Healthcare Credential Submission
          </div>
          <h2 className="text-2xl font-bold text-navy-900">Doctor & Staff Registration</h2>
          <p className="text-xs text-slate-500">Provide verified clinical or hospital administrative credentials</p>
        </div>

        {/* Server-Side Approval Banner Requirement */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Administrative Verification Mandate</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              All staff registrations (Doctor, Nurse, Receptionist, Pharmacist) remain in a <strong>pending</strong> state until an authorized hospital administrator reviews and approves the credentials. Self-promotion to clinical privileges is strictly prevented.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Section: Professional Designation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
              Professional Role & Department
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Role *</label>
                <select
                  name="professional_role"
                  value={formData.professional_role}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
                >
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="admin">Hospital Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Emergency & Trauma">Emergency & Trauma</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID *</label>
                <input
                  type="text"
                  required
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  placeholder="e.g. EMP-DOC-8921"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

            </div>
          </div>

          {/* Section: Clinical Qualifications */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
              Qualifications & Licensing
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Highest Qualification *</label>
                <input
                  type="text"
                  required
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="e.g. MBBS, MD (Cardiology)"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Interventional Cardiology"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Registration Number</label>
                <input
                  type="text"
                  name="medical_registration_number"
                  value={formData.medical_registration_number}
                  onChange={handleChange}
                  placeholder="e.g. MCI/NMC-2016-77889"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

            </div>
          </div>

          {/* Section: Contact & Credentials */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
              Contact & Authentication
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Sameer Kulkarni"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="dr.sameer@hospital.org"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Contact Phone *</label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98201 12345"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                required
                name="accept_terms"
                checked={formData.accept_terms}
                onChange={handleChange}
                className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>
                I certify that the clinical licenses and professional credentials submitted are authentic and subject to hospital audit verification.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-glow flex items-center justify-center gap-2 transition-all disabled:bg-slate-300"
          >
            <span>{loading ? 'Submitting Credentials...' : 'Submit for Administrator Approval'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Already verified?{' '}
          <Link to="/auth/staff/signin" className="text-teal-700 font-bold hover:underline">
            Sign In to Doctor & Staff Portal
          </Link>
        </div>

      </div>
    </div>
  );
};
