create extension if not exists pgcrypto;

create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  organisation_type text,
  description text,
  website_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organisations_status_check check (status in ('active', 'paused', 'archived')),
  constraint organisations_slug_format_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.organisation_memberships (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  department_id uuid,
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  constraint organisation_memberships_role_check check (
    role in (
      'owner',
      'organisation_admin',
      'department_manager',
      'content_editor',
      'mentor',
      'analyst',
      'member'
    )
  ),
  constraint organisation_memberships_status_check check (status in ('active', 'invited', 'suspended', 'removed')),
  constraint organisation_memberships_unique_member unique (organisation_id, user_id)
);

create table if not exists public.organisation_branding (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null unique references public.organisations(id) on delete cascade,
  logo_url text,
  favicon_url text,
  primary_colour text not null default '#1f0954',
  secondary_colour text not null default '#2563eb',
  accent_colour text not null default '#7c3aed',
  background_colour text not null default '#ffffff',
  text_colour text not null default '#111827',
  font_family text not null default 'Inter',
  border_radius text not null default 'medium',
  theme_mode text not null default 'light',
  login_banner_url text,
  dashboard_banner_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organisation_branding_theme_mode_check check (theme_mode in ('light', 'dark', 'system')),
  constraint organisation_branding_radius_check check (border_radius in ('small', 'medium', 'large', 'rounded'))
);

create table if not exists public.organisation_settings (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null unique references public.organisations(id) on delete cascade,
  welcome_heading text,
  welcome_message text,
  navigation_config jsonb not null default '[]'::jsonb,
  homepage_config jsonb not null default '[]'::jsonb,
  feature_flags jsonb not null default '{}'::jsonb,
  terminology_config jsonb not null default '{}'::jsonb,
  draft_config jsonb not null default '{}'::jsonb,
  published_config jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists organisations_slug_idx on public.organisations (slug);
create index if not exists organisation_memberships_user_id_idx on public.organisation_memberships (user_id);
create index if not exists organisation_memberships_organisation_id_idx on public.organisation_memberships (organisation_id);
create index if not exists organisation_memberships_active_user_org_idx
  on public.organisation_memberships (user_id, organisation_id)
  where status = 'active';
create index if not exists organisation_branding_organisation_id_idx on public.organisation_branding (organisation_id);
create index if not exists organisation_settings_organisation_id_idx on public.organisation_settings (organisation_id);

create or replace function public.is_active_organisation_member(target_organisation_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organisation_memberships
    where organisation_id = target_organisation_id
      and user_id = (select auth.uid())
      and status = 'active'
  );
$$;

create or replace function public.is_organisation_admin(target_organisation_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organisation_memberships
    where organisation_id = target_organisation_id
      and user_id = (select auth.uid())
      and status = 'active'
      and role in ('owner', 'organisation_admin')
  );
$$;

alter table public.organisations enable row level security;
alter table public.organisation_memberships enable row level security;
alter table public.organisation_branding enable row level security;
alter table public.organisation_settings enable row level security;

drop policy if exists "Members can view their organisations" on public.organisations;
create policy "Members can view their organisations"
on public.organisations
for select
using ((select public.is_active_organisation_member(id)));

drop policy if exists "Members can view memberships in their organisations" on public.organisation_memberships;
create policy "Members can view memberships in their organisations"
on public.organisation_memberships
for select
using ((select public.is_active_organisation_member(organisation_id)));

drop policy if exists "Organisation admins can manage memberships" on public.organisation_memberships;
create policy "Organisation admins can manage memberships"
on public.organisation_memberships
for all
using ((select public.is_organisation_admin(organisation_id)))
with check ((select public.is_organisation_admin(organisation_id)));

drop policy if exists "Members can view organisation branding" on public.organisation_branding;
create policy "Members can view organisation branding"
on public.organisation_branding
for select
using ((select public.is_active_organisation_member(organisation_id)));

drop policy if exists "Organisation admins can update branding" on public.organisation_branding;
create policy "Organisation admins can update branding"
on public.organisation_branding
for update
using ((select public.is_organisation_admin(organisation_id)))
with check ((select public.is_organisation_admin(organisation_id)));

drop policy if exists "Members can view organisation settings" on public.organisation_settings;
create policy "Members can view organisation settings"
on public.organisation_settings
for select
using ((select public.is_active_organisation_member(organisation_id)));

drop policy if exists "Organisation admins can update settings" on public.organisation_settings;
create policy "Organisation admins can update settings"
on public.organisation_settings
for update
using ((select public.is_organisation_admin(organisation_id)))
with check ((select public.is_organisation_admin(organisation_id)));
