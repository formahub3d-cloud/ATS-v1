-- ATS-v1 · Migrazione 10: funzioni RPC per check-in / check-out turni
-- ----------------------------------------------------------------------------
-- L'employee non aggiorna direttamente la tabella `shifts` (RLS lo vieta).
-- Espongo due funzioni SECURITY DEFINER chiamabili via supabase.rpc():
--
--   public.shift_check_in(p_qr_token text, p_lat numeric, p_lng numeric)
--     - trova lo shift dal qr_token
--     - verifica che l'auth.uid() sia l'employee assegnato e che lo stato
--       sia 'assigned'
--     - setta check_in_at = now(), check_in_lat/lng, status = 'in_progress'
--     - ritorna l'id del turno
--
--   public.shift_check_out(p_shift_id uuid)
--     - verifica che l'auth.uid() sia l'employee assegnato e lo stato
--       sia 'in_progress'
--     - setta check_out_at = now(), status = 'completed'
--     - ritorna le ore lavorate
--
-- Entrambe sollevano eccezione con messaggio leggibile in caso di errore.
-- ----------------------------------------------------------------------------

create or replace function public.shift_check_in(
  p_qr_token text,
  p_lat      numeric default null,
  p_lng      numeric default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_shift  public.shifts%rowtype;
  v_uid    uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Devi essere autenticato per fare check-in' using errcode = '42501';
  end if;
  if p_qr_token is null or length(p_qr_token) < 8 then
    raise exception 'QR token non valido' using errcode = '22023';
  end if;

  -- Trova lo shift dal token (unique).
  select * into v_shift
    from public.shifts
   where qr_token = p_qr_token;
  if not found then
    raise exception 'Turno non trovato per questo QR' using errcode = '02000';
  end if;

  -- Solo l'employee assegnato può fare check-in.
  if v_shift.employee_id is distinct from v_uid then
    raise exception 'Questo turno non è assegnato a te' using errcode = '42501';
  end if;

  -- Stato deve essere 'assigned' (non già checked-in né completato/cancellato).
  if v_shift.status <> 'assigned' then
    raise exception 'Check-in non disponibile: il turno è in stato %', v_shift.status using errcode = '22023';
  end if;

  update public.shifts
     set status      = 'in_progress',
         check_in_at = now(),
         check_in_lat = p_lat,
         check_in_lng = p_lng
   where id = v_shift.id;

  return v_shift.id;
end;
$$;

create or replace function public.shift_check_out(
  p_shift_id uuid
)
returns numeric                     -- ore lavorate (decimal hours)
language plpgsql
security definer set search_path = public
as $$
declare
  v_shift     public.shifts%rowtype;
  v_uid       uuid := auth.uid();
  v_hours     numeric(5, 2);
  v_now       timestamptz := now();
begin
  if v_uid is null then
    raise exception 'Devi essere autenticato per fare check-out' using errcode = '42501';
  end if;

  select * into v_shift from public.shifts where id = p_shift_id;
  if not found then
    raise exception 'Turno non trovato' using errcode = '02000';
  end if;

  if v_shift.employee_id is distinct from v_uid then
    raise exception 'Questo turno non è assegnato a te' using errcode = '42501';
  end if;

  if v_shift.status <> 'in_progress' then
    raise exception 'Check-out non disponibile: il turno è in stato %', v_shift.status using errcode = '22023';
  end if;

  v_hours := round(extract(epoch from (v_now - v_shift.check_in_at)) / 3600.0, 2);

  update public.shifts
     set status        = 'completed',
         check_out_at  = v_now,
         estimated_hours = coalesce(v_shift.estimated_hours, v_hours)
   where id = v_shift.id;

  return v_hours;
end;
$$;

-- ----------------------------------------------------------------------------
-- GRANT esecuzione a authenticated.
-- ----------------------------------------------------------------------------
grant execute on function public.shift_check_in(text, numeric, numeric) to authenticated;
grant execute on function public.shift_check_out(uuid) to authenticated;
