create extension if not exists pgcrypto;

create schema if not exists fozzies;

create table if not exists fozzies.job_applicants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text null,
  position text not null,
  availability text null,
  message text not null,
  website text null,
  status text not null default 'new',
  admin_note text null,
  source text not null default 'website',
  user_agent text null,
  ip_hash text null,
  deleted_at timestamptz null,
  constraint job_applicants_status_check check (status in ('new', 'reviewed', 'archived'))
);

create index if not exists job_applicants_created_at_desc_idx on fozzies.job_applicants (created_at desc);
create index if not exists job_applicants_status_idx on fozzies.job_applicants (status);
create index if not exists job_applicants_email_lower_idx on fozzies.job_applicants ((lower(email)));

alter table fozzies.job_applicants enable row level security;

-- No anon/public read/update/delete policies are created.
-- Server-side API writes use service role and bypass RLS safely.
