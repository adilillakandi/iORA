-- ============================================================================
-- iORA ADMIN AUTHENTICATION SCHEMA & PROVISIONING SCRIPT
-- ============================================================================
-- Admin Account: ksidanbasheer@gmail.com
-- Admin Password: iOra@123321
-- ============================================================================

-- 1. Enable pgcrypto extension for hashing
create extension if not exists "pgcrypto";

-- 2. Admin Users Table
-- Links to Supabase auth.users to designate administrator privileges
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamptz not null default now()
);

-- Index for quick lookup by email
create index if not exists idx_admin_users_email on public.admin_users(email);

-- Enable Row Level Security (RLS)
alter table public.admin_users enable row level security;

-- 3. Security Definer Helper Function: is_admin()
-- Evaluates whether the currently authenticated session UID is an active admin
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

-- Policy allowing admins to inspect admin accounts
drop policy if exists "Admins can view admin list" on public.admin_users;
create policy "Admins can view admin list"
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin());

-- 4. Idempotent Provisioning Block
-- Safely inserts ksidanbasheer@gmail.com with password iOra@123321 into auth.users
-- and connects the record into public.admin_users
do $$
declare
  admin_uid uuid;
  target_email text := 'ksidanbasheer@gmail.com';
  target_password text := 'iOra@123321';
  encrypted_pw text;
begin
  -- Compute bcrypt hash
  encrypted_pw := crypt(target_password, gen_salt('bf'));

  -- Check if user already exists in auth.users
  select id into admin_uid
  from auth.users
  where email = target_email;

  if admin_uid is null then
    admin_uid := gen_random_uuid();
    
    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      admin_uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      target_email,
      encrypted_pw,
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "super_admin"}'::jsonb,
      now(),
      now()
    );
  else
    -- User exists: sync password and confirm email
    update auth.users
    set encrypted_password = encrypted_pw,
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    where id = admin_uid;
  end if;

  -- Ensure record exists in public.admin_users
  insert into public.admin_users (user_id, email, role)
  values (admin_uid, target_email, 'super_admin')
  on conflict (user_id) do update
  set role = 'super_admin', email = target_email;

  raise notice 'Admin account provisioned successfully for %', target_email;
end $$;
