-- ATS-v1 · Migrazione 15: app_settings (key/value globale)
-- ----------------------------------------------------------------------------
-- Tabella semplice key/value per tenere parametri globali editabili dagli
-- admin (tariffe zone, fee struttura, soglie rank, ecc.).
-- Approccio "singolo blob JSON per categoria" per evitare schema rigido.
-- ----------------------------------------------------------------------------

create table public.app_settings (
  key         text primary key,
  value       jsonb not null,
  updated_by  uuid references public.profiles (id) on delete set null,
  updated_at  timestamptz not null default now()
);

comment on table public.app_settings is
  'Configurazioni globali editabili dagli admin. Una riga per categoria (tariffe, fee, rank, ecc.).';

-- Trigger updated_at.
drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row execute function public.tg_set_updated_at();

-- Seed dei valori di default (solo se non esistono).
insert into public.app_settings (key, value) values
  ('hourly_rates_by_zone', '{
    "Centro": 18.00,
    "Periferia": 14.00,
    "Industriale": 13.00,
    "Eventi": 16.00,
    "Resort": 14.00,
    "Fuori città": 12.00
  }'::jsonb),
  ('structure_fee', '{
    "annual": 900,
    "currency": "EUR",
    "discount_threshold_shifts": 100,
    "discount_percent": 10
  }'::jsonb),
  ('rank_thresholds', '{
    "rookie": 0,
    "affidabile": 500,
    "senior": 1200,
    "elite": 2000,
    "ambassador": 3500
  }'::jsonb)
on conflict (key) do nothing;

-- RLS
alter table public.app_settings enable row level security;

-- Admin: tutto.
create policy "app_settings: admin all"
  on public.app_settings for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Authenticated (struttura/employee): può LEGGERE i settings (per mostrare
-- es. tariffe nella UI), non scrivere.
create policy "app_settings: authenticated read"
  on public.app_settings for select
  to authenticated
  using (true);

grant select, insert, update on public.app_settings to authenticated;
