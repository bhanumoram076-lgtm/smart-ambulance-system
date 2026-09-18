import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase, type Ambulance, type TrafficSignal, type EmergencyRequest } from '@/lib/supabase';
import { requestGreenCorridor, cancelEmergency, endEmergency, updateAmbulanceLocation, updateDestination, getCurrentPosition, calculateETA, formatETA } from '@/lib/emergency';
import { DEMO_ROUTE, DEMO_HOSPITAL, DEMO_DRIVER } from '@/lib/constants';
import SystemStatus from '@/components/SystemStatus';
import MapView from '@/components/MapView';
import Logo from '@/components/Logo';
import { Ambulance as AmbulanceIcon, MapPin, Clock, Navigation, Radio, AlertCircle, CheckCircle2, XCircle, Play, Hospital, Loader2, Wifi } from 'lucide-react';

export default function DriverDashboard() {
  const { user, signOut } = useAuth();
  const [ambulance, setAmbulance] = useState<Ambulance | null>(null);
  const [signals, setSignals] = useState<TrafficSignal[]>([]);
  const [emergency, setEmergency] = useState<EmergencyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [corridorActive, setCorridorActive] = useState(false);
  const [corridorConfirmed, setCorridorConfirmed] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'active' | 'demo'>('active');
  const [currentPos, setCurrentPos] = useState({ lat: DEMO_ROUTE[0].lat, lng: DEMO_ROUTE[0].lng });
  const [destinationInput, setDestinationInput] = useState(DEMO_HOSPITAL.name);
  const [showDestModal, setShowDestModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const routeStepRef = useRef(0);

  // Fetch initial data
  useEffect(() => {
    fetchAmbulance();
    fetchSignals();
    fetchActiveEmergency();
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    const ambChannel = supabase
      .channel('driver-ambulances')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ambulances' }, (payload) => {
        if (payload.new && (payload.new as Ambulance).driver_id === DEMO_DRIVER.driver_id) {
          setAmbulance(payload.new as Ambulance);
        }
      })
      .subscribe();

    const sigChannel = supabase
      .channel('driver-signals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'traffic_signals' }, () => {
        fetchSignals();
      })
      .subscribe();

    const emChannel = supabase
      .channel('driver-emergency')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_requests' }, (payload) => {
        const req = payload.new as EmergencyRequest;
        if (req.driver_id === DEMO_DRIVER.driver_id) {
          setEmergency(req);
          if (req.status === 'completed' || req.status === 'cancelled') {
            setCorridorActive(false);
            setCorridorConfirmed(false);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ambChannel);
      supabase.removeChannel(sigChannel);
      supabase.removeChannel(emChannel);
    };
  }, []);

  const fetchAmbulance = async () => {
    const { data } = await supabase
      .from('ambulances')
      .select('*')
      .eq('driver_id', DEMO_DRIVER.driver_id)
      .maybeSingle();
    if (data) {
      setAmbulance(data);
      setCurrentPos({ lat: data.latitude, lng: data.longitude });
      if (data.destination) setDestinationInput(data.destination);
    }
    setLoading(false);
  };

  const fetchSignals = async () => {
    const { data } = await supabase.from('traffic_signals').select('*').order('signal_name');
    if (data) setSignals(data);
  };

  const fetchActiveEmergency = async () => {
    const { data } = await supabase
      .from('emergency_requests')
      .select('*')
      .eq('driver_id', DEMO_DRIVER.driver_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .maybeSingle();
    if (data) {
      setEmergency(data);
      setCorridorActive(true);
      setCorridorConfirmed(true);
    }
  };

  // GPS tracking
  useEffect(() => {
    if (corridorActive && !demoMode) {
      getCurrentPosition().then((pos) => {
        setCurrentPos(pos);
        if (ambulance) {
          const eta = calculateETA(pos.lat, pos.lng);
          updateAmbulanceLocation(ambulance.id, pos.lat, pos.lng, eta);
        }
      });
    }
  }, [corridorActive, demoMode]);

  // Demo mode simulation
  const startDemo = useCallback(async () => {
    if (!ambulance) return;
    setDemoMode(true);
    setGpsStatus('demo');
    routeStepRef.current = 0;
    setCurrentPos({ lat: DEMO_ROUTE[0].lat, lng: DEMO_ROUTE[0].lng });

    await updateAmbulanceLocation(ambulance.id, DEMO_ROUTE[0].lat, DEMO_ROUTE[0].lng, calculateETA(DEMO_ROUTE[0].lat, DEMO_ROUTE[0].lng));

    demoIntervalRef.current = setInterval(async () => {
      routeStepRef.current += 1;
      if (routeStepRef.current >= DEMO_ROUTE.length) {
        routeStepRef.current = DEMO_ROUTE.length - 1;
        if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
        return;
      }
      const pos = DEMO_ROUTE[routeStepRef.current];
      setCurrentPos(pos);
      const eta = calculateETA(pos.lat, pos.lng);
      await updateAmbulanceLocation(ambulance.id, pos.lat, pos.lng, eta);
    }, 3000);
  }, [ambulance]);

  const stopDemo = useCallback(() => {
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    setDemoMode(false);
    setGpsStatus('active');
  }, []);

  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, []);

  const handleRequestCorridor = async () => {
    if (!ambulance) return;
    setActionLoading(true);
    setError(null);
    try {
      const pos = demoMode ? currentPos : await getCurrentPosition();
      setCurrentPos(pos);
      await requestGreenCorridor(ambulance.id, DEMO_DRIVER.driver_id, pos.lat, pos.lng, destinationInput);
      setCorridorActive(true);
      setCorridorConfirmed(true);
      // Start demo movement if in demo mode
      if (demoMode) startDemo();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate corridor');
    }
    setActionLoading(false);
  };

  const handleCancel = async () => {
    if (!emergency || !ambulance) return;
    setActionLoading(true);
    await cancelEmergency(emergency.id, ambulance.id);
    setCorridorActive(false);
    setCorridorConfirmed(false);
    setEmergency(null);
    stopDemo();
    setActionLoading(false);
  };

  const handleEnd = async () => {
    if (!emergency || !ambulance) return;
    setActionLoading(true);
    await endEmergency(emergency.id, ambulance.id);
    setCorridorActive(false);
    setCorridorConfirmed(false);
    setEmergency(null);
    stopDemo();
    setActionLoading(false);
  };

  const handleUpdateDest = async () => {
    if (!ambulance) return;
    await updateDestination(ambulance.id, destinationInput);
    setShowDestModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
      </div>
    );
  }

  const eta = calculateETA(currentPos.lat, currentPos.lng);
  const clearedSignals = signals.filter((s) => s.status === 'green').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold">{DEMO_DRIVER.name}</div>
              <div className="text-[10px] text-gray-400">{DEMO_DRIVER.driver_id} · {DEMO_DRIVER.ambulance_number}</div>
            </div>
            <button onClick={signOut} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        <SystemStatus />

        {/* Demo Mode Button */}
        {!demoMode && !corridorActive && (
          <button
            onClick={startDemo}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 font-semibold text-sm flex items-center justify-center gap-2 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
          >
            <Play className="w-4 h-4" />
            START DEMO - Simulate Ambulance Movement
          </button>
        )}
        {demoMode && (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-xs text-cyan-300 font-semibold">DEMO MODE ACTIVE - Simulating GPS movement along route</span>
            </div>
            <button onClick={stopDemo} className="text-xs text-cyan-400 hover:text-cyan-300">Stop Demo</button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left: Status Cards */}
          <div className="lg:col-span-2 space-y-5">
            {/* Driver Info */}
            <div className="glassmorphism rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <AmbulanceIcon className="w-5 h-5 text-red-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Driver Status</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] uppercase text-gray-500 mb-1">Driver Name</div>
                  <div className="text-sm font-semibold">{DEMO_DRIVER.name}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-500 mb-1">Ambulance No.</div>
                  <div className="text-sm font-semibold text-red-400">{DEMO_DRIVER.ambulance_number}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-500 mb-1">Driver ID</div>
                  <div className="text-sm font-semibold">{DEMO_DRIVER.driver_id}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-500 mb-1">GPS Location</div>
                  <div className="text-sm font-mono text-cyan-400">{currentPos.lat.toFixed(4)}, {currentPos.lng.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-500 mb-1">Emergency Status</div>
                  <div className={`text-sm font-bold ${corridorActive ? 'text-red-400' : 'text-gray-400'}`}>
                    {corridorActive ? 'ACTIVE' : 'IDLE'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-500 mb-1">Destination</div>
                  <div className="text-sm font-semibold text-cyan-300">{ambulance?.destination || DEMO_HOSPITAL.name}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-500 mb-1">ETA</div>
                  <div className="text-sm font-bold text-amber-400">{formatETA(eta)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-500 mb-1">Connection</div>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Connected</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-500 mb-1">GPS Mode</div>
                  <div className={`text-sm font-semibold ${gpsStatus === 'demo' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                    {gpsStatus === 'demo' ? 'Demo Sim' : 'Live GPS'}
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="glassmorphism rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Live Route Map</h2>
              </div>
              <MapView
                ambulanceLat={currentPos.lat}
                ambulanceLng={currentPos.lng}
                hospitalLat={DEMO_HOSPITAL.latitude}
                hospitalLng={DEMO_HOSPITAL.longitude}
                signals={signals}
                height="h-72"
              />
            </div>
          </div>

          {/* Right: Emergency Actions */}
          <div className="space-y-5">
            {/* Green Corridor Button */}
            <div className="glassmorphism rounded-2xl p-5 border border-white/10">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Emergency Actions</h2>

              {!corridorActive ? (
                <button
                  onClick={handleRequestCorridor}
                  disabled={actionLoading}
                  className="w-full py-8 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white font-bold text-lg shadow-2xl shadow-red-500/40 hover:shadow-red-500/60 transition-all duration-300 disabled:opacity-50 flex flex-col items-center gap-2 group"
                >
                  {actionLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <>
                      <AlertCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                      REQUEST GREEN CORRIDOR
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <span className="text-emerald-400 font-bold text-sm">GREEN CORRIDOR ACTIVATED</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50">
                    <Navigation className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-gray-300">Signals Cleared: {clearedSignals}/{signals.length}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-400">
                  {error}
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setShowDestModal(true)}
                  disabled={!ambulance}
                  className="w-full py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-xs text-gray-300 hover:border-cyan-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Update Destination
                </button>
                {corridorActive && (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={actionLoading}
                      className="w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel Emergency
                    </button>
                    <button
                      onClick={handleEnd}
                      disabled={actionLoading}
                      className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      End Emergency
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Route Info */}
            <div className="glassmorphism rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300">Current Route</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-gray-300">Current: {currentPos.lat.toFixed(4)}, {currentPos.lng.toFixed(4)}</span>
                </div>
                {signals.map((sig, i) => (
                  <div key={sig.id} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${sig.status === 'green' ? 'bg-emerald-400' : 'bg-red-500'}`} />
                    <span className="text-gray-400">{sig.signal_name}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs">
                  <Hospital className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-300">{ambulance?.destination || DEMO_HOSPITAL.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Destination Modal */}
      {showDestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glassmorphism rounded-2xl p-6 border border-white/10 max-w-md w-full">
            <h3 className="text-sm font-semibold mb-4">Update Destination Hospital</h3>
            <input
              type="text"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowDestModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-xs text-gray-400">
                Cancel
              </button>
              <button onClick={handleUpdateDest} className="flex-1 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-xs text-cyan-300">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
