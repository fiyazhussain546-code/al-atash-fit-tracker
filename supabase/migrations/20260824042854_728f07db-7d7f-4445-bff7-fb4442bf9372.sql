ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_amount text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_date text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_client_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_whatsapp text NOT NULL DEFAULT '';