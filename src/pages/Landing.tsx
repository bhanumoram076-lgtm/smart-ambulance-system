import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import {
  Ambulance,
  MapPin,
  TrafficCone,
  Building2,
  Camera,
  HeartPulse,
  Radio,
  ArrowRight,
  Menu,
  X,
  Activity,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'GPS Tracking',
    description: 'Real-time ambulance location tracking with high-precision GPS coordinates updated every second.',
    color: 'blue',
  },
  {
    icon: TrafficCone,
    title: 'Smart Traffic',
    description: 'AI-powered traffic signal control that creates instant green corridors for emergency vehicles.',
    color: 'cyan',
  },
  {
    icon: Building2,
    title: 'Hospital Dashboard',
    description: 'Live hospital readiness tracking with ED preparation status and ambulance arrival ETA.',
    color: 'sky',
  },
  {
    icon: Camera,
    title: 'AI Camera',
    description: 'Intelligent number-plate detection and lane monitoring to clear the emergency route.',
    color: 'indigo',
  },
  {
    icon: HeartPulse,
    title: 'Patient Sensors',
    description: 'Vital signs streaming from ambulance to hospital so the team is ready before arrival.',
    color: 'rose',
  },
  {
    icon: Radio,
    title: '6G Module',
    description: 'Ultra-low-latency 6G connectivity linking ambulance, traffic, and hospital in real time.',
    color: 'violet',
  },
];

const stats = [
  { value: '60%', label: 'Faster Emergency Response' },
  { value: '4', label: 'Traffic Signals Automated' },
  { value: '3', label: 'Connected Dashboards' },
  { value: '<1s', label: 'Real-time Sync Latency' },
];

const steps = [
  {
    icon: Ambulance,
    title: 'Driver Requests Corridor',
    description: 'The ambulance driver taps one button to request a green corridor to the hospital.',
  },
  {
    icon: TrafficCone,
    title: 'Traffic Signals Turn Green',
    description: 'All traffic signals along the route instantly switch to green, clearing the path.',
  },
  {
    icon: Building2,
    title: 'Hospital Prepares ED',
    description: 'The hospital receives a live alert and prepares the emergency department before arrival.',
  },
];

export default function Landing({ onLaunch }: { onLaunch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const colorMap: Record<string, { bg: string; text: string; border: string; hoverBg: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', hoverBg: 'group-hover:bg-blue-100' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100', hoverBg: 'group-hover:bg-cyan-100' },
    sky: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100', hoverBg: 'group-hover:bg-sky-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', hoverBg: 'group-hover:bg-indigo-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', hoverBg: 'group-hover:bg-rose-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', hoverBg: 'group-hover:bg-violet-100' },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Ambulance className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <div className="text-base font-bold text-slate-900 leading-tight">
                  6G <span className="text-blue-600">Smart</span> Ambulance
                </div>
                <div className="text-[9px] uppercase tracking-widest text-slate-400">AI Emergency Response</div>
              </div>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                How It Works
              </a>
              <a href="#stats" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                Impact
              </a>
              <button
                onClick={onLaunch}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Live Tracking
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm font-medium text-slate-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" className="block text-sm font-medium text-slate-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
              How It Works
            </a>
            <a href="#stats" className="block text-sm font-medium text-slate-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
              Impact
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLaunch();
              }}
              className="w-full px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Live Tracking
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-cyan-100/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">6G Connected System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
                AI-Based Intelligent{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Emergency Response
                </span>{' '}
                System
              </h1>

              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl">
                A unified platform that connects ambulance drivers, traffic control, and hospitals in real time.
                One tap activates a green corridor, clears traffic signals, and alerts the emergency department —
                saving critical minutes when every second counts.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onLaunch}
                  className="px-7 py-4 rounded-xl bg-blue-600 text-white font-semibold text-base shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  Launch Live Tracking
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#features"
                  className="px-7 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-base hover:border-blue-300 hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ChevronRight className="w-5 h-5" />
                  Explore Features
                </a>
              </div>

              <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  Real-time sync
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  3 connected dashboards
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  Deploy ready
                </div>
              </div>
            </div>

            {/* Right: image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10 border border-slate-100">
                <img
                  src="https://images.pexels.com/photos/4489423/pexels-photo-4489423.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Modern ambulance rushing through city"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-transparent to-transparent" />
              </div>

              {/* Floating cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-center gap-3 animate-float">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Corridor Active</div>
                  <div className="text-[10px] text-slate-500">4 signals cleared</div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">ETA 3:20</div>
                  <div className="text-[10px] text-slate-500">Live tracking</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white">{stat.value}</div>
                <div className="mt-2 text-sm text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 mb-4">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Core Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Everything Connected, Everything Live
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Six integrated modules working together to save lives through intelligent emergency response.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              const c = colorMap[feature.color];
              return (
                <div
                  key={i}
                  className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl ${c.bg} ${c.border} border flex items-center justify-center mb-5 ${c.hoverBg} transition-colors duration-300`}>
                    <Icon className={`w-7 h-7 ${c.text}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                  <div className={`mt-4 flex items-center gap-1 text-sm font-semibold ${c.text} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 mb-4">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">How It Works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Three Steps to Save a Life
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              From emergency to hospital in the shortest time possible.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent -translate-x-1/2" />
                  )}
                  <div className="text-center">
                    <div className="relative inline-flex">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 flex items-center justify-center mb-5">
                        <Icon className="w-10 h-10 text-blue-600" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-blue-500/30">
                        {i + 1}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-14 text-center">
            <button
              onClick={onLaunch}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-blue-600 text-white font-semibold text-base shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/50 transition-all duration-300 group"
            >
              Try Live Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-cyan-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to See It in Action?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Launch the live tracking demo and experience the full 6G Smart Ambulance system across three connected dashboards.
          </p>
          <button
            onClick={onLaunch}
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-600 font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-300 group"
          >
            Launch Live Tracking
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                  <Ambulance className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-base font-bold text-white">6G Smart Ambulance</div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-500">AI Emergency Response</div>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                An AI-based intelligent emergency response system connecting ambulances, traffic control, and hospitals through 6G technology.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Modules</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <f.icon className="w-3.5 h-3.5 text-blue-400" />
                    {f.title}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">System Status</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  6G Connection: Active
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  AI System: Online
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  GPS Network: Connected
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Hospital Link: Connected
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
            © 2026 6G Smart Ambulance System. AI-Based Intelligent Emergency Response.
          </div>
        </div>
      </footer>
    </div>
  );
}
