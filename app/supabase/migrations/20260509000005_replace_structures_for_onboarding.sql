-- ATS-v1 · Migrazione 6: rimpiazzo della tabella structures
-- ----------------------------------------------------------------------------
-- La migrazione precedente (20260509000003) modellava `structures` come pura
-- anagrafica clienti (owner_id nullable, nessuno stato, nessuna foto/video).
-- Il wizard di onboarding strutture richiede:
--   - workflow di approvazione (pending_review → approved/rejected/suspended)
--   - 1:1 stretto con profiles.role='structure' (vincolo: una persona = una
--     struttura per l'MVP; al limite si fa "multi-sede" più avanti)
--   - campi del wizard (tipo struttura, zona, ruoli cercati, fasce orarie,
--     tag valori, qualificazione, video di attestazione)
--   - foto degli ambienti (tabella separata)
--
-- ⚠️ DESTRUCTIVE: questa migrazione DROP la tabella `structures` esistente.
-- È stata creata in dev senza dati di produzione (verificato che non c'è
-- nessuna riga prima di applicare). Le tabelle `employees` e `documents`
-- restano intatte — le useremo nella prossima fetta (onboarding dipendente).
-- ----------------------------------------------------------------------------

-- 1. Pulizia: drop della vecchia tabella + sue policy/grant (CASCADE).
drop table if exists public.structures cascade;

-- 2. Stato del ciclo di vita della candidatura/struttura.
create type public.structure_status as enum (
  'pending_review',  -- candidatura inviata, in attesa di review admin
  'approved',        -- approvata, può ricevere turni e operare
  'rejected',        -- respinta dopo review (vedi rejection_reason)
  'suspended'        -- sospesa temporaneamente (es. inadempienza pagamento)
);

-- 3. Tabella principale.
create table public.structures (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references public.profiles (id) on delete cascade,
  status      public.structure_status not null default 'pending_review',

  -- Dati aziendali
  ragione_sociale text not null,
  piva            text not null,
  codice_fiscale  text,
  sede_legale     text,
  sede_operativa  text,

  -- Referente principale
  referente_nome     text,
  referente_ruolo    text,
  referente_telefono text,
  referente_email    text,

  -- Identità struttura
  tipo_struttura  text,  -- Bar | Ristorante | Hotel | Resort | Location eventi | SPA | Altro
  zona            text,  -- Centro | Periferia | Industriale | Eventi | Resort | Fuori città
  descrizione     text,

  -- Esigenze operative
  ruoli_cercati      text[] not null default '{}',
  fasce_orarie       jsonb  not null default '{}'::jsonb,  -- { "Lunedì": "19:00 - 23:00", ... }
  persone_per_turno  integer,
  servizi_aggiuntivi text[] not null default '{}',         -- divise | navetta | attrezzature

  -- Tag valori (qualità ricercate nei collaboratori)
  tag_valori text[] not null default '{}',

  -- Qualificazione
  eventi_settimana    integer,
  dipendenti_interni  integer,
  esperienze_esterne  text,
  fatturato           text,    -- fascia: < 100K | 100K - 500K | ...
  ore_esterno_mensili integer,

  -- Pagamento (MVP: solo metodo. Card/IBAN reali → Stripe in fetta dedicata.)
  metodo_pagamento text check (metodo_pagamento in ('carta', 'sepa')),

  -- Storage (path nel bucket dedicato, vedi mig. successiva)
  video_attestazione_path text,

  -- Audit & approvazione
  accettato_contratto    boolean not null default false,
  accettato_contratto_at timestamptz,
  approved_at            timestamptz,
  approved_by            uuid references public.profiles (id) on delete set null,
  rejection_reason       text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.structures is
  'Strutture clienti ATS (bar/ristoranti/hotel/...). 1:1 con profiles.role=structure.';

create index structures_status_idx     on public.structures (status);
create index structures_zona_idx       on public.structures (zona);
create index structures_created_at_idx on public.structures (created_at desc);

create trigger structures_set_updated_at
  before update on public.structures
  for each row execute function public.tg_set_updated_at();

-- 4. Foto degli ambienti: tabella N:1 con structures.
create table public.structure_photos (
  id           uuid primary key default gen_random_uuid(),
  structure_id uuid not null references public.structures (id) on delete cascade,
  storage_path text not null,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index structure_photos_structure_id_idx on public.structure_photos (structure_id);

-- 5. Row Level Security
alter table public.structures       enable row level security;
alter table public.structure_photos enable row level security;

-- structures: la struttura legge solo se stessa.
create policy "structures: own select"
  on public.structures for select
  using (auth.uid() = user_id);

-- structures: admin legge tutte (per dashboard pending review).
create policy "structures: admin select all"
  on public.structures for select
  using (public.current_user_role() = 'admin');

-- structures: insert self-service durante l'onboarding.
create policy "structures: own insert"
  on public.structures for insert
  with check (
    auth.uid() = user_id
    and status = 'pending_review'
    and approved_at is null
    and approved_by is null
  );

-- structures: la struttura aggiorna i propri dati (campi admin-only protetti
-- dal trigger sotto, perché esprimerli in `with check` è fragile).
create policy "structures: own update"
  on public.structures for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- structures: admin aggiorna qualunque cosa (incluso lo stato).
create policy "structures: admin update"
  on public.structures for update
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- structures: solo admin cancella (cascade da profiles/auth gestisce il resto).
create policy "structures: admin delete"
  on public.structures for delete
  using (public.current_user_role() = 'admin');

-- 6. Trigger: blocca campi admin-only quando l'update è fatto da non-admin.
create or replace function public.tg_structures_protect_admin_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if public.current_user_role() <> 'admin' then
    if new.status            is distinct from old.status            then
      raise exception 'Solo admin può cambiare lo stato della struttura' using errcode = '42501';
    end if;
    if new.approved_at       is distinct from old.approved_at       then
      raise exception 'Solo admin può impostare approved_at' using errcode = '42501';
    end if;
    if new.approved_by       is distinct from old.approved_by       then
      raise exception 'Solo admin può impostare approved_by' using errcode = '42501';
    end if;
    if new.rejection_reason  is distinct from old.rejection_reason  then
      raise exception 'Solo admin può impostare rejection_reason' using errcode = '42501';
    end if;
    if new.user_id           is distinct from old.user_id           then
      raise exception 'user_id non modificabile' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger structures_protect_admin_fields
  before update on public.structures
  for each row execute function public.tg_structures_protect_admin_fields();

-- 7. structure_photos: RLS
create policy "structure_photos: owner select"
  on public.structure_photos for select
  using (
    exists (
      select 1 from public.structures s
      where s.id = structure_photos.structure_id
        and s.user_id = auth.uid()
    )
  );

create policy "structure_photos: admin select all"
  on public.structure_photos for select
  using (public.current_user_role() = 'admin');

create policy "structure_photos: owner insert"
  on public.structure_photos for insert
  with check (
    exists (
      select 1 from public.structures s
      where s.id = structure_photos.structure_id
        and s.user_id = auth.uid()
    )
  );

create policy "structure_photos: owner delete"
  on public.structure_photos for delete
  using (
    exists (
      select 1 from public.structures s
      where s.id = structure_photos.structure_id
        and s.user_id = auth.uid()
    )
  );

create policy "structure_photos: admin delete"
  on public.structure_photos for delete
  using (public.current_user_role() = 'admin');

-- 8. GRANT espliciti (Data API non auto-espone le nuove tabelle).
grant select, insert, update, delete on public.structures       to authenticated;
grant select, insert, delete         on public.structure_photos to authenticated;
