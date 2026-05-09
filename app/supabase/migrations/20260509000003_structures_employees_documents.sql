-- ATS-v1 · Migrazione 4: anagrafiche core (structures, employees, documents)
-- ----------------------------------------------------------------------------
-- - structures   = clienti di ATS (hotel, ville, eventi, aziende)
-- - employees    = estensione di profiles per chi ha role='employee'
-- - documents    = file caricati per ciascun dipendente (HACCP, idoneità, ...)
-- Le policy RLS riflettono il modello catering interno: admin vede tutto;
-- structure vede solo i propri record; employee vede solo sé stesso.
-- ----------------------------------------------------------------------------

-- ============================================================================
-- 1. STRUCTURES (clienti)
-- ============================================================================
create table public.structures (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid references public.profiles (id) on delete set null,

  ragione_sociale text not null,
  piva            text,
  cf              text,
  sdi             text,                -- codice destinatario fatturazione elettronica

  email           text,
  phone           text,
  website         text,

  indirizzo       text,
  cap             text,
  citta           text,
  provincia       text,
  paese           text not null default 'IT',

  contact_name    text,
  contact_role    text,
  contact_phone   text,

  notes           text,
  active          boolean not null default true,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.structures is
  'Clienti di ATS: hotel, ville, ristoranti, aziende che richiedono servizi catering.';
comment on column public.structures.owner_id is
  'Profilo (role=structure) che gestisce questa struttura. Una persona può gestire più strutture.';

create index structures_owner_idx        on public.structures (owner_id);
create index structures_active_idx       on public.structures (active) where active;
create index structures_citta_idx        on public.structures (citta);

create trigger structures_set_updated_at
  before update on public.structures
  for each row execute function public.tg_set_updated_at();


-- ============================================================================
-- 2. EMPLOYEES (estensione di profiles per ruolo employee)
-- ============================================================================
create table public.employees (
  id                uuid primary key references public.profiles (id) on delete cascade,

  -- Anagrafica fiscale
  cf                text,
  iban              text,
  birth_date        date,
  birth_place       text,

  -- Inquadramento contrattuale
  contract_type     text,            -- 'a_chiamata' | 'tempo_determinato' | 'tempo_indeterminato' | 'occasionale'
  hourly_rate       numeric(10, 2),
  weekly_hours_max  integer,
  hire_date         date,
  termination_date  date,
  active            boolean not null default true,

  -- Profilo professionale
  skills            jsonb not null default '[]'::jsonb,    -- es. ['cameriere', 'cuoco', 'barista', 'runner']
  bio               text,

  -- Indirizzo di residenza
  home_address      text,
  home_city         text,
  home_province     text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.employees is
  'Dipendenti ATS catering. 1:1 con profiles dove role=employee.';

create index employees_active_idx        on public.employees (active) where active;
create index employees_skills_gin_idx    on public.employees using gin (skills);
create index employees_contract_type_idx on public.employees (contract_type);

create trigger employees_set_updated_at
  before update on public.employees
  for each row execute function public.tg_set_updated_at();


-- ============================================================================
-- 3. DOCUMENTS (documenti dipendente)
-- ============================================================================
create type public.document_type as enum (
  'id_card',      -- carta d'identità / passaporto
  'tax_code',     -- codice fiscale / tessera sanitaria
  'iban_proof',   -- prova IBAN (estratto conto)
  'haccp',        -- attestato HACCP
  'health_cert',  -- idoneità sanitaria
  'contract',     -- contratto firmato
  'other'
);

create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  employee_id   uuid not null references public.employees (id) on delete cascade,

  type          public.document_type not null,
  file_path     text not null,          -- path nel bucket Storage: employee-docs/{employee_id}/{id}.{ext}
  file_name     text,
  mime_type     text,
  size_bytes    bigint,

  expires_at    date,
  uploaded_at   timestamptz not null default now(),
  uploaded_by   uuid references public.profiles (id) on delete set null,
  verified_at   timestamptz,
  verified_by   uuid references public.profiles (id) on delete set null
);

comment on table public.documents is
  'Documenti caricati per ciascun dipendente. file_path punta al bucket Storage employee-docs.';

create index documents_employee_idx     on public.documents (employee_id);
create index documents_type_idx         on public.documents (type);
create index documents_expires_idx      on public.documents (expires_at) where expires_at is not null;
create index documents_unverified_idx   on public.documents (verified_at) where verified_at is null;


-- ============================================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================================
alter table public.structures enable row level security;
alter table public.employees  enable row level security;
alter table public.documents  enable row level security;

-- ----- STRUCTURES ------------------------------------------------------------
-- Admin: tutto.
create policy "structures: admin all"
  on public.structures for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Structure (cliente): vede e aggiorna SOLO le strutture di cui è owner.
create policy "structures: owner select"
  on public.structures for select
  using (public.current_user_role() = 'structure' and owner_id = auth.uid());

create policy "structures: owner update"
  on public.structures for update
  using (public.current_user_role() = 'structure' and owner_id = auth.uid())
  with check (public.current_user_role() = 'structure' and owner_id = auth.uid());

-- ----- EMPLOYEES -------------------------------------------------------------
-- Admin: tutto.
create policy "employees: admin all"
  on public.employees for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Employee: legge SOLO il proprio record.
create policy "employees: self select"
  on public.employees for select
  using (id = auth.uid());

-- Employee: aggiorna SOLO il proprio record (campi non sensibili gestiti
-- via colonne; admin resta unico a poter cambiare hourly_rate/contract_type
-- a livello policy, ma per v1 lasciamo update libero al self e l'audit lo
-- facciamo lato app — TODO Sprint 3: aggiungere column-level grants).
create policy "employees: self update"
  on public.employees for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- (Nota: structure verrà autorizzato a vedere employees nello Sprint 4
-- quando ci saranno gli assignments → join con events.)

-- ----- DOCUMENTS -------------------------------------------------------------
-- Admin: tutto.
create policy "documents: admin all"
  on public.documents for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Employee: legge i propri documenti.
create policy "documents: self select"
  on public.documents for select
  using (employee_id = auth.uid());

-- Employee: carica nuovi documenti per sé (verified_* resta NULL,
-- li approva l'admin).
create policy "documents: self insert"
  on public.documents for insert
  with check (
    employee_id = auth.uid()
    and verified_at is null
    and verified_by is null
    and uploaded_by = auth.uid()
  );


-- ============================================================================
-- 5. GRANT espliciti per Data API
-- (tabelle sensibili: niente SELECT per anon, solo authenticated)
-- ============================================================================
grant select, insert, update, delete on public.structures  to authenticated;
grant select, insert, update, delete on public.employees   to authenticated;
grant select, insert, update, delete on public.documents   to authenticated;
