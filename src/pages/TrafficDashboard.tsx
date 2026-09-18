import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase, type Ambulance, type TrafficSignal, type EmergencyRequest, type AiDetection } from '@/lib/supabase';
import { formatETA, calculateETA } from '@/lib/emergency';
import SystemStatus from '@/components/SystemStatus';
import MapView from '@/components/MapView';
import TrafficSignalDisplay from '@/components/TrafficSignalDisplay';
import AITrafficMonitor from '@/components/AITrafficMonitor';
import Logo from '@/components/Logo';
import { Ambulance as AmbulanceIcon, MapPin, Clock, Activity, Radio, AlertTriangle, CheckCircle2, Loader2, Shield, Zap } from 'lucide-react';

export default function TrafficDashboard() {
  const { user, signOut } = useAuth();
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [signals, setSignals] = useState<TrafficSignal[]>([]);
  const [emergency, setEmergency] = useState<EmergencyRequest | null>(null);
  const [detections, setDetections] = useState<AiDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseTime, setResponseTime] = useState<string>('--');

  useEffect(() => {
    fetchAmbulances();
    fetchSignals();
    fetchEmergency();
    fetchDetections();

    const ambChannel = supabase
      .channel('traffic-ambulances')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ambulances' }, () => fetchAmbulances())
      .subscribe();

    const sigChannel = supabase
      .channel('traffic-signals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'traffic_signals' }, () => fetchSignals())
      .subscribe();

    const emChannel = supabase
      .channel('traffic-emergency')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_requests' }, (payload) => {
        const req = payload.new as EmergencyRequest;
        if (req.status === 'active') {
          setEmergency(req);
          setResponseTime(((Date.now() - new Date(req.created_at).getTime()) / 1000).toFixed(1) + 's');
        } else {
          setEmergency(null);
        }
      })
      .subscribe();

    const detChannel = supabase
      .channel('traffic-ai')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_detections' }, () => fetchDetections())
      .subscribe();

    return () => {
      supabase.removeChannel(ambChannel);
      supabase.removeChannel(sigChannel);
      supabase.removeChannel(emChannel);
      supabase.removeChannel(detChannel);
    };
  }, []);

  const fetchAmbulances = async () => {
    const { data } = await supabase.from('ambulances').select('*').order('updated_at', { ascending: false });
    if (data) setAmbulances(data);
    setLoading(false);
  };

  const fetchSignals = async () => {
    const { data } = await supabase.from('traffic_signals').select('*').order('signal_name');
    if (data) setSignals(data);
  };

  const fetchEmergency = async () => {
    const { data } = await supabase
      .from('emergency_requests')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .maybeSingle();
    if (data) {
      setEmergency(data);
      setResponseTime(((Date.now() - new Date(data.created_at).getTime()) / 1000).toFixed(1) + 's');
    }
  };

  const fetchDetections = async () => {
    const { data } = await supabase.from('ai_detections').select('*').order('created_at', { ascending: false }).limit(10);
    if (data) setDetections(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const activeAmbulances = ambulances.filter((a) => a.status === 'active' || a.status === 'en_route');
  const clearedSignals = signals.filter((s) => s.status === 'green').length;
  const corridorActive = emergency?.status === 'active';
  const primaryAmbulance = activeAmbulances[0] || ambulances[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-cyan-300 font-semibold">TRAFFIC CONTROL HQ</span>
            </div>
          </div>
          <button onClick={signOut} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        <SystemStatus />

        {/* Corridor Status Banner */}
        {corridorActive ? (
          <div className="flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-green-500/15 border border-emerald-500/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-emerald-400">GREEN CORRIDOR ACTIVE</div>
                <div className="text-xs text-gray-400">Emergency route cleared · {clearedSignals}/{signals.length} signals green</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-300">All systems responding</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-900/40 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-slate-700/30 flex items-center justify-center">
              <Radio className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-400">NO ACTIVE EMERGENCY</div>
              <div className="text-xs text-gray-500">Monitoring traffic network · All signals normal</div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left: Active Ambulances + Map */}
          <div className="lg:col-span-2 space-y-5">
            {/* Active Ambulances */}
            <div className="glassmorphism rounded-2xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AmbulanceIcon className="w-5 h-5 text-red-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Active Ambulances</h2>
                </div>
                <span className="text-xs text-gray-500">{activeAmbulances.length} active</span>
              </div>

              {activeAmbulances.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">No active emergency ambulances</div>
              ) : (
                <div className="space-y-2">
                  {activeAmbulances.map((amb) => (
                    <div key={amb.id} className="grid grid-cols-6 gap-3 px-4 py-3 rounded-xl bg-slate-800/40 border border-white/5 items-center text-xs">
                      <div>
                        <div className="text-[9px] text-gray-500 uppercase">Ambulance</div>
                        <div className="text-red-400 font-mono font-semibold">{amb.ambulance_number}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-500 uppercase">Driver ID</div>
                        <div className="text-gray-300">{amb.driver_id}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-500 uppercase">Location</div>
                        <div className="text-cyan-400 font-mono">{amb.latitude.toFixed(3)}, {amb.longitude.toFixed(3)}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-500 uppercase">Destination</div>
                        <div className="text-gray-300 truncate">{amb.destination || '--'}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-500 uppercase">ETA</div>
                        <div className="text-amber-400 font-bold">{formatETA(calculateETA(amb.latitude, amb.longitude))}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-500 uppercase">Status</div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                          <span className="text-red-400 font-semibold">{amb.status.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            <div className="glassmorphism rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Emergency Route Map</h2>
              </div>
              <MapView
                ambulanceLat={primaryAmbulance?.latitude}
                ambulanceLng={primaryAmbulance?.longitude}
                signals={signals}
                height="h-80"
              />
            </div>
          </div>

          {/* Right: Signals + Stats + AI */}
          <div className="space-y-5">
            {/* Traffic Signals */}
            <div className="glassmorphism rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Traffic Signals</h2>
              </div>
              <TrafficSignalDisplay signals={signals} />
            </div>

            {/* Stats */}
            <div className="glassmorphism rounded-2xl p-5 border border-white/10">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-3">Corridor Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Signals Cleared</span>
                  <span className="text-sm font-bold text-emerald-400">{clearedSignals}/{signals.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Response Time</span>
                  <span className="text-sm font-bold text-cyan-400">{responseTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Ambulance ETA</span>
                  <span className="text-sm font-bold text-amber-400">
                    {primaryAmbulance ? formatETA(calculateETA(primaryAmbulance.latitude, primaryAmbulance.longitude)) : '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Connection</span>
                  <span className="text-sm font-bold text-emerald-400">Connected</span>
                </div>
              </div>
            </div>

            {/* AI Traffic Monitor */}
            <div className="glassmorphism rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300">AI Traffic Monitoring</h3>
              </div>
              <AITrafficMonitor detections={detections} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
