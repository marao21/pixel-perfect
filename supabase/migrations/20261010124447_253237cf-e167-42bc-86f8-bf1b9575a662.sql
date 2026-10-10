CREATE TABLE public.content_overrides (
  key text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.content_overrides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_overrides TO authenticated;
GRANT ALL ON public.content_overrides TO service_role;
ALTER TABLE public.content_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads overrides" ON public.content_overrides FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage overrides" ON public.content_overrides FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER content_overrides_touch BEFORE UPDATE ON public.content_overrides
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();