-- ============================================================
-- THAPPASORN WORKS — Supabase schema
-- Run in Supabase SQL editor (or `supabase db push`).
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- PROJECTS ----------
create table if not exists public.projects (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  slug          text unique not null,
  description   text,
  category      text not null check (category in ('graphics','shot-videos','long-form-video','filming-photography')),
  tags          text[] default '{}',
  client        text,
  year          text,
  services      text[] default '{}',
  challenge     text,
  solution      text,
  results       text,
  featured      boolean default false,
  thumbnail     text,                       -- Cloudinary URL
  gallery       text[] default '{}',        -- Cloudinary URLs
  video_url     text,
  views         integer default 0,
  created_at    timestamptz default now()
);
create index if not exists projects_category_idx on public.projects (category, created_at desc);
create index if not exists projects_featured_idx on public.projects (featured) where featured = true;

-- ---------- REVIEWS ----------
create table if not exists public.reviews (
  id              uuid primary key default uuid_generate_v4(),
  client_name     text not null,
  company         text,
  position        text,
  profile_image   text,
  signature_image text,
  rating          integer not null default 5 check (rating between 1 and 5),
  review_text     text,
  video_review    text,
  project_type    text,
  date_completed  text,
  featured        boolean default false,
  created_at      timestamptz default now()
);

-- ---------- TRUSTED BY ----------
create table if not exists public.trusted_by (
  id           uuid primary key default uuid_generate_v4(),
  company_name text not null,
  logo         text,
  website      text,
  created_at   timestamptz default now()
);

-- ---------- ANALYTICS EVENTS ----------
create table if not exists public.analytics_events (
  id         bigint generated always as identity primary key,
  type       text not null,        -- 'visit' | 'project_view' | 'line_click' | 'email_click' | 'phone_click'
  ref        text,                 -- project slug / path
  country    text,
  source     text,                 -- referrer host
  created_at timestamptz default now()
);
create index if not exists analytics_type_idx on public.analytics_events (type, created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- Public can READ content; only the authenticated owner can WRITE.
-- ============================================================
alter table public.projects        enable row level security;
alter table public.reviews         enable row level security;
alter table public.trusted_by      enable row level security;
alter table public.analytics_events enable row level security;

-- public read
create policy "public read projects"   on public.projects   for select using (true);
create policy "public read reviews"    on public.reviews    for select using (true);
create policy "public read trusted"    on public.trusted_by for select using (true);

-- owner write (any authenticated user — there is only one)
create policy "owner write projects" on public.projects   for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "owner write reviews"  on public.reviews    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "owner write trusted"  on public.trusted_by for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- analytics: anyone may insert an event, only owner may read
create policy "anyone insert events" on public.analytics_events for insert with check (true);
create policy "owner read events"    on public.analytics_events for select using (auth.role() = 'authenticated');

-- increment project views atomically
create or replace function public.increment_views(p_slug text)
returns void language sql as $$
  update public.projects set views = views + 1 where slug = p_slug;
$$;
