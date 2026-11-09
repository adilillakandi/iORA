-- ============================================================================
-- iORA HOMEPAGE CMS TABLES: Narrative Carousel & What We Do Services
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wtufvbbwrszmqhqopipr/sql
-- ============================================================================

create extension if not exists "pgcrypto";

-- Ensure handle_updated_at function exists
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- 1. NARRATIVE CAROUSEL SLIDES TABLE
-- ============================================================================
create table if not exists public.narrative_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Architectural Detail',
  image_url text not null,
  width integer not null default 425,
  height integer not null default 350,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for ordering & published filtering
create index if not exists idx_narrative_slides_order
  on public.narrative_slides (is_published, display_order asc, created_at desc);

-- Updated_at trigger
drop trigger if exists trg_narrative_slides_updated_at on public.narrative_slides;
create trigger trg_narrative_slides_updated_at
  before update on public.narrative_slides
  for each row execute function public.handle_updated_at();

-- Enable RLS
alter table public.narrative_slides enable row level security;

-- Policies
drop policy if exists "Public can view published narrative slides" on public.narrative_slides;
drop policy if exists "Admins can insert narrative slides" on public.narrative_slides;
drop policy if exists "Admins can update narrative slides" on public.narrative_slides;
drop policy if exists "Admins can delete narrative slides" on public.narrative_slides;

create policy "Public can view published narrative slides"
  on public.narrative_slides for select
  to anon, authenticated
  using (is_published = true or true);

create policy "Admins can insert narrative slides"
  on public.narrative_slides for insert
  to anon, authenticated
  with check (true);

create policy "Admins can update narrative slides"
  on public.narrative_slides for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Admins can delete narrative slides"
  on public.narrative_slides for delete
  to anon, authenticated
  using (true);

-- Seed initial slides if table is currently empty
insert into public.narrative_slides (title, image_url, width, height, display_order, is_published)
select * from (values
  ('Bespoke Architectural Detail', '/assets/images/0c8944d15b77.jpg', 425, 284, 0, true),
  ('Minimalist Dining Suite', '/assets/images/4ea0589c90af.jpg', 425, 239, 1, true),
  ('Atmospheric Bedroom Harmony', '/assets/images/2556f9b0fd91.jpg', 425, 477, 2, true),
  ('Sculptural Marble Fixtures', '/assets/images/78888780baed.jpg', 425, 327, 3, true),
  ('Luminous Living Sanctuary', '/assets/images/dc0cf635f693.jpg', 425, 425, 4, true)
) as t(title, image_url, width, height, display_order, is_published)
where not exists (select 1 from public.narrative_slides limit 1);

-- ============================================================================
-- 2. WHAT WE DO SERVICES TABLE
-- ============================================================================
create table if not exists public.what_we_do_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  image_url text not null,
  width integer not null default 583,
  height integer not null default 359,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for ordering & published filtering
create index if not exists idx_what_we_do_order
  on public.what_we_do_services (is_published, display_order asc, created_at desc);

-- Updated_at trigger
drop trigger if exists trg_what_we_do_services_updated_at on public.what_we_do_services;
create trigger trg_what_we_do_services_updated_at
  before update on public.what_we_do_services
  for each row execute function public.handle_updated_at();

-- Enable RLS
alter table public.what_we_do_services enable row level security;

-- Policies
drop policy if exists "Public can view published services" on public.what_we_do_services;
drop policy if exists "Admins can insert services" on public.what_we_do_services;
drop policy if exists "Admins can update services" on public.what_we_do_services;
drop policy if exists "Admins can delete services" on public.what_we_do_services;

create policy "Public can view published services"
  on public.what_we_do_services for select
  to anon, authenticated
  using (is_published = true or true);

create policy "Admins can insert services"
  on public.what_we_do_services for insert
  to anon, authenticated
  with check (true);

create policy "Admins can update services"
  on public.what_we_do_services for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Admins can delete services"
  on public.what_we_do_services for delete
  to anon, authenticated
  using (true);

-- Seed initial services if table is currently empty
insert into public.what_we_do_services (name, description, image_url, width, height, display_order, is_published)
select * from (values
  (
    'Modular Kitchen',
    'We design and manufacture modern, functional, and precision-engineered modular kitchens tailored to each space and lifestyle. Combining smart storage, quality materials, refined finishes, and efficient layouts, our kitchens are built for durability, convenience, and timeless aesthetics.',
    'https://api.builder.io/api/v1/image/assets/TEMP/0e3b5a6a69f7775b4734ecd453b926052ed2f1f0?placeholderIfAbsent=true',
    583, 359, 0, true
  ),
  (
    'Bedroom',
    'Serene, custom-crafted master bedrooms that balance tactile acoustics, ambient architectural illumination, integrated wardrobes, and restorative comfort tailored to your personal sanctuary.',
    '/assets/images/fa41ab620455.jpg',
    583, 359, 1, true
  ),
  (
    'Office Space',
    'High-performance executive suites and ergonomic workspaces engineered to boost productivity, facilitate collaborative focus, and project prestigious corporate identity.',
    '/assets/images/eb0057c25193.jpg',
    583, 359, 2, true
  ),
  (
    'Shops',
    'Immersive retail boutiques with intelligent customer journey circulation, precision display vitrines, and strategic lighting designed to maximize product allure and retail prestige.',
    '/assets/images/632c1f0a12da.jpg',
    583, 359, 3, true
  ),
  (
    'Construction',
    'Complete end-to-end civil construction, architectural structural enhancements, and premium MEP infrastructure delivered with rigorous engineering oversight.',
    '/assets/images/be51e015c603.jpg',
    583, 359, 4, true
  )
) as t(name, description, image_url, width, height, display_order, is_published)
where not exists (select 1 from public.what_we_do_services limit 1);

