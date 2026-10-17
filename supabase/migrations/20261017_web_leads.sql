-- Leads from the brightscalegroup.com contact form (web-lead Edge Function).
create table if not exists private.web_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  zip text,
  project text,
  start_when text,
  details text,
  sms_consent boolean not null default false,
  sms_consent_text text,
  language text,
  page text,
  estimate jsonb not null default '{}'::jsonb,
  ip text,
  user_agent text,
  telegram_status text not null default 'pending' check (telegram_status in ('pending','sent','failed')),
  internal_email_status text not null default 'pending' check (internal_email_status in ('pending','sent','failed','skipped')),
  customer_email_status text not null default 'pending' check (customer_email_status in ('pending','sent','failed','skipped')),
  email_provider text,
  last_error text,
  created_at timestamptz not null default now()
);
alter table private.web_leads enable row level security;
revoke all on private.web_leads from anon, authenticated;
grant all on private.web_leads to postgres, service_role;
create index if not exists web_leads_created_idx on private.web_leads(created_at desc);
create index if not exists web_leads_ip_idx on private.web_leads(ip, created_at desc);
