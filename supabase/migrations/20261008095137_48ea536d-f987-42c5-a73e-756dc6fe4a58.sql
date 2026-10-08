ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.membros FROM anon, authenticated;
GRANT ALL ON public.membros TO service_role;