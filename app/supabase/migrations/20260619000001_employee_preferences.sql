-- ============================================================================
-- Preferenze dipendente — compilate nella dashboard "Completa profilo".
-- ============================================================================
-- has_vehicle      : "Auto munito?" (sì/no). È il prerequisito per navetta_driver.
-- service_zones    : tipo di zona/servizio in cui opera (centro / periferia /
--                    eventi privati / navetta). Niente prezzi.
-- availability_pref: tipo di impiego CERCATO dal dipendente (full_time / part_time
--                    / on_call). ATTENZIONE: è una PREFERENZA del lavoratore, NON
--                    il contratto legale. Il contract_type legale resta admin-only
--                    (vedi RLS "employees: self insert" che forza contract_type NULL).
-- ----------------------------------------------------------------------------
alter table public.employees
  add column if not exists has_vehicle       boolean not null default false,
  add column if not exists service_zones     text[]  not null default '{}',
  add column if not exists availability_pref text
    check (availability_pref is null or availability_pref in ('full_time','part_time','on_call'));

comment on column public.employees.has_vehicle       is 'Auto munito (prerequisito navetta_driver) — preferenza dipendente';
comment on column public.employees.service_zones     is 'Tipi di zona/servizio: centro|periferia|eventi|navetta';
comment on column public.employees.availability_pref is 'Impiego cercato dal dipendente: full_time|part_time|on_call (preferenza, non il contratto legale)';
