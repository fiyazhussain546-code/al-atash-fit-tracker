-- Ensure RLS is on
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Remove any client-facing privileges; all access goes through trusted server code
REVOKE ALL ON public.app_settings FROM anon, authenticated;
REVOKE ALL ON public.submissions FROM anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
GRANT ALL ON public.submissions TO service_role;

-- Explicit deny-all policies (documented intent, mirrors diet_plans)
DROP POLICY IF EXISTS "No direct client access to app settings" ON public.app_settings;
CREATE POLICY "No direct client access to app settings"
ON public.app_settings
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "No direct client access to submissions" ON public.submissions;
CREATE POLICY "No direct client access to submissions"
ON public.submissions
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Storage: deny all direct client access to the private payment-proofs bucket
DROP POLICY IF EXISTS "No direct client access to payment proofs" ON storage.objects;
CREATE POLICY "No direct client access to payment proofs"
ON storage.objects
FOR ALL
TO anon, authenticated
USING (bucket_id <> 'payment-proofs')
WITH CHECK (bucket_id <> 'payment-proofs');