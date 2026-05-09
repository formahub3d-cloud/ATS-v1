-- ATS-v1 · Migrazione 11: chat tracciata admin ↔ struttura e admin ↔ employee
-- ----------------------------------------------------------------------------
-- Modello business: NESSUN contatto diretto struttura ↔ dipendente. Tutta la
-- comunicazione passa dall'admin (per audit + protezione antibypass). Per
-- questo le `conversations` hanno sempre l'admin come una delle parti.
--
-- Una conversazione esiste per ogni coppia distinta:
--   - kind='admin_structure' → structure_id NOT NULL, employee_id NULL
--   - kind='admin_employee'  → employee_id NOT NULL, structure_id NULL
--
-- Una sola conversazione per coppia (UNIQUE su structure_id e employee_id).
-- L'helper `ensure_conversation_*` la crea se non esiste.
-- ----------------------------------------------------------------------------

create type public.conversation_kind as enum ('admin_structure', 'admin_employee');

create table public.conversations (
  id              uuid primary key default gen_random_uuid(),
  kind            public.conversation_kind not null,
  structure_id    uuid references public.structures (id) on delete cascade,
  employee_id     uuid references public.employees (id) on delete cascade,
  last_message_at timestamptz,
  created_at      timestamptz not null default now(),

  -- Vincoli di consistenza: esattamente uno dei due id valorizzato in base al kind.
  constraint conversations_structure_xor check (
    (kind = 'admin_structure' and structure_id is not null and employee_id is null)
    or (kind = 'admin_employee' and employee_id is not null and structure_id is null)
  ),

  -- Una sola conversazione per struttura / per employee.
  constraint conversations_unique_structure unique (structure_id),
  constraint conversations_unique_employee  unique (employee_id)
);

create index conversations_kind_idx        on public.conversations (kind);
create index conversations_last_msg_idx    on public.conversations (last_message_at desc nulls last);

-- ----------------------------------------------------------------------------
-- Messaggi
-- ----------------------------------------------------------------------------
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete set null,
  body            text not null check (length(body) between 1 and 4000),
  created_at      timestamptz not null default now(),
  read_at         timestamptz                              -- letto dalla controparte
);

create index messages_conversation_idx on public.messages (conversation_id, created_at desc);
create index messages_unread_idx       on public.messages (conversation_id) where read_at is null;

-- Trigger: aggiorna conversations.last_message_at quando arriva un nuovo messaggio.
create or replace function public.tg_messages_bump_last()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_bump_last on public.messages;
create trigger messages_bump_last
  after insert on public.messages
  for each row execute function public.tg_messages_bump_last();

-- ----------------------------------------------------------------------------
-- RPC helper: garantisce esistenza di una conversazione, ritorna l'id.
-- Usato dal client struttura/employee al primo accesso alla chat.
-- ----------------------------------------------------------------------------
create or replace function public.ensure_my_conversation()
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_role      public.user_role;
  v_conv_id   uuid;
  v_struct_id uuid;
begin
  if v_uid is null then
    raise exception 'Non autenticato' using errcode = '42501';
  end if;
  v_role := public.current_user_role();

  if v_role = 'employee' then
    select id into v_conv_id from public.conversations where employee_id = v_uid;
    if v_conv_id is null then
      insert into public.conversations (kind, employee_id) values ('admin_employee', v_uid)
      returning id into v_conv_id;
    end if;
  elsif v_role = 'structure' then
    select id into v_struct_id from public.structures where user_id = v_uid;
    if v_struct_id is null then
      raise exception 'Struttura non trovata per l''utente corrente' using errcode = '02000';
    end if;
    select id into v_conv_id from public.conversations where structure_id = v_struct_id;
    if v_conv_id is null then
      insert into public.conversations (kind, structure_id) values ('admin_structure', v_struct_id)
      returning id into v_conv_id;
    end if;
  else
    raise exception 'Solo employee o structure possono chiamare ensure_my_conversation' using errcode = '42501';
  end if;

  return v_conv_id;
end;
$$;

grant execute on function public.ensure_my_conversation() to authenticated;

-- ----------------------------------------------------------------------------
-- RPC helper per admin: marca tutti i messaggi di una conversazione come letti.
-- ----------------------------------------------------------------------------
create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_role      public.user_role;
  v_count     integer;
  v_struct_id uuid;
begin
  if v_uid is null then
    raise exception 'Non autenticato' using errcode = '42501';
  end if;
  v_role := public.current_user_role();

  -- Controllo accesso: la conversazione deve appartenere all'utente o lui deve essere admin.
  if v_role <> 'admin' then
    if v_role = 'structure' then
      select id into v_struct_id from public.structures where user_id = v_uid;
      if not exists (
        select 1 from public.conversations c
        where c.id = p_conversation_id and c.structure_id = v_struct_id
      ) then
        raise exception 'Conversazione non accessibile' using errcode = '42501';
      end if;
    elsif v_role = 'employee' then
      if not exists (
        select 1 from public.conversations c
        where c.id = p_conversation_id and c.employee_id = v_uid
      ) then
        raise exception 'Conversazione non accessibile' using errcode = '42501';
      end if;
    end if;
  end if;

  -- Marca come letti tutti i messaggi NON inviati dall'utente corrente.
  update public.messages
     set read_at = now()
   where conversation_id = p_conversation_id
     and sender_id <> v_uid
     and read_at is null;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.mark_conversation_read(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.conversations enable row level security;
alter table public.messages       enable row level security;

-- ─── conversations ────────────────────────────────────────────────────────

create policy "conversations: admin all"
  on public.conversations for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "conversations: structure select own"
  on public.conversations for select
  using (
    structure_id in (select id from public.structures where user_id = auth.uid())
  );

create policy "conversations: employee select own"
  on public.conversations for select
  using (employee_id = auth.uid());

-- INSERT è gestito SOLO dalla funzione ensure_my_conversation (security definer);
-- nessuna policy INSERT diretta.

-- ─── messages ─────────────────────────────────────────────────────────────

create policy "messages: admin all"
  on public.messages for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Structure: legge i messaggi della propria conversazione.
create policy "messages: structure select own"
  on public.messages for select
  using (
    conversation_id in (
      select c.id from public.conversations c
      where c.structure_id in (select id from public.structures where user_id = auth.uid())
    )
  );

-- Structure: invia messaggi nella propria conversazione, sender = self.
create policy "messages: structure insert own"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and conversation_id in (
      select c.id from public.conversations c
      where c.structure_id in (select id from public.structures where user_id = auth.uid())
    )
  );

-- Employee: legge i messaggi della propria conversazione.
create policy "messages: employee select own"
  on public.messages for select
  using (
    conversation_id in (
      select c.id from public.conversations c where c.employee_id = auth.uid()
    )
  );

-- Employee: invia messaggi nella propria conversazione, sender = self.
create policy "messages: employee insert own"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and conversation_id in (
      select c.id from public.conversations c where c.employee_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- GRANT espliciti per Data API
-- ----------------------------------------------------------------------------
grant select          on public.conversations to authenticated;
grant select, insert  on public.messages       to authenticated;

-- ----------------------------------------------------------------------------
-- Realtime: abilita publication su messages così il client riceve le insert
-- in tempo reale (Supabase Realtime).
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
