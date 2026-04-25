create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  mobile_number text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists otp_codes_mobile_idx on public.otp_codes(mobile_number, created_at desc);

alter table public.otp_codes enable row level security;

create or replace function public.cleanup_expired_otps()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.otp_codes where expires_at < now() - interval '1 day';
$$;