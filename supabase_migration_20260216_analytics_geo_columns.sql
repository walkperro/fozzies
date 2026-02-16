alter table fozzies.analytics_events add column if not exists city text;
alter table fozzies.analytics_events add column if not exists region text;
alter table fozzies.analytics_events add column if not exists country text;

create index if not exists idx_analytics_events_city
  on fozzies.analytics_events (city);

create index if not exists idx_analytics_events_country
  on fozzies.analytics_events (country);
