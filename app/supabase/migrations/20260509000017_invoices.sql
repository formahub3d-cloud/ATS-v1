-- ATS-v1 · Migrazione 18: fatturazione mensile strutture
-- ----------------------------------------------------------------------------
-- Schema MVP per le fatture: una riga per (struttura, periodo mese).
-- L'admin genera la fattura via RPC `generate_invoice_for_period` che
-- aggrega i turni completed del mese e salva il totale.
--
-- Stripe-ready: campo `stripe_payment_intent_id` nullable per future
-- integrazioni. Per ora lo stato passa manualmente da 'draft' → 'sent'
-- → 'paid' / 'overdue' / 'void' tramite admin UI.
-- ----------------------------------------------------------------------------

create type public.invoice_status as enum (
  'draft',     -- generata, non ancora inviata al cliente
  'sent',      -- inviata, in attesa di pagamento
  'paid',      -- pagata
  'overdue',   -- scaduta (oltre payment_due)
  'void'       -- annullata
);

create table public.invoices (
  id                       uuid primary key default gen_random_uuid(),
  structure_id             uuid not null references public.structures (id) on delete restrict,
  period_year              integer not null,
  period_month             integer not null check (period_month between 1 and 12),

  -- Aggregato dei turni completed del periodo:
  shifts_count             integer not null default 0,
  total_hours              numeric(10, 2) not null default 0,
  total_amount             numeric(10, 2) not null default 0,    -- compenso erogato ai dipendenti
  fee_amount               numeric(10, 2) not null default 0,    -- margine ATS (configurabile)
  grand_total              numeric(10, 2) not null default 0,    -- total_amount + fee_amount

  status                   public.invoice_status not null default 'draft',

  -- Stripe (nullable per ora)
  stripe_payment_intent_id text,
  stripe_invoice_id        text,

  -- Date critiche
  payment_due              date,
  sent_at                  timestamptz,
  paid_at                  timestamptz,

  notes                    text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  -- Una sola fattura per coppia (struttura, periodo).
  unique (structure_id, period_year, period_month)
);

create index invoices_structure_idx on public.invoices (structure_id, period_year desc, period_month desc);
create index invoices_status_idx    on public.invoices (status) where status in ('draft', 'sent', 'overdue');
create index invoices_period_idx    on public.invoices (period_year, period_month);

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.tg_set_updated_at();

-- ----------------------------------------------------------------------------
-- RPC: generate_invoice_for_period(structure_id, year, month)
-- Aggrega i turni completed del periodo, crea o aggiorna la riga `invoices`.
-- Idempotente: re-eseguibile senza creare duplicati.
-- ----------------------------------------------------------------------------
create or replace function public.generate_invoice_for_period(
  p_structure_id uuid,
  p_year         integer,
  p_month        integer
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_count       integer;
  v_hours       numeric(10, 2);
  v_amount      numeric(10, 2);
  v_invoice_id  uuid;
  v_period_from date;
  v_period_to   date;
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'Solo admin può generare fatture' using errcode = '42501';
  end if;

  v_period_from := make_date(p_year, p_month, 1);
  v_period_to   := (v_period_from + interval '1 month - 1 day')::date;

  -- Aggrega: count, ore (con fallback estimated/time), amount.
  select
    count(*),
    coalesce(sum(
      case
        when s.check_in_at is not null and s.check_out_at is not null
          then extract(epoch from (s.check_out_at - s.check_in_at)) / 3600.0
        when s.estimated_hours is not null then s.estimated_hours
        else extract(epoch from (s.time_end - s.time_start)) / 3600.0
      end
    ), 0)::numeric(10,2),
    coalesce(sum(
      s.hourly_rate *
      case
        when s.check_in_at is not null and s.check_out_at is not null
          then extract(epoch from (s.check_out_at - s.check_in_at)) / 3600.0
        when s.estimated_hours is not null then s.estimated_hours
        else extract(epoch from (s.time_end - s.time_start)) / 3600.0
      end
    ), 0)::numeric(10,2)
  into v_count, v_hours, v_amount
  from public.shifts s
  where s.structure_id = p_structure_id
    and s.status = 'completed'
    and s.shift_date between v_period_from and v_period_to;

  -- Fee ATS: 15% del compenso lordo (configurabile via app_settings se presente).
  declare
    v_fee_pct numeric := 15;
    v_fee_amt numeric;
    v_total   numeric;
  begin
    -- Lettura opzionale settings.
    select coalesce((value->>'percent')::numeric, 15) into v_fee_pct
      from public.app_settings where key = 'ats_fee_percent';
    -- Se la riga non c'è, v_fee_pct resta 15 (default coalesce non si applica
    -- se nessuna riga; gestisco il fallback con il valore già inizializzato).
    if v_fee_pct is null then v_fee_pct := 15; end if;

    v_fee_amt := round(v_amount * v_fee_pct / 100.0, 2);
    v_total   := v_amount + v_fee_amt;

    insert into public.invoices (
      structure_id, period_year, period_month,
      shifts_count, total_hours, total_amount, fee_amount, grand_total,
      status, payment_due
    ) values (
      p_structure_id, p_year, p_month,
      v_count, v_hours, v_amount, v_fee_amt, v_total,
      'draft', (v_period_to + interval '15 days')::date
    )
    on conflict (structure_id, period_year, period_month) do update
      set shifts_count = excluded.shifts_count,
          total_hours  = excluded.total_hours,
          total_amount = excluded.total_amount,
          fee_amount   = excluded.fee_amount,
          grand_total  = excluded.grand_total,
          -- non sovrascriviamo status/sent_at/paid_at se la fattura è già stata
          -- inviata o pagata: mantieni i valori esistenti.
          updated_at   = now()
    returning id into v_invoice_id;

    return v_invoice_id;
  end;
end;
$$;

grant execute on function public.generate_invoice_for_period(uuid, integer, integer) to authenticated;

-- ----------------------------------------------------------------------------
-- RPC: generate_all_invoices_for_period(year, month)
-- Per comodità admin: genera fatture per TUTTE le strutture approved con
-- almeno un turno completed nel periodo.
-- ----------------------------------------------------------------------------
create or replace function public.generate_all_invoices_for_period(
  p_year  integer,
  p_month integer
)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  v_count integer := 0;
  v_struct_id uuid;
  v_period_from date;
  v_period_to date;
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'Solo admin' using errcode = '42501';
  end if;

  v_period_from := make_date(p_year, p_month, 1);
  v_period_to   := (v_period_from + interval '1 month - 1 day')::date;

  for v_struct_id in
    select distinct s.structure_id
      from public.shifts s
     where s.status = 'completed'
       and s.shift_date between v_period_from and v_period_to
  loop
    perform public.generate_invoice_for_period(v_struct_id, p_year, p_month);
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

grant execute on function public.generate_all_invoices_for_period(integer, integer) to authenticated;

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.invoices enable row level security;

create policy "invoices: admin all"
  on public.invoices for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Structure: legge SOLO le proprie fatture.
create policy "invoices: structure select own"
  on public.invoices for select
  using (
    structure_id in (select id from public.structures where user_id = auth.uid())
  );

grant select on public.invoices to authenticated;
