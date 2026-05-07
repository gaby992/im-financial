-- ============================================================
-- IM Financial Dashboard — Supabase Schema
-- Run this in: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. Companies
CREATE TABLE IF NOT EXISTS companies (
  id   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,  -- 'IM', 'WSH', 'Abundant'
  name text NOT NULL
);

INSERT INTO companies (code, name) VALUES
  ('IM',       'Interactive Marketing'),
  ('WSH',      'Western Star Holdings'),
  ('Abundant', 'Abundant Legacy Trust')
ON CONFLICT (code) DO NOTHING;

-- 2. Upload Batches (one per QB export)
CREATE TABLE IF NOT EXISTS upload_batches (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_code text NOT NULL REFERENCES companies(code),
  filename     text NOT NULL,
  period_label text NOT NULL,      -- e.g. 'April 2026'
  period_start date NOT NULL,
  period_end   date NOT NULL,
  uploaded_by  text NOT NULL,
  uploaded_at  timestamptz DEFAULT now(),
  row_count    int  DEFAULT 0,
  deleted_at   timestamptz          -- soft delete
);

-- 3. P&L Entries (actual transaction data)
CREATE TABLE IF NOT EXISTS pl_entries (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id     uuid NOT NULL REFERENCES upload_batches(id) ON DELETE CASCADE,
  company_code text NOT NULL,
  entry_type   text NOT NULL CHECK (entry_type IN ('income','expense')),
  category     text NOT NULL,
  description  text NOT NULL,
  amount       numeric(12,2) NOT NULL,
  entry_date   date NOT NULL,
  created_at   timestamptz DEFAULT now()
);

-- 4. AI Questions log
CREATE TABLE IF NOT EXISTS ai_questions (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  asked_by   text NOT NULL,
  question   text NOT NULL,
  answer     text,
  model_used text,
  created_at timestamptz DEFAULT now()
);

-- 5. App Settings (API keys, preferences)
CREATE TABLE IF NOT EXISTS app_settings (
  key        text PRIMARY KEY,
  value      text,
  updated_at timestamptz DEFAULT now()
);

-- ── Indexes for fast queries ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pl_entries_company ON pl_entries(company_code);
CREATE INDEX IF NOT EXISTS idx_pl_entries_date    ON pl_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_pl_entries_type    ON pl_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_pl_entries_batch   ON pl_entries(batch_id);
CREATE INDEX IF NOT EXISTS idx_batches_company    ON upload_batches(company_code);

-- ── Row Level Security (enable but allow all for now) ─────────
ALTER TABLE companies      ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pl_entries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_questions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings   ENABLE ROW LEVEL SECURITY;

-- Public read for the dashboard (anon key access)
CREATE POLICY "Public read companies"      ON companies      FOR SELECT USING (true);
CREATE POLICY "Public read batches"        ON upload_batches FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read pl_entries"     ON pl_entries     FOR SELECT USING (true);
CREATE POLICY "Public read ai_questions"   ON ai_questions   FOR SELECT USING (true);
CREATE POLICY "Public read settings"       ON app_settings   FOR SELECT USING (true);

-- Write requires service_role key (used in API routes only)
CREATE POLICY "Service write batches"      ON upload_batches FOR ALL USING (true);
CREATE POLICY "Service write pl_entries"   ON pl_entries     FOR ALL USING (true);
CREATE POLICY "Service write ai_questions" ON ai_questions   FOR ALL USING (true);
CREATE POLICY "Service write settings"     ON app_settings   FOR ALL USING (true);
