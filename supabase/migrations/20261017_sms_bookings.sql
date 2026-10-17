-- SMS confirmation funnel (sms-funnel Edge Function): a proposed appointment waits for YES.
create table if not exists private.sms_bookings (
  id uuid primary key default gen_random_uuid(),
  phone text not null,                 -- E.164, e.g. +19545041068
  customer_name text,
  customer_email text,
  booking_type text not null default 'video' check (booking_type in ('video','in_person')),
  proposed_start timestamptz not null,
  proposed_label text,
  alternatives jsonb not null default '[]'::jsonb,  -- other open slots offered if the first is taken
  summary text,
  source text,                         -- test | vapi | web
  status text not null default 'proposed' check (status in ('proposed','confirmed','declined','expired','failed')),
  meet_url text,
  event_id text,
  last_inbound text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table private.sms_bookings enable row level security;
revoke all on private.sms_bookings from anon, authenticated;
grant all on private.sms_bookings to postgres, service_role;
create index if not exists sms_bookings_phone_idx on private.sms_bookings(phone, created_at desc);

create table if not exists private.sms_messages (
  id bigserial primary key,
  direction text not null check (direction in ('out','in')),
  phone text not null,
  body text,
  twilio_sid text,
  booking_id uuid,
  created_at timestamptz not null default now()
);
alter table private.sms_messages enable row level security;
revoke all on private.sms_messages from anon, authenticated;
grant all on private.sms_messages, private.sms_messages_id_seq to postgres, service_role;
