-- ============================================================================
-- iORA INTERIOR DESIGN WEBSITE - DATABASE & STORAGE SCHEMA
-- Covers: Admin Users, Portfolio Projects, Shop Products, RLS Policies, & Storage Buckets
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS & HELPER FUNCTIONS
-- ============================================================================
create extension if not exists "pgcrypto";

-- Reusable trigger function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- 2. ADMIN USERS & ROLE VALIDATION
-- ============================================================================
-- Links to Supabase auth.users to designate admin privileges safely
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Function to check if the current requesting session belongs to an active admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================================
-- 3. PORTFOLIO PROJECTS TABLE
-- ============================================================================
create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  category text not null check (category in ('Residential', 'Commercial', 'Construction', 'Modular Kitchen', 'Turnkey')),
  image_url text not null,
  aspect_ratio numeric not null default 0.667,
  display_order integer not null default 0,
  is_published boolean not null default true,
  the_idea_title text,
  the_idea_description text,
  specifications jsonb not null default '[]'::jsonb,
  gallery_images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Performance & filtering indexes for public queries
create index if not exists idx_portfolio_published_category_order
  on public.portfolio_projects (is_published, category, display_order asc, created_at desc);

-- Automatic updated_at trigger
drop trigger if exists trg_portfolio_projects_updated_at on public.portfolio_projects;
create trigger trg_portfolio_projects_updated_at
  before update on public.portfolio_projects
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- 4. SHOP PRODUCTS TABLE
-- ============================================================================
create table if not exists public.shop_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('Bedroom', 'Living room', 'Kitchen', 'Workspace', 'Dining')),
  tag text,
  price text not null,
  image_url text not null,
  description text,
  dimensions text,
  material text,
  finishes jsonb not null default '[]'::jsonb,
  configurations jsonb not null default '[]'::jsonb,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Performance & filtering indexes for public catalog queries
create index if not exists idx_shop_products_published_category_order
  on public.shop_products (is_published, category, display_order asc, created_at desc);

-- Automatic updated_at trigger
drop trigger if exists trg_shop_products_updated_at on public.shop_products;
create trigger trg_shop_products_updated_at
  before update on public.shop_products
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
alter table public.portfolio_projects enable row level security;
alter table public.shop_products enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Public can view published portfolio projects" on public.portfolio_projects;
drop policy if exists "Admins can insert portfolio projects" on public.portfolio_projects;
drop policy if exists "Admins can update portfolio projects" on public.portfolio_projects;
drop policy if exists "Admins can delete portfolio projects" on public.portfolio_projects;

-- --- Portfolio Policies ---
create policy "Public can view published portfolio projects"
  on public.portfolio_projects
  for select
  to anon, authenticated
  using (is_published = true or public.is_admin());

create policy "Admins can insert portfolio projects"
  on public.portfolio_projects
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update portfolio projects"
  on public.portfolio_projects
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete portfolio projects"
  on public.portfolio_projects
  for delete
  to authenticated
  using (public.is_admin());

-- --- Shop Policies ---
drop policy if exists "Public can view published shop products" on public.shop_products;
drop policy if exists "Admins can insert shop products" on public.shop_products;
drop policy if exists "Admins can update shop products" on public.shop_products;
drop policy if exists "Admins can delete shop products" on public.shop_products;

create policy "Public can view published shop products"
  on public.shop_products
  for select
  to anon, authenticated
  using (is_published = true or public.is_admin());

create policy "Admins can insert shop products"
  on public.shop_products
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update shop products"
  on public.shop_products
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete shop products"
  on public.shop_products
  for delete
  to authenticated
  using (public.is_admin());

-- --- Admin Users Policies ---
drop policy if exists "Admins can view admin list" on public.admin_users;
create policy "Admins can view admin list"
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin());

-- ============================================================================
-- 6. SUPABASE STORAGE BUCKETS SETUP & POLICIES
-- ============================================================================
-- Insert public storage buckets for portfolio and shop image uploads
insert into storage.buckets (id, name, public)
values 
  ('portfolio', 'portfolio', true),
  ('shop', 'shop', true)
on conflict (id) do nothing;

-- Storage RLS: Public can view images
drop policy if exists "Public Access to Portfolio Images" on storage.objects;
create policy "Public Access to Portfolio Images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'portfolio');

drop policy if exists "Public Access to Shop Images" on storage.objects;
create policy "Public Access to Shop Images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'shop');

-- Storage RLS: Admins can upload & delete
drop policy if exists "Admins can upload to portfolio bucket" on storage.objects;
create policy "Admins can upload to portfolio bucket"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio' and public.is_admin());

drop policy if exists "Admins can upload to shop bucket" on storage.objects;
create policy "Admins can upload to shop bucket"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'shop' and public.is_admin());

drop policy if exists "Admins can delete portfolio images" on storage.objects;
create policy "Admins can delete portfolio images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio' and public.is_admin());

drop policy if exists "Admins can delete shop images" on storage.objects;
create policy "Admins can delete shop images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'shop' and public.is_admin());
