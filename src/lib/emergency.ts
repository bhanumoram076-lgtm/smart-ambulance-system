import { supabase } from './supabase';
import { DEMO_ROUTE, DEMO_HOSPITAL } from './constants';

// Request green corridor: create emergency request + turn signals green
export async function requestGreenCorridor(ambulanceId: string, driverId: string, lat: number, lng: number, destination: string) {
  // Create emergency request
  const { data: emergency, error: emergencyError } = await supabase
    .from('emergency_requests')
    .insert({
      ambulance_id: ambulanceId,
      driver_id: driverId,
      latitude: lat,
      longitude: lng,
      destination,
      status: 'active',
      priority: 'high',
    })
    .select()
    .single();

  if (emergencyError) throw emergencyError;

  // Update ambulance status
  await supabase
    .from('ambulances')
    .update({ status: 'active', destination, updated_at: new Date().toISOString() })
    .eq('id', ambulanceId);

  // Turn all traffic signals green
  await supabase
    .from('traffic_signals')
    .update({ status: 'green', emergency_mode: true, updated_at: new Date().toISOString() })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  // Create notifications for traffic and hospital
  await supabase.from('notifications').insert([
    {
      type: 'emergency',
      title: 'GREEN CORRIDOR ACTIVATED',
      message: `Ambulance ${driverId} has requested a green corridor to ${destination}`,
      read: false,
    },
    {
      type: 'hospital',
      title: 'AMBULANCE APPROACHING',
      message: `Ambulance ${driverId} is en route to ${destination}. Prepare Emergency Department.`,
      read: false,
    },
  ]);

  return emergency;
}

// Cancel emergency
export async function cancelEmergency(emergencyId: string, ambulanceId: string) {
  await supabase
    .from('emergency_requests')
    .update({ status: 'cancelled', ended_at: new Date().toISOString() })
    .eq('id', emergencyId);

  await supabase
    .from('ambulances')
    .update({ status: 'idle', updated_at: new Date().toISOString() })
    .eq('id', ambulanceId);

  await resetTrafficSignals();
}

// End emergency (completed)
export async function endEmergency(emergencyId: string, ambulanceId: string) {
  await supabase
    .from('emergency_requests')
    .update({ status: 'completed', ended_at: new Date().toISOString() })
    .eq('id', emergencyId);

  await supabase
    .from('ambulances')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', ambulanceId);

  await resetTrafficSignals();
}

// Reset all traffic signals to red
export async function resetTrafficSignals() {
  await supabase
    .from('traffic_signals')
    .update({ status: 'red', emergency_mode: false, updated_at: new Date().toISOString() })
    .neq('id', '00000000-0000-0000-0000-000000000000');
}

// Update ambulance location
export async function updateAmbulanceLocation(ambulanceId: string, lat: number, lng: number, eta: number) {
  await supabase
    .from('ambulances')
    .update({
      latitude: lat,
      longitude: lng,
      eta,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ambulanceId);
}

// Update destination
export async function updateDestination(ambulanceId: string, destination: string) {
  await supabase
    .from('ambulances')
    .update({ destination, updated_at: new Date().toISOString() })
    .eq('id', ambulanceId);
}

// Update hospital readiness
export async function updateHospitalStatus(hospitalId: string, status: 'ready' | 'preparing' | 'patient_received') {
  await supabase
    .from('hospitals')
    .update({ emergency_ready: status })
    .eq('id', hospitalId);
}

// Get current position via browser geolocation
export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: DEMO_ROUTE[0].lat, lng: DEMO_ROUTE[0].lng });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({ lat: DEMO_ROUTE[0].lat, lng: DEMO_ROUTE[0].lng }),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
}

// Calculate ETA in seconds based on distance to hospital
export function calculateETA(lat: number, lng: number): number {
  const dx = DEMO_HOSPITAL.latitude - lat;
  const dy = DEMO_HOSPITAL.longitude - lng;
  const distance = Math.sqrt(dx * dx + dy * dy);
  // Approximate: 1 degree ~ 111km, average speed 40km/h
  const distanceKm = distance * 111;
  const etaSeconds = Math.max(0, Math.round((distanceKm / 40) * 3600));
  return etaSeconds;
}

// Format seconds to mm:ss
export function formatETA(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
