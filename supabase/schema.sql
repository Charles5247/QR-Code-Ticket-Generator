-- ============================================================
-- MC FABS MASTERCLASS — Supabase Database Schema
-- ============================================================
-- Run this SQL in your Supabase SQL Editor to set up the database

-- ─── Enable UUID extension ────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Attendees Table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendees (
  id                 UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name          TEXT NOT NULL,
  email              TEXT NOT NULL,
  phone              TEXT NOT NULL,
  gender             TEXT,
  occupation         TEXT,
  ticket_category    TEXT NOT NULL DEFAULT 'regular',
  ticket_code        TEXT UNIQUE NOT NULL,
  seat_number        TEXT UNIQUE NOT NULL,
  payment_reference  TEXT UNIQUE,
  payment_status     TEXT NOT NULL DEFAULT 'pending',
  amount_paid        NUMERIC DEFAULT 0,
  paid_at            TIMESTAMPTZ,
  qr_code_url        TEXT,
  ticket_pdf_url     TEXT,
  checked_in         BOOLEAN DEFAULT FALSE,
  checked_in_at      TIMESTAMPTZ,
  scan_attempts      INTEGER DEFAULT 0,
  last_scan_status   TEXT,
  last_scan_attempt_at TIMESTAMPTZ,
  special_requests   TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email);
CREATE INDEX IF NOT EXISTS idx_attendees_ticket_code ON attendees(ticket_code);
CREATE INDEX IF NOT EXISTS idx_attendees_payment_status ON attendees(payment_status);
CREATE INDEX IF NOT EXISTS idx_attendees_ticket_category ON attendees(ticket_category);
CREATE INDEX IF NOT EXISTS idx_attendees_created_at ON attendees(created_at DESC);

-- ─── Updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_attendees_updated_at
  BEFORE UPDATE ON attendees
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users (admin) can do everything
CREATE POLICY "admin_all" ON attendees
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Anonymous can insert (registration)
CREATE POLICY "anon_insert" ON attendees
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Anonymous can read their own ticket (by email or ticket_code)
CREATE POLICY "anon_read_own" ON attendees
  FOR SELECT
  TO anon
  USING (true); -- Allow all reads for now; restrict by email in production

-- Policy: Anonymous can update payment status (via edge function only in prod)
CREATE POLICY "anon_update_payment" ON attendees
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- ─── Supabase Storage Bucket (run separately in Storage tab) ─────────────────
-- Create a bucket named 'tickets' in Supabase Storage with public access
-- INSERT INTO storage.buckets (id, name, public) VALUES ('tickets', 'tickets', true);

-- ─── Sample data (optional - for testing) ────────────────────────────────────
/*
INSERT INTO attendees (full_name, email, phone, gender, occupation, ticket_category, ticket_code, seat_number, payment_status, amount_paid, checked_in)
VALUES 
  ('Test User VIP', 'vip@test.com', '08012345678', 'Male', 'Entrepreneur', 'vip', 'MCFABS-2026-VIP-0001', 'VIP-001', 'paid', 35000, false),
  ('Test User Regular', 'reg@test.com', '07023456789', 'Female', 'Student', 'regular', 'MCFABS-2026-REG-0001', 'REG-001', 'paid', 15000, true),
  ('Test User Premium', 'prm@test.com', '09034567890', 'Male', 'CEO', 'premium', 'MCFABS-2026-PRM-0001', 'PRM-001', 'paid', 75000, false);
*/
