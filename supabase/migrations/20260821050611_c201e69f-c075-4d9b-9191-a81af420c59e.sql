CREATE TABLE public.diet_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid NOT NULL UNIQUE REFERENCES public.submissions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Not Started',
  patient_name text NOT NULL DEFAULT '',
  plan_title text NOT NULL DEFAULT '',
  duration_label text NOT NULL DEFAULT '',
  breakfast text NOT NULL DEFAULT '',
  mid_morning text NOT NULL DEFAULT '',
  lunch text NOT NULL DEFAULT '',
  evening_snack text NOT NULL DEFAULT '',
  dinner text NOT NULL DEFAULT '',
  water_guidance text NOT NULL DEFAULT '',
  activity_guidance text NOT NULL DEFAULT '',
  foods_prefer text NOT NULL DEFAULT '',
  foods_limit text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  consultant_name text NOT NULL DEFAULT '',
  consultant_note text NOT NULL DEFAULT '',
  released_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.diet_plans TO service_role;

ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct client access to diet plans"
  ON public.diet_plans FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_diet_plans_updated_at
BEFORE UPDATE ON public.diet_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();