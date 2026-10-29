-- Lead-conversion CRM behind brightscalegroup.com/painel (applied to brightscale-scanner on 2026-10-28).
create table if not exists private.crm_users (
  email text primary key check (email = lower(email)),
  name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists private.crm_login_tokens (
  token_hash text primary key,
  email text not null references private.crm_users(email) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  ip text,
  created_at timestamptz not null default now()
);
create index if not exists crm_login_tokens_email_idx on private.crm_login_tokens(email, created_at desc);
create table if not exists private.crm_sessions (
  token_hash text primary key,
  email text not null references private.crm_users(email) on delete cascade,
  expires_at timestamptz not null,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);
-- Manual outcome per lead: what the automatic data cannot know (won/lost, value, why)
create table if not exists private.lead_outcomes (
  source text not null check (source in ('home_depot','brighty_call','site','whatsapp')),
  lead_id uuid not null,
  outcome text not null default 'open' check (outcome in ('open','won','lost','test')),
  job_value numeric(12,2),
  lost_reason text,
  notes text,
  updated_by text,
  updated_at timestamptz not null default now(),
  primary key (source, lead_id)
);
-- Diary of what changed in the funnel, to explain shifts in the numbers
create table if not exists private.crm_changelog (
  id uuid primary key default gen_random_uuid(),
  happened_on date not null,
  title text not null,
  details text,
  created_by text,
  created_at timestamptz not null default now()
);
alter table private.crm_users enable row level security;
alter table private.crm_login_tokens enable row level security;
alter table private.crm_sessions enable row level security;
alter table private.lead_outcomes enable row level security;
alter table private.crm_changelog enable row level security;

-- Who may sign in (add more with: insert into private.crm_users(email, name) values ('x@y.com','Nome');)
insert into private.crm_users(email, name) values
  ('brightscalegroup@gmail.com','Paulo'),
  ('paulolibanionetousa@gmail.com','Paulo')
on conflict do nothing;
