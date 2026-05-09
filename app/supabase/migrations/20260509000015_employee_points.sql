-- ATS-v1 · Migrazione 16: sistema punti / rank dipendenti
-- ----------------------------------------------------------------------------
-- Schema gamification: ogni evento positivo/negativo genera un'entry in
-- `employee_points` (audit completo). La view `employee_total_points`
-- aggrega per dipendente con punti totali + livello calcolato.
--
-- Eventi che generano punti (gestiti da trigger):
--   +100 turno completato (shift_completed)
--   +50  recensione 5★ ricevuta (review_5stars)
--   +30  recensione 4★ ricevuta
--   -100 no-show (shift_no_show)
--   +200 documento HACCP/idoneità verificato dall'admin (doc_verified)
--   +500 onboarding completato (onboarding_completed) — assegnato all'inserimento
--
-- I punti negativi sono record con `points` negativo, non sottrazioni.
-- Per mostrare lo storico user-friendly senza calcoli ricorsivi.
-- ----------------------------------------------------------------------------

create type public.points_source_type as enum (
  'shift_completed',
  'review_5stars',
  'review_4stars',
  'shift_no_show',
  'doc_verified',
  'onboarding_completed',
  'admin_adjustment'              -- correzione manuale dall'admin
);

create table public.employee_points (
  id            uuid primary key default gen_random_uuid(),
  employee_id   uuid not null references public.employees (id) on delete cascade,
  source_type   public.points_source_type not null,
  source_id     uuid,                         -- shift.id, review.id, document.id...
  points        integer not null,             -- positivo o negativo
  reason        text,                         -- copy human-readable per UI
  created_at    timestamptz not null default now(),
  awarded_by    uuid references public.profiles (id) on delete set null
);

create index employee_points_employee_idx on public.employee_points (employee_id, created_at desc);
create index employee_points_source_idx   on public.employee_points (source_type, source_id);

-- Vincolo soft: niente double-award per stessa source (id+type unique
-- quando source_id non è null). Per admin_adjustment lo lasciamo aperto.
create unique index employee_points_unique_source_idx
  on public.employee_points (employee_id, source_type, source_id)
  where source_id is not null;

-- ----------------------------------------------------------------------------
-- View aggregata con livello
-- ----------------------------------------------------------------------------
create or replace view public.employee_total_points as
with totals as (
  select employee_id, coalesce(sum(points), 0)::integer as total_points
    from public.employee_points
    group by employee_id
),
all_emps as (
  select id as employee_id from public.employees
)
select
  ae.employee_id,
  coalesce(t.total_points, 0) as total_points,
  case
    when coalesce(t.total_points, 0) >= 3500 then 'ambassador'
    when coalesce(t.total_points, 0) >= 2000 then 'elite'
    when coalesce(t.total_points, 0) >= 1200 then 'senior'
    when coalesce(t.total_points, 0) >= 500  then 'affidabile'
    else 'rookie'
  end as level
from all_emps ae
left join totals t on t.employee_id = ae.employee_id;

grant select on public.employee_total_points to authenticated;

-- ----------------------------------------------------------------------------
-- Trigger: turno completato → +100
-- ----------------------------------------------------------------------------
create or replace function public.tg_shifts_award_points()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- shift_completed: +100 al passaggio a 'completed'.
  if new.status = 'completed' and old.status is distinct from 'completed' and new.employee_id is not null then
    insert into public.employee_points (employee_id, source_type, source_id, points, reason)
    values (new.employee_id, 'shift_completed', new.id, 100,
            'Turno completato del ' || to_char(new.shift_date, 'DD/MM/YYYY'))
    on conflict (employee_id, source_type, source_id) do nothing;
  end if;

  -- shift_no_show: -100 al passaggio a 'no_show'.
  if new.status = 'no_show' and old.status is distinct from 'no_show' and old.employee_id is not null then
    insert into public.employee_points (employee_id, source_type, source_id, points, reason)
    values (old.employee_id, 'shift_no_show', new.id, -100,
            'No-show turno del ' || to_char(new.shift_date, 'DD/MM/YYYY'))
    on conflict (employee_id, source_type, source_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists shifts_award_points on public.shifts;
create trigger shifts_award_points
  after insert or update on public.shifts
  for each row execute function public.tg_shifts_award_points();

-- ----------------------------------------------------------------------------
-- Trigger: recensione struttura→employee → +50 (5★) / +30 (4★)
-- ----------------------------------------------------------------------------
create or replace function public.tg_reviews_award_points()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_shift  public.shifts%rowtype;
  v_pts    integer;
  v_type   public.points_source_type;
begin
  if new.reviewer_role <> 'structure' then return new; end if;
  select * into v_shift from public.shifts where id = new.shift_id;
  if not found or v_shift.employee_id is null then return new; end if;

  if new.rating = 5 then v_pts := 50;  v_type := 'review_5stars';
  elsif new.rating = 4 then v_pts := 30; v_type := 'review_4stars';
  else return new;                          -- ★1-3 niente bonus
  end if;

  insert into public.employee_points (employee_id, source_type, source_id, points, reason)
  values (v_shift.employee_id, v_type, new.id, v_pts,
          'Recensione ' || new.rating || '★ per turno del ' || to_char(v_shift.shift_date, 'DD/MM'))
  on conflict (employee_id, source_type, source_id) do nothing;
  return new;
end;
$$;

drop trigger if exists reviews_award_points on public.reviews;
create trigger reviews_award_points
  after insert on public.reviews
  for each row execute function public.tg_reviews_award_points();

-- ----------------------------------------------------------------------------
-- Trigger: documento HACCP/idoneità verificato dall'admin → +200
-- ----------------------------------------------------------------------------
create or replace function public.tg_documents_award_points()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.verified_at is not null and old.verified_at is null
     and new.type in ('haccp', 'health_cert') then
    insert into public.employee_points (employee_id, source_type, source_id, points, reason, awarded_by)
    values (new.employee_id, 'doc_verified', new.id, 200,
            'Documento ' || new.type || ' verificato',
            new.verified_by)
    on conflict (employee_id, source_type, source_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists documents_award_points on public.documents;
create trigger documents_award_points
  after update on public.documents
  for each row execute function public.tg_documents_award_points();

-- ----------------------------------------------------------------------------
-- Trigger: employees insert → +500 onboarding bonus
-- ----------------------------------------------------------------------------
create or replace function public.tg_employees_award_onboarding()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Solo se onboarding_completed_at è valorizzato (significa che il wizard
  -- è davvero stato fatto, non un INSERT amministrativo).
  if new.onboarding_completed_at is not null then
    insert into public.employee_points (employee_id, source_type, source_id, points, reason)
    values (new.id, 'onboarding_completed', new.id, 500,
            'Bonus completamento profilo')
    on conflict (employee_id, source_type, source_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists employees_award_onboarding on public.employees;
create trigger employees_award_onboarding
  after insert on public.employees
  for each row execute function public.tg_employees_award_onboarding();

-- ----------------------------------------------------------------------------
-- Backfill: assegna i +500 onboarding agli employees già esistenti.
-- ----------------------------------------------------------------------------
insert into public.employee_points (employee_id, source_type, source_id, points, reason)
select id, 'onboarding_completed', id, 500, 'Bonus completamento profilo (backfill)'
  from public.employees
 where onboarding_completed_at is not null
on conflict (employee_id, source_type, source_id) do nothing;

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.employee_points enable row level security;

create policy "employee_points: admin all"
  on public.employee_points for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "employee_points: own select"
  on public.employee_points for select
  using (employee_id = auth.uid());

grant select on public.employee_points to authenticated;
