-- ATS-v1 · Migrazione 20: SEED demo data per dashboard admin/structure/employee
-- ============================================================================

-- pgcrypto serve per crypt() + gen_salt() nel _seed_demo_user.
-- Su Supabase è quasi sempre già abilitata, ma garantiamo.
create extension if not exists pgcrypto with schema extensions;

-- Scopo: popolare il sistema con dati realistici (6 strutture, 12 dipendenti,
-- ~30 turni passati con recensioni, 5 messaggi contatto) per dare vita alle
-- dashboard amministrative e poter fare demo a clienti.
--
-- Idempotente: tutti gli ID sono deterministici (md5(...)::uuid) e gli insert
-- usano on conflict do nothing. Riesegui senza danni.
--
-- ATTENZIONE: questa migration inserisce direttamente in auth.users sfruttando
-- il trigger on_auth_user_created che crea le profile con ruolo dedotto da
-- raw_user_meta_data. Se Supabase cambia lo schema interno di auth.users in
-- futuro, questa migration potrebbe rompersi. In quel caso: rimuovere o
-- aggiornare la chiamata a _seed_demo_user.
--
-- Per pulire i dati seed (utile in dev): seleziona public._seed_demo_clear()
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper: insert demo user via auth.users (il trigger crea profile + ruolo).
-- ----------------------------------------------------------------------------
create or replace function public._seed_demo_user(
  p_id uuid, p_email text, p_role text, p_full_name text
) returns uuid
language plpgsql
-- Search_path include extensions perché pgcrypto (crypt, gen_salt) su Supabase
-- è installato in schema extensions, non in public.
security definer set search_path = public, auth, extensions
as $$
begin
  -- Insert in auth.users con campi minimi richiesti da GoTrue.
  -- Il trigger handle_new_user creerà automaticamente la profile leggendo
  -- raw_user_meta_data (role + full_name).
  insert into auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  )
  values (
    p_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    p_email,
    -- Schema-qualified + cast esplicito a text per evitare "unknown" overload.
    extensions.crypt('DemoPassword123!'::text, extensions.gen_salt('bf'::text)),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('role', p_role, 'full_name', p_full_name),
    now(),
    now()
  )
  on conflict (id) do nothing;

  return p_id;
end;
$$;
comment on function public._seed_demo_user(uuid, text, text, text) is
  'Helper interno per il seed demo. Crea utente auth + profile via trigger.';

-- ----------------------------------------------------------------------------
-- Helper: pulizia (riservato dev). Cancella in cascade tutti i seed.
-- ----------------------------------------------------------------------------
create or replace function public._seed_demo_clear() returns void
language plpgsql
security definer set search_path = public, auth
as $$
begin
  -- Cascading via FK on delete cascade dai profiles.
  delete from auth.users where email like '%@ats-demo.local';
  delete from public.contact_messages where source = 'seed-demo';
end;
$$;

-- ============================================================================
-- 1. CONTACT MESSAGES (5) — no FK auth, semplice
-- ============================================================================
insert into public.contact_messages (id, name, email, subject, body, source, status, created_at)
values
  (md5('seed:contact:1')::uuid, 'Marco Verdi', 'marco.verdi@trattorialebetulle.it',
   'Sono una struttura HORECA e voglio info',
   'Salve, gestisco una trattoria a Telese e vorrei capire come funziona il vostro servizio. Abbiamo bisogno di personale weekend.',
   'seed-demo', 'new', now() - interval '2 hours'),
  (md5('seed:contact:2')::uuid, 'Laura Bianchi', 'laura.bianchi@gmail.com',
   'Cerco lavoro e voglio iscrivermi',
   'Buongiorno, sono cameriera con 5 anni di esperienza, vivo a Benevento. Vorrei candidarmi.',
   'seed-demo', 'in_progress', now() - interval '1 day'),
  (md5('seed:contact:3')::uuid, 'Giovanni Russo', 'g.russo@hotelbelvedere.com',
   'Sono una struttura HORECA e voglio info',
   'Hotel 4 stelle a Telese cerca staff per banqueting eventi. Possiamo fissare una call?',
   'seed-demo', 'handled', now() - interval '3 days'),
  (md5('seed:contact:4')::uuid, 'Anna Promo', 'spam@bot.tld',
   'Stampa / partnership',
   'Buy followers, real cheap, click here etc.',
   'seed-demo', 'spam', now() - interval '5 days'),
  (md5('seed:contact:5')::uuid, 'Carla Esposito', 'carla.e@email.it',
   'Cerco lavoro e voglio iscrivermi',
   'Sommelier AIS, disponibile da settembre. Allego CV via mail successiva.',
   'seed-demo', 'new', now() - interval '6 hours')
on conflict (id) do nothing;

-- ============================================================================
-- 2. STRUTTURE (6) + relativi user
-- ============================================================================
do $$
declare
  v_now timestamptz := now();
  v_struct record;
begin
  -- Crea i 6 user struttura
  perform public._seed_demo_user(md5('seed:user:struct:1')::uuid, 'demo-trattoria@ats-demo.local',     'structure', 'Trattoria Nonna Lucia');
  perform public._seed_demo_user(md5('seed:user:struct:2')::uuid, 'demo-belvedere@ats-demo.local',     'structure', 'Hotel Belvedere');
  perform public._seed_demo_user(md5('seed:user:struct:3')::uuid, 'demo-barcentrale@ats-demo.local',   'structure', 'Bar Centrale');
  perform public._seed_demo_user(md5('seed:user:struct:4')::uuid, 'demo-pizzeria@ats-demo.local',      'structure', 'Pizzeria del Borgo');
  perform public._seed_demo_user(md5('seed:user:struct:5')::uuid, 'demo-glicine@ats-demo.local',       'structure', 'Ristorante Il Glicine');
  perform public._seed_demo_user(md5('seed:user:struct:6')::uuid, 'demo-catering@ats-demo.local',      'structure', 'Catering Eventi BN');
end $$;

insert into public.structures (
  id, user_id, status, ragione_sociale, piva, sede_legale, sede_operativa,
  referente_nome, referente_ruolo, referente_telefono, referente_email,
  tipo_struttura, zona, descrizione,
  ruoli_cercati, persone_per_turno, tag_valori,
  accettato_contratto, accettato_contratto_at, approved_at,
  created_at
) values
  (md5('seed:struct:1')::uuid, md5('seed:user:struct:1')::uuid, 'approved',
   'Trattoria Nonna Lucia S.r.l.', '01234567890', 'Via Mario Vetrone 12, 82100 Benevento (BN)', null,
   'Lucia De Rosa', 'Titolare', '+39 0824 312456', 'demo-trattoria@ats-demo.local',
   'Trattoria', 'Benevento centro', 'Trattoria tipica beneventana, 80 coperti, specialità carne alla griglia.',
   array['Cameriere', 'Aiuto Cuoco', 'Lavapiatti'], 4, array['Famiglia', 'Tradizione'],
   true, now() - interval '120 days', now() - interval '118 days', now() - interval '120 days'),

  (md5('seed:struct:2')::uuid, md5('seed:user:struct:2')::uuid, 'approved',
   'Hotel Belvedere Hospitality S.p.A.', '02345678901', 'Viale degli Atlantici 45, 82100 Benevento (BN)', null,
   'Antonio Russo', 'Direttore', '+39 0824 411222', 'demo-belvedere@ats-demo.local',
   'Hotel', 'Benevento periferia', 'Hotel 4 stelle, ristorante interno + sala convegni 200 posti.',
   array['Cameriere', 'Receptionist', 'Hostess', 'Barman'], 6, array['Eccellenza', 'Internazionale'],
   true, now() - interval '90 days', now() - interval '88 days', now() - interval '90 days'),

  (md5('seed:struct:3')::uuid, md5('seed:user:struct:3')::uuid, 'approved',
   'Bar Centrale di Mario Esposito', '03456789012', 'Corso Garibaldi 88, 82100 Benevento (BN)', null,
   'Mario Esposito', 'Titolare', '+39 0824 222333', 'demo-barcentrale@ats-demo.local',
   'Bar / Caffetteria', 'Benevento centro', 'Caffetteria storica del centro, colazioni, pranzi veloci, aperitivi.',
   array['Barman', 'Cameriere'], 2, array['Velocità', 'Quartiere'],
   true, now() - interval '60 days', now() - interval '58 days', now() - interval '60 days'),

  (md5('seed:struct:4')::uuid, md5('seed:user:struct:4')::uuid, 'approved',
   'Pizzeria del Borgo S.n.c.', '04567890123', 'Via Roma 5, 82019 Sant''Agata de'' Goti (BN)', null,
   'Salvatore Coppola', 'Pizzaiolo / Titolare', '+39 0823 717123', 'demo-pizzeria@ats-demo.local',
   'Pizzeria', 'Sant''Agata de'' Goti', 'Pizzeria napoletana verace, forno a legna, 60 coperti + asporto.',
   array['Pizzaiolo', 'Cameriere', 'Aiuto Pizzaiolo'], 3, array['Tradizione', 'Qualità'],
   true, now() - interval '45 days', now() - interval '43 days', now() - interval '45 days'),

  (md5('seed:struct:5')::uuid, md5('seed:user:struct:5')::uuid, 'approved',
   'Ristorante Il Glicine S.r.l.', '05678901234', 'Via Caracciolo 22, 82037 Telese Terme (BN)', null,
   'Francesca Romano', 'Restaurant Manager', '+39 0824 940123', 'demo-glicine@ats-demo.local',
   'Ristorante Gourmet', 'Telese Terme', 'Ristorante gourmet, 1 forchetta Gambero Rosso, cucina creativa territoriale.',
   array['Cameriere', 'Sommelier', 'Chef de Partie'], 5, array['Eccellenza', 'Innovazione'],
   true, now() - interval '30 days', now() - interval '28 days', now() - interval '30 days'),

  (md5('seed:struct:6')::uuid, md5('seed:user:struct:6')::uuid, 'approved',
   'Catering Eventi BN S.r.l.', '06789012345', 'Zona PIP, 82100 Benevento (BN)', null,
   'Roberto Pellegrino', 'Event Manager', '+39 0824 555666', 'demo-catering@ats-demo.local',
   'Catering / Banqueting', 'Provincia di Benevento', 'Catering per matrimoni, cerimonie, eventi corporate. Operativi su BN e provincia.',
   array['Cameriere', 'Hostess', 'Barman', 'Chef de Partie', 'Lavapiatti'], 12, array['Flessibilità', 'Eventi'],
   true, now() - interval '20 days', now() - interval '18 days', now() - interval '20 days')
on conflict (id) do nothing;

-- ============================================================================
-- 3. DIPENDENTI (12) + relativi user
-- ============================================================================
do $$
begin
  perform public._seed_demo_user(md5('seed:user:emp:1')::uuid,  'demo-emp1@ats-demo.local',  'employee', 'Marco Bianchi');
  perform public._seed_demo_user(md5('seed:user:emp:2')::uuid,  'demo-emp2@ats-demo.local',  'employee', 'Laura Rossi');
  perform public._seed_demo_user(md5('seed:user:emp:3')::uuid,  'demo-emp3@ats-demo.local',  'employee', 'Giovanni Esposito');
  perform public._seed_demo_user(md5('seed:user:emp:4')::uuid,  'demo-emp4@ats-demo.local',  'employee', 'Anna Russo');
  perform public._seed_demo_user(md5('seed:user:emp:5')::uuid,  'demo-emp5@ats-demo.local',  'employee', 'Davide Romano');
  perform public._seed_demo_user(md5('seed:user:emp:6')::uuid,  'demo-emp6@ats-demo.local',  'employee', 'Sara Coppola');
  perform public._seed_demo_user(md5('seed:user:emp:7')::uuid,  'demo-emp7@ats-demo.local',  'employee', 'Luca Pellegrino');
  perform public._seed_demo_user(md5('seed:user:emp:8')::uuid,  'demo-emp8@ats-demo.local',  'employee', 'Martina De Rosa');
  perform public._seed_demo_user(md5('seed:user:emp:9')::uuid,  'demo-emp9@ats-demo.local',  'employee', 'Francesco Verdi');
  perform public._seed_demo_user(md5('seed:user:emp:10')::uuid, 'demo-emp10@ats-demo.local', 'employee', 'Chiara Greco');
  perform public._seed_demo_user(md5('seed:user:emp:11')::uuid, 'demo-emp11@ats-demo.local', 'employee', 'Stefano Bruno');
  perform public._seed_demo_user(md5('seed:user:emp:12')::uuid, 'demo-emp12@ats-demo.local', 'employee', 'Alessia Conte');
end $$;

insert into public.employees (
  id, cf, iban, birth_date, birth_place,
  contract_type, hourly_rate, weekly_hours_max, hire_date, active,
  skills, bio, home_city, home_province
) values
  (md5('seed:user:emp:1')::uuid,  'BNCMRC85A01F839X', 'IT60X0542811101000000123456', '1985-01-01', 'Benevento',
   'a_chiamata', 12.50, 20, current_date - interval '10 months', true,
   '["cameriere", "runner"]'::jsonb, 'Cameriere senior, esperienza ristoranti gourmet.', 'Benevento', 'BN'),
  (md5('seed:user:emp:2')::uuid,  'RSSLRA90B41F839Y', 'IT60X0542811101000000123457', '1990-02-01', 'Benevento',
   'tempo_determinato', 13.00, 35, current_date - interval '8 months', true,
   '["cameriere", "hostess"]'::jsonb, 'Cameriera con esperienza in eventi e banqueting.', 'Benevento', 'BN'),
  (md5('seed:user:emp:3')::uuid,  'SPSGNN82C15F839Z', 'IT60X0542811101000000123458', '1982-03-15', 'Benevento',
   'a_chiamata', 14.50, 24, current_date - interval '14 months', true,
   '["pizzaiolo", "aiuto_cuoco"]'::jsonb, 'Pizzaiolo napoletano, esperienza forno a legna.', 'Sant''Agata de'' Goti', 'BN'),
  (md5('seed:user:emp:4')::uuid,  'RSSANN88D05F839W', 'IT60X0542811101000000123459', '1988-04-05', 'Benevento',
   'tempo_indeterminato', 15.00, 40, current_date - interval '24 months', true,
   '["chef_de_partie", "aiuto_cuoco"]'::jsonb, 'Chef de partie, formazione ALMA, specialista carni.', 'Telese Terme', 'BN'),
  (md5('seed:user:emp:5')::uuid,  'RMNDVD95E10F839V', 'IT60X0542811101000000123460', '1995-05-10', 'Benevento',
   'a_chiamata', 11.50, 16, current_date - interval '6 months', true,
   '["barman", "barback"]'::jsonb, 'Barman creativo, AIBES level 2.', 'Benevento', 'BN'),
  (md5('seed:user:emp:6')::uuid,  'CPPSRA92F50F839U', 'IT60X0542811101000000123461', '1992-06-10', 'Benevento',
   'a_chiamata', 12.00, 20, current_date - interval '4 months', true,
   '["hostess", "receptionist"]'::jsonb, 'Hostess multilingua, ottima padronanza inglese.', 'Benevento', 'BN'),
  (md5('seed:user:emp:7')::uuid,  'PLLLCU90G07F839T', 'IT60X0542811101000000123462', '1990-07-07', 'Benevento',
   'occasionale', 11.00, 12, current_date - interval '3 months', true,
   '["lavapiatti", "runner"]'::jsonb, 'Studente, disponibile weekend.', 'Benevento', 'BN'),
  (md5('seed:user:emp:8')::uuid,  'DRSMTN87H45F839S', 'IT60X0542811101000000123463', '1987-08-05', 'Telese',
   'tempo_determinato', 16.00, 35, current_date - interval '12 months', true,
   '["sommelier", "cameriere"]'::jsonb, 'Sommelier AIS, esperienza ristorazione gourmet.', 'Telese Terme', 'BN'),
  (md5('seed:user:emp:9')::uuid,  'VRDFNC83I20F839R', 'IT60X0542811101000000123464', '1983-09-20', 'Benevento',
   'tempo_indeterminato', 18.50, 40, current_date - interval '36 months', true,
   '["chef_de_partie", "head_chef"]'::jsonb, 'Capo cucina, 12 anni di esperienza.', 'Sant''Agata de'' Goti', 'BN'),
  (md5('seed:user:emp:10')::uuid, 'GRCCHR94L60F839Q', 'IT60X0542811101000000123465', '1994-10-12', 'Telese',
   'a_chiamata', 12.50, 18, current_date - interval '5 months', true,
   '["cameriere"]'::jsonb, 'Cameriera, disponibilità serale e weekend.', 'Telese Terme', 'BN'),
  (md5('seed:user:emp:11')::uuid, 'BRNSFN89M11F839P', 'IT60X0542811101000000123466', '1989-11-11', 'Benevento',
   'a_chiamata', 13.00, 22, current_date - interval '7 months', true,
   '["barman", "cameriere"]'::jsonb, 'Barman e cameriere, esperienza in cocktail bar.', 'Benevento', 'BN'),
  (md5('seed:user:emp:12')::uuid, 'CNTLSS96N28F839O', 'IT60X0542811101000000123467', '1996-12-28', 'Benevento',
   'occasionale', 11.50, 10, current_date - interval '2 months', true,
   '["hostess", "runner"]'::jsonb, 'Studentessa universitaria, primo anno con ATS.', 'Benevento', 'BN')
on conflict (id) do nothing;

-- ============================================================================
-- 4. SHIFTS PASSATI (~30) con check-in/out — distribuzione su 60 giorni
-- ============================================================================
-- Pattern: ogni structure_id riceve 5 turni completed, distribuiti casualmente
-- negli ultimi 60 giorni, assegnati a employee diversi. UUID deterministici
-- per idempotenza.
insert into public.shifts (
  id, structure_id, employee_id, status, shift_date, time_start, time_end,
  role, hourly_rate, estimated_hours,
  check_in_at, check_out_at,
  assigned_at, created_at
)
select
  md5('seed:shift:' || s.struct_idx || ':' || s.idx)::uuid,
  (array[
    md5('seed:struct:1')::uuid, md5('seed:struct:2')::uuid, md5('seed:struct:3')::uuid,
    md5('seed:struct:4')::uuid, md5('seed:struct:5')::uuid, md5('seed:struct:6')::uuid
  ])[s.struct_idx],
  (array[
    md5('seed:user:emp:1')::uuid,  md5('seed:user:emp:2')::uuid,  md5('seed:user:emp:3')::uuid,
    md5('seed:user:emp:4')::uuid,  md5('seed:user:emp:5')::uuid,  md5('seed:user:emp:6')::uuid,
    md5('seed:user:emp:7')::uuid,  md5('seed:user:emp:8')::uuid,  md5('seed:user:emp:9')::uuid,
    md5('seed:user:emp:10')::uuid, md5('seed:user:emp:11')::uuid, md5('seed:user:emp:12')::uuid
  ])[((s.struct_idx + s.idx - 1) % 12) + 1],
  'completed'::public.shift_status,
  current_date - ((s.idx * 11 + s.struct_idx * 3) || ' days')::interval,
  '19:00'::time,
  '23:30'::time,
  ('{Cameriere,Barman,Chef de Partie,Hostess,Pizzaiolo}'::text[])[((s.idx + s.struct_idx) % 5) + 1],
  12.50 + ((s.idx + s.struct_idx) % 5),
  4.5,
  ((current_date - ((s.idx * 11 + s.struct_idx * 3) || ' days')::interval) + interval '19 hours')::timestamptz,
  ((current_date - ((s.idx * 11 + s.struct_idx * 3) || ' days')::interval) + interval '23 hours 30 minutes')::timestamptz,
  ((current_date - ((s.idx * 11 + s.struct_idx * 3 + 5) || ' days')::interval))::timestamptz,
  ((current_date - ((s.idx * 11 + s.struct_idx * 3 + 7) || ' days')::interval))::timestamptz
from (
  select struct_idx, idx
  from generate_series(1, 6) struct_idx,
       generate_series(1, 5) idx
) s
on conflict (id) do nothing;

-- ============================================================================
-- 5. RECENSIONI (struttura → employee + employee → struttura per ogni shift)
-- ============================================================================
-- Per ogni turno completed inserisce 2 recensioni: una della struttura sul
-- dipendente (4-5 stelle) e una del dipendente sulla struttura (4-5 stelle).
--
-- Il trigger reviews_validate fa controlli su auth.uid() che è NULL durante
-- una migration (non c'è sessione utente). Lo disabilitiamo temporaneamente
-- per il seed e lo riabilitiamo subito dopo. Pulito perché la migration gira
-- come postgres con permessi pieni.
alter table public.reviews disable trigger reviews_validate;

insert into public.reviews (id, shift_id, reviewer_id, reviewer_role, rating, tags, comment, created_at)
select
  md5('seed:rev:struct:' || sh.id::text)::uuid,
  sh.id,
  s.user_id,
  'structure'::public.review_role,
  4 + ((extract(day from sh.shift_date)::int) % 2),  -- 4 o 5 stelle
  array['Puntuale', 'Professionale'],
  'Ottimo turno, dipendente affidabile.',
  sh.check_out_at + interval '2 hours'
from public.shifts sh
join public.structures s on s.id = sh.structure_id
where sh.status = 'completed'
  and sh.id in (
    select md5('seed:shift:' || ss.struct_idx || ':' || ss.idx)::uuid
    from generate_series(1, 6) ss(struct_idx), generate_series(1, 5) tt(idx)
  )
on conflict (shift_id, reviewer_id) do nothing;

insert into public.reviews (id, shift_id, reviewer_id, reviewer_role, rating, tags, comment, created_at)
select
  md5('seed:rev:emp:' || sh.id::text)::uuid,
  sh.id,
  sh.employee_id,
  'employee'::public.review_role,
  4 + ((extract(day from sh.shift_date)::int + 1) % 2),
  array['Ambiente accogliente', 'Pagamento puntuale'],
  'Esperienza positiva, ci tornerei volentieri.',
  sh.check_out_at + interval '3 hours'
from public.shifts sh
where sh.status = 'completed'
  and sh.employee_id is not null
  and sh.id in (
    select md5('seed:shift:' || ss.struct_idx || ':' || ss.idx)::uuid
    from generate_series(1, 6) ss(struct_idx), generate_series(1, 5) tt(idx)
  )
on conflict (shift_id, reviewer_id) do nothing;

-- Riabilita la validazione: in produzione le review devono passare il check.
alter table public.reviews enable trigger reviews_validate;

-- ============================================================================
-- DONE
-- ============================================================================
-- Per pulire: select public._seed_demo_clear();
