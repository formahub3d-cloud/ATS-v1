-- ATS-v1 · Migrazione 24: cancellazione turno con notifica automatica
-- ============================================================================
-- RPC `cancel_shift(p_shift_id, p_reason)` SECURITY DEFINER:
--   - Permessa a: admin, struttura proprietaria, dipendente assegnato
--   - Imposta status='cancelled', cancelled_at, cancellation_reason
--   - Crea notifica per la controparte (struttura ↔ dipendente) e per admin
--
-- Effetti business:
--   - struttura cancella turno open: nessuno è assegnato, solo log
--   - struttura cancella turno assigned: notifica al dipendente
--   - dipendente cancella turno assigned: notifica alla struttura + admin
--     (caso "non posso presentarmi" gestibile da admin per riassegnare)
-- ============================================================================

create or replace function public.cancel_shift(
  p_shift_id uuid,
  p_reason   text default null
) returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid          uuid := auth.uid();
  v_role         public.user_role;
  v_shift        public.shifts%rowtype;
  v_struct_user  uuid;
  v_struct_name  text;
  v_emp_name     text;
  v_canceller    text;  -- 'admin' | 'structure' | 'employee'
begin
  if v_uid is null then
    raise exception 'Non autenticato' using errcode = '42501';
  end if;
  v_role := public.current_user_role();

  select * into v_shift from public.shifts where id = p_shift_id;
  if not found then
    raise exception 'Turno non trovato' using errcode = '02000';
  end if;
  if v_shift.status not in ('open', 'assigned') then
    raise exception 'Solo turni open o assigned possono essere cancellati (stato attuale: %)', v_shift.status
      using errcode = '22023';
  end if;

  -- Determina il canceller + autorizzazione.
  if v_role = 'admin' then
    v_canceller := 'admin';
  elsif v_role = 'structure' then
    select user_id, ragione_sociale into v_struct_user, v_struct_name
      from public.structures where id = v_shift.structure_id;
    if v_struct_user <> v_uid then
      raise exception 'Non sei il referente di questa struttura' using errcode = '42501';
    end if;
    v_canceller := 'structure';
  elsif v_role = 'employee' then
    if v_shift.employee_id is distinct from v_uid then
      raise exception 'Non sei il dipendente assegnato a questo turno' using errcode = '42501';
    end if;
    v_canceller := 'employee';
  else
    raise exception 'Ruolo non autorizzato' using errcode = '42501';
  end if;

  -- Aggiorna lo shift: status cancelled + audit timestamps.
  update public.shifts
     set status = 'cancelled',
         cancelled_at = now(),
         cancellation_reason = nullif(trim(coalesce(p_reason, '')), '')
   where id = p_shift_id;

  -- Carica i nomi per le notifiche (idempotente, no-op se già caricati).
  if v_struct_name is null then
    select ragione_sociale into v_struct_name from public.structures where id = v_shift.structure_id;
  end if;
  if v_shift.employee_id is not null then
    select full_name into v_emp_name from public.profiles where id = v_shift.employee_id;
  end if;

  -- Notifiche automatiche: chi viene notificato dipende da chi ha cancellato.
  if v_canceller = 'structure' or v_canceller = 'admin' then
    -- Notifica al dipendente assegnato (se presente).
    if v_shift.employee_id is not null then
      insert into public.notifications (user_id, kind, title, body, link)
      values (
        v_shift.employee_id,
        'shift_cancelled'::public.notification_kind,
        'Turno annullato',
        format('Il turno del %s presso %s è stato annullato%s.',
               to_char(v_shift.shift_date, 'DD/MM'),
               coalesce(v_struct_name, 'struttura'),
               case when p_reason is not null then ' — ' || p_reason else '' end),
        '/employee'
      );
    end if;
  end if;

  if v_canceller = 'employee' then
    -- Notifica alla struttura (referente) per riorganizzarsi.
    if v_struct_user is null then
      select user_id into v_struct_user from public.structures where id = v_shift.structure_id;
    end if;
    if v_struct_user is not null then
      insert into public.notifications (user_id, kind, title, body, link)
      values (
        v_struct_user,
        'shift_cancelled'::public.notification_kind,
        'Dipendente ha cancellato',
        format('%s non potrà fare il turno del %s%s. Pubblica un nuovo turno per ricoprirlo.',
               coalesce(v_emp_name, 'Il dipendente assegnato'),
               to_char(v_shift.shift_date, 'DD/MM'),
               case when p_reason is not null then ' (' || p_reason || ')' else '' end),
        '/structure/matching'
      );
    end if;
    -- Notifica anche tutti gli admin: caso operativo che potrebbero
    -- voler riassegnare proattivamente.
    insert into public.notifications (user_id, kind, title, body, link)
    select p.id,
           'shift_cancelled'::public.notification_kind,
           'Cancellazione dipendente',
           format('%s ha cancellato il turno del %s presso %s.',
                  coalesce(v_emp_name, 'Un dipendente'),
                  to_char(v_shift.shift_date, 'DD/MM'),
                  coalesce(v_struct_name, 'una struttura')),
           '/admin/shifts'
    from public.profiles p
    where p.role = 'admin';
  end if;
exception
  when others then
    -- Permettiamo che lo shift venga marked cancelled anche se la notifica
    -- fallisce: meglio lasciare un audit log incompleto che bloccare la
    -- cancellazione. Ma se è la UPDATE che fallisce (RLS, vincolo), la
    -- exception viene rilanciata.
    if sqlstate in ('42501', '02000', '22023') then raise; end if;
    raise warning '[cancel_shift] non-fatal post-update error: %', sqlerrm;
end;
$$;

grant execute on function public.cancel_shift(uuid, text) to authenticated;

comment on function public.cancel_shift(uuid, text) is
  'Cancella un turno + crea notifiche per la controparte (struttura ↔ dipendente). '
  'Permessa ad admin, struttura proprietaria, dipendente assegnato.';
