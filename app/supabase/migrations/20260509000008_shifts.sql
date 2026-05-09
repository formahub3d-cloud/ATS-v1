-- ATS-v1 · Migrazione 9: schema turni (shifts) + matching base
-- ----------------------------------------------------------------------------
-- Modello MVP per i turni:
-- - `shifts`: ogni richiesta di personale fatta da una struttura per una data
--   specifica. Status workflow: open → assigned → in_progress → completed
--   (oppure cancelled / no_show). Quando assigned, employee_id contiene il
--   dipendente che eseguirà il turno.
-- - `shift_likes`: like/skip dei dipendenti sui turni open. Tipo Tinder:
--   l'employee fa like → la struttura vede chi ha messo like e conferma.
--   shift_likes.action = 'like' | 'skip'. Una sola riga per coppia (shift, employee).
--
-- Decisioni di design intenzionali:
-- - Nessun campo "paga totale calcolata" persisitito: si calcola al volo
--   da hourly_rate * ore. Tabella `shifts.hourly_rate` è snapshot al momento
--   della creazione (la paga del singolo turno non cambia se la struttura
--   modifica il default più tardi).
-- - check_in_at / check_out_at sui shifts (non in tabella separata) finché
--   non avremo eventi tipo break/pause da tracciare.
-- - qr_token random generato server-side al passaggio a 'assigned',
--   usato dall'employee per check-in via scanner QR.
-- ----------------------------------------------------------------------------

create type public.shift_status as enum (
  'open',         -- pubblicato, in attesa di assegnazione
  'assigned',     -- assegnato a un dipendente specifico (qr_token generato)
  'in_progress',  -- check-in fatto, turno in corso
  'completed',    -- check-out fatto, completato regolarmente
  'cancelled',    -- annullato (da struttura o admin)
  'no_show'       -- dipendente non si è presentato
);

create type public.shift_like_action as enum ('like', 'skip');

create table public.shifts (
  id              uuid primary key default gen_random_uuid(),

  structure_id    uuid not null references public.structures (id) on delete cascade,
  employee_id     uuid references public.employees (id) on delete set null,
  status          public.shift_status not null default 'open',

  -- Definizione del turno
  shift_date      date not null,
  time_start      time not null,
  time_end        time not null,
  role            text not null,               -- es. Cameriere, Chef de Partie...
  notes           text,

  -- Compenso (snapshot al momento della creazione)
  hourly_rate     numeric(10, 2) not null,
  estimated_hours numeric(5, 2),               -- calcolata UI; nullable per orari "spezzati"

  -- Check-in / Check-out
  qr_token        text unique,                  -- generato all'assegnazione, usato per check-in
  check_in_at     timestamptz,
  check_out_at    timestamptz,
  check_in_lat    numeric(9, 6),
  check_in_lng    numeric(9, 6),
  no_show_reason  text,

  -- Audit
  created_by      uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  assigned_at     timestamptz,
  cancelled_at    timestamptz,
  cancellation_reason text
);

comment on table public.shifts is
  'Turni richiesti dalle strutture e assegnabili ai dipendenti.';

create index shifts_structure_idx       on public.shifts (structure_id);
create index shifts_employee_idx        on public.shifts (employee_id) where employee_id is not null;
create index shifts_status_idx          on public.shifts (status);
create index shifts_date_idx            on public.shifts (shift_date);
create index shifts_role_idx            on public.shifts (role);
create index shifts_open_compat_idx     on public.shifts (status, shift_date) where status = 'open';
-- Unique sul qr_token già implicato dalla colonna; index esplicito per lookup rapidi
create index shifts_qr_token_idx        on public.shifts (qr_token) where qr_token is not null;

create trigger shifts_set_updated_at
  before update on public.shifts
  for each row execute function public.tg_set_updated_at();

-- ----------------------------------------------------------------------------
-- shift_likes: tracking like/skip degli employee sui turni open
-- ----------------------------------------------------------------------------
create table public.shift_likes (
  id           uuid primary key default gen_random_uuid(),
  shift_id     uuid not null references public.shifts (id) on delete cascade,
  employee_id  uuid not null references public.employees (id) on delete cascade,
  action       public.shift_like_action not null,
  created_at   timestamptz not null default now(),

  unique (shift_id, employee_id)
);

create index shift_likes_shift_idx     on public.shift_likes (shift_id);
create index shift_likes_employee_idx  on public.shift_likes (employee_id);
create index shift_likes_likes_idx     on public.shift_likes (shift_id) where action = 'like';

-- ----------------------------------------------------------------------------
-- Trigger: protezione dei campi admin/structure-only sui shifts
-- ----------------------------------------------------------------------------
create or replace function public.tg_shifts_protect_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role public.user_role;
begin
  v_role := public.current_user_role();

  -- Solo admin può forzare lo stato a no_show o cambiare assegnazioni a mano
  -- in modo arbitrario. La struttura fa transizioni "logiche" e l'employee
  -- solo check-in/check-out via funzione dedicata (non update diretto).
  if v_role <> 'admin' then
    -- structure_id e hourly_rate sono immutabili dopo la creazione (per chiunque non admin)
    if new.structure_id is distinct from old.structure_id then
      raise exception 'structure_id non modificabile' using errcode = '42501';
    end if;
    if new.hourly_rate is distinct from old.hourly_rate then
      raise exception 'hourly_rate non modificabile dopo creazione' using errcode = '42501';
    end if;
  end if;

  -- L'auto-aggiornamento di updated_at è gestito dal trigger separato.
  return new;
end;
$$;

drop trigger if exists shifts_protect_fields on public.shifts;
create trigger shifts_protect_fields
  before update on public.shifts
  for each row execute function public.tg_shifts_protect_fields();

-- ----------------------------------------------------------------------------
-- Helper: emette un qr_token sicuro (alfanumerico 32 char). Lo useremo nei
-- prossimi sprint quando la struttura conferma l'assegnazione.
-- ----------------------------------------------------------------------------
create or replace function public.generate_shift_qr_token()
returns text
language plpgsql
as $$
begin
  return encode(gen_random_bytes(24), 'base64');
end;
$$;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.shifts      enable row level security;
alter table public.shift_likes enable row level security;

-- ─── shifts ────────────────────────────────────────────────────────────────

-- Admin: tutto.
create policy "shifts: admin all"
  on public.shifts for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Structure: vede e modifica i propri turni.
create policy "shifts: structure select own"
  on public.shifts for select
  using (
    structure_id in (select id from public.structures where user_id = auth.uid())
  );

create policy "shifts: structure insert own"
  on public.shifts for insert
  with check (
    structure_id in (select id from public.structures where user_id = auth.uid())
    and status = 'open'                       -- nasce sempre 'open'
    and employee_id is null
    and check_in_at is null
    and check_out_at is null
    and qr_token is null
  );

create policy "shifts: structure update own"
  on public.shifts for update
  using (
    structure_id in (select id from public.structures where user_id = auth.uid())
  )
  with check (
    structure_id in (select id from public.structures where user_id = auth.uid())
  );

create policy "shifts: structure delete own"
  on public.shifts for delete
  using (
    structure_id in (select id from public.structures where user_id = auth.uid())
    and status in ('open', 'cancelled')       -- non si elimina dopo l'assegnazione
  );

-- Employee: vede i turni open compatibili (per ora: tutti gli open) + i propri assegnati.
create policy "shifts: employee select open"
  on public.shifts for select
  using (
    public.current_user_role() = 'employee'
    and status = 'open'
  );

create policy "shifts: employee select assigned"
  on public.shifts for select
  using (employee_id = auth.uid());

-- L'employee NON aggiorna direttamente i shifts: check-in/out via funzione
-- security-definer dedicata (verrà aggiunta nella fetta C insieme allo
-- scanner QR).

-- ─── shift_likes ───────────────────────────────────────────────────────────

create policy "shift_likes: admin all"
  on public.shift_likes for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Employee: gestisce i propri like/skip.
create policy "shift_likes: own select"
  on public.shift_likes for select
  using (employee_id = auth.uid());

create policy "shift_likes: own insert"
  on public.shift_likes for insert
  with check (
    employee_id = auth.uid()
    and exists (
      select 1 from public.shifts s
      where s.id = shift_likes.shift_id and s.status = 'open'
    )
  );

create policy "shift_likes: own delete"
  on public.shift_likes for delete
  using (employee_id = auth.uid());

-- Structure: vede chi ha messo like sui propri turni open.
create policy "shift_likes: structure select on own shifts"
  on public.shift_likes for select
  using (
    exists (
      select 1 from public.shifts s
      where s.id = shift_likes.shift_id
        and s.structure_id in (select id from public.structures where user_id = auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- GRANT espliciti per Data API
-- ----------------------------------------------------------------------------
grant select, insert, update, delete on public.shifts      to authenticated;
grant select, insert, delete         on public.shift_likes to authenticated;
grant execute on function public.generate_shift_qr_token() to authenticated;
