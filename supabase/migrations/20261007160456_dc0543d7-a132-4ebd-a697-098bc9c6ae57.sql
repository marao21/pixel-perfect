create table public.custom_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text,
  youtube_url text,
  position int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.custom_pages enable row level security;
grant select on public.custom_pages to anon, authenticated;
grant insert, update, delete on public.custom_pages to authenticated;
create policy "read published pages" on public.custom_pages for select using (published or public.has_role(auth.uid(), 'admin'));
create policy "admins manage pages" on public.custom_pages for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));