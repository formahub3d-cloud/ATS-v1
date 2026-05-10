-- ATS-v1 · Migrazione 22: notifica email all'admin per nuovi messaggi contatto
-- ============================================================================
-- Quando un visitatore compila /contatti, oggi il messaggio finisce in
-- public.contact_messages e basta. Se nessuno guarda /admin/messages,
-- muore lì. Aggiungiamo un trigger AFTER INSERT che invia un'email
-- all'admin via Resend API (https://resend.com — free tier: 100 mail/giorno).
--
-- Architettura: niente Edge Function. Usiamo pg_net (estensione Supabase)
-- per fare HTTP POST direttamente dal trigger Postgres → API Resend.
-- Vantaggi: zero deploy in più, tutto SQL, asincrono (non blocca l'INSERT).
--
-- Configurazione richiesta (una tantum, vedi README/istruzioni in chat):
--   alter database postgres set app.resend_api_key = 're_xxxxx';
--   alter database postgres set app.admin_notify_email = 'tuo@email.it';
--   select pg_reload_conf();
--
-- Se app.resend_api_key non è settata, il trigger NON fallisce: skippa
-- silenziosamente. Questo permette di applicare la migration anche prima
-- di avere l'account Resend.
-- ============================================================================

create extension if not exists pg_net with schema extensions;

create or replace function public.tg_notify_admin_contact()
returns trigger
language plpgsql
security definer set search_path = public, extensions
as $$
declare
  v_resend_key   text;
  v_admin_email  text;
  v_from_addr    text;
  v_html         text;
begin
  -- Settings opzionali. current_setting con missing_ok=true torna NULL se
  -- non set, evitando errore "unrecognized configuration parameter".
  v_resend_key := nullif(current_setting('app.resend_api_key', true), '');
  v_admin_email := nullif(current_setting('app.admin_notify_email', true), '');

  -- Se non c'è key configurata, skippa silenziosamente. L'admin può
  -- comunque vedere il messaggio in /admin/messages.
  if v_resend_key is null or v_admin_email is null then
    return new;
  end if;

  -- "from" deve essere su un dominio verificato sul tuo account Resend.
  -- Default: onboarding@resend.dev funziona per test (limite 100/day,
  -- solo verso indirizzi verificati). Per produzione: setta
  -- app.resend_from_address al tuo dominio (es. notify@ats-servizio.it).
  v_from_addr := coalesce(
    nullif(current_setting('app.resend_from_address', true), ''),
    'ATS Notifications <onboarding@resend.dev>'
  );

  v_html := format(
    '<div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f5f5f5;">'
    '<div style="background: white; border-radius: 8px; padding: 24px;">'
      '<h2 style="color: #06101E; margin-top: 0;">Nuovo messaggio dal sito</h2>'
      '<table style="width: 100%%; border-collapse: collapse; margin: 16px 0;">'
        '<tr><td style="padding: 8px 0; color: #6b7280; width: 100px;">Da</td><td style="padding: 8px 0; color: #111827;"><strong>%s</strong></td></tr>'
        '<tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;"><a href="mailto:%s" style="color: #5BB8F5;">%s</a></td></tr>'
        '<tr><td style="padding: 8px 0; color: #6b7280;">Oggetto</td><td style="padding: 8px 0; color: #111827;">%s</td></tr>'
        '<tr><td style="padding: 8px 0; color: #6b7280;">Provenienza</td><td style="padding: 8px 0; color: #6b7280; font-size: 12px;">%s</td></tr>'
      '</table>'
      '<div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 16px;">'
        '<p style="color: #111827; line-height: 1.6; white-space: pre-wrap; margin: 0;">%s</p>'
      '</div>'
      '<div style="margin-top: 24px; padding: 16px; background: #f0f9ff; border-radius: 6px; font-size: 13px; color: #075985;">'
        'Vai su <a href="https://ats-servizio.it/admin/messages" style="color: #075985; font-weight: 600;">/admin/messages</a> per gestire la richiesta.'
      '</div>'
    '</div>'
    '</div>',
    coalesce(new.name, '—'),
    new.email, new.email,
    coalesce(new.subject, '—'),
    coalesce(new.source, '—'),
    new.body
  );

  -- POST asincrono a Resend. pg_net non blocca: il trigger torna subito,
  -- la richiesta HTTP viene processata in background dal worker pg_net.
  perform extensions.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_resend_key
    ),
    body := jsonb_build_object(
      'from',     v_from_addr,
      'to',       v_admin_email,
      'subject',  '[ATS] ' || coalesce(new.subject, 'Nuovo contatto'),
      'html',     v_html,
      'reply_to', new.email
    )
  );

  return new;
exception
  when others then
    -- Non bloccare mai l'INSERT del messaggio per un errore email.
    -- L'utente non deve vedere "errore form": il messaggio è salvato
    -- in DB, l'email può fallire silenziosamente.
    raise warning '[tg_notify_admin_contact] failed: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists contact_messages_notify_admin on public.contact_messages;
create trigger contact_messages_notify_admin
  after insert on public.contact_messages
  for each row execute function public.tg_notify_admin_contact();

comment on function public.tg_notify_admin_contact() is
  'Invia email all''admin via Resend al ricevimento di un contact_message. '
  'Skippa silenziosamente se app.resend_api_key non è configurata.';
