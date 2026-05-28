-- ATS-v1 · Migrazione 6: auto-creazione record employees quando profile.role='employee'
-- ----------------------------------------------------------------------------
-- Pattern: quando il trigger handle_new_user crea un profile con role='employee'
-- (signUp pubblico), creiamo subito anche la riga employees con valori default.
-- L'admin completerà dopo i campi contrattuali (hourly_rate, contract_type, ecc.).
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_employee_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role = 'employee' then
    insert into public.employees (id, active)
    values (new.id, true)
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_employee_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_employee_profile();

-- Backfill: se ci sono già profili 'employee' senza riga employees
-- (es. l'admin storico che è stato declassato), li allineiamo.
insert into public.employees (id, active)
select p.id, true
  from public.profiles p
 where p.role = 'employee'
   and not exists (select 1 from public.employees e where e.id = p.id);

-- Promozione di ruolo: se admin cambia un profilo da altro ruolo a 'employee',
-- creiamo automaticamente la riga employees (idempotente con ON CONFLICT).
create or replace function public.handle_role_change_to_employee()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role = 'employee' and (old.role is null or old.role <> 'employee') then
    insert into public.employees (id, active)
    values (new.id, true)
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_profile_role_to_employee
  after update of role on public.profiles
  for each row execute function public.handle_role_change_to_employee();
