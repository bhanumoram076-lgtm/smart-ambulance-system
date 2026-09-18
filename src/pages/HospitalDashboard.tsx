import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase, type Ambulance, type EmergencyRequest, type Hospital, type Notification } from '@/lib/supabase';
import { updateHospitalStatus, calculateETA, formatETA } from '@/lib/emergency';
import { DEMO_HOSPITAL } from '@/lib/constants';
import SystemStatus from '@/components/SystemStatus';
import MapView from '@/components/MapView';
import Logo from '@/components/Logo';
import { Ambulance as AmbulanceIcon, MapPin, Clock, Building2, Bell, CheckCircle2, Loader2, Stethoscope, Heart, AlertCircle, BedDouble } from 'lucide-react';

export default function HospitalDashboard() {
  const { signOut } = useAuth();
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [emergency, setEmergency] = useState<EmergencyRequest | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchAmbulances();
    fetchHospital();
    fetchEmergency();
    fetchNotifications();

    const ambChannel = supabase
      .channel('hospital-ambulances')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ambulances' }, () => fetchAmbulances())
      .subscribe();

    const emChannel = supabase
      .channel('hospital-emergency')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_requests' }, (payload) => {
        const req = payload.new as EmergencyRequest;
        if (req.status === 'active') {
          setEmergency(req);
        } else {
          setEmergency(null);
        }
      })
      .subscribe();

    const hospChannel = supabase
      .channel('hospital-status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hospitals' }, () => fetchHospital())
      .subscribe();

    const notifChannel = supabase
      .channel('hospital-notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 10));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ambChannel);
      supabase.removeChannel(emChannel);
      supabase.removeChannel(hospChannel);
      supabase.removeChannel(notifChannel);
    };
  }, []);

  const fetchAmbulances = async () => {
    const { data } = await supabase.from('ambulances').select('*').order('updated_at', { ascending: false });
    if (data) setAmbulances(data);
    setLoading(false);
  };

  const fetchHospital = async () => {
    const { data } = await supabase.from('hospitals').select('*').eq('name', DEMO_HOSPITAL.name).maybeSingle();
    if (data) setHospital(data);
  };

  const fetchEmergency = async () => {
    const { data } = await supabase
      .from('emergency_requests')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .maybeSingle();
    if (data) setEmergency(data);
  };

  const fetchNotifications = async () => {
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10);
    if (data) setNotifications(data);
  };

  const handleStatusUpdate = async (status: 'ready' | 'preparing' | 'patient_received') => {
    if (!hospital) return;
    setStatusUpdating(true);
    await updateHospitalStatus(hospital.id, status);
    setStatusUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const activeAmbulance = ambulances.find((a) => a.status === 'active' || a.status === 'en_route') || ambulances[0];
  const eta = activeAmbulance ? calculateETA(activeAmbulance.latitude, activeAmbulance.longitude) : 0;
  const ambulanceApproaching = emergency?.status === 'active';

  const readinessOptions: { value: 'ready' | 'preparing' | 'patient_received'; label: string; icon: typeof CheckCircle2; color: string }[] = [
    { value: 'ready', label: 'Ready', icon: CheckCircle2, color: 'emerald' },
    { value: 'preparing', label: 'Preparing', icon: Stethoscope, color: 'amber' },
    { value: 'patient_received', label: 'Patient Received', icon: BedDouble, color: 'cyan' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-300 font-semibold">{DEMO_HOSPITAL.name.toUpperCase()}</span>
            </div>
          </div>
          <button onClick={signOut} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        <SystemStatus />

        {/* Ambulance Approaching Banner */}
        {ambulanceApproaching ? (
          <div className="flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/40 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-red-400">AMBULANCE APPROACHING</div>
                <div className="text-xs text-gray-400">Prepare Emergency Department · ETA {formatETA(eta)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-400" />
              <span className="text-sm font-bold text-red-400">{formatETA(eta)}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-900/40 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-slate-700/30 flex items-center justify-center">
              <Heart className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-400">NO ACTIVE EMERGENCY</div>
              <div className="text-xs text-gray-500">Emergency Department standing by</div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left: Ambulance Info + Map */}
          <div className="lg:col-span-2 space-y-5">
            {/* Ambulance Details */}
            <div className="glassmorphism rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <AmbulanceIcon className="w-5 h-5 text-red-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Incoming Ambulance</h2>
              </div>
              {activeAmbulance ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] uppercase text-gray-500 mb-1">Ambulance Number</div>
                    <div className="text-sm font-bold text-red-400">{activeAmbulance.ambulance_number}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-gray-500 mb-1">Driver ID</div>
                    <div className="text-sm font-semibold">{activeAmbulance.driver_id}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-gray-500 mb-1">Emergency Status</div>
                    <div className={`text-sm font-bold ${ambulanceApproaching ? 'text-red-400' : 'text-gray-400'}`}>
                      {ambulanceApproaching ? 'ACTIVE' : 'IDLE'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-gray-500 mb-1">Current Location</div>
                    <div className="text-sm font-mono text-cyan-400">{activeAmbulance.latitude.toFixed(4)}, {activeAmbulance.longitude.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-gray-500 mb-1">Destination</div>
                    <div className="text-sm font-semibold text-cyan-300">{activeAmbulance.destination || DEMO_HOSPITAL.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-gray-500 mb-1">ETA</div>
                    <div className="text-sm font-bold text-amber-400">{formatETA(eta)}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-gray-500">No ambulance data available</div>
              )}
            </div>

            {/* Map */}
            <div className="glassmorphism rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Ambulance Tracking Map</h2>
              </div>
              <MapView
                ambulanceLat={activeAmbulance?.latitude}
                ambulanceLng={activeAmbulance?.longitude}
                hospitalLat={DEMO_HOSPITAL.latitude}
                hospitalLng={DEMO_HOSPITAL.longitude}
                height="h-72"
              />
            </div>
          </div>

          {/* Right: ED Status + Notifications */}
          <div className="space-y-5">
            {/* ED Readiness */}
            <div className="glassmorphism rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Emergency Department</h2>
              </div>

              <div className="text-center py-4 mb-4">
                <div className="text-[10px] uppercase text-gray-500 mb-1">Current Status</div>
                <div className={`text-lg font-bold ${
                  hospital?.emergency_ready === 'ready' ? 'text-emerald-400' :
                  hospital?.emergency_ready === 'patient_received' ? 'text-cyan-400' :
                  'text-amber-400'
                }`}>
                  {hospital?.emergency_ready === 'ready' ? 'READY' :
                   hospital?.emergency_ready === 'patient_received' ? 'PATIENT RECEIVED' :
                   'PREPARING'}
                </div>
              </div>

              <div className="space-y-2">
                {readinessOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = hospital?.emergency_ready === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusUpdate(opt.value)}
                      disabled={statusUpdating}
                      className={`w-full py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                        isActive
                          ? `bg-${opt.color}-500/20 border-${opt.color}-500/40 text-${opt.color}-400`
                          : 'bg-slate-800/40 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notifications */}
            <div className="glassmorphism rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300">Live Notifications</h3>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scroll">
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-500">No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="px-3 py-2 rounded-lg bg-slate-800/40 border border-white/5">
                      <div className="text-xs font-semibold text-white">{notif.title}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{notif.message}</div>
                      <div className="text-[9px] text-gray-600 mt-1">{new Date(notif.created_at).toLocaleTimeString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
