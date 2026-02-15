-- Email compliance + deliverability fields for fozzies.clients
alter table if exists fozzies.clients
  add column if not exists unsubscribed_at timestamptz,
  add column if not exists suppressed_reason text,
  add column if not exists suppressed_at timestamptz,
  add column if not exists resend_contact_id text,
  add column if not exists unsubscribe_token text;

-- Ensure common indexes exist
create index if not exists idx_clients_email on fozzies.clients (email);
create index if not exists idx_clients_unsubscribed on fozzies.clients (unsubscribed);
create index if not exists idx_clients_suppressed_at on fozzies.clients (suppressed_at);
create index if not exists idx_clients_suppressed_reason on fozzies.clients (suppressed_reason);
create unique index if not exists idx_clients_unsubscribe_token on fozzies.clients (unsubscribe_token) where unsubscribe_token is not null;

-- Optional: event log table for provider webhooks
create table if not exists fozzies.email_events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  type text not null,
  email text,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists idx_email_events_created_at on fozzies.email_events (created_at desc);
create index if not exists idx_email_events_type on fozzies.email_events (type);
create index if not exists idx_email_events_email on fozzies.email_events (email);
