DROP POLICY IF EXISTS "read published pages" ON public.custom_pages;
CREATE POLICY "Anon reads published pages" ON public.custom_pages FOR SELECT TO anon USING (published);
CREATE POLICY "Users read pages" ON public.custom_pages FOR SELECT TO authenticated USING (published OR public.has_role(auth.uid(), 'admin'::app_role));
GRANT SELECT ON public.custom_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_pages TO authenticated;
GRANT ALL ON public.custom_pages TO service_role;