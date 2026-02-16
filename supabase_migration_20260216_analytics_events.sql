create extension if not exists pgcrypto;

create table if not exists fozzies.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_type text not null,
  page_path text null,
  referrer text null,
  utm_source text null,
  utm_medium text null,
  utm_campaign text null,
  utm_term text null,
  utm_content text null,
  visitor_id text null,
  user_agent text null,
  device text null,
  meta jsonb not null default '{}'::jsonb
);

create index if not exists idx_analytics_events_created_at_desc
  on fozzies.analytics_events (created_at desc);

create index if not exists idx_analytics_events_event_type
  on fozzies.analytics_events (event_type);

create index if not exists idx_analytics_events_page_path
  on fozzies.analytics_events (page_path);

create index if not exists idx_analytics_events_utm_source_medium
  on fozzies.analytics_events (utm_source, utm_medium);

create index if not exists idx_analytics_events_visitor_id
  on fozzies.analytics_events (visitor_id);
