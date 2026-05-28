# ATS-v1 — Roadmap & Task Tracker

> **Ultima modifica**: 2026-05-29
> **Branch attivo**: `claude/mystifying-brattain-457c03`
> **Stack**: Vite 7 · React 19 · TypeScript · Tailwind 3 · shadcn/ui · Framer Motion · **Supabase** (PG + Auth + Storage)

---

## Contesto del prodotto

**ATS** è una società di **catering HORECA** con dipendenti propri. Questa webapp è il CRM operativo + portale dipendenti + portale clienti (strutture).

- **Strutture** = clienti (hotel, ville, eventi, aziende)
- **Lavoratori** = dipendenti diretti ATS (camerieri, cuochi, baristi, runner)
- **Payroll** = manuale via export CSV al consulente del lavoro (no modulo paghe interno)
- **Niente somministrazione**, niente Albo ANPAL

📂 Memorie dettagliate (solo locali): `~/.claude/projects/-Users-andreaaloia-Desktop-ATS---Web-App---CRM-ATS-v1/memory/`

---

## Setup minimo per lavorare al progetto

```bash
git clone https://github.com/formahub3d-cloud/ATS-v1.git
cd ATS-v1
git checkout claude/mystifying-brattain-457c03   # branch corrente
cd app
npm install
cp .env.example .env.local
# Riempire .env.local con i valori reali Supabase (vedi sezione qui sotto)
npm run dev
```

### Variabili d'ambiente (`app/.env.local` — non versionato)

```
VITE_SUPABASE_URL=https://pvzbuitpgeowzgbognqa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Cvgmc9c3NgRJ4vzzGtb6zg_aTkaUUM-
```

> La `publishable_key` è sicura nel client (è progettata per essere pubblica), RLS protegge i dati.
> La `secret_key` resta solo nel dashboard Supabase, mai esposta.

### Supabase

- **Progetto**: `pvzbuitpgeowzgbognqa` (Frankfurt)
- **Dashboard**: https://supabase.com/dashboard/project/pvzbuitpgeowzgbognqa
- **Account admin esistente**: `andreaaloia15@gmail.com`
- **Migrazioni applicate** (in ordine): `20260508000001` → `20260509000005` (vedi `app/supabase/migrations/`)
- Se è un ambiente nuovo, applicarle tutte in ordine via SQL Editor del dashboard.

### Deploy target

- **Frontend**: Vercel (deploy auto da push su `main`)
- **Dominio produzione**: `altuoservizio.online` (registrato su IONOS)
- **DNS**: A 76.76.21.21 (apex), CNAME `cname.vercel-dns.com` (www)

---

## Stato sprint

### ✅ Sprint 1 — Fondamenta Supabase (commit `8feed32`)
- [x] Client Supabase tipizzato, AuthContext con signIn/signUp/signOut
- [x] Schema iniziale: enum `user_role`, tabella `profiles`, trigger auto-creazione profilo
- [x] RLS minime su `profiles`, GRANT espliciti per Data API
- [x] Hardening trigger contro auto-promozione admin via signUp

### ✅ Sprint 2A — CRM Strutture (commit `dee6280`)
- [x] Schema tabelle `structures`, `employees`, `documents` + enum `document_type`
- [x] Storage bucket `employee-docs` (privato, 10MB, JPG/PNG/WebP/PDF) con policy RLS
- [x] Service layer: `structures.ts`, `employees.ts`, `documents.ts`
- [x] Pagina `/admin/structures-live` con CRUD reale (search, soft-delete, dialog di crea/modifica)

### 🟡 Sprint 2B — CRM Dipendenti (in corso)
- [x] **2B-1**: pagina `/admin/employees-live` con CRUD dipendenti + filtro skill
- [x] **2B-3**: componente `EmployeeDocuments` (upload, signed URL, verifica admin)
- [x] **2B-4**: link sidebar admin per pagine Live
- [x] Migrazione `HashRouter` → `BrowserRouter` (URL puliti, no `#`)
- [x] `vercel.json` con rewrite SPA per deploy futuro
- [x] Migrazione 6 — auto-creazione record `employees` quando appare profilo con role=employee
- [ ] **2B-2**: pagina `/employee/profile-live` — vista del dipendente loggato che modifica i propri dati e carica documenti
- [ ] **2B-5**: build TS finale + commit + push Sprint 2B

### ⏳ Fase 2 — Deploy produzione
- [ ] **2-2**: setup progetto Vercel, import repo, env vars
- [ ] **2-3**: DNS IONOS `altuoservizio.online` → Vercel (record A + CNAME)
- [ ] **2-4**: aggiornare Site URL su Supabase Auth → smoke test mobile in produzione

### ⏳ Fase 3 — Test sul campo
- [ ] Identificare 1-2 dipendenti tester reali (settore catering)
- [ ] Guidare il flusso: registrazione → upload HACCP → upload CD
- [ ] Raccogliere feedback, fixare bug UX/responsive

### ⏳ Fase 4 — Sprint 3 e oltre (post field-test)
- Sprint 3: tabella `events` + portale struttura (richiesta servizio catering)
- Sprint 4: disponibilità dipendente + applications + assegnazione admin
- Sprint 5: check-in QR + GPS + tabella `worked_hours`
- Sprint 6: contratti + firma digitale FEA (Yousign / Namirial)
- Sprint 7: chat realtime + Resend email + push PWA
- Sprint 8: recensioni bidirezionali + export ore CSV mensile
- Sprint 9: formazione HACCP (corsi + quiz + attestati PDF)
- Sprint 10: polish, accessibilità, hardening, deploy v1 finale

---

## Decisioni tecniche prese (locked)

| Area | Scelta | Motivo |
|---|---|---|
| Modello marketplace | Bidirezionale **interno** (cliente richiede, dipendente propone, admin assegna) | ATS è catering, non agenzia somministrazione |
| Settore | Solo HORECA | Nicchia chiara, vincoli verticali coerenti |
| Payroll | Manuale via export CSV al consulente | Niente sviluppo modulo paghe in v1 |
| Backend | Supabase (PG + Auth + Storage + Realtime) | Time-to-market rapidissimo |
| Frontend | Vite + React + TS + shadcn | Base esistente di Kimi |
| Routing | BrowserRouter + rewrite SPA su Vercel | URL puliti |
| Convenzione visiva | shadcn "sobrio" sulle pagine `Live`; design glass-morphism Kimi tenuto come riferimento sulle pagine `demo` | Funzionalità prima, poi rifinitura visiva |

---

## Convenzioni di codice

- **TypeScript strict**: tutto tipizzato dal DB su (`src/lib/database.types.ts`)
- **Service layer**: tutte le query Supabase passano da `src/services/*.ts`, mai inline nelle pagine
- **Naming pagine**: `*Live.tsx` = pagina agganciata a Supabase; senza suffisso = pagina demo Kimi
- **Forms**: react-hook-form + zod, sempre. Mai `useState` per form complessi
- **Toast**: `useToast` da `@/components/ui/ToastSystem` (esistente)
- **data-testid**: ogni elemento interattivo + dato critico, kebab-case
- **Migrazioni SQL**: file numerati `YYYYMMDDHHMMSS_nome.sql` in `app/supabase/migrations/`

---

## Pagine attualmente disponibili

| URL | Stato | Cosa fa |
|---|---|---|
| `/` | Demo Kimi | Landing pubblica |
| `/auth` | Demo Kimi | Login/registrazione (mock, da rifare in `AuthLive`) |
| `/admin` | Demo Kimi | Dashboard admin con KPI mock |
| `/admin/structures-live` | ✅ Live | CRUD strutture reale |
| `/admin/employees-live` | ✅ Live | CRUD dipendenti reale |
| `/admin/structures` | Demo Kimi | Pagina strutture mock |
| `/admin/employees` | Demo Kimi | Pagina dipendenti mock |
| `/admin/shifts` | Demo Kimi | Turni mock (Sprint 3 li farà live) |
| `/admin/settings` | Demo Kimi | Impostazioni mock |
| `/structure*` | Demo Kimi | Portale struttura mock |
| `/employee*` | Demo Kimi | Portale dipendente mock |

---

## Riferimenti rapidi

- **Repo GitHub**: https://github.com/formahub3d-cloud/ATS-v1
- **Supabase dashboard**: https://supabase.com/dashboard/project/pvzbuitpgeowzgbognqa
- **Dev server locale**: http://localhost:3000
- **Worktree path locale (Mac di origine)**: `/Users/andreaaloia/Desktop/ATS - Web App - CRM/ATS-v1/app/.claude/worktrees/mystifying-brattain-457c03/app/`
