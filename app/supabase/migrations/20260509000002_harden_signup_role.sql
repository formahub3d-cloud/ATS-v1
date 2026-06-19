-- ATS-v1 · Migrazione 3: hardening del trigger handle_new_user
-- ----------------------------------------------------------------------------
-- Bug rilevato dopo Sprint 1: il trigger accettava un qualunque ruolo passato
-- in raw_user_meta_data.role, permettendo a chiunque di registrarsi come
-- 'admin'. Adesso accettiamo solo i ruoli "non privilegiati" da signUp;
-- 'admin' va concesso esclusivamente con UPDATE manuale dal SQL Editor.
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_requested text;
  v_role public.user_role;
begin
  v_requested := new.raw_user_meta_data ->> 'role';

  -- 'admin' non è auto-assegnabile via signUp. I valori validi self-service
  -- sono 'employee' (dipendente) e 'structure' (cliente). Qualunque altro
  -- valore (incluso 'admin', stringhe sporche, NULL) → fallback 'employee'.
  if v_requested in ('employee', 'structure') then
    v_role := v_requested::public.user_role;
  else
    v_role := 'employee';
  end if;

  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    v_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  );
  return new;
end;
$$;
