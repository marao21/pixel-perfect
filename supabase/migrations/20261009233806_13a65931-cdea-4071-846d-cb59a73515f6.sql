CREATE TABLE public.system_pages (
 slug text PRIMARY KEY CHECK (slug IN ('home','plano','biblia','oferta','pecado','devocional','tempo-com-deus')),
 title text NOT NULL DEFAULT '',
 intro text NOT NULL DEFAULT '',
 content_blocks jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(content_blocks) = 'array'),
 content_position text NOT NULL DEFAULT 'before' CHECK (content_position IN ('before','after')),
 show_original boolean NOT NULL DEFAULT true,
 home_sections jsonb NOT NULL DEFAULT '[{"id":"reading","visible":true},{"id":"progress","visible":true},{"id":"devotional","visible":true},{"id":"feed","visible":true}]'::jsonb CHECK (jsonb_typeof(home_sections) = 'array'),
 show_announcements boolean NOT NULL DEFAULT true,
 published boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.system_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_pages TO authenticated;
GRANT ALL ON public.system_pages TO service_role;
ALTER TABLE public.system_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published system pages readable" ON public.system_pages FOR SELECT TO anon USING (published);
CREATE POLICY "Users read system pages" ON public.system_pages FOR SELECT TO authenticated USING (published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage system pages" ON public.system_pages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER system_pages_touch BEFORE UPDATE ON public.system_pages FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
INSERT INTO public.system_pages (slug) VALUES ('home'),('plano'),('biblia'),('oferta'),('pecado'),('devocional'),('tempo-com-deus');
CREATE POLICY "Published system page images readable" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'page-images' AND EXISTS (SELECT 1 FROM public.system_pages p WHERE p.published AND p.content_blocks @> jsonb_build_array(jsonb_build_object('type','image','path',storage.objects.name))));