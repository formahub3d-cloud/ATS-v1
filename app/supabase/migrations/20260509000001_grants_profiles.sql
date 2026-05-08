-- ATS-v1 · Migrazione 2: GRANT espliciti su profiles
-- ----------------------------------------------------------------------------
-- Il progetto ha "Automatically expose new tables" disattivato (sicurezza by
-- default). Senza GRANT espliciti, anche con RLS configurata la Data API
-- risponde 401 prima di valutare le policy. Aggiungiamo i privilegi minimi.
-- ----------------------------------------------------------------------------

-- Schema usage (di solito già presente, ma non costa essere espliciti).
grant usage on schema public to anon, authenticated;

-- Profiles: anon e authenticated possono fare SELECT (RLS filtra le righe).
-- UPDATE solo authenticated (RLS impedisce di cambiare il proprio role e
-- impedisce a non-admin di toccare profili altrui).
-- INSERT non concesso a nessuno: la creazione passa SOLO dal trigger
-- handle_new_user(), che gira come SECURITY DEFINER.
-- DELETE solo authenticated, ma RLS lo limita ad admin.
grant select on public.profiles to anon, authenticated;
grant update, delete on public.profiles to authenticated;

-- Funzione helper consultata dalle policy: deve essere eseguibile dai ruoli.
grant execute on function public.current_user_role() to anon, authenticated;
