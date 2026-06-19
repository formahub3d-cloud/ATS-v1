-- ATS-v1 · Migrazione 19: form contatti dalla landing
-- ----------------------------------------------------------------------------
-- Tabella per salvare le richieste di contatto inviate dalla landing.
-- Insert via RPC SECURITY DEFINER (così l'anon può scrivere senza dover
-- avere policy INSERT permissive su una tabella pubblica). Lettura solo admin.
-- ----------------------------------------------------------------------------

create type public.contact_status as enum ('new', 'in_progress', 'handled', 'spam');

create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text not null,
  body        text not null,
  source      text,                          -- pagina di provenienza, es. /contatti, /strutture
  status      public.contact_status not null default 'new',
  handled_by  uuid references public.profiles (id) on delete set null,
  handled_at  timestamptz,
  notes       text,                          -- note interne admin
  created_at  timestamptz not null default now(),

  constraint contact_messages_email_format check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  constraint contact_messages_body_length check (length(body) between 10 and 4000)
);

create index contact_messages_status_idx  on public.contact_messages (status, created_at desc);
create index contact_messages_email_idx   on public.contact_messages (email);
create index contact_messages_recent_idx  on public.contact_messages (created_at desc);

-- ----------------------------------------------------------------------------
-- RPC: submit_contact_message — chiamabile anche da utente anon.
-- Validazione lato server (long body, email formato già coperto da check).
-- Rate limit soft: max 3 invii per 24h dallo stesso IP/email
-- (per la versione MVP, controlliamo solo per email).
-- ----------------------------------------------------------------------------
create or replace function public.submit_contact_message(
  p_name    text,
  p_email   text,
  p_subject text,
  p_body    text,
  p_source  text default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_id           uuid;
  v_recent_count integer;
begin
  if length(coalesce(p_name, '')) < 2 then
    raise exception 'Nome troppo corto' using errcode = '22023';
  end if;
  if length(coalesce(p_subject, '')) < 3 then
    raise exception 'Oggetto troppo corto' using errcode = '22023';
  end if;

  -- Rate limit: max 3 invii nelle ultime 24h dalla stessa email.
  select count(*) into v_recent_count
    from public.contact_messages
    where email = lower(p_email)
      and created_at > now() - interval '24 hours';
  if v_recent_count >= 3 then
    raise exception 'Hai già inviato troppi messaggi nelle ultime 24 ore. Riprova domani.'
      using errcode = '22023';
  end if;

  insert into public.contact_messages (name, email, subject, body, source)
  values (trim(p_name), lower(trim(p_email)), trim(p_subject), p_body, p_source)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.submit_contact_message(text, text, text, text, text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.contact_messages enable row level security;

create policy "contact_messages: admin all"
  on public.contact_messages for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- INSERT solo via RPC (security definer), nessuna policy diretta.

grant select, update on public.contact_messages to authenticated;
