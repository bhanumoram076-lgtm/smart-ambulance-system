import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: '6g-ambulance-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type UserRole = 'driver' | 'traffic_control' | 'hospital';

export type EmergencyStatus = 'active' | 'cancelled' | 'completed';
export type AmbulanceStatus = 'idle' | 'active' | 'en_route' | 'completed';
export type SignalStatus = 'red' | 'green';
export type HospitalReadyStatus = 'ready' | 'preparing' | 'patient_received';
export type DetectionStatus = 'cleared' | 'blocking';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Driver {
  id: string;
  user_id: string;
  driver_id: string;
  ambulance_number: string;
  phone: string;
  created_at: string;
}

export interface Ambulance {
  id: string;
  driver_id: string;
  ambulance_number: string;
  latitude: number;
  longitude: number;
  status: AmbulanceStatus;
  destination: string;
  eta: number;
  updated_at: string;
}

export interface EmergencyRequest {
  id: string;
  ambulance_id: string | null;
  driver_id: string;
  latitude: number | null;
  longitude: number | null;
  destination: string | null;
  status: EmergencyStatus;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  ended_at: string | null;
}

export interface TrafficSignal {
  id: string;
  signal_name: string;
  latitude: number;
  longitude: number;
  status: SignalStatus;
  emergency_mode: boolean;
  updated_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  emergency_ready: HospitalReadyStatus;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface AiDetection {
  id: string;
  vehicle_number: string;
  detection_time: string;
  lane: string;
  status: DetectionStatus;
  created_at: string;
}
