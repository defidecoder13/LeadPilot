CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  rating DOUBLE PRECISION,
  review_count INTEGER NOT NULL DEFAULT 0,
  google_maps_url TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'Google Places',
  discovered_at TIMESTAMPTZ,
  lead_status TEXT NOT NULL DEFAULT 'NEW',
  research_status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  research_data JSONB,
  email_status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  email_subject TEXT,
  email_body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_lead_status_idx ON leads (lead_status);
CREATE INDEX IF NOT EXISTS leads_research_status_idx ON leads (research_status);
CREATE INDEX IF NOT EXISTS leads_email_status_idx ON leads (email_status);
CREATE INDEX IF NOT EXISTS leads_discovered_at_idx ON leads (discovered_at DESC);
