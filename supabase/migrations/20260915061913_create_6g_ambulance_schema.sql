/*
# 6G Smart Ambulance System - Database Schema

## Overview
Creates the complete schema for an AI-based intelligent emergency response system
with three user roles: Ambulance Driver, Traffic Control, and Hospital/Patient Attender.

## New Tables

1. `users` - User profiles linked to auth.users, stores role (driver/traffic_control/hospital)
   - id (uuid, PK, references auth.users)
   - name (text)
   - email (text, unique)
   - role (text: driver, traffic_control, hospital)
   - created_at (timestamptz)

2. `drivers` - Driver-specific information
   - id (uuid, PK)
   - user_id (uuid, references users)
   - driver_id (text, unique - e.g. "DRV001")
   - ambulance_number (text - e.g. "AP39AB1234")
   - phone (text)
   - created_at (timestamptz)

3. `ambulances` - Real-time ambulance tracking
   - id (uuid, PK)
   - driver_id (text)
   - ambulance_number (text)
   - latitude (double precision)
   - longitude (double precision)
   - status (text: idle, active, en_route, completed)
   - destination (text)
   - eta (integer, seconds)
   - updated_at (timestamptz)

4. `emergency_requests` - Emergency green corridor requests
   - id (uuid, PK)
   - ambulance_id (uuid)
   - driver_id (text)
   - latitude (double precision)
   - longitude (double precision)
   - destination (text)
   - status (text: active, cancelled, completed)
   - priority (text: high, medium, low)
   - created_at (timestamptz)
   - ended_at (timestamptz)

5. `traffic_signals` - Traffic signals along routes
   - id (uuid, PK)
   - signal_name (text)
   - latitude (double precision)
   - longitude (double precision)
   - status (text: red, green)
   - emergency_mode (boolean)
   - updated_at (timestamptz)

6. `hospitals` - Hospital information
   - id (uuid, PK)
   - name (text)
   - latitude (double precision)
   - longitude (double precision)
   - emergency_ready (text: ready, preparing, patient_received)
   - created_at (timestamptz)

7. `notifications` - System notifications
   - id (uuid, PK)
   - user_id (uuid, nullable)
   - type (text)
   - title (text)
   - message (text)
   - read (boolean)
   - created_at (timestamptz)

8. `ai_detections` - AI number plate detection simulation
   - id (uuid, PK)
   - vehicle_number (text)
   - detection_time (timestamptz)
   - lane (text)
   - status (text: cleared, blocking)
   - created_at (timestamptz)

## Security
- RLS enabled on all tables
- All tables accessible to authenticated users (emergency data is intentionally shared
  across all three roles for coordinated emergency response)
- Role-based access control handled at the application layer via the users.role field
*/

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('driver', 'traffic_control', 'hospital')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_users_select" ON users;
CREATE POLICY "auth_users_select" ON users FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_users_insert" ON users;
CREATE POLICY "auth_users_insert" ON users FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_users_update" ON users;
CREATE POLICY "auth_users_update" ON users FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- DRIVERS TABLE
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  driver_id text UNIQUE NOT NULL,
  ambulance_number text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_drivers_select" ON drivers;
CREATE POLICY "auth_drivers_select" ON drivers FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_drivers_insert" ON drivers;
CREATE POLICY "auth_drivers_insert" ON drivers FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_drivers_update" ON drivers;
CREATE POLICY "auth_drivers_update" ON drivers FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- AMBULANCES TABLE
CREATE TABLE IF NOT EXISTS ambulances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id text NOT NULL,
  ambulance_number text NOT NULL,
  latitude double precision DEFAULT 17.3850,
  longitude double precision DEFAULT 78.4867,
  status text NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'active', 'en_route', 'completed')),
  destination text,
  eta integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE ambulances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_ambulances_select" ON ambulances;
CREATE POLICY "auth_ambulances_select" ON ambulances FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_ambulances_insert" ON ambulances;
CREATE POLICY "auth_ambulances_insert" ON ambulances FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_ambulances_update" ON ambulances;
CREATE POLICY "auth_ambulances_update" ON ambulances FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_ambulances_delete" ON ambulances;
CREATE POLICY "auth_ambulances_delete" ON ambulances FOR DELETE
  TO authenticated USING (true);

-- EMERGENCY REQUESTS TABLE
CREATE TABLE IF NOT EXISTS emergency_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambulance_id uuid,
  driver_id text NOT NULL,
  latitude double precision,
  longitude double precision,
  destination text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  priority text NOT NULL DEFAULT 'high' CHECK (priority IN ('high', 'medium', 'low')),
  created_at timestamptz DEFAULT now(),
  ended_at timestamptz
);
ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_emergency_select" ON emergency_requests;
CREATE POLICY "auth_emergency_select" ON emergency_requests FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_emergency_insert" ON emergency_requests;
CREATE POLICY "auth_emergency_insert" ON emergency_requests FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_emergency_update" ON emergency_requests;
CREATE POLICY "auth_emergency_update" ON emergency_requests FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- TRAFFIC SIGNALS TABLE
CREATE TABLE IF NOT EXISTS traffic_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_name text NOT NULL,
  latitude double precision,
  longitude double precision,
  status text NOT NULL DEFAULT 'red' CHECK (status IN ('red', 'green')),
  emergency_mode boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE traffic_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_signals_select" ON traffic_signals;
CREATE POLICY "auth_signals_select" ON traffic_signals FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_signals_insert" ON traffic_signals;
CREATE POLICY "auth_signals_insert" ON traffic_signals FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_signals_update" ON traffic_signals;
CREATE POLICY "auth_signals_update" ON traffic_signals FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  latitude double precision,
  longitude double precision,
  emergency_ready text NOT NULL DEFAULT 'preparing' CHECK (emergency_ready IN ('ready', 'preparing', 'patient_received')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_hospitals_select" ON hospitals;
CREATE POLICY "auth_hospitals_select" ON hospitals FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_hospitals_insert" ON hospitals;
CREATE POLICY "auth_hospitals_insert" ON hospitals FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_hospitals_update" ON hospitals;
CREATE POLICY "auth_hospitals_update" ON hospitals FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_notifications_select" ON notifications;
CREATE POLICY "auth_notifications_select" ON notifications FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_notifications_insert" ON notifications;
CREATE POLICY "auth_notifications_insert" ON notifications FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_notifications_update" ON notifications;
CREATE POLICY "auth_notifications_update" ON notifications FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- AI DETECTIONS TABLE
CREATE TABLE IF NOT EXISTS ai_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_number text NOT NULL,
  detection_time timestamptz DEFAULT now(),
  lane text NOT NULL,
  status text NOT NULL DEFAULT 'cleared' CHECK (status IN ('cleared', 'blocking')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE ai_detections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_ai_select" ON ai_detections;
CREATE POLICY "auth_ai_select" ON ai_detections FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_ai_insert" ON ai_detections;
CREATE POLICY "auth_ai_insert" ON ai_detections FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_ai_update" ON ai_detections;
CREATE POLICY "auth_ai_update" ON ai_detections FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE ambulances;
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE traffic_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_detections;

-- SEED DATA: Traffic signals along a predefined route
INSERT INTO traffic_signals (signal_name, latitude, longitude, status, emergency_mode) VALUES
  ('Signal 1 - MG Road', 17.3960, 78.4900, 'red', false),
  ('Signal 2 - Station Road', 17.4010, 78.4950, 'red', false),
  ('Signal 3 - Hospital Road', 17.4060, 78.5000, 'red', false),
  ('Signal 4 - Emergency Junction', 17.4110, 78.5050, 'red', false)
ON CONFLICT DO NOTHING;

-- SEED DATA: Hospital
INSERT INTO hospitals (name, latitude, longitude, emergency_ready) VALUES
  ('City General Hospital', 17.4150, 78.5100, 'preparing')
ON CONFLICT DO NOTHING;

-- SEED DATA: AI detections
INSERT INTO ai_detections (vehicle_number, lane, status) VALUES
  ('AP39AB1234', 'Lane 2', 'cleared'),
  ('TS09XY5678', 'Lane 1', 'cleared'),
  ('AP28CD9012', 'Lane 3', 'cleared'),
  ('KA01EF3456', 'Lane 4', 'cleared')
ON CONFLICT DO NOTHING;
