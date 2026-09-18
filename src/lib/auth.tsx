import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserRole } from './supabase';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const DEMO_USERS: Record<string, { password: string; user: DemoUser }> = {
  'driver@6gambulance.com': {
    password: 'driver123',
    user: { id: 'demo-driver', name: 'Ravi Kumar', email: 'driver@6gambulance.com', role: 'driver' },
  },
  'traffic@6gambulance.com': {
    password: 'traffic123',
    user: { id: 'demo-traffic', name: 'Traffic Control HQ', email: 'traffic@6gambulance.com', role: 'traffic_control' },
  },
  'hospital@6gambulance.com': {
    password: 'hospital123',
    user: { id: 'demo-hospital', name: 'City General Hospital', email: 'hospital@6gambulance.com', role: 'hospital' },
  },
};

const STORAGE_KEY = '6g-ambulance-auth';

interface AuthContextType {
  user: DemoUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => { error: string | null };
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading] = useState(false);

  // Restore session from localStorage on mount
  useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DemoUser;
        if (parsed && DEMO_USERS[parsed.email]) {
          setUser(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }
  });

  const signIn = useCallback((email: string, password: string): { error: string | null } => {
    const entry = DEMO_USERS[email.toLowerCase().trim()];
    if (!entry || entry.password !== password) {
      return { error: 'Invalid credentials. Please check your email and password.' };
    }
    setUser(entry.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry.user));
    return { error: null };
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
