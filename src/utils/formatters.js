export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
}

export function formatTime(timeString) {
  if (!timeString) return 'N/A';
  try {
    const parts = timeString.split(':');
    let hour = parseInt(parts[0], 10);
    const minute = parts[1] || '00';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}:${minute} ${ampm}`;
  } catch (e) {
    return timeString;
  }
}

export function getStatusBadge(status) {
  const map = {
    pending: { label: 'Pending', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    confirmed: { label: 'Confirmed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    completed: { label: 'Completed', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    cancelled: { label: 'Cancelled', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    approved: { label: 'Approved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    active: { label: 'Active', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    taken: { label: 'Taken', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    skipped: { label: 'Skipped', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  };
  return map[status?.toLowerCase()] || { label: status || 'Unknown', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
}
