import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Phone,
  MapPin,
  Heart,
  Info,
  Building,
  Navigation,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Clock,
  Wifi,
  WifiOff,
  CheckCircle,
} from 'lucide-react';

// ─── Haversine distance (km) ────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Fetch real hospitals from OpenStreetMap Overpass API ───────────────────
async function fetchNearbyHospitals(lat, lon, radiusKm = 10) {
  const radius = radiusKm * 1000; // metres
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
      node["amenity"="clinic"](around:${radius},${lat},${lon});
      node["healthcare"="hospital"](around:${radius},${lat},${lon});
    );
    out center tags;
  `;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });
  if (!res.ok) throw new Error('Overpass API error');
  const json = await res.json();

  return json.elements
    .map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (!elLat || !elLon) return null;
      const dist = haversine(lat, lon, elLat, elLon);
      const tags = el.tags || {};
      return {
        id: el.id,
        name: tags.name || tags['name:en'] || 'Unnamed Hospital',
        dist,
        distStr: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`,
        etaMins: Math.ceil((dist / 40) * 60), // ~40 km/h city speed
        phone:
          tags.phone ||
          tags['contact:phone'] ||
          tags['phone:emergency'] ||
          null,
        emergency: tags.emergency === 'yes' || tags['emergency'] !== undefined,
        type: tags.amenity === 'hospital' ? 'Hospital' : 'Clinic',
        lat: elLat,
        lon: elLon,
        address:
          [tags['addr:street'], tags['addr:city']]
            .filter(Boolean)
            .join(', ') || null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 8);
}

// ─── Reverse geocode via Nominatim (no key needed) ─────────────────────────
async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const j = await res.json();
  return j.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

// ─── Main Component ─────────────────────────────────────────────────────────
export const PatientEmergencyHelp = () => {
  const { user } = useAuth();

  const [locState, setLocState] = useState('idle'); // idle | loading | success | error | denied
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [hospLoading, setHospLoading] = useState(false);
  const [hospError, setHospError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const emergencyContacts = [
    { name: 'National Emergency Helpline', number: '112', desc: 'Police · Fire · Ambulance — Single number across India', primary: true },
    { name: 'Ambulance (Free Service)', number: '108', desc: 'Free emergency medical ambulance across most Indian states' },
    { name: 'National Poison Control', number: '1800-116-117', desc: 'Immediate advice for poisoning & drug overdose (Toll Free)' },
    { name: 'Swasthya Sense Ambulance', number: '+919820011200', desc: 'Our hospital direct rapid-dispatch ambulance 24×7' },
  ];

  // ── Get location + hospitals ─────────────────────────────────────────────
  const getLocationAndHospitals = useCallback(() => {
    if (!navigator.geolocation) {
      setLocState('error');
      return;
    }
    setLocState('loading');
    setHospitals([]);
    setHospError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        setLocState('success');
        setLastUpdated(new Date());

        // Reverse geocode in background
        reverseGeocode(latitude, longitude)
          .then(setAddress)
          .catch(() => setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`));

        // Fetch hospitals
        setHospLoading(true);
        try {
          const results = await fetchNearbyHospitals(latitude, longitude, 15);
          setHospitals(results);
          if (results.length === 0) setHospError('No hospitals found within 15 km. Try calling 112.');
        } catch (e) {
          setHospError('Could not load nearby hospitals. Please call 112 directly.');
        } finally {
          setHospLoading(false);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setLocState('denied');
        else setLocState('error');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, []);

  // Auto-request on mount
  useEffect(() => {
    getLocationAndHospitals();
  }, [getLocationAndHospitals]);

  const openMapsDirections = (h) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const openLocationOnMap = () => {
    if (!coords) return;
    window.open(
      `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=14/${coords.lat}/${coords.lon}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* ── SOS Banner ── */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 rounded-3xl p-6 sm:p-10 text-white shadow-soft-lg space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              Emergency Assistance Terminal
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Immediate Help: Dial 112
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 max-w-2xl leading-relaxed">
              If someone is unresponsive, having chest pain, sudden paralysis, or severe bleeding — call emergency services immediately and use the hospital locator below.
            </p>
          </div>
          <a
            href="tel:112"
            className="px-8 py-5 rounded-2xl bg-white text-rose-700 font-extrabold text-base shadow-glow hover:bg-rose-50 transition-all flex items-center gap-3 shrink-0 animate-bounce"
          >
            <Phone className="w-6 h-6 fill-rose-600" />
            CALL 112 NOW
          </a>
        </div>
        <div className="p-3.5 rounded-2xl bg-black/25 border border-white/20 text-xs text-rose-100 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Notice:</strong> Clicking phone links initiates standard telephone dialing on your device. Hospital distances are estimated. Always verify with emergency operators.
          </p>
        </div>
      </div>

      {/* ── Location Status Bar ── */}
      <div className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3 ${
        locState === 'success' ? 'bg-emerald-50 border-emerald-200' :
        locState === 'denied'  ? 'bg-amber-50 border-amber-200' :
        locState === 'error'   ? 'bg-rose-50 border-rose-200' :
                                 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5">
          {locState === 'loading' && <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />}
          {locState === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
          {locState === 'denied'  && <WifiOff className="w-4 h-4 text-amber-600" />}
          {locState === 'error'   && <AlertTriangle className="w-4 h-4 text-rose-600" />}
          {locState === 'idle'    && <MapPin className="w-4 h-4 text-slate-500" />}

          <div>
            {locState === 'loading' && <p className="text-xs font-semibold text-brand-700">Acquiring your GPS location…</p>}
            {locState === 'success' && (
              <div>
                <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                  <Navigation className="w-3 h-3" /> Location detected
                  {lastUpdated && <span className="font-normal text-emerald-600 ml-1">· {lastUpdated.toLocaleTimeString()}</span>}
                </p>
                {address && <p className="text-[11px] text-slate-600 mt-0.5 max-w-md truncate">{address}</p>}
              </div>
            )}
            {locState === 'denied' && (
              <div>
                <p className="text-xs font-semibold text-amber-800">Location access denied</p>
                <p className="text-[11px] text-amber-700">Enable location in your browser settings, then refresh.</p>
              </div>
            )}
            {locState === 'error' && (
              <div>
                <p className="text-xs font-semibold text-rose-800">Could not get location</p>
                <p className="text-[11px] text-rose-700">Check GPS / internet and try again.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {locState === 'success' && coords && (
            <button
              onClick={openLocationOnMap}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> View on Map
            </button>
          )}
          {(locState === 'error' || locState === 'denied' || locState === 'success') && (
            <button
              onClick={getLocationAndHospitals}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT: Helplines + Hospitals ── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Emergency Contacts */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-rose-600" />
              Verified Emergency Helplines (India)
            </h3>
            <div className="space-y-3">
              {emergencyContacts.map((c, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    c.primary ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-navy-900">{c.name}</h4>
                      {c.primary && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 uppercase">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{c.desc}</p>
                  </div>
                  <a
                    href={`tel:${c.number.replace(/\D/g, '')}`}
                    className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-mono font-bold text-xs shrink-0 flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    {c.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Hospitals — Live from GPS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-brand-600" />
                Nearby Hospitals
                {coords && (
                  <span className="text-[10px] font-normal text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Live · GPS
                  </span>
                )}
              </h3>
              {hospLoading && <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />}
            </div>

            {/* Loading state */}
            {hospLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
                ))}
                <p className="text-[11px] text-center text-slate-400">Searching hospitals near you via OpenStreetMap…</p>
              </div>
            )}

            {/* Error */}
            {!hospLoading && hospError && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{hospError}</span>
              </div>
            )}

            {/* No location yet */}
            {!hospLoading && !hospError && hospitals.length === 0 && locState !== 'success' && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Allow location access to find hospitals near you</p>
                <button
                  onClick={getLocationAndHospitals}
                  className="mt-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 mx-auto"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Allow Location & Find Hospitals
                </button>
              </div>
            )}

            {/* Hospital list */}
            {!hospLoading && hospitals.length > 0 && (
              <div className="space-y-3">
                {hospitals.map((h, i) => (
                  <div
                    key={h.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 uppercase">
                            #{i + 1}
                          </span>
                          <h4 className="text-xs font-bold text-navy-900 truncate">{h.name}</h4>
                          {h.emergency && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 uppercase shrink-0">
                              ER
                            </span>
                          )}
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                            {h.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            {h.distStr}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            ~{h.etaMins} min drive
                          </span>
                          {h.address && (
                            <span className="text-slate-400 truncate max-w-xs">{h.address}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        {h.phone ? (
                          <a
                            href={`tel:${h.phone.replace(/\s/g, '')}`}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" /> Call
                          </a>
                        ) : (
                          <a
                            href="tel:112"
                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" /> 112
                          </a>
                        )}
                        <button
                          onClick={() => openMapsDirections(h)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 flex items-center gap-1"
                        >
                          <Navigation className="w-3 h-3" /> Directions
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <p className="text-[10px] text-center text-slate-400 pt-1">
                  Data from OpenStreetMap · Sorted by distance · {hospitals.length} hospitals found within 15 km
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Emergency Medical ID Card ── */}
        <div className="lg:col-span-5 space-y-6">

          {/* Medical ID Card */}
          <div className="bg-gradient-to-br from-navy-900 to-navy-950 text-white rounded-3xl p-6 shadow-soft-lg space-y-5 border border-navy-800">
            <div className="flex items-center justify-between pb-4 border-b border-navy-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Emergency Medical Card</h4>
                  <p className="text-[10px] text-slate-400">First Responder Accessible</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40">
                SOS ID
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-navy-900/90 border border-navy-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Patient Name</span>
                <p className="text-sm font-bold text-white mt-0.5">{user?.full_name || 'Patient Name'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-navy-900/90 border border-navy-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Blood Group</span>
                  <p className="text-base font-extrabold text-rose-400 mt-0.5">
                    {user?.patient_details?.blood_group || 'Not Set'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-navy-900/90 border border-navy-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Allergies</span>
                  <p className="text-xs font-bold text-amber-300 mt-0.5">
                    {user?.patient_details?.allergies?.join(', ') || 'None listed'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-navy-900/90 border border-navy-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Conditions</span>
                <p className="text-xs font-semibold text-slate-200 mt-0.5">
                  {user?.patient_details?.conditions?.join(', ') || 'None listed'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-navy-900/90 border border-navy-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Emergency Contact</span>
                <p className="text-xs font-bold text-white mt-0.5">
                  {user?.patient_details?.emergency_contact || 'Not configured — update in Profile'}
                </p>
              </div>

              {/* My Live Location share */}
              {coords && (
                <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-700/40">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">My Current Location</span>
                  <p className="text-xs font-mono text-emerald-300 mt-0.5">
                    {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
                  </p>
                  <button
                    onClick={openLocationOnMap}
                    className="mt-2 text-[10px] px-2.5 py-1 rounded-lg bg-emerald-700/50 hover:bg-emerald-600/60 text-emerald-200 font-semibold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Share on Map
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 text-[10px] text-slate-400 text-center">
              Keep this card accessible on your phone for paramedic triage.
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-3">
            <h4 className="text-xs font-bold text-navy-900 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              While Waiting for Help
            </h4>
            {[
              'Stay calm and keep the patient still',
              'Do not give food or water unless advised',
              'If choking: 5 back blows, then 5 abdominal thrusts',
              'For bleeding: apply firm pressure with a clean cloth',
              'For chest pain: loosen clothing, keep person seated upright',
              'Share your live location with the dispatcher',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[9px] font-extrabold bg-amber-100 text-amber-700 rounded-full w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
