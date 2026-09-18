// Demo credentials for the hackathon
export const DEMO_CREDENTIALS = {
  driver: {
    email: 'driver@6gambulance.com',
    password: 'driver123',
    driver_id: 'DRV001',
    ambulance_number: 'AP39AB1234',
  },
  traffic_control: {
    email: 'traffic@6gambulance.com',
    password: 'traffic123',
  },
  hospital: {
    email: 'hospital@6gambulance.com',
    password: 'hospital123',
  },
};

// Predefined demo route coordinates (Hyderabad area)
export const DEMO_ROUTE = [
  { lat: 17.385, lng: 78.4867 },   // Start point
  { lat: 17.396, lng: 78.49 },     // Signal 1
  { lat: 17.401, lng: 78.495 },    // Signal 2
  { lat: 17.406, lng: 78.5 },      // Signal 3
  { lat: 17.411, lng: 78.505 },    // Signal 4
  { lat: 17.415, lng: 78.51 },     // Hospital
];

export const DEMO_HOSPITAL = {
  name: 'City General Hospital',
  latitude: 17.415,
  longitude: 78.51,
};

export const DEMO_DRIVER = {
  name: 'Ravi Kumar',
  driver_id: 'DRV001',
  ambulance_number: 'AP39AB1234',
  phone: '+919876543210',
};

// System status indicators
export const SYSTEM_STATUSES = [
  { label: '6G CONNECTION', status: 'CONNECTED', color: 'green' },
  { label: 'AI SYSTEM', status: 'ACTIVE', color: 'green' },
  { label: 'GPS', status: 'ACTIVE', color: 'green' },
  { label: 'TRAFFIC NETWORK', status: 'CONNECTED', color: 'green' },
  { label: 'HOSPITAL', status: 'CONNECTED', color: 'green' },
];

// AI detection sample data
export const AI_DETECTION_SAMPLES = [
  { vehicle_number: 'AP39AB1234', lane: 'Lane 2', status: 'cleared' as const },
  { vehicle_number: 'TS09XY5678', lane: 'Lane 1', status: 'cleared' as const },
  { vehicle_number: 'AP28CD9012', lane: 'Lane 3', status: 'cleared' as const },
  { vehicle_number: 'KA01EF3456', lane: 'Lane 4', status: 'cleared' as const },
  { vehicle_number: 'AP07GH7890', lane: 'Lane 2', status: 'blocking' as const },
];
