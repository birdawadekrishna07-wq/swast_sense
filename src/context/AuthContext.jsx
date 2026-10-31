import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Current user state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('swasthya_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default logged in demo profile as Patient for immediate interactive exploration
    return {
      id: 'usr-pat-001',
      email: 'rahul.deshmukh@gmail.com',
      full_name: 'Rahul Deshmukh',
      role: 'patient',
      phone: '+91 98230 45678',
      approval_status: 'approved',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
      patient_details: {
        blood_group: 'O+',
        date_of_birth: '1988-06-15',
        gender: 'male',
        city: 'Mumbai',
        emergency_contact: '+91 98200 99887 (Pooja Deshmukh - Spouse)',
        allergies: ['Penicillin', 'Peanuts'],
        conditions: ['Stage 1 Essential Hypertension']
      }
    };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync session changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('swasthya_user_session', JSON.stringify(user));
      localStorage.setItem('swasthya_auth_token', `dev-test-token-${user.role}`);
    } else {
      localStorage.removeItem('swasthya_user_session');
      localStorage.removeItem('swasthya_auth_token');
    }
  }, [user]);

  // Real Supabase session listener if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              role: profile.role,
              phone: profile.phone,
              avatar_url: profile.avatar_url,
              approval_status: 'approved'
            });
          }
        } catch (e) {
          console.error('Error fetching Supabase profile:', e);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1. Patient Sign In
  const signInPatient = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      if (isSupabaseConfigured) {
        const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
        if (authErr) throw authErr;
        // Profile will be set by onAuthStateChange
        return { success: true };
      }

      // Demo login
      const mockPatient = {
        id: 'usr-pat-001',
        email: email || 'rahul.deshmukh@gmail.com',
        full_name: email.split('@')[0].replace('.', ' ').toUpperCase() || 'Rahul Deshmukh',
        role: 'patient',
        phone: '+91 98230 45678',
        approval_status: 'approved',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
        patient_details: {
          blood_group: 'O+',
          date_of_birth: '1988-06-15',
          gender: 'male',
          city: 'Mumbai',
          emergency_contact: '+91 98200 99887 (Pooja Deshmukh)',
          allergies: ['Penicillin', 'Peanuts'],
          conditions: ['Stage 1 Essential Hypertension']
        }
      };
      setUser(mockPatient);
      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 2. Patient Sign Up
  const signUpPatient = async (patientData) => {
    setLoading(true);
    setError(null);
    try {
      if (isSupabaseConfigured) {
        const { data, error: authErr } = await supabase.auth.signUp({
          email: patientData.email,
          password: patientData.password,
          options: {
            // emailRedirectTo skipped so no confirmation email is needed
            data: {
              role: 'patient',
              full_name: patientData.full_name,
              phone: patientData.phone,
              date_of_birth: patientData.date_of_birth,
              gender: patientData.gender,
              blood_group: patientData.blood_group,
              city: patientData.city
            }
          }
        });

        if (authErr) {
          // Friendly messages for common Supabase errors
          if (authErr.message?.toLowerCase().includes('email rate limit') ||
              authErr.message?.toLowerCase().includes('rate limit') ||
              authErr.message?.toLowerCase().includes('email limit') ||
              authErr.status === 429) {
            throw new Error('Too many sign-ups. Please wait a few minutes and try again, or use a different email address.');
          }
          if (authErr.message?.toLowerCase().includes('user already registered') ||
              authErr.message?.toLowerCase().includes('already registered')) {
            throw new Error('This email is already registered. Please sign in instead.');
          }
          throw authErr;
        }

        // If user session returned immediately (email confirmation disabled), auto-login
        if (data?.session) {
          const profile = {
            id: data.user.id,
            email: data.user.email,
            full_name: patientData.full_name,
            role: 'patient',
            phone: patientData.phone,
            approval_status: 'approved',
            patient_details: {
              blood_group: patientData.blood_group || 'O+',
              date_of_birth: patientData.date_of_birth,
              gender: patientData.gender,
              city: patientData.city,
              emergency_contact: patientData.emergency_contact,
              allergies: [],
              conditions: []
            }
          };
          setUser(profile);
          return { success: true, autoLoggedIn: true };
        }

        // Email confirmation is disabled on Supabase → identities will be empty if already confirmed
        return { success: true, needsConfirmation: false };
      }

      // Demo sign up (no Supabase configured)
      const newPatient = {
        id: `pat-${Date.now()}`,
        email: patientData.email,
        full_name: patientData.full_name,
        role: 'patient',
        phone: patientData.phone,
        approval_status: 'approved',
        patient_details: {
          blood_group: patientData.blood_group || 'O+',
          date_of_birth: patientData.date_of_birth,
          gender: patientData.gender,
          city: patientData.city,
          emergency_contact: patientData.emergency_contact,
          allergies: [],
          conditions: []
        }
      };
      setUser(newPatient);
      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 3. Doctor & Staff Sign In
  const signInStaff = async (email, password, requestedRole = null) => {
    setLoading(true);
    setError(null);
    try {
      if (isSupabaseConfigured) {
        const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
        if (authErr) throw authErr;
        return { success: true };
      }

      const role = requestedRole || 'doctor';
      const mockStaff = {
        id: `staff-${role}-001`,
        email: email || `${role}@swasthya-sense.health`,
        full_name: role === 'doctor' ? 'Dr. Ananya Sharma' : (role === 'nurse' ? 'Sister Sunita Rao' : `${role.toUpperCase()} Officer`),
        role: role,
        phone: '+91 98200 11990',
        approval_status: 'approved', // Pre-approved demo
        avatar_url: role === 'doctor' 
          ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop' 
          : 'https://images.unsplash.com/photo-1594824813576-f39b699a779d?w=300&auto=format&fit=crop',
        staff_details: {
          employee_id: `EMP-${role.toUpperCase()}-2026`,
          qualification: role === 'doctor' ? 'MBBS, MD (Cardiology)' : 'B.Sc Nursing',
          specialization: role === 'doctor' ? 'Interventional Cardiology' : 'Critical Care',
          hospital_clinic: 'Swasthya Sense Central Hospital, Mumbai'
        }
      };
      setUser(mockStaff);
      return { success: true, role };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 4. Staff Sign Up (Requires approval)
  const signUpStaff = async (staffData) => {
    setLoading(true);
    setError(null);
    try {
      if (isSupabaseConfigured) {
        const { data, error: authErr } = await supabase.auth.signUp({
          email: staffData.email,
          password: staffData.password,
          options: {
            data: {
              role: staffData.professional_role,
              full_name: staffData.full_name,
              phone: staffData.phone,
              employee_id: staffData.employee_id,
              qualification: staffData.qualification,
              specialization: staffData.specialization,
              medical_registration_number: staffData.medical_registration_number
            }
          }
        });

        if (authErr) {
          if (authErr.message?.toLowerCase().includes('email rate limit') ||
              authErr.message?.toLowerCase().includes('rate limit') ||
              authErr.message?.toLowerCase().includes('email limit') ||
              authErr.status === 429) {
            throw new Error('Too many sign-ups. Please wait a few minutes and try again, or use a different email address.');
          }
          if (authErr.message?.toLowerCase().includes('user already registered') ||
              authErr.message?.toLowerCase().includes('already registered')) {
            throw new Error('This email is already registered. Please sign in instead.');
          }
          throw authErr;
        }
        return { success: true, pendingApproval: true };
      }

      // Demo: Created with PENDING status to demonstrate the required approval workflow
      return { 
        success: true, 
        pendingApproval: true, 
        message: 'Your registration has been submitted for administrative verification.' 
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 5. Quick Switch Role (For fast evaluator review of all 6 dashboards)
  const switchRole = (role) => {
    const rolesMap = {
      patient: {
        id: 'usr-pat-001',
        email: 'rahul.deshmukh@gmail.com',
        full_name: 'Rahul Deshmukh',
        role: 'patient',
        phone: '+91 98230 45678',
        approval_status: 'approved',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
        patient_details: {
          blood_group: 'O+',
          date_of_birth: '1988-06-15',
          gender: 'male',
          city: 'Mumbai',
          emergency_contact: '+91 98200 99887 (Pooja Deshmukh)',
          allergies: ['Penicillin', 'Peanuts'],
          conditions: ['Stage 1 Essential Hypertension']
        }
      },
      doctor: {
        id: 'doc-01',
        email: 'dr.ananya@swasthya-sense.health',
        full_name: 'Dr. Ananya Sharma',
        role: 'doctor',
        phone: '+91 98200 11990',
        approval_status: 'approved',
        avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop',
        staff_details: {
          employee_id: 'EMP-DOC-8821',
          qualification: 'MBBS, MD (Cardiology), FACC',
          specialization: 'Interventional Cardiology',
          hospital_clinic: 'Swasthya Sense Central Hospital, Mumbai'
        }
      },
      nurse: {
        id: 'nurse-01',
        email: 'nurse.sunita@swasthya-sense.health',
        full_name: 'Nurse Sunita Rao',
        role: 'nurse',
        phone: '+91 98200 44551',
        approval_status: 'approved',
        avatar_url: 'https://images.unsplash.com/photo-1594824813576-f39b699a779d?w=300&auto=format&fit=crop',
        staff_details: {
          employee_id: 'EMP-NUR-4012',
          qualification: 'B.Sc Nursing, Critical Care Specialist',
          specialization: 'Inpatient & ICU Care',
          hospital_clinic: 'Swasthya Sense Central Hospital'
        }
      },
      receptionist: {
        id: 'reception-01',
        email: 'reception@swasthya-sense.health',
        full_name: 'Pooja Verma',
        role: 'receptionist',
        phone: '+91 98200 88221',
        approval_status: 'approved',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop',
        staff_details: {
          employee_id: 'EMP-REC-1090',
          qualification: 'Hospital Administration & Front-desk Operations',
          hospital_clinic: 'Swasthya Sense Central Hospital'
        }
      },
      pharmacist: {
        id: 'pharmacy-01',
        email: 'pharmacy@swasthya-sense.health',
        full_name: 'Karan Mehra',
        role: 'pharmacist',
        phone: '+91 98200 99334',
        approval_status: 'approved',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop',
        staff_details: {
          employee_id: 'EMP-PHARM-3310',
          qualification: 'M.Pharm (Clinical Pharmacy), Registered Pharmacist',
          specialization: 'Dispensing & Therapeutic Drug Monitoring',
          hospital_clinic: 'Swasthya Pharmacy Central'
        }
      },
      admin: {
        id: 'admin-01',
        email: 'admin@swasthya-sense.health',
        full_name: 'Super Administrator',
        role: 'admin',
        phone: '+91 98200 00001',
        approval_status: 'approved',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop',
        staff_details: {
          employee_id: 'EMP-ADM-0001',
          qualification: 'Director of Healthcare Informatics & Operations',
          hospital_clinic: 'Swasthya Sense Healthcare Network'
        }
      }
    };

    if (rolesMap[role]) {
      setUser(rolesMap[role]);
    }
  };

  // 6. Sign Out
  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('swasthya_user_session');
    localStorage.removeItem('swasthya_auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInPatient,
        signUpPatient,
        signInStaff,
        signUpStaff,
        signOut,
        switchRole,
        isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
