import { AuthProvider, useAuth } from '@/lib/auth';
import Login from '@/pages/Login';
import DriverDashboard from '@/pages/DriverDashboard';
import TrafficDashboard from '@/pages/TrafficDashboard';
import HospitalDashboard from '@/pages/HospitalDashboard';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
      </div>
    );
  }

  if (!user) return <Login />;

  switch (user.role) {
    case 'driver':
      return <DriverDashboard />;
    case 'traffic_control':
      return <TrafficDashboard />;
    case 'hospital':
      return <HospitalDashboard />;
    default:
      return <Login />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
