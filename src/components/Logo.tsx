import { Ambulance } from 'lucide-react';

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { icon: 'w-5 h-5', text: 'text-sm', sub: 'text-[8px]' },
    md: { icon: 'w-7 h-7', text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl', sub: 'text-xs' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-red-500/30 blur-xl rounded-full" />
        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shadow-lg shadow-red-500/30">
          <Ambulance className="w-7 h-7 text-white" />
        </div>
      </div>
      <div>
        <div className={`${s.text} font-bold text-white leading-tight`}>
          6G <span className="text-red-400">Smart</span> Ambulance
        </div>
        <div className={`${s.sub} uppercase tracking-widest text-cyan-400/70`}>AI Emergency Response</div>
      </div>
    </div>
  );
}
