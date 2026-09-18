import { Scan, AlertTriangle, CheckCircle2, Car } from 'lucide-react';
import type { AiDetection } from '@/lib/supabase';

interface Props {
  detections: AiDetection[];
}

export default function AITrafficMonitor({ detections }: Props) {
  const hasBlocking = detections.some((d) => d.status === 'blocking');

  return (
    <div className="space-y-3">
      {hasBlocking && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/15 border border-red-500/40 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-xs font-bold text-red-400">Vehicle Blocking Emergency Route</span>
        </div>
      )}
      <div className="space-y-2 max-h-48 overflow-y-auto custom-scroll">
        {detections.map((det) => (
          <div
            key={det.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${
              det.status === 'blocking'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-slate-800/40 border-white/5'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              det.status === 'blocking' ? 'bg-red-500/20' : 'bg-emerald-500/10'
            }`}>
              {det.status === 'blocking' ? (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              ) : (
                <Car className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="flex-1 grid grid-cols-4 gap-2 text-xs">
              <div>
                <div className="text-[9px] text-gray-500 uppercase">Vehicle</div>
                <div className="text-white font-mono font-semibold">{det.vehicle_number}</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 uppercase">Time</div>
                <div className="text-gray-300">{new Date(det.detection_time).toLocaleTimeString('en-US', { hour12: false })}</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 uppercase">Lane</div>
                <div className="text-gray-300">{det.lane}</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 uppercase">Status</div>
                <div className={`flex items-center gap-1 font-semibold ${det.status === 'blocking' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {det.status === 'cleared' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {det.status === 'cleared' ? 'Cleared' : 'Blocking'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-gray-500">
        <Scan className="w-3 h-3" />
        <span>AI Number Plate Detection - Simulation Mode</span>
      </div>
    </div>
  );
}
