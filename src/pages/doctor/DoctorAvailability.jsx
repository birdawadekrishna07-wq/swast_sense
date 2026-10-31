import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';

export const DoctorAvailability = () => {
  const [schedule, setSchedule] = useState([
    { day: 'Monday', active: true, start: '09:00', end: '17:00', slot: '30 mins' },
    { day: 'Tuesday', active: true, start: '09:00', end: '17:00', slot: '30 mins' },
    { day: 'Wednesday', active: true, start: '09:00', end: '17:00', slot: '30 mins' },
    { day: 'Thursday', active: true, start: '09:00', end: '17:00', slot: '30 mins' },
    { day: 'Friday', active: true, start: '09:00', end: '16:00', slot: '30 mins' },
    { day: 'Saturday', active: true, start: '09:00', end: '13:00', slot: '30 mins' },
    { day: 'Sunday', active: false, start: '10:00', end: '12:00', slot: '30 mins' }
  ]);

  const [saved, setSaved] = useState(false);

  const toggleDay = (idx) => {
    setSchedule(prev =>
      prev.map((s, i) => i === idx ? { ...s, active: !s.active } : s)
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-navy-900">Doctor Availability & Slot Windows</h2>
          <p className="text-xs text-slate-500">Configure your active consultation days and slot durations</p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all"
        >
          Save Schedule
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Availability schedule updated and synced across OPD booking engines!</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft divide-y divide-slate-100">
        {schedule.map((s, idx) => (
          <div key={s.day} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={s.active}
                onChange={() => toggleDay(idx)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
              />
              <span className={`text-xs font-bold ${s.active ? 'text-navy-900' : 'text-slate-400 line-through'}`}>
                {s.day}
              </span>
            </div>

            {s.active ? (
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">From</span>
                  <input
                    type="time"
                    value={s.start}
                    className="p-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium"
                    readOnly
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">To</span>
                  <input
                    type="time"
                    value={s.end}
                    className="p-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium"
                    readOnly
                  />
                </div>
                <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-1 rounded font-bold">
                  {s.slot}
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">Off Duty</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
