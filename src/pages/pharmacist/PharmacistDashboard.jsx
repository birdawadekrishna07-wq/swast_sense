import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Package, Pill, AlertTriangle, CheckCircle2, Search,
  ShieldCheck, Plus, Clock, LayoutDashboard, ClipboardList,
  TrendingDown, RefreshCw, X, Save, Edit3, Bell, BarChart3,
  AlertCircle, Filter, Download, Eye
} from 'lucide-react';

const TABS = [
  { id: 'overview',      label: 'Overview',             icon: LayoutDashboard },
  { id: 'prescriptions', label: 'Prescription Queue',   icon: ClipboardList },
  { id: 'inventory',     label: 'Medicine Inventory',   icon: Package },
  { id: 'dispensed',     label: 'Dispensing Log',       icon: CheckCircle2 },
];

const INITIAL_INVENTORY = [
  { id: 'med-01', name: 'Paracetamol 650mg',    category: 'Analgesic',        stock: 450, min: 100, unit: 'tabs',  supplier: 'Cipla Ltd',    expiry: '2027-08' },
  { id: 'med-02', name: 'Amoxicillin 500mg',    category: 'Antibiotic',       stock: 60,  min: 80,  unit: 'caps',  supplier: 'Sun Pharma',   expiry: '2026-12' },
  { id: 'med-03', name: 'Telmisartan 40mg',     category: 'Cardiovascular',   stock: 310, min: 100, unit: 'tabs',  supplier: 'Lupin',        expiry: '2027-03' },
  { id: 'med-04', name: 'Metformin 500mg',      category: 'Antidiabetic',     stock: 24,  min: 50,  unit: 'tabs',  supplier: 'USV Pvt Ltd',  expiry: '2027-01' },
  { id: 'med-05', name: 'Cetirizine 10mg',      category: 'Antihistamine',    stock: 190, min: 75,  unit: 'tabs',  supplier: 'Dr. Reddy\'s', expiry: '2027-06' },
  { id: 'med-06', name: 'Pantoprazole 40mg',    category: 'Gastrointestinal', stock: 280, min: 80,  unit: 'tabs',  supplier: 'Alkem Labs',   expiry: '2027-04' },
  { id: 'med-07', name: 'Ceftriaxone 1g IV',   category: 'Antibiotic (IV)',  stock: 18,  min: 30,  unit: 'vials', supplier: 'Fresenius',    expiry: '2026-11' },
  { id: 'med-08', name: 'Atorvastatin 20mg',   category: 'Lipid-lowering',   stock: 340, min: 60,  unit: 'tabs',  supplier: 'Pfizer',       expiry: '2027-09' },
  { id: 'med-09', name: 'Amlodipine 5mg',      category: 'Cardiovascular',   stock: 220, min: 80,  unit: 'tabs',  supplier: 'Cipla Ltd',    expiry: '2027-07' },
  { id: 'med-10', name: 'Ondansetron 4mg IV',  category: 'Antiemetic (IV)',  stock: 8,   min: 20,  unit: 'vials', supplier: 'Neon Labs',    expiry: '2026-12' },
];

const INITIAL_RX_QUEUE = [
  {
    id: 'RX-2026-9901', patient: 'Rahul Deshmukh', age: 38,
    doctor: 'Dr. Ananya Sharma', dept: 'Cardiology',
    medicines: [
      { name: 'Telmisartan 40mg', qty: '30 tabs', sig: 'Once daily after food' },
      { name: 'Atorvastatin 20mg', qty: '30 tabs', sig: 'Once daily at bedtime' },
    ],
    sig: 'SHA256:8fa3b...VERIFIED', time: '15m ago', status: 'Pending',
  },
  {
    id: 'RX-2026-9902', patient: 'Sunita Mukherjee', age: 46,
    doctor: 'Dr. Vikram Sengupta', dept: 'General Medicine',
    medicines: [
      { name: 'Amoxicillin 500mg', qty: '15 caps', sig: '1 cap TDS for 5 days' },
      { name: 'Paracetamol 650mg', qty: '10 tabs', sig: 'PRN for fever/pain' },
    ],
    sig: 'SHA256:3de9c...VERIFIED', time: '45m ago', status: 'Pending',
  },
  {
    id: 'RX-2026-9903', patient: 'Aarav Patel', age: 29,
    doctor: 'Dr. Priya Nair', dept: 'Surgery',
    medicines: [
      { name: 'Pantoprazole 40mg', qty: '14 tabs', sig: 'Once daily before breakfast' },
      { name: 'Cetirizine 10mg',   qty: '7 tabs',  sig: 'Once daily at night' },
    ],
    sig: 'SHA256:7ab2f...VERIFIED', time: '1h 20m ago', status: 'Pending',
  },
];

const DISPENSED_LOG = [
  { id: 'RX-2026-9898', patient: 'Meena Shah', medicine: 'Metformin 500mg (60 tabs)', pharmacist: 'Karan Mehra', time: '11:30 AM', status: 'Dispensed' },
  { id: 'RX-2026-9897', patient: 'Ravi Kumar', medicine: 'Amlodipine 5mg (30 tabs)', pharmacist: 'Karan Mehra', time: '10:45 AM', status: 'Dispensed' },
  { id: 'RX-2026-9895', patient: 'Deepa Iyer',  medicine: 'Cetirizine 10mg (10 tabs)', pharmacist: 'Karan Mehra', time: '09:15 AM', status: 'Dispensed' },
];

function getStockStatus(stock, min) {
  const ratio = stock / min;
  if (ratio <= 0.5) return { label: 'Critical Low', color: 'bg-rose-50 text-rose-700 border-rose-200', bar: 'bg-rose-500' };
  if (ratio <= 1)   return { label: 'Low Stock',    color: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-500' };
  return              { label: 'In Stock',      color: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' };
}

export const PharmacistDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== tab) {
      setTab(urlTab);
    } else if (!urlTab && tab !== 'overview') {
      setTab('overview');
    }
  }, [searchParams]);

  const handleSelectTab = (newTab) => {
    setTab(newTab);
    if (newTab === 'overview') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: newTab });
    }
  };
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [rxQueue, setRxQueue] = useState(INITIAL_RX_QUEUE);
  const [dispensedLog, setDispensedLog] = useState(DISPENSED_LOG);
  const [search, setSearch] = useState('');
  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [toast, setToast] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const dispenseRx = (rxId) => {
    const rx = rxQueue.find(r => r.id === rxId);
    if (!rx) return;
    setRxQueue(prev => prev.filter(r => r.id !== rxId));
    const entry = {
      id: rxId,
      patient: rx.patient,
      medicine: rx.medicines.map(m => m.name).join(' + '),
      pharmacist: user?.full_name || 'Karan Mehra',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'Dispensed',
    };
    setDispensedLog(prev => [entry, ...prev]);
    // Deduct stock
    rx.medicines.forEach(m => {
      const qty = parseInt(m.qty) || 1;
      setInventory(prev => prev.map(inv => inv.name.toLowerCase().includes(m.name.split(' ')[0].toLowerCase()) ? { ...inv, stock: Math.max(0, inv.stock - qty) } : inv));
    });
    showToast(`${rxId} dispensed & logged to MAR. Stock deducted automatically.`);
  };

  const rejectRx = (rxId) => {
    setRxQueue(prev => prev.filter(r => r.id !== rxId));
    showToast(`Prescription ${rxId} rejected and returned to doctor for review.`);
  };

  const doRestock = (itemId) => {
    const qty = parseInt(restockQty);
    if (!qty || qty <= 0) return;
    setInventory(prev => prev.map(i => i.id === itemId ? { ...i, stock: i.stock + qty } : i));
    setRestockItem(null);
    setRestockQty('');
    showToast(`Stock updated by +${qty} units.`);
  };

  const categories = ['All', ...Array.from(new Set(inventory.map(i => i.category)))];
  const filteredInventory = inventory
    .filter(i => (filterCat === 'All' || i.category === filterCat) && i.name.toLowerCase().includes(search.toLowerCase()));

  const lowStockCount = inventory.filter(i => i.stock <= i.min).length;
  const criticalCount = inventory.filter(i => i.stock / i.min <= 0.5).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Restock Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900">Restock Medicine</h3>
              <button onClick={() => setRestockItem(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <p className="text-xs text-slate-600">{restockItem.name} · Current stock: <strong>{restockItem.stock} {restockItem.unit}</strong></p>
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">Add Units</label>
              <input type="number" min="1" value={restockQty} onChange={e => setRestockQty(e.target.value)} placeholder="Enter quantity..." className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => doRestock(restockItem.id)} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"><Save className="w-3.5 h-3.5" /> Update Stock</button>
              <button onClick={() => setRestockItem(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[11px] font-semibold">
              <Package className="w-3.5 h-3.5 text-emerald-200" /> Pharmacy Station & Drug Dispensary
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{user?.full_name || 'Karan Mehra'}, R.Ph.</h2>
            <p className="text-xs text-emerald-100">Registration: PCI-MH-2019-11204 · Central Dispensary Counter 2</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {criticalCount > 0 && (
              <span className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-4 h-4" /> {criticalCount} Critical Low
              </span>
            )}
            {rxQueue.length > 0 && (
              <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5">
                <Bell className="w-4 h-4" /> {rxQueue.length} Rx Pending
              </span>
            )}
          </div>
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { label: 'Rx Pending',        value: rxQueue.length,   color: rxQueue.length ? 'bg-amber-500/30' : 'bg-white/10' },
            { label: 'Dispensed Today',   value: dispensedLog.length, color: 'bg-white/10' },
            { label: 'Low Stock Alerts',  value: lowStockCount,    color: lowStockCount ? 'bg-rose-500/30' : 'bg-white/10' },
            { label: 'Total Medicines',   value: inventory.length, color: 'bg-white/10' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-2xl p-3 border border-white/10`}>
              <p className="text-[10px] text-emerald-200 font-semibold uppercase">{s.label}</p>
              <p className="text-xl font-extrabold text-white mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => handleSelectTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${tab === t.id ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
              {t.id === 'prescriptions' && rxQueue.length > 0 && <span className="ml-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{rxQueue.length}</span>}
            </button>
          );
        })}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="space-y-5">
          {/* Alerts */}
          {lowStockCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Stock Alerts — Reorder Required</h4>
              {inventory.filter(i => i.stock <= i.min).map(item => {
                const s = getStockStatus(item.stock, item.min);
                return (
                  <div key={item.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-amber-100">
                    <div>
                      <span className="text-xs font-bold text-navy-900">{item.name}</span>
                      <span className="text-[10px] text-slate-400 ml-2">{item.stock}/{item.min} {item.unit} remaining</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${s.color}`}>{s.label}</span>
                      <button onClick={() => { setRestockItem(item); handleSelectTab('inventory'); }} className="text-[11px] px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Restock</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pending Rx */}
          {rxQueue.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-4">
              <h3 className="text-sm font-bold text-navy-900">Prescriptions Awaiting Verification</h3>
              {rxQueue.slice(0, 2).map(rx => (
                <div key={rx.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{rx.id}</span>
                      <span className="text-xs font-bold text-navy-900">{rx.patient}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Signature Verified</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{rx.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{rx.medicines.map(m => m.name).join(' + ')}</p>
                  <div className="flex gap-2">
                    <button onClick={() => dispenseRx(rx.id)} className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">Dispense & Log</button>
                    <button onClick={() => rejectRx(rx.id)} className="px-4 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200">Reject</button>
                  </div>
                </div>
              ))}
              {rxQueue.length > 2 && <button onClick={() => handleSelectTab('prescriptions')} className="text-xs text-emerald-700 font-semibold hover:underline">View all {rxQueue.length} prescriptions →</button>}
            </div>
          )}

          {/* Quick Inventory Summary */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-4">
            <h3 className="text-sm font-bold text-navy-900">Inventory Snapshot</h3>
            <div className="space-y-2">
              {inventory.slice(0, 5).map(item => {
                const s = getStockStatus(item.stock, item.min);
                const pct = Math.min(100, Math.round((item.stock / (item.min * 4)) * 100));
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-navy-900 w-44 truncate">{item.name}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${s.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 w-12 text-right">{item.stock} {item.unit}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${s.color} hidden sm:block`}>{s.label}</span>
                  </div>
                );
              })}
              <button onClick={() => handleSelectTab('inventory')} className="text-xs text-emerald-700 font-semibold hover:underline pt-1">View full inventory →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRESCRIPTION QUEUE ── */}
      {tab === 'prescriptions' && (
        <div className="space-y-4">
          {rxQueue.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-10 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-navy-900">All prescriptions fulfilled!</p>
              <p className="text-xs text-slate-400">No pending prescriptions in the queue.</p>
            </div>
          ) : (
            rxQueue.map(rx => (
              <div key={rx.id} className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{rx.id}</span>
                      <span className="text-xs font-bold text-navy-900">{rx.patient} · {rx.age}y</span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Doctor Signature Verified</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Prescribing: {rx.doctor} ({rx.dept}) · {rx.time}</p>
                    <p className="text-[10px] font-mono text-slate-400">{rx.sig}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">{rx.status}</span>
                </div>

                <div className="space-y-2">
                  {rx.medicines.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <Pill className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-navy-900">{m.name} — {m.qty}</p>
                        <p className="text-[10px] text-slate-500">{m.sig}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={() => dispenseRx(rx.id)} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Verify & Dispense
                  </button>
                  <button onClick={() => rejectRx(rx.id)} className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── INVENTORY ── */}
      {tab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicines..." className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" />
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3 px-4">Medicine</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Min Threshold</th>
                    <th className="py-3 px-4">Stock Bar</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Expiry</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map(item => {
                    const s = getStockStatus(item.stock, item.min);
                    const pct = Math.min(100, Math.round((item.stock / (item.min * 4)) * 100));
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-navy-900">{item.name}</td>
                        <td className="py-3 px-4 text-slate-500">{item.category}</td>
                        <td className="py-3 px-4 font-mono font-bold text-navy-900">{item.stock} <span className="text-slate-400 font-normal">{item.unit}</span></td>
                        <td className="py-3 px-4 font-mono text-slate-400">{item.min}</td>
                        <td className="py-3 px-4">
                          <div className="w-20 bg-slate-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${s.bar}`} style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.color}`}>{s.label}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{item.supplier}</td>
                        <td className="py-3 px-4 text-slate-500">{item.expiry}</td>
                        <td className="py-3 px-4">
                          <button onClick={() => setRestockItem(item)} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── DISPENSING LOG ── */}
      {tab === 'dispensed' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Today's Dispensing Log</h3>
            <span className="text-xs text-slate-400">{dispensedLog.length} entries</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-4">Rx ID</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Medicine(s)</th>
                  <th className="py-3 px-4">Dispensed By</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dispensedLog.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700">{log.id}</td>
                    <td className="py-3 px-4 font-semibold text-navy-900">{log.patient}</td>
                    <td className="py-3 px-4 text-slate-600">{log.medicine}</td>
                    <td className="py-3 px-4 text-slate-500">{log.pharmacist}</td>
                    <td className="py-3 px-4 text-slate-500">{log.time}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{log.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
