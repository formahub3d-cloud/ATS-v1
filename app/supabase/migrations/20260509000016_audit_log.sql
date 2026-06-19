-- ATS-v1 · Migrazione 17: audit log centralizzato
-- ----------------------------------------------------------------------------
-- Tabella `audit_log` che traccia gli eventi critici della piattaforma:
--   - Approvazione/rifiuto/sospensione struttura
--   - Assegnazione/cancellazione turno
--   - Verifica/sblocco documento
--   - Aggiustamenti punti manuali
--   - Cambi ruolo utente
--
-- Solo admin può leggere il log (è un audit di sicurezza).
-- ----------------------------------------------------------------------------

create type public.audit_event_type as enum (
  'structure_approved',
  'structure_rejected',
  'structure_suspended',
  'shift_assigned',
  'shift_cancelled',
  'shift_completed',
  'shift_no_show',
  'document_verified',
  'document_deleted',
  'employee_activated',
  'employee_deactivated',
  'role_changed',
  'points_adjusted'
);

create table public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  event_type   public.audit_event_type not null,
  actor_id     uuid references public.profiles (id) on delete set null,    -- chi ha fatto l'azione (NULL se trigger automatico)
  target_type  text not null,                                              -- 'structure' | 'employee' | 'shift' | 'document' | 'profile'
  target_id    uuid,                                                       -- id della riga toccata
  metadata     jsonb,                                                      -- payload contestuale (es. {"old_status": "open", "new_status": "assigned"})
  created_at   timestamptz not null default now()
);

create index audit_log_event_idx   on public.audit_log (event_type, created_at desc);
create index audit_log_actor_idx   on public.audit_log (actor_id, created_at desc);
create index audit_log_target_idx  on public.audit_log (target_type, target_id);
create index audit_log_recent_idx  on public.audit_log (created_at desc);

-- ----------------------------------------------------------------------------
-- Trigger: cambio status structures → audit log
-- ----------------------------------------------------------------------------
create or replace function public.tg_structures_audit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_event public.audit_event_type;
begin
  if new.status = old.status then return new; end if;

  v_event := case new.status
    when 'approved'  then 'structure_approved'::public.audit_event_type
    when 'rejected'  then 'structure_rejected'::public.audit_event_type
    when 'suspended' then 'structure_suspended'::public.audit_event_type
    else null
  end;
  if v_event is null then return new; end if;

  insert into public.audit_log (event_type, actor_id, target_type, target_id, metadata)
  values (
    v_event,
    auth.uid(),
    'structure',
    new.id,
    jsonb_build_object(
      'ragione_sociale', new.ragione_sociale,
      'old_status', old.status,
      'new_status', new.status,
      'rejection_reason', new.rejection_reason
    )
  );
  return new;
end;
$$;

drop trigger if exists structures_audit on public.structures;
create trigger structures_audit
  after update on public.structures
  for each row execute function public.tg_structures_audit();

-- ----------------------------------------------------------------------------
-- Trigger: cambio status shifts → audit log
-- ----------------------------------------------------------------------------
create or replace function public.tg_shifts_audit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_event public.audit_event_type;
begin
  if tg_op = 'INSERT' then return new; end if;
  if new.status = old.status then return new; end if;

  v_event := case new.status
    when 'assigned'  then 'shift_assigned'::public.audit_event_type
    when 'cancelled' then 'shift_cancelled'::public.audit_event_type
    when 'completed' then 'shift_completed'::public.audit_event_type
    when 'no_show'   then 'shift_no_show'::public.audit_event_type
    else null
  end;
  if v_event is null then return new; end if;

  insert into public.audit_log (event_type, actor_id, target_type, target_id, metadata)
  values (
    v_event,
    auth.uid(),
    'shift',
    new.id,
    jsonb_build_object(
      'role', new.role,
      'shift_date', new.shift_date,
      'structure_id', new.structure_id,
      'employee_id', new.employee_id,
      'old_status', old.status,
      'new_status', new.status
    )
  );
  return new;
end;
$$;

drop trigger if exists shifts_audit on public.shifts;
create trigger shifts_audit
  after update on public.shifts
  for each row execute function public.tg_shifts_audit();

-- ----------------------------------------------------------------------------
-- Trigger: documento verificato → audit log
-- ----------------------------------------------------------------------------
create or replace function public.tg_documents_audit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.verified_at is not null and old.verified_at is null then
    insert into public.audit_log (event_type, actor_id, target_type, target_id, metadata)
    values (
      'document_verified',
      auth.uid(),
      'document',
      new.id,
      jsonb_build_object(
        'employee_id', new.employee_id,
        'doc_type', new.type
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists documents_audit on public.documents;
create trigger documents_audit
  after update on public.documents
  for each row execute function public.tg_documents_audit();

-- ----------------------------------------------------------------------------
-- Trigger: cambio role profile → audit log
-- ----------------------------------------------------------------------------
create or replace function public.tg_profiles_audit_role()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role = old.role then return new; end if;
  insert into public.audit_log (event_type, actor_id, target_type, target_id, metadata)
  values (
    'role_changed',
    auth.uid(),
    'profile',
    new.id,
    jsonb_build_object(
      'old_role', old.role,
      'new_role', new.role,
      'full_name', new.full_name
    )
  );
  return new;
end;
$$;

drop trigger if exists profiles_audit_role on public.profiles;
create trigger profiles_audit_role
  after update on public.profiles
  for each row execute function public.tg_profiles_audit_role();

-- ----------------------------------------------------------------------------
-- Trigger: cambio active employees → audit log
-- ----------------------------------------------------------------------------
create or replace function public.tg_employees_audit_active()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.active = old.active then return new; end if;
  insert into public.audit_log (event_type, actor_id, target_type, target_id, metadata)
  values (
    case when new.active then 'employee_activated' else 'employee_deactivated' end,
    auth.uid(),
    'employee',
    new.id,
    jsonb_build_object('old_active', old.active, 'new_active', new.active)
  );
  return new;
end;
$$;

drop trigger if exists employees_audit_active on public.employees;
create trigger employees_audit_active
  after update on public.employees
  for each row execute function public.tg_employees_audit_active();

-- ----------------------------------------------------------------------------
-- RLS: solo admin legge il log
-- ----------------------------------------------------------------------------
alter table public.audit_log enable row level security;

create policy "audit_log: admin select"
  on public.audit_log for select
  using (public.current_user_role() = 'admin');

-- INSERT solo via trigger (security definer); nessuna policy diretta.

grant select on public.audit_log to authenticated;
