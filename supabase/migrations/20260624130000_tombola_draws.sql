create table if not exists tombola_draws (
  id uuid primary key default gen_random_uuid(),
  participant_count integer not null default 0,
  prizes_json jsonb not null default '[]',
  winners_json jsonb not null default '[]',
  drawn_at timestamptz not null default now()
);
