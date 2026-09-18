import { Wifi, Brain, MapPin, TrafficCone, Building2 } from 'lucide-react';

const indicators = [
  { label: '6G CONNECTION', status: 'CONNECTED', color: 'emerald', icon: Wifi },
  { label: 'AI SYSTEM', status: 'ACTIVE', color: 'emerald', icon: Brain },
  { label: 'GPS', status: 'ACTIVE', color: 'emerald', icon: MapPin },
  { label: 'TRAFFIC NETWORK', status: 'CONNECTED', color: 'emerald', icon: TrafficCone },
  { label: 'HOSPITAL', status: 'CONNECTED', color: 'emerald', icon: Building2 },
];

export default function SystemStatus() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {indicators.map((ind) => {
        const Icon = ind.icon;
        return (
          <div
            key={ind.label}
            className="glassmorphism rounded-xl px-4 py-3 flex items-center gap-3 border border-white/5"
          >
            <div className="relative">
              <Icon className="w-5 h-5 text-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{ind.label}</div>
              <div className="text-xs font-bold text-emerald-400">{ind.status}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
