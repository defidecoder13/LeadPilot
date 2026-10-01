ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_email_source TEXT,
ADD COLUMN IF NOT EXISTS contact_email_status TEXT NOT NULL DEFAULT 'NOT_STARTED';

CREATE INDEX IF NOT EXISTS leads_contact_email_status_idx
ON public.leads(contact_email_status);
