ALTER TABLE public.diet_plans
  ADD COLUMN IF NOT EXISTS ai_draft jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_generated_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS ai_generation_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_review_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_review_flags text NOT NULL DEFAULT ''::text;