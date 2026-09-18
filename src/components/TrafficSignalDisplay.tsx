import { TrafficCone } from 'lucide-react';
import type { TrafficSignal } from '@/lib/supabase';

interface Props {
  signals: TrafficSignal[];
  compact?: boolean;
}

export default function TrafficSignalDisplay({ signals, compact = false }: Props) {
  if (compact) {
    return (
      <div className="flex gap-2">
        {signals.map((sig, i) => (
          <div key={sig.id} className="flex flex-col items-center gap-1">
            <div className={`w-4 h-4 rounded-full transition-all duration-700 ${sig.status === 'green' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[9px] text-gray-400">S{i + 1}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {signals.map((sig, i) => (
        <div
          key={sig.id}
          className={`rounded-xl p-4 border transition-all duration-500 ${
            sig.status === 'green'
              ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(52,211,153,0.15)]'
              : 'bg-red-500/10 border-red-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <TrafficCone className={`w-4 h-4 ${sig.status === 'green' ? 'text-emerald-400' : 'text-red-400'}`} />
            <span className="text-[10px] uppercase tracking-wider text-gray-400">Signal {i + 1}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-700 ${
              sig.status === 'green'
                ? 'bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)] animate-pulse'
                : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
            }`}>
              <div className={`w-3 h-3 rounded-full ${sig.status === 'green' ? 'bg-emerald-200' : 'bg-red-200'}`} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">{sig.signal_name}</div>
              <div className={`text-[10px] font-bold ${sig.status === 'green' ? 'text-emerald-400' : 'text-red-400'}`}>
                {sig.emergency_mode ? 'EMERGENCY MODE' : sig.status.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
