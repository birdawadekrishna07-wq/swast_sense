import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = ({ title = "Dashboard", subtitle = "Connected Healthcare" }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Appointment Confirmed', time: '10m ago', unread: true },
    { id: 2, title: 'Medicine Reminder: Telmisartan 40mg', time: '1h ago', unread: true },
    { id: 3, title: 'Digital Prescription Signed by Dr. Sharma', time: 'Yesterday', unread: false },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-20">
      
      {/* Title & Context */}
      <div>
        <h1 className="text-lg font-bold text-navy-900">{title}</h1>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        
        {/* Quick Emergency Call Button */}
        <Link
          to="/patient/emergency"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          <span>Emergency 112</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-soft-lg border border-slate-100 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-navy-900">Notifications</span>
                <span className="text-[10px] text-brand-600 font-semibold cursor-pointer">Mark all read</span>
              </div>
              <div className="divide-y divide-slate-50 py-1">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 px-1 flex items-start gap-2.5 hover:bg-slate-50 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0"></span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-800">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role & Name Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-navy-900">{user?.full_name || 'Rahul Deshmukh'}</p>
            <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200 uppercase">
              {user?.role || 'patient'}
            </span>
          </div>
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
        </div>

      </div>

    </header>
  );
};
