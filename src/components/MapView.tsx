import { Ambulance, MapPin, Building2 } from 'lucide-react';

interface MapViewProps {
  ambulanceLat?: number;
  ambulanceLng?: number;
  hospitalLat?: number;
  hospitalLng?: number;
  signals?: { id: string; signal_name: string; latitude: number; longitude: number; status: string }[];
  height?: string;
}

export default function MapView({ ambulanceLat, ambulanceLng, hospitalLat = 17.415, hospitalLng = 78.51, signals = [], height = 'h-64' }: MapViewProps) {
  // Project lat/lng to x/y percentages on the map
  const minLat = 17.38;
  const maxLat = 17.42;
  const minLng = 78.48;
  const maxLng = 78.52;

  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const ambPos = ambulanceLat && ambulanceLng ? project(ambulanceLat, ambulanceLng) : null;
  const hospPos = project(hospitalLat, hospitalLng);
  const signalPositions = signals.map((s) => ({ ...s, ...project(s.latitude, s.longitude) }));

  // Build route path
  const routePoints: { x: number; y: number }[] = [];
  if (ambPos) routePoints.push(ambPos);
  signalPositions.forEach((s) => routePoints.push({ x: s.x, y: s.y }));
  routePoints.push(hospPos);
  const routePath = routePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className={`relative ${height} w-full rounded-xl overflow-hidden bg-slate-900/60 border border-white/10`}>
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Road lines */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {/* Major roads */}
        <line x1="0" y1="30" x2="100" y2="35" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="3" />
        <line x1="0" y1="65" x2="100" y2="70" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="3" />
        <line x1="25" y1="0" x2="30" y2="100" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="3" />
        <line x1="60" y1="0" x2="65" y2="100" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="3" />

        {/* Route path */}
        {routePoints.length > 1 && (
          <>
            <path d={routePath} stroke="rgba(239, 68, 68, 0.4)" strokeWidth="2" fill="none" strokeDasharray="3 2" />
            <path d={routePath} stroke="rgba(239, 68, 68, 0.8)" strokeWidth="1" fill="none" className="animate-pulse" />
          </>
        )}
      </svg>

      {/* Traffic signals */}
      {signalPositions.map((s) => (
        <div
          key={s.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
        >
          <div className={`w-3 h-3 rounded-full ${s.status === 'green' ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'} ${s.status === 'green' ? 'animate-pulse' : ''}`} />
          <div className="text-[8px] text-gray-400 mt-0.5 whitespace-nowrap">{s.signal_name.split(' - ')[0]}</div>
        </div>
      ))}

      {/* Hospital marker */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${hospPos.x}%`, top: `${hospPos.y}%` }}
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border-2 border-cyan-400">
            <Building2 className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-cyan-300 whitespace-nowrap font-medium">Hospital</div>
        </div>
      </div>

      {/* Ambulance marker */}
      {ambPos && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear z-10"
          style={{ left: `${ambPos.x}%`, top: `${ambPos.y}%` }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-red-500/30 flex items-center justify-center border-2 border-red-400 animate-pulse">
              <Ambulance className="w-5 h-5 text-red-300" />
            </div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-red-300 whitespace-nowrap font-bold">Ambulance</div>
          </div>
        </div>
      )}

      {/* Compass */}
      <div className="absolute top-3 right-3 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
        <MapPin className="w-4 h-4 text-cyan-400" />
      </div>

      {/* Scale */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1">
        <div className="w-12 h-0.5 bg-white/30" />
        <span className="text-[9px] text-gray-400">500m</span>
      </div>
    </div>
  );
}
