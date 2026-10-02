ALTER TABLE public.eyecare_patients ADD COLUMN IF NOT EXISTS specialty text NOT NULL DEFAULT 'eye-care';
ALTER TABLE public.eyecare_doctors ADD COLUMN IF NOT EXISTS module text NOT NULL DEFAULT 'eye-care';
ALTER TABLE public.eyecare_assessments ADD COLUMN IF NOT EXISTS extra jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS eyecare_patients_specialty_idx ON public.eyecare_patients(specialty);
CREATE INDEX IF NOT EXISTS eyecare_doctors_module_idx ON public.eyecare_doctors(module);

CREATE OR REPLACE FUNCTION public.next_consultancy_patient_id(_prefix text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE n bigint;
BEGIN
  IF _prefix !~ '^[A-Z]{2,4}$' THEN RAISE EXCEPTION 'Invalid prefix'; END IF;
  n := nextval('public.eyecare_patient_seq');
  RETURN _prefix || '-' || to_char(now() AT TIME ZONE 'utc', 'YYYY') || '-' || lpad(n::text, 4, '0');
END;
$$;
REVOKE ALL ON FUNCTION public.next_consultancy_patient_id(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_consultancy_patient_id(text) TO service_role;