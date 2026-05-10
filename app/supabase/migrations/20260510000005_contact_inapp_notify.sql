-- ATS-v1 · Migrazione 23: notifica in-app agli admin per nuovi contact_messages
-- ============================================================================
-- Completa lo stack notifiche per i contatti dalla landing:
--   • Mig 19 → form pubblico salva in contact_messages
--   • Mig 22 → email transazionale all'admin via Resend
--   • Mig 23 → notifica in-app (row in public.notifications) per ogni
--             admin attivo, così il toast realtime appare in app
--             (vedi src/hooks/useNotificationsToast.ts)
--
-- Trigger separato da tg_notify_admin_contact (mig 22): separation of
-- concerns, indipendentemente disabilitabile, niente accoppiamenti.
-- ============================================================================

create or replace function public.tg_contact_notify_admins_inapp()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Una notification row per ogni admin attivo. Volumi bassi (admin è 1-3
  -- persone), nessun problema di performance.
  insert into public.notifications (user_id, kind, title, body, link)
  select
    p.id,
    'new_message'::public.notification_kind,
    'Nuovo messaggio dal sito',
    coalesce(new.name, 'Anonimo') || ': ' || new.subject,
    '/admin/messages'
  from public.profiles p
  where p.role = 'admin';

  return new;
exception
  when others then
    raise warning '[tg_contact_notify_admins_inapp] failed: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists contact_messages_notify_admins_inapp on public.contact_messages;
create trigger contact_messages_notify_admins_inapp
  after insert on public.contact_messages
  for each row execute function public.tg_contact_notify_admins_inapp();

comment on function public.tg_contact_notify_admins_inapp() is
  'Crea una notifica in-app per ogni admin quando arriva un nuovo contact_message. '
  'Combina con useNotificationsToast per toast realtime in app.';
