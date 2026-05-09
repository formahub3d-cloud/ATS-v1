-- ATS-v1 · Migrazione 13: notifiche in-app
-- ----------------------------------------------------------------------------
-- Tabella `notifications` user-scoped: ogni utente vede solo le proprie.
-- Le notifiche vengono inserite da trigger automatici sugli eventi chiave:
--   - turno assegnato a un dipendente
--   - turno annullato (per il dipendente assegnato e/o per la struttura)
--   - nuova recensione ricevuta
--   - struttura approvata / respinta
-- Il client mostra il bell con count unread + dropdown lista.
-- ----------------------------------------------------------------------------

create type public.notification_kind as enum (
  'shift_assigned',
  'shift_cancelled',
  'shift_completed',
  'review_received',
  'structure_approved',
  'structure_rejected',
  'new_message'
);

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  kind        public.notification_kind not null,
  title       text not null,
  body        text,
  link        text,                  -- route SPA dove andare al click (es. /employee/checkin)
  created_at  timestamptz not null default now(),
  read_at     timestamptz
);

create index notifications_user_idx          on public.notifications (user_id, created_at desc);
create index notifications_user_unread_idx   on public.notifications (user_id) where read_at is null;

-- ----------------------------------------------------------------------------
-- Trigger: turno assegnato → notifica per il dipendente
-- ----------------------------------------------------------------------------
create or replace function public.tg_shifts_notify_assignment()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_struct_name text;
begin
  -- Notifica solo quando si passa a 'assigned' (sia INSERT new=assigned sia
  -- UPDATE da open→assigned).
  if new.status = 'assigned' and (old.status is distinct from 'assigned') and new.employee_id is not null then
    select ragione_sociale into v_struct_name from public.structures where id = new.structure_id;
    insert into public.notifications (user_id, kind, title, body, link)
    values (
      new.employee_id,
      'shift_assigned',
      'Nuovo turno assegnato',
      coalesce(v_struct_name, 'Una struttura') || ' ti ha confermato come ' || new.role || ' per il ' ||
        to_char(new.shift_date, 'DD/MM') || ' (' || to_char(new.time_start, 'HH24:MI') || '–' || to_char(new.time_end, 'HH24:MI') || ').',
      '/employee/checkin'
    );
  end if;

  -- Notifica turno cancellato per il dipendente (se era assegnato).
  if new.status = 'cancelled' and old.status is distinct from 'cancelled' and old.employee_id is not null then
    insert into public.notifications (user_id, kind, title, body, link)
    values (
      old.employee_id,
      'shift_cancelled',
      'Turno annullato',
      'Il turno del ' || to_char(new.shift_date, 'DD/MM') || ' (' || new.role || ') è stato annullato.',
      '/employee'
    );
  end if;

  -- Notifica turno completato → grazie + invito a lasciare recensione.
  if new.status = 'completed' and old.status is distinct from 'completed' then
    -- Per il dipendente
    if new.employee_id is not null then
      insert into public.notifications (user_id, kind, title, body, link)
      values (
        new.employee_id,
        'shift_completed',
        'Turno completato 🎉',
        'Hai completato il turno del ' || to_char(new.shift_date, 'DD/MM') || '. Lascia una recensione alla struttura.',
        '/employee/checkin'
      );
    end if;
    -- Per la struttura (referente, via user_id su structures)
    insert into public.notifications (user_id, kind, title, body, link)
    select s.user_id, 'shift_completed', 'Turno completato',
           'Il turno del ' || to_char(new.shift_date, 'DD/MM') || ' è stato completato. Lascia una recensione al dipendente.',
           '/structure/matching'
      from public.structures s
     where s.id = new.structure_id;
  end if;

  return new;
end;
$$;

drop trigger if exists shifts_notify_assignment on public.shifts;
create trigger shifts_notify_assignment
  after insert or update on public.shifts
  for each row execute function public.tg_shifts_notify_assignment();

-- ----------------------------------------------------------------------------
-- Trigger: nuova recensione → notifica al recensito
-- ----------------------------------------------------------------------------
create or replace function public.tg_reviews_notify_recipient()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_shift  public.shifts%rowtype;
begin
  select * into v_shift from public.shifts where id = new.shift_id;
  if not found then return new; end if;

  if new.reviewer_role = 'structure' and v_shift.employee_id is not null then
    insert into public.notifications (user_id, kind, title, body, link)
    values (
      v_shift.employee_id,
      'review_received',
      'Hai ricevuto una recensione',
      'Una struttura ti ha valutato ' || new.rating || '★ per il turno del ' || to_char(v_shift.shift_date, 'DD/MM') || '.',
      '/employee/rank'
    );
  elsif new.reviewer_role = 'employee' then
    insert into public.notifications (user_id, kind, title, body, link)
    select s.user_id, 'review_received',
           'Hai ricevuto una recensione',
           'Un dipendente ti ha valutato ' || new.rating || '★ per il turno del ' || to_char(v_shift.shift_date, 'DD/MM') || '.',
           '/structure/history'
      from public.structures s
     where s.id = v_shift.structure_id;
  end if;

  return new;
end;
$$;

drop trigger if exists reviews_notify_recipient on public.reviews;
create trigger reviews_notify_recipient
  after insert on public.reviews
  for each row execute function public.tg_reviews_notify_recipient();

-- ----------------------------------------------------------------------------
-- Trigger: struttura approvata / respinta dall'admin → notifica al referente
-- ----------------------------------------------------------------------------
create or replace function public.tg_structures_notify_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    insert into public.notifications (user_id, kind, title, body, link)
    values (
      new.user_id, 'structure_approved',
      'Struttura approvata 🎉',
      'La candidatura di ' || new.ragione_sociale || ' è stata approvata. Puoi pubblicare turni.',
      '/structure'
    );
  elsif new.status = 'rejected' and old.status is distinct from 'rejected' then
    insert into public.notifications (user_id, kind, title, body, link)
    values (
      new.user_id, 'structure_rejected',
      'Candidatura non approvata',
      coalesce(new.rejection_reason, 'La candidatura non è stata approvata. Contatta il supporto per dettagli.'),
      '/structure'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists structures_notify_status on public.structures;
create trigger structures_notify_status
  after update on public.structures
  for each row execute function public.tg_structures_notify_status();

-- ----------------------------------------------------------------------------
-- Trigger: nuovo messaggio chat → notifica per la controparte
-- (admin riceve se sender è user; user riceve se sender è admin).
-- ----------------------------------------------------------------------------
create or replace function public.tg_messages_notify_counterpart()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_conv      public.conversations%rowtype;
  v_sender_role public.user_role;
  v_recipient_id uuid;
  v_link        text;
begin
  select * into v_conv from public.conversations where id = new.conversation_id;
  if not found then return new; end if;

  select role into v_sender_role from public.profiles where id = new.sender_id;

  -- Se sender è admin → notifico l'altro lato.
  if v_sender_role = 'admin' then
    if v_conv.kind = 'admin_employee' then
      v_recipient_id := v_conv.employee_id;
      v_link := '/employee/chat';
    else
      select user_id into v_recipient_id from public.structures where id = v_conv.structure_id;
      v_link := '/structure/chat';
    end if;
  else
    -- Sender è structure o employee → notifico TUTTI gli admin.
    -- (Per MVP: una sola notifica con user_id = NULL? No, non possiamo. Inserisco
    -- una riga per ogni admin attualmente registrato. Bassi volumi, accettabile.)
    insert into public.notifications (user_id, kind, title, body, link)
    select p.id, 'new_message', 'Nuovo messaggio in chat',
           substring(new.body from 1 for 100),
           '/admin/chat'
      from public.profiles p
     where p.role = 'admin';
    return new;
  end if;

  if v_recipient_id is not null then
    insert into public.notifications (user_id, kind, title, body, link)
    values (
      v_recipient_id, 'new_message', 'Nuovo messaggio dall''Admin',
      substring(new.body from 1 for 100),
      v_link
    );
  end if;

  return new;
end;
$$;

drop trigger if exists messages_notify_counterpart on public.messages;
create trigger messages_notify_counterpart
  after insert on public.messages
  for each row execute function public.tg_messages_notify_counterpart();

-- ----------------------------------------------------------------------------
-- RPC: marca tutte le mie notifiche come lette (o solo una specifica).
-- ----------------------------------------------------------------------------
create or replace function public.notifications_mark_read(p_id uuid default null)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_count integer;
begin
  if v_uid is null then
    raise exception 'Non autenticato' using errcode = '42501';
  end if;

  if p_id is null then
    update public.notifications set read_at = now()
     where user_id = v_uid and read_at is null;
  else
    update public.notifications set read_at = now()
     where user_id = v_uid and id = p_id and read_at is null;
  end if;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.notifications_mark_read(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.notifications enable row level security;

create policy "notifications: own select"
  on public.notifications for select
  using (user_id = auth.uid());

-- Admin vede anche tutte le notifiche per debug/audit.
create policy "notifications: admin select all"
  on public.notifications for select
  using (public.current_user_role() = 'admin');

-- INSERT/UPDATE/DELETE solo via trigger/RPC (security definer).

grant select on public.notifications to authenticated;

-- Realtime: per badge live.
alter publication supabase_realtime add table public.notifications;
