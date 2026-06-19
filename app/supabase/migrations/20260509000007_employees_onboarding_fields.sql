-- ATS-v1 · Migrazione 8: estendi employees con i campi del wizard di onboarding
-- ----------------------------------------------------------------------------
-- La tabella employees nasceva come "anagrafica fiscale". Il wizard di
-- onboarding employee 8-step però raccoglie altre cose (video attestazione,
-- esperienze pregresse, tag valori motivazionali, preferenze zona/paga,
-- ecc.). Aggiungiamo le colonne mancanti e il trigger che impedisce
-- ai non-admin di toccare i campi finanziari/contrattuali.
-- ----------------------------------------------------------------------------

alter table public.employees
  add column if not exists video_attestation_path text,
  add column if not exists experiences            jsonb not null default '[]'::jsonb,
  add column if not exists certifications         jsonb not null default '[]'::jsonb,
  add column if not exists preferred_zone         text,
  add column if not exists min_hourly_rate        numeric(10, 2),
  add column if not exists tag_valori             text[] not null default '{}',
  add column if not exists navetta_driver         boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz;

comment on column public.employees.video_attestation_path is
  'Path nel bucket employee-docs per il video di attestazione registrato in onboarding.';
comment on column public.employees.experiences is
  'Array di esperienze pregresse: [{ruolo, tipoStruttura, periodoDa, periodoA}].';
comment on column public.employees.certifications is
  'Array di certificazioni dichiarate: [{tipo, rilascio, scadenza}]. Per il file vero, vedi la tabella documents.';
comment on column public.employees.tag_valori is
  'Tag motivazionali/valori dichiarati dal dipendente (flessibilita, paga_equa, crescita...).';

-- ----------------------------------------------------------------------------
-- Trigger: blocca i campi admin-only (paga, contratto, attivazione) quando
-- l'update è fatto dal dipendente stesso. Stesso pattern usato per structures.
-- ----------------------------------------------------------------------------
create or replace function public.tg_employees_protect_admin_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if public.current_user_role() <> 'admin' then
    if new.contract_type     is distinct from old.contract_type     then
      raise exception 'Solo admin può cambiare contract_type' using errcode = '42501';
    end if;
    if new.hourly_rate       is distinct from old.hourly_rate       then
      raise exception 'Solo admin può cambiare hourly_rate' using errcode = '42501';
    end if;
    if new.hire_date         is distinct from old.hire_date         then
      raise exception 'Solo admin può cambiare hire_date' using errcode = '42501';
    end if;
    if new.termination_date  is distinct from old.termination_date  then
      raise exception 'Solo admin può cambiare termination_date' using errcode = '42501';
    end if;
    if new.active            is distinct from old.active            then
      raise exception 'Solo admin può attivare/disattivare il dipendente' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists employees_protect_admin_fields on public.employees;
create trigger employees_protect_admin_fields
  before update on public.employees
  for each row execute function public.tg_employees_protect_admin_fields();

-- ----------------------------------------------------------------------------
-- INSERT self-service: durante l'onboarding il dipendente crea il proprio
-- record subito dopo signUp. Va aggiunta una policy INSERT (assente nella
-- mig 3, che aveva solo SELECT/UPDATE).
-- ----------------------------------------------------------------------------
create policy "employees: self insert"
  on public.employees for insert
  with check (
    auth.uid() = id
    and (active is null or active = true)        -- niente trick di disattivazione
    and contract_type is null                    -- contract_type lo setta admin
    and hourly_rate is null                      -- pagaminima va in min_hourly_rate, non hourly_rate
    and hire_date is null
  );
