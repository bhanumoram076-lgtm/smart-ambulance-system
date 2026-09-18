import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { DEMO_CREDENTIALS } from '@/lib/constants';
import Logo from '@/components/Logo';
import { Ambulance, TrafficCone, Building2, Loader2, Lock, User as UserIcon, KeyRound } from 'lucide-react';

const roles = [
  { id: 'driver', label: 'Ambulance Driver', icon: Ambulance, color: 'red', email: 'driver@6gambulance.com', password: 'driver123', desc: 'Request green corridor from the field' },
  { id: 'traffic_control', label: 'Traffic Control', icon: TrafficCone, color: 'cyan', email: 'traffic@6gambulance.com', password: 'traffic123', desc: 'Monitor signals & active corridors' },
  { id: 'hospital', label: 'Hospital / Attender', icon: Building2, color: 'emerald', email: 'hospital@6gambulance.com', password: 'hospital123', desc: 'Prepare ED & track ambulance' },
] as const;

export default function Login() {
  const { signIn } = useAuth();
  const [selectedRole, setSelectedRole] = useState<typeof roles[number]['id']>('driver');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = (role: typeof roles[number]) => {
    setSelectedRole(role.id);
    setEmail(role.email);
    setPassword(role.password);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <p className="text-sm text-gray-400 mt-2">AI-Based Intelligent Emergency Response System</p>
        </div>

        {/* Role selection */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {roles.map((role) => {
            const Icon = role.icon;
            const isActive = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                  isActive
                    ? 'bg-white/10 border-white/30 shadow-lg'
                    : 'bg-slate-900/50 border-white/5 hover:border-white/15'
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <div className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-400'}`}>{role.label}</div>
                <div className="text-[10px] text-gray-500 mt-1">{role.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="glassmorphism rounded-2xl p-6 border border-white/10 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-2 block">Email</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Select a role above"
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                required
              />
            </div>
          </div>

          {error && (
            <div className="px-4 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold text-sm shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Sign In to Dashboard
              </>
            )}
          </button>

          <div className="text-center text-[10px] text-gray-500 pt-2">
            Demo credentials are pre-filled. Just select a role and click Sign In.
          </div>
        </form>
      </div>
    </div>
  );
}
