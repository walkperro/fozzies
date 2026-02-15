-- fozzies schema notes for new admin dashboard sections
-- TODO: apply this in a proper migration flow (Supabase CLI / SQL migrations) before production.

create schema if not exists fozzies;

create extension if not exists pgcrypto;

create table if not exists fozzies.announcements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  body text not null,
  pinned boolean not null default false,
  is_published boolean not null default true,
  starts_at timestamptz null,
  ends_at timestamptz null
);

create table if not exists fozzies.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text null,
  email text not null unique,
  unsubscribed boolean not null default false
);

create table if not exists fozzies.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Optional trigger to keep updated_at fresh on writes.
-- TODO: add/update trigger function if your project does not already include one.
-- create function set_updated_at() returns trigger ...
-- create trigger ... before update on fozzies.announcements/site_settings ...

-- Seed keys expected by the app after migrations:
-- key = 'menu_html' (JSON payload containing MENU_META and MENU_SECTIONS)
-- key = 'menu_pdf'  (JSON payload: { "path": "...", "updatedAt": "..." })
