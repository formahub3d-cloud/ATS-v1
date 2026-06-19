-- ATS-v1 · Migrazione 14: cron giornaliero per notifiche scadenza documenti
-- ----------------------------------------------------------------------------
-- Problema: i documenti `documents.expires_at` (HACCP, idoneità sanitaria,
-- ecc.) scadono e nessuno avvisa il dipendente in modo automatico.
-- Soluzione: una funzione SQL che, eseguita ogni giorno, crea notifiche per
-- documenti che scadono in 30 / 15 / 7 / 0 / -1..-30 giorni, evitando
-- duplicati (controlla che non sia già stata creata una notifica con lo
-- stesso link nelle ultime 20 ore).
--
-- L'esecuzione automatica è schedulata con pg_cron (estensione disponibile
-- sui progetti Supabase). Default: tutti i giorni alle 09:00 UTC.
-- ----------------------------------------------------------------------------

-- Abilita le estensioni necessarie (no-op se già abilitate).
create extension if not exists pg_cron with schema extensions;

-- ----------------------------------------------------------------------------
-- Funzione che crea le notifiche di scadenza
-- ----------------------------------------------------------------------------
create or replace function public.notify_expiring_documents()
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  v_inserted integer := 0;
  v_record   record;
  v_days     integer;
  v_title    text;
  v_body     text;
  v_link     text := '/employee/documents';
  v_doc_label text;
begin
  for v_record in
    select d.*,
           (d.expires_at - current_date)::integer as days_to_expiry
      from public.documents d
     where d.expires_at is not null
       and d.expires_at >= current_date - interval '30 days'
       and d.expires_at <= current_date + interval '30 days'
  loop
    v_days := v_record.days_to_expiry;

    -- Notifica solo a soglie significative (30/15/7/0 e -1..-30 ogni 7 giorni).
    if not (v_days in (30, 15, 7, 3, 1, 0) or (v_days < 0 and v_days % 7 = 0)) then
      continue;
    end if;

    -- Etichetta tipo documento human-friendly.
    v_doc_label := case v_record.type
      when 'haccp' then 'attestato HACCP'
      when 'health_cert' then 'idoneità sanitaria'
      when 'id_card' then 'carta d''identità'
      when 'tax_code' then 'codice fiscale'
      when 'iban_proof' then 'prova IBAN'
      when 'contract' then 'contratto'
      else 'documento'
    end;

    if v_days > 0 then
      v_title := 'Documento in scadenza';
      v_body := 'Il tuo ' || v_doc_label || ' scade tra ' || v_days || ' giorn' ||
                case when v_days = 1 then 'o' else 'i' end || '. Aggiornalo per continuare a ricevere turni.';
    elsif v_days = 0 then
      v_title := 'Documento scade oggi';
      v_body := 'Il tuo ' || v_doc_label || ' scade oggi. Carica subito una versione aggiornata.';
    else
      v_title := 'Documento scaduto';
      v_body := 'Il tuo ' || v_doc_label || ' è scaduto da ' || abs(v_days) || ' giorn' ||
                case when abs(v_days) = 1 then 'o' else 'i' end || '. Carica una versione valida per riprendere i turni.';
    end if;

    -- Evita duplicati: una sola notifica simile nelle ultime 20 ore.
    if exists (
      select 1 from public.notifications n
       where n.user_id = v_record.employee_id
         and n.title = v_title
         and n.body  = v_body
         and n.created_at > now() - interval '20 hours'
    ) then
      continue;
    end if;

    insert into public.notifications (user_id, kind, title, body, link)
    values (v_record.employee_id, 'shift_completed', v_title, v_body, v_link);
    -- Nota: riusiamo `kind = 'shift_completed'` come fallback "generico" perché
    -- non vogliamo aggiungere un nuovo enum value qui (richiederebbe migrazione
    -- separata). Il type semantico verrà aggiunto in una fetta dedicata se
    -- vogliamo filtrare lato UI.

    v_inserted := v_inserted + 1;
  end loop;

  return v_inserted;
end;
$$;

grant execute on function public.notify_expiring_documents() to authenticated;

-- ----------------------------------------------------------------------------
-- Cron job: ogni giorno alle 09:00 UTC.
-- pg_cron usa il time zone UTC del server. 09:00 UTC = 10:00 IT inverno,
-- 11:00 IT estate (sufficiente per essere "appena svegliati" in entrambi i
-- casi).
-- ----------------------------------------------------------------------------
-- unschedule del job se già esiste (idempotenza in caso di re-run).
do $$
begin
  perform cron.unschedule('ats-notify-expiring-docs');
exception when others then
  null;
end $$;

select cron.schedule(
  'ats-notify-expiring-docs',
  '0 9 * * *',
  $cron$select public.notify_expiring_documents();$cron$
);

-- Per disabilitare manualmente:
--   select cron.unschedule('ats-notify-expiring-docs');
-- Per testare subito:
--   select public.notify_expiring_documents();
