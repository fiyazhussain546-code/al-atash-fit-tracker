-- ============ Eye Care Consultancy (isolated module) ============

CREATE TABLE public.eyecare_patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  age text NOT NULL DEFAULT '',
  gender text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  attendant_name text NOT NULL DEFAULT '',
  relationship text NOT NULL DEFAULT '',
  main_problem text NOT NULL DEFAULT '',
  case_category text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'Normal',
  preferred_city text NOT NULL DEFAULT '',
  budget_preference text NOT NULL DEFAULT '',
  service_package text NOT NULL DEFAULT '',
  case_status text NOT NULL DEFAULT 'New',
  registration_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  notes text NOT NULL DEFAULT '',
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.eyecare_patients TO service_role;
ALTER TABLE public.eyecare_patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct client access to eyecare patients" ON public.eyecare_patients
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE TABLE public.eyecare_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_uid uuid NOT NULL REFERENCES public.eyecare_patients(id) ON DELETE CASCADE,
  symptoms text NOT NULL DEFAULT '',
  previous_diagnosis text NOT NULL DEFAULT '',
  previous_doctor text NOT NULL DEFAULT '',
  previous_treatment text NOT NULL DEFAULT '',
  previous_reports text NOT NULL DEFAULT '',
  reports_available text NOT NULL DEFAULT 'No',
  surgery_suggested text NOT NULL DEFAULT 'Not Confirmed',
  second_opinion_required text NOT NULL DEFAULT 'No',
  required_specialist text NOT NULL DEFAULT 'General Ophthalmology',
  patient_priority text NOT NULL DEFAULT 'Normal',
  travel_preference text NOT NULL DEFAULT 'Local',
  budget text NOT NULL DEFAULT '',
  consultant_notes text NOT NULL DEFAULT '',
  assessment_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.eyecare_assessments TO service_role;
ALTER TABLE public.eyecare_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct client access to eyecare assessments" ON public.eyecare_assessments
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE TABLE public.eyecare_doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  specialty text NOT NULL DEFAULT 'General Ophthalmology',
  consultation_fee text NOT NULL DEFAULT '',
  estimated_cost text NOT NULL DEFAULT '',
  services text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  contact text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.eyecare_doctors TO service_role;
ALTER TABLE public.eyecare_doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct client access to eyecare doctors" ON public.eyecare_doctors
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE TABLE public.eyecare_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_uid uuid NOT NULL REFERENCES public.eyecare_patients(id) ON DELETE CASCADE,
  option_number integer NOT NULL CHECK (option_number BETWEEN 1 AND 3),
  doctor_uid uuid REFERENCES public.eyecare_doctors(id) ON DELETE SET NULL,
  doctor_name text NOT NULL DEFAULT '',
  specialty text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  estimated_cost text NOT NULL DEFAULT '',
  why_suitable text NOT NULL DEFAULT '',
  appointment_status text NOT NULL DEFAULT 'Requested',
  consultant_notes text NOT NULL DEFAULT '',
  shareable boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (patient_uid, option_number)
);
GRANT ALL ON public.eyecare_recommendations TO service_role;
ALTER TABLE public.eyecare_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct client access to eyecare recommendations" ON public.eyecare_recommendations
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE TABLE public.eyecare_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_uid uuid NOT NULL REFERENCES public.eyecare_patients(id) ON DELETE CASCADE,
  doctor_name text NOT NULL DEFAULT '',
  appointment_date date,
  appointment_time text NOT NULL DEFAULT '',
  appointment_type text NOT NULL DEFAULT 'Consultation',
  status text NOT NULL DEFAULT 'Requested',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.eyecare_appointments TO service_role;
ALTER TABLE public.eyecare_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct client access to eyecare appointments" ON public.eyecare_appointments
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE TABLE public.eyecare_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_uid uuid NOT NULL REFERENCES public.eyecare_patients(id) ON DELETE CASCADE,
  followup_date date,
  consultation_status text NOT NULL DEFAULT 'Pending',
  doctor_advice text NOT NULL DEFAULT '',
  surgery_planned text NOT NULL DEFAULT 'No',
  surgery_date date,
  next_followup date,
  patient_feedback text NOT NULL DEFAULT '',
  case_status text NOT NULL DEFAULT 'Follow-up',
  notes text NOT NULL DEFAULT '',
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.eyecare_followups TO service_role;
ALTER TABLE public.eyecare_followups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct client access to eyecare followups" ON public.eyecare_followups
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE TABLE public.eyecare_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_uid uuid NOT NULL REFERENCES public.eyecare_patients(id) ON DELETE CASCADE,
  service_package text NOT NULL DEFAULT 'Basic Eye Guidance',
  service_type text NOT NULL DEFAULT '',
  fee numeric(12,2) NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'Pending',
  payment_method text NOT NULL DEFAULT '',
  payment_date date,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.eyecare_services TO service_role;
ALTER TABLE public.eyecare_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct client access to eyecare services" ON public.eyecare_services
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE TABLE public.eyecare_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_uid uuid NOT NULL REFERENCES public.eyecare_patients(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Medical Report',
  storage_path text NOT NULL DEFAULT '',
  external_link text NOT NULL DEFAULT '',
  patient_shareable boolean NOT NULL DEFAULT false,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.eyecare_documents TO service_role;
ALTER TABLE public.eyecare_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct client access to eyecare documents" ON public.eyecare_documents
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE TABLE public.eyecare_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_uid uuid NOT NULL REFERENCES public.eyecare_patients(id) ON DELETE CASCADE,
  event text NOT NULL DEFAULT '',
  detail text NOT NULL DEFAULT '',
  occurred_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.eyecare_timeline TO service_role;
ALTER TABLE public.eyecare_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct client access to eyecare timeline" ON public.eyecare_timeline
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- updated_at triggers (reuses the existing helper function)
CREATE TRIGGER eyecare_patients_updated BEFORE UPDATE ON public.eyecare_patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER eyecare_assessments_updated BEFORE UPDATE ON public.eyecare_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER eyecare_doctors_updated BEFORE UPDATE ON public.eyecare_doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER eyecare_recommendations_updated BEFORE UPDATE ON public.eyecare_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER eyecare_appointments_updated BEFORE UPDATE ON public.eyecare_appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER eyecare_followups_updated BEFORE UPDATE ON public.eyecare_followups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER eyecare_services_updated BEFORE UPDATE ON public.eyecare_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER eyecare_documents_updated BEFORE UPDATE ON public.eyecare_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sequential, unique, human-readable patient IDs: EC-YYYY-0001
CREATE SEQUENCE IF NOT EXISTS public.eyecare_patient_seq;

CREATE OR REPLACE FUNCTION public.next_eyecare_patient_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n bigint;
BEGIN
  n := nextval('public.eyecare_patient_seq');
  RETURN 'EC-' || to_char(now() AT TIME ZONE 'utc', 'YYYY') || '-' || lpad(n::text, 4, '0');
END;
$$;
REVOKE ALL ON FUNCTION public.next_eyecare_patient_id() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_eyecare_patient_id() TO service_role;

CREATE INDEX eyecare_patients_status_idx ON public.eyecare_patients (case_status);
CREATE INDEX eyecare_recs_patient_idx ON public.eyecare_recommendations (patient_uid);
CREATE INDEX eyecare_appts_patient_idx ON public.eyecare_appointments (patient_uid);
CREATE INDEX eyecare_followups_patient_idx ON public.eyecare_followups (patient_uid);
CREATE INDEX eyecare_services_patient_idx ON public.eyecare_services (patient_uid);
CREATE INDEX eyecare_documents_patient_idx ON public.eyecare_documents (patient_uid);
CREATE INDEX eyecare_timeline_patient_idx ON public.eyecare_timeline (patient_uid, occurred_at DESC);