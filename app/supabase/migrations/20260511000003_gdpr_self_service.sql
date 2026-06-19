-- ATS-v1 · Migrazione 26: GDPR self-service (export dati + cancellazione account)
-- ============================================================================
-- Implementa 2 dei diritti GDPR (Reg. UE 2016/679) in modalità self-service:
--   Art. 15 (accesso) + Art. 20 (portabilità) → export_my_data()
--   Art. 17 (cancellazione / 'diritto all'oblio') → delete_my_account(...)
--
-- Entrambe SECURITY DEFINER. Niente service_role richiesto lato client.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXPORT MY DATA
-- ----------------------------------------------------------------------------
-- Restituisce un JSON con TUTTI i dati personali dell'utente corrente.
-- Il client può salvarlo come .json e fornirlo come "data portability".
create or replace function public.export_my_data()
returns jsonb
language plpgsql
security definer set search_path = public, auth
as $$
declare
  v_uid     uuid := auth.uid();
  v_role    public.user_role;
  v_email   text;
  v_profile jsonb;
  v_emp     jsonb;
  v_struct  jsonb;
  v_docs    jsonb;
  v_shifts  jsonb;
  v_reviews jsonb;
  v_chat    jsonb;
  v_points  jsonb;
  v_notif   jsonb;
begin
  if v_uid is null then
    raise exception 'Non autenticato' using errcode = '42501';
  end if;
  v_role := public.current_user_role();

  select email into v_email from auth.users where id = v_uid;

  -- Profilo base
  select to_jsonb(p) into v_profile from public.profiles p where p.id = v_uid;

  -- Dati employee (se ruolo employee)
  if v_role = 'employee' then
    select to_jsonb(e) into v_emp from public.employees e where e.id = v_uid;
    select coalesce(jsonb_agg(to_jsonb(d)), '[]'::jsonb) into v_docs
      from public.documents d where d.employee_id = v_uid;
    select coalesce(jsonb_agg(to_jsonb(s)), '[]'::jsonb) into v_shifts
      from public.shifts s where s.employee_id = v_uid;
    select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) into v_points
      from public.employee_points p where p.employee_id = v_uid;
  end if;

  -- Dati structure (se ruolo structure)
  if v_role = 'structure' then
    select to_jsonb(s) into v_struct from public.structures s where s.user_id = v_uid;
    select coalesce(jsonb_agg(to_jsonb(sh)), '[]'::jsonb) into v_shifts
      from public.shifts sh
     where sh.structure_id in (select id from public.structures where user_id = v_uid);
  end if;

  -- Recensioni date dall'utente (qualsiasi ruolo)
  select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) into v_reviews
    from public.reviews r where r.reviewer_id = v_uid;

  -- Messaggi chat inviati
  select coalesce(jsonb_agg(to_jsonb(m)), '[]'::jsonb) into v_chat
    from public.messages m where m.sender_id = v_uid;

  -- Notifiche ricevute
  select coalesce(jsonb_agg(to_jsonb(n)), '[]'::jsonb) into v_notif
    from public.notifications n where n.user_id = v_uid;

  return jsonb_build_object(
    'export_date',  now(),
    'export_format_version', '1.0',
    'gdpr_articles',  array['15 - Accesso', '20 - Portabilità'],
    'user', jsonb_build_object(
      'id',    v_uid,
      'email', v_email,
      'role',  v_role,
      'profile', v_profile
    ),
    'employee_data',   v_emp,
    'structure_data',  v_struct,
    'documents',       coalesce(v_docs, '[]'::jsonb),
    'shifts',          coalesce(v_shifts, '[]'::jsonb),
    'reviews_given',   coalesce(v_reviews, '[]'::jsonb),
    'chat_messages',   coalesce(v_chat, '[]'::jsonb),
    'employee_points', coalesce(v_points, '[]'::jsonb),
    'notifications',   coalesce(v_notif, '[]'::jsonb)
  );
end;
$$;

grant execute on function public.export_my_data() to authenticated;

comment on function public.export_my_data() is
  'GDPR Art. 15+20: ritorna JSON portabile con tutti i dati personali dell''utente corrente.';

-- ----------------------------------------------------------------------------
-- 2. DELETE MY ACCOUNT
-- ----------------------------------------------------------------------------
-- Hard delete dell'account dell'utente corrente. Tutti i dati cascade via FK
-- on delete cascade (profiles, employees, structures, documents, shifts come
-- employee_id set null, messages, notifications, ecc).
--
-- Richiede conferma esplicita via p_email_confirm = email dell'utente,
-- per evitare cancellazioni accidentali da bug client.
--
-- ATTENZIONE: irreversibile. Cancella anche da auth.users.
create or replace function public.delete_my_account(p_email_confirm text)
returns void
language plpgsql
security definer set search_path = public, auth
as $$
declare
  v_uid      uuid := auth.uid();
  v_email    text;
  v_role     public.user_role;
begin
  if v_uid is null then
    raise exception 'Non autenticato' using errcode = '42501';
  end if;

  select email into v_email from auth.users where id = v_uid;

  -- Conferma: email passata deve coincidere con quella dell'utente.
  -- Difesa contro: bug client che chiama la funzione senza conferma utente,
  -- doppio submit, link malevolo.
  if lower(coalesce(p_email_confirm, '')) <> lower(coalesce(v_email, '')) then
    raise exception 'Conferma email errata. Riprova.' using errcode = '22023';
  end if;

  -- Audit log: traccia la cancellazione PRIMA di eseguirla. La FK ON DELETE
  -- SET NULL su actor_id mantiene la riga visibile post-delete.
  v_role := public.current_user_role();
  insert into public.audit_log (event_type, actor_id, target_type, target_id, metadata)
  values (
    case v_role
      when 'employee' then 'employee_deactivated'::public.audit_event_type
      when 'structure' then 'structure_suspended'::public.audit_event_type
      else 'role_changed'::public.audit_event_type
    end,
    v_uid,
    coalesce(v_role::text, 'user'),
    v_uid,
    jsonb_build_object(
      'reason', 'gdpr_self_delete',
      'email',  v_email,
      'role',   v_role,
      'deleted_at', now()
    )
  );

  -- Hard delete da auth.users. Cascade su profiles, employees, structures,
  -- documents, messages, notifications, reviews (via reviewer_id FK cascade),
  -- shifts (employee_id set null), conversations (cascade).
  delete from auth.users where id = v_uid;
end;
$$;

grant execute on function public.delete_my_account(text) to authenticated;

comment on function public.delete_my_account(text) is
  'GDPR Art. 17: cancella account dell''utente corrente. Richiede email di conferma. Irreversibile.';
