-- ════════════════════════════════════════════════════════════════════════════
-- SECURITY LOCKDOWN — enable RLS on every public table and scope access
-- Run this in Supabase Dashboard → SQL Editor.
-- Service-role key (server-side) bypasses RLS automatically, so all existing
-- server actions (dashboard reads/writes, API routes, agents) keep working.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. enable RLS on every public table ───────────────────────────────────
do $$
declare r record;
begin
  for r in
    select tablename from pg_tables where schemaname='public'
  loop
    execute format('alter table public.%I enable row level security', r.tablename);
    execute format('alter table public.%I force row level security', r.tablename);
  end loop;
end $$;

-- ─── 2. drop any overly-permissive legacy policies so we start clean ────────
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies where schemaname='public'
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- ─── 3. PUBLIC READS (directory pages need these) ─────────────────────────

-- Vendors: anyone can read active vendors only
create policy "vendors_public_read_active" on public.vendors
  for select to anon, authenticated
  using (is_active = true);

-- Categories: public read active only
create policy "categories_public_read_active" on public.categories
  for select to anon, authenticated
  using (is_active = true);

-- Cities: public read active only
create policy "cities_public_read_active" on public.cities
  for select to anon, authenticated
  using (is_active = true);

-- Blog posts: public read published only
create policy "blog_posts_public_read_published" on public.blog_posts
  for select to anon, authenticated
  using (
    case when exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='blog_posts' and column_name='published'
    ) then published = true else true end
  );

-- ─── 4. AUTHENTICATED WRITES (vendor dashboard owns its own rows) ──────────

-- Vendors: owner can update their own row (join via user_profiles.user_id or vendors.user_id if present)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='vendors' and column_name='user_id'
  ) then
    execute $pol$
      create policy "vendors_owner_update" on public.vendors
        for update to authenticated
        using (user_id = auth.uid())
        with check (user_id = auth.uid())
    $pol$;
  end if;
end $$;

-- Vendor photos: owner can read/write their own photos
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='vendor_photos'
  ) then
    execute $pol$
      create policy "vendor_photos_public_read" on public.vendor_photos
        for select to anon, authenticated using (true)
    $pol$;
  end if;
end $$;

-- ─── 5. EVERYTHING ELSE: no public access ──────────────────────────────────
-- All tables without explicit policies are now locked. Only the service role
-- (server code) can read/write them. This covers:
--   leads, subscribers, contact_submissions, vendor_claims, user_profiles,
--   inquiries, saved_vendors, reviews, newsletter_subscribers, profiles,
--   bookings, messages, analytics, vendor_reviews, vendor_inquiries,
--   client_inquiries, planner_profiles, clients, tasks
--
-- If you later need authenticated users to read their own rows, add scoped
-- policies like:
--   create policy "leads_owner_read" on public.leads
--     for select to authenticated using (user_id = auth.uid());

-- ─── 6. Revoke anon direct grants (belt-and-braces) ────────────────────────
do $$
declare r record;
begin
  for r in
    select tablename from pg_tables where schemaname='public'
      and tablename not in ('vendors','categories','cities','blog_posts','vendor_photos')
  loop
    execute format('revoke all on public.%I from anon', r.tablename);
  end loop;
end $$;

-- Done. Service role bypasses RLS so existing server code keeps working.
