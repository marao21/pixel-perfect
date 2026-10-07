ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS full_access boolean NOT NULL DEFAULT false;
UPDATE public.user_roles SET full_access = true WHERE role = 'admin';

CREATE OR REPLACE FUNCTION public.is_full_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin' AND full_access)
$$;

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role, full_access) VALUES (auth.uid(), 'admin', true);
  RETURN true;
END $$;

DROP POLICY IF EXISTS "Admins add roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins remove roles" ON public.user_roles;
CREATE POLICY "Full admins add roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_full_admin(auth.uid()));
CREATE POLICY "Full admins update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.is_full_admin(auth.uid())) WITH CHECK (public.is_full_admin(auth.uid()));
CREATE POLICY "Full admins remove roles" ON public.user_roles FOR DELETE TO authenticated USING (public.is_full_admin(auth.uid()));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_full_admin(uuid) TO authenticated;