-- ATS-v1 · Migrazione 25: email transazionali per ogni nuova notification
-- ============================================================================
-- Estende l'infrastruttura email Resend (mig 22) per inviare email anche al
-- destinatario di OGNI public.notifications insertita. Casi coperti
-- automaticamente:
--   • shift_assigned → email al dipendente "Ti hanno assegnato un turno"
--   • shift_cancelled → email a dipendente o struttura
--   • shift_completed → email di chiusura
--   • review_received → email "Hai ricevuto una recensione"
--   • document_expiring → email reminder scadenza
--   • structure_approved/rejected → email all'utente struttura
--
-- Skip per kind='new_message' (già gestito da tg_notify_admin_contact mig 22
-- + chat in-app è il canale primario, evitiamo doppia email).
--
-- Idempotente. Skip silenzioso se app.resend_api_key non configurata.
-- ============================================================================

create or replace function public.tg_notification_send_email()
returns trigger
language plpgsql
security definer set search_path = public, auth, extensions
as $$
declare
  v_resend_key   text;
  v_from_addr    text;
  v_user_email   text;
  v_user_name    text;
  v_html         text;
  v_link_label   text;
  v_link_url     text;
begin
  -- Skip kinds che hanno già un canale email dedicato o non hanno senso via email.
  if new.kind = 'new_message' then return new; end if;

  v_resend_key := nullif(current_setting('app.resend_api_key', true), '');
  if v_resend_key is null then return new; end if;

  -- Email + nome del destinatario.
  select u.email, p.full_name
    into v_user_email, v_user_name
    from auth.users u
    join public.profiles p on p.id = u.id
   where u.id = new.user_id;
  if v_user_email is null then return new; end if;

  v_from_addr := coalesce(
    nullif(current_setting('app.resend_from_address', true), ''),
    'ATS Notifications <onboarding@resend.dev>'
  );

  -- Link CTA: cambia label in base al kind per essere chiaro.
  v_link_label := case new.kind
    when 'shift_assigned'      then 'Vedi il turno'
    when 'shift_cancelled'     then 'Apri ATS'
    when 'shift_completed'     then 'Lascia recensione'
    when 'shift_no_show'       then 'Vai in app'
    when 'review_received'     then 'Vedi recensione'
    when 'document_expiring'   then 'Carica documento'
    when 'structure_approved'  then 'Accedi al portale'
    when 'structure_rejected'  then 'Apri ATS'
    else 'Apri ATS'
  end;
  v_link_url := 'https://ats-servizio.it' || coalesce(new.link, '/');

  v_html := format(
    '<div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f5f5f5;">'
    '<div style="background: white; border-radius: 8px; padding: 24px;">'
      '<p style="color: #6b7280; margin: 0 0 4px; font-size: 13px;">Ciao %s,</p>'
      '<h2 style="color: #06101E; margin: 0 0 12px; font-size: 22px;">%s</h2>'
      '%s'
      '<div style="margin-top: 24px;">'
        '<a href="%s" style="display: inline-block; padding: 12px 20px; background: linear-gradient(135deg, #5BB8F5, #3AA3E8); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">%s →</a>'
      '</div>'
      '<p style="color: #94A3B8; margin: 28px 0 0; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 12px;">'
        'Ricevi questa email perché hai un account su ATS — Al TuO Servizio.<br />'
        'Per gestire le notifiche, accedi al tuo profilo nel portale.'
      '</p>'
    '</div>'
    '</div>',
    coalesce(v_user_name, 'utente'),
    new.title,
    case when new.body is not null
      then format('<p style="color: #374151; line-height: 1.6; margin: 0 0 12px;">%s</p>', new.body)
      else ''
    end,
    v_link_url,
    v_link_label
  );

  -- Invio asincrono via pg_net. La transazione INSERT ritorna subito.
  perform extensions.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_resend_key
    ),
    body := jsonb_build_object(
      'from',    v_from_addr,
      'to',      v_user_email,
      'subject', '[ATS] ' || new.title,
      'html',    v_html
    )
  );

  return new;
exception
  when others then
    -- Non bloccare mai l'INSERT della notifica per un errore email.
    raise warning '[tg_notification_send_email] failed for notification %: %', new.id, sqlerrm;
    return new;
end;
$$;

drop trigger if exists notifications_send_email on public.notifications;
create trigger notifications_send_email
  after insert on public.notifications
  for each row execute function public.tg_notification_send_email();

comment on function public.tg_notification_send_email() is
  'Invia email transazionale al destinatario per ogni nuova notification. '
  'Skippa silenziosamente se Resend non configurato o kind=new_message.';
