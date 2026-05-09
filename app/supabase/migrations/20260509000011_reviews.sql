-- ATS-v1 · Migrazione 12: recensioni post-turno
-- ----------------------------------------------------------------------------
-- Modello bilaterale: per ogni turno 'completed' la struttura recensisce il
-- dipendente E il dipendente recensisce la struttura. Una sola recensione per
-- coppia (shift_id, reviewer_id) — l'unique vincolo lo garantisce.
--
-- Volutamente NIENTE blind/timeline anti-bias per MVP: ognuno vede subito
-- la recensione che ha ricevuto, anche se non ne ha ancora scritta una.
-- Lo aggiungeremo quando il volume di recensioni sarà significativo.
-- ----------------------------------------------------------------------------

create type public.review_role as enum ('structure', 'employee');

create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  shift_id      uuid not null references public.shifts (id) on delete cascade,
  reviewer_id   uuid not null references public.profiles (id) on delete cascade,
  reviewer_role public.review_role not null,
  rating        integer not null check (rating between 1 and 5),
  tags          text[] not null default '{}',
  comment       text check (comment is null or length(comment) <= 1000),
  created_at    timestamptz not null default now(),

  -- Una sola recensione per coppia (shift, reviewer).
  unique (shift_id, reviewer_id)
);

create index reviews_shift_idx        on public.reviews (shift_id);
create index reviews_reviewer_idx     on public.reviews (reviewer_id);
create index reviews_role_idx         on public.reviews (reviewer_role);

comment on table public.reviews is
  'Recensioni bilaterali post-turno: structure→employee e employee→structure.';

-- ----------------------------------------------------------------------------
-- Trigger: validazione che il reviewer sia legittimamente parte del turno
-- e che lo stato sia 'completed'.
-- ----------------------------------------------------------------------------
create or replace function public.tg_reviews_validate()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_shift     public.shifts%rowtype;
  v_struct    public.structures%rowtype;
  v_uid       uuid := auth.uid();
  v_role      public.user_role;
begin
  v_role := public.current_user_role();

  -- Admin bypass: può creare/modificare recensioni a fini di moderazione.
  if v_role = 'admin' then
    return new;
  end if;

  select * into v_shift from public.shifts where id = new.shift_id;
  if not found then
    raise exception 'Turno non trovato' using errcode = '02000';
  end if;
  if v_shift.status <> 'completed' then
    raise exception 'Si possono recensire solo turni completati' using errcode = '22023';
  end if;

  if new.reviewer_role = 'employee' then
    -- Reviewer = il dipendente assegnato al turno.
    if v_shift.employee_id is distinct from v_uid then
      raise exception 'Non sei il dipendente di questo turno' using errcode = '42501';
    end if;
    if new.reviewer_id <> v_uid then
      raise exception 'reviewer_id deve coincidere con auth.uid()' using errcode = '42501';
    end if;
  elsif new.reviewer_role = 'structure' then
    -- Reviewer = un utente della struttura di quel turno.
    select * into v_struct from public.structures where id = v_shift.structure_id;
    if not found or v_struct.user_id <> v_uid then
      raise exception 'Non sei il referente di questa struttura' using errcode = '42501';
    end if;
    if new.reviewer_id <> v_uid then
      raise exception 'reviewer_id deve coincidere con auth.uid()' using errcode = '42501';
    end if;
  else
    raise exception 'reviewer_role non valido' using errcode = '22023';
  end if;

  return new;
end;
$$;

drop trigger if exists reviews_validate on public.reviews;
create trigger reviews_validate
  before insert or update on public.reviews
  for each row execute function public.tg_reviews_validate();

-- ----------------------------------------------------------------------------
-- Vista materializzata leggera: rating medio per dipendente / struttura.
-- Usata dalle dashboard. Niente refresh automatico, è un select aggregato.
-- (View normale, non materialized: i volumi MVP sono bassi.)
-- ----------------------------------------------------------------------------
create or replace view public.employee_rating_summary as
select
  s.employee_id                   as employee_id,
  count(r.*)                      as total_reviews,
  round(avg(r.rating)::numeric, 2) as avg_rating
from public.reviews r
join public.shifts  s on s.id = r.shift_id
where r.reviewer_role = 'structure'
  and s.employee_id is not null
group by s.employee_id;

create or replace view public.structure_rating_summary as
select
  s.structure_id                  as structure_id,
  count(r.*)                      as total_reviews,
  round(avg(r.rating)::numeric, 2) as avg_rating
from public.reviews r
join public.shifts  s on s.id = r.shift_id
where r.reviewer_role = 'employee'
group by s.structure_id;

grant select on public.employee_rating_summary  to authenticated;
grant select on public.structure_rating_summary to authenticated;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.reviews enable row level security;

-- Admin: tutto.
create policy "reviews: admin all"
  on public.reviews for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Reviewer: select e insert/update sulle proprie recensioni.
create policy "reviews: reviewer select own"
  on public.reviews for select
  using (reviewer_id = auth.uid());

create policy "reviews: reviewer insert own"
  on public.reviews for insert
  with check (reviewer_id = auth.uid());

create policy "reviews: reviewer update own"
  on public.reviews for update
  using (reviewer_id = auth.uid())
  with check (reviewer_id = auth.uid());

-- Recipient employee: vede le recensioni structure→employee dei propri turni.
create policy "reviews: employee select received"
  on public.reviews for select
  using (
    reviewer_role = 'structure'
    and exists (
      select 1 from public.shifts s
      where s.id = reviews.shift_id and s.employee_id = auth.uid()
    )
  );

-- Recipient structure: vede le recensioni employee→structure sui propri turni.
create policy "reviews: structure select received"
  on public.reviews for select
  using (
    reviewer_role = 'employee'
    and exists (
      select 1 from public.shifts s
      where s.id = reviews.shift_id
        and s.structure_id in (select id from public.structures where user_id = auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- GRANT espliciti
-- ----------------------------------------------------------------------------
grant select, insert, update on public.reviews to authenticated;
