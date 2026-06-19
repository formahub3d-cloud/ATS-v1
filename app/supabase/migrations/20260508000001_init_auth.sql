-- ATS-v1 · Migrazione 1: fondamenta auth & ruoli
-- ----------------------------------------------------------------------------
-- Crea l'enum dei ruoli, la tabella profiles legata a auth.users, un trigger
-- che popola automaticamente profiles alla signup, e le RLS policy minime.
-- Le tabelle di dominio (events, assignments, ecc.) arrivano nelle migrazioni
-- successive.
-- ----------------------------------------------------------------------------

-- Enum dei ruoli applicativi.
-- 'admin'     = staff ATS (CRM + amministrazione)
-- 'structure' = cliente di ATS (hotel, villa, ristorante che richiede catering)
-- 'employee'  = dipendente ATS (cameriere, cuoco, barista, runner)
create type public.user_role as enum ('admin', 'structure', 'employee');

-- Tabella profiles: 1:1 con auth.users.
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        public.user_role not null default 'employee',
  full_name   text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Profilo applicativo collegato 1:1 a auth.users. Il ruolo decide quale portale vede l''utente.';

-- Indice utile per query "tutti gli employee", "tutte le structure" da admin.
create index profiles_role_idx on public.profiles (role);

-- Trigger: aggiorna updated_at su ogni UPDATE.
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- Trigger: crea automaticamente un profilo quando un utente si registra.
-- Il ruolo iniziale viene letto da raw_user_meta_data.role (passato a signUp);
-- default 'employee' se non specificato.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role public.user_role;
begin
  begin
    v_role := coalesce(
      (new.raw_user_meta_data ->> 'role')::public.user_role,
      'employee'
    );
  exception when invalid_text_representation then
    v_role := 'employee';
  end;

  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    v_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: leggere il ruolo dell'utente corrente senza incorrere in ricorsione
-- nelle policy RLS (chiamare profiles dentro la policy di profiles è loop).
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- L'utente legge il proprio profilo.
create policy "profiles: own select"
  on public.profiles for select
  using (auth.uid() = id);

-- Admin legge tutti i profili.
create policy "profiles: admin select all"
  on public.profiles for select
  using (public.current_user_role() = 'admin');

-- L'utente aggiorna il proprio profilo MA non può cambiare il proprio role.
create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );

-- Admin può aggiornare qualunque profilo (incluso il role).
create policy "profiles: admin update"
  on public.profiles for update
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- INSERT è gestito esclusivamente dal trigger handle_new_user; nessuna policy
-- INSERT permette inserimenti diretti dal client.

-- DELETE: solo admin (e cascade da auth.users quando l'utente viene eliminato).
create policy "profiles: admin delete"
  on public.profiles for delete
  using (public.current_user_role() = 'admin');

-- ----------------------------------------------------------------------------
-- NOTA OPERATIVA — promozione del primo admin
-- ----------------------------------------------------------------------------
-- Dopo la prima registrazione (che crea un profilo employee), promuovi il
-- founder ad admin con una query manuale dal SQL Editor del dashboard:
--
--   update public.profiles
--      set role = 'admin'
--    where id = (select id from auth.users where email = 'tuo@email.it');
--
-- Da quel momento quell'account potrà cambiare il ruolo di altri utenti.
