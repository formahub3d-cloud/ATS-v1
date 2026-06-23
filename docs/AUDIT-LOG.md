# AUDIT-LOG — Registro cronologico degli audit ATS

> Audit più recente **in alto**. Si compila con `docs/03-AUDIT-TEMPLATE.md` a fine di ogni lavoro.
> Questo registro è la memoria condivisa del progetto: ogni nuovo agente lo legge prima di iniziare.

---

## Audit #6 — 23/06/2026 — Preferenze profilo + fix flusso auth + responsive desktop (portale dipendente)

**Autore:** Claude Code — sessione con Andrea
**Obiettivo:** Completare le Preferenze del profilo, sbloccare login/registrazione, rendere responsive il portale dipendente.

### 1. Lavoro svolto
- **Preferenze profilo (Parte B completa):** città geolocalizzata (autocomplete OpenStreetMap), tipo zona (centro/periferia/eventi/navetta, no prezzi), impiego cercato (full/part/a chiamata = `availability_pref`, distinto dal `contract_type` legale admin-only), paga minima 7/8/9/10€, auto munito→navetta driver. Nuova **migration** `20260619000001_employee_preferences.sql` (`has_vehicle`, `service_zones`, `availability_pref`) + tipi TS.
- **Fix flusso auth:** dopo la registrazione → **ingresso diretto in dashboard** (autoconfirm on → niente re-login, che confondeva/bloccava); messaggio chiaro "email già registrata → accedi"; errori login in italiano. Diagnosi blocco utente: **email duplicata** (riusava la principale). SQL di reset utenti fornito.
- **Responsive desktop — portale dipendente:** dashboard + profilo a **2 colonne** (`lg:` columns), rank allargato (`lg:max-w-3xl`); calendario già responsive; check-in/chat/matching ok centrati (640px). Mobile invariato.
- **Bug critico risolto:** `EmployeeRank` usava `AnimatePresence` senza importarlo → **white-screen per tutti** (non visto da `tsc` per `@ts-nocheck`). Emerso grazie al pass responsive visivo.

### 2. File toccati
`Auth.tsx`, `EmployeeProfile.tsx`, `EmployeeDashboard.tsx`, `EmployeeRank.tsx`, `lib/database.types.ts`, `supabase/migrations/20260619000001_employee_preferences.sql` (nuovo), `docs/AUDIT-LOG.md`.

### 3. Stato moduli
Personale 🟢 (onboarding + profilo completi e responsive). Turni/Presenze/Paga/Fatturazione invariati.

### 4. Qualità
Build verde su tutto. ⚠️ Restano: pagine `@ts-nocheck` con possibili bug latenti (come Rank); 0 test; dati mock in dashboard/rank.

### 5. Decisioni
Responsive = mobile-first mantenuto + desktop a 2 colonne (approvato dall'utente, "applicala ovunque"). `availability_pref` come preferenza, NON contratto legale.

### 6. Rischi / questioni aperte
- ⚠️ **Lavoro TUTTO in locale sul branch `feat/onboarding-dipendente`, NON pushato** → fare push (backup + abilita Claude Code web/mobile).
- Portale **Struttura e Admin** responsive ancora da fare (servono i rispettivi ruoli/login; admin è il più critico su desktop — tabelle dati).
- Migration preferenze da applicare su Supabase (SQL fornito).

### 7. Prossimo passo
Push su GitHub; responsive Admin (promuovere un account ad admin via SQL) + Struttura; poi "**semplicità d'uso**" della web app.

### 8. Valutazione (1–5)
Avanzamento: 4/5 · Qualità: 3,5/5 · Aderenza regole: 4,5/5.

---

## Audit #5 — 19/06/2026 — Onboarding dipendente (registrazione 2 step + dashboard profilo) + audit generale HTML

**Autore:** Claude Code — sessione con Andrea
**Obiettivo:** Snellire la registrazione dipendente, spostare i dati ricchi nella dashboard, diagnosticare il blocco login, produrre un audit generale.
**Fase:** Sviluppo (post-adozione Supabase). Dettaglio completo in `docs/AUDIT-GENERALE-19Giugno2026.html`.

### 1. Lavoro svolto
- **Parte A** — registrazione dipendente ridotta a **2 step** (dati+documento → foto); rimossi IBAN/video/storico/certificazioni/preferenze/colloquio; documento+indirizzo obbligatori; submit snellito. Verificata a video.
- **Parte B** — nuova pagina `/employee/profile` ("Completa profilo": IBAN, storico, certificazioni, video attestazione, ruoli/zona/preferenze) + card di stato in dashboard + route. Build verde.
- **Fix UX auth** — email già registrata → messaggio chiaro + login; errori login tradotti in italiano.
- **Diagnosi blocco login** — causa = email duplicata (autoconfirm ON → email nuova entra subito); pipeline RLS verificata corretta (`employees`/`documents` self-insert presenti). Confermato funzionante con email nuova.
- **Audit generale HTML** prodotto (voto **6,0/10** + valutazione economica + roadmap P0/P1/P2).

### 2. File toccati
`app/src/pages/Auth.tsx`, `components/auth/GlassRoleSelector.tsx`, `pages/EmployeeProfile.tsx` (nuovo), `App.tsx`, `pages/EmployeeDashboard.tsx`, `docs/AUDIT-GENERALE-19Giugno2026.html` (nuovo), `docs/AUDIT-LOG.md`.

### 3. Stato dei moduli
Invariato vs Audit #4 (Personale/Turni/Presenze 🟢, Paga/Fatturazione 🟡). Onboarding dipendente ristrutturato.

### 4. Qualità
Build verde. Restano: **0 test**, **responsive mancante** (mobile-first), dati mock in dashboard, file giganti (`Auth.tsx` ~2.800 righe).

### 5. Decisioni prese
- Registrazione = 2 step; tutto il resto nella dashboard.
- Gate di approvazione (Parte C) = **documento + video attestazione** → sblocca colloquio (scelta utente).
- Resta **web app responsive** (non nativa/App Store); responsive = priorità **P0**.
- Preferenze: città geolocalizzate, tipo zona (no prezzi), contratto full/part/a chiamata, paga 7/8/9/10€, auto munito→navetta driver.

### 6. Rischi / questioni aperte
- Login: account vecchi con password ignota → eliminare/reset su Supabase (azione utente).
- Parte B (preferenze) e Parte C richiedono **mini-migration** (`has_vehicle`, `service_zones`, stato approvazione, slot colloquio) da applicare su Supabase.
- Lavoro su branch `feat/onboarding-dipendente` **non pushato**; `main` locale non pushato.
- Validazione legale paghe ancora aperta.

### 7. Prossimo passo consigliato
Responsive pass (landing + Admin/Struttura); chiudere Parte B (preferenze+migration) e Parte C; push + deploy su Cloudflare Pages + dominio; Vitest sul motore paghe.

### 8. Valutazione sintetica (1–5)
Avanzamento: 3,5/5 · Qualità: 3/5 · Aderenza alle regole: 4,5/5.

---

## Audit #4 — 19/06/2026 — Scoperta e adozione dell'app Supabase esistente (rettifica dello stato di progetto)

**Autore:** Claude Code — sessione con Andrea
**Sessione / obiettivo:** Iniziare la Fase 0 (setup cloud + push GitHub). Durante il setup è emersa una
**contraddizione critica** tra i docs e la realtà del repo.
**Fase roadmap:** RETTIFICA. Lo stato reale **non è** "Pre-Fase 0 / zero codice": esiste già un'app
quasi completa che copre gran parte delle Fasi 1–5, costruita su **Supabase** (non MongoDB).

### 1. Lavoro svolto
- Ri-agganciato il repo locale (era uno ZIP senza storia git) a `origin/main` senza perdere file.
- Scoperti **2 branch `claude/*`** con un'app ATS quasi completa su **Supabase**: `interesting-jemison`
  (58 commit, linea principale, fino al 13/05) e `mystifying-brattain` (3 commit + doc di handoff).
- **Verifica tecnica** del branch più avanzato: `npm install` OK; build inizialmente **ROSSA** (6 errori
  TS in `tsc -b`); corretti **2 bug reali**; build poi **VERDE** (`tsc -b && vite build`) + PWA generata.
- **Merge** di `interesting-jemison` su `main` (pulito, **senza force-push**): `main` ora = app Supabase
  reale + docs di progetto. Push sul remoto **non ancora eseguito** (in attesa di OK utente).

### 2. File / aree toccate
- `app/src/pages/StructureMatching.tsx` e `app/src/hooks/useNotificationsToast.ts` (fix build).
- `app/.env.local` creato (credenziali Supabase dall'handoff; **gitignored**, non committato).
- `main`: merge dei 58 commit Supabase + commit di fix. `docs/AUDIT-LOG.md` (questo) e `CLAUDE.md`
  (banner di rettifica).

### 3. Stato dei moduli prioritari (semaforo) — RIVISTO ALLA REALTÀ (Supabase)
| Modulo | Stato | Nota (da commit + build; **da confermare con audit funzionale**) |
|---|---|---|
| Personale | 🟢 | CRM strutture/dipendenti/documenti reale, onboarding wizard, scadenze doc (cron). |
| Turni | 🟢 | Schema turni + matching like-based + assegnazione + cancel/duplica + calendario. |
| Presenze/Ore | 🟢 | QR check-in/out reale con timer ore lavorate (RPC security definer). |
| Calcolo Paga | 🟡 | `admin-payroll` con drill-down + "Compenso lordo"; **manca** verifica aderenza a tariffe da config validata dal consulente + test. |
| Fatturazione | 🟡 | Fatturazione mensile strutture "Stripe-ready" (sprint-18); da verificare completezza/export. |

### 4. Qualità tecnica
- Build **verde** dopo i 2 fix. 26 migration SQL versionate, RLS attiva, enum espliciti → buona disciplina DB.
- **Debiti:** 14 vulnerabilità npm (1 low / 4 mod / 9 high); bundle main 685 KB (202 KB gzip) → code-split;
  il cron scadenze documenti riusa `kind='shift_completed'` come fallback (manca un kind proprio
  `document_expiring`, che richiede `ALTER TYPE` enum — decisione DB, non fatta); **test assenti**
  (Vitest non configurato) → critico per il modulo paga; serve gate CI su `npm run build` (non solo `tsc --noEmit`).

### 5. Decisioni prese
- **Stack reale = SUPABASE** (PostgreSQL + Auth + Storage + Realtime), **non** MongoDB/Mongoose/Fastify.
  I docs `00/01/02` e `CLAUDE.md §3–§4` (impianto MongoDB) sono **SUPERATI** e vanno riallineati.
- Adottato `interesting-jemison` come base di `main` (linea più avanzata); `mystifying-brattain`
  accantonato salvo i suoi doc di handoff.
- I 2 fix sono stati scelti come **allineamento del codice allo schema reale** (fonte di verità = migration SQL), non patch ai tipi.

### 6. Rischi / questioni aperte
- ⚠️ **Docs ↔ codice in contraddizione**: i manuali dicono MongoDB, il codice è Supabase → riscrivere
  i docs per non sviare i prossimi agenti (banner provvisorio messo in `CLAUDE.md`).
- ⚠️ **Disallineamento Cowork ↔ realtà**: la pianificazione del 19/06 ignorava l'app già esistente.
- ⚠️ **Paga/Fatturazione & legale**: verificare che tariffe/maggiorazioni vivano in config validata dal
  consulente (regola §3/§7.4) e che il modello (extra/intermittente/occasionale, "solo personale") regga.
- **Segreti**: publishable key Supabase in chiaro in `HANDOFF_PROMPT.md` (branch mystifying) — è
  client-safe (RLS) ma valutarne la rimozione dal repo.

### 7. Prossimo passo consigliato
- **Conferma utente** per: (a) push di `main` su GitHub; (b) deploy target (**Vercel** — già wired via
  `vercel.json`/`_redirects` — **vs Railway** dei docs).
- Riallineare i docs (`CLAUDE.md`/`00`/`01`/`02`) a Supabase + stato reale.
- Smoke-test funzionale end-to-end (login admin/struttura/dipendente) sulla Supabase live.
- Configurare **Vitest** + primi test sul modulo **paga**; triage delle 14 vuln npm.

### 8. Valutazione sintetica (1–5)
- Avanzamento reale: **4/5** (app quasi completa) · Qualità: **3,5/5** (build verde, ma 0 test + vuln + bundle)
  · Aderenza alle regole: **4/5** (verifica + audit + no force-push; resta il riallineamento docs).

---

## Audit #3 — 19/06/2026 — Doppio manuale agenti: Cowork (strategia) + Claude Code (tecnico)

**Autore:** Claude (Cowork) — sessione di kickoff con Andrea
**Sessione / obiettivo:** Separare le istruzioni in due manuali: come opera l'agente in Cowork e come
opera Claude Code.
**Fase roadmap:** Pre-Fase 0 (impostazione).

### 1. Lavoro svolto
- Creato **`docs/ISTRUZIONI-COWORK.md`**: ruolo partner strategico + orchestratore, uso proattivo di
  browser/ricerca/connettori, divisione del lavoro con Claude Code, flusso, guardrail, audit.
- Affinato **`CLAUDE.md`**: dichiarato manuale tecnico di Claude Code (auto-caricato) + sezione
  "Due agenti, due manuali" + rimando al manuale Cowork.

### 2. File / aree toccate
- `docs/ISTRUZIONI-COWORK.md` (nuovo), `CLAUDE.md` (header + §10), `docs/AUDIT-LOG.md`.

### 3. Stato dei moduli prioritari (semaforo)
Invariato (impostazione, nessuno sviluppo).

### 4. Qualità tecnica
- Chiarita la governance a due agenti; ridotto il rischio di sovrapposizione/ambiguità di ruolo.

### 5. Decisioni prese
- **Cowork = partner strategico + orchestratore** (pensa, decide, ricerca, coordina; esegue codice
  solo se serve).
- **Cowork proattivo** su browser/ricerca/connettori, con trasparenza e fonti.
- **Istruzioni di Claude Code nel `CLAUDE.md`** alla radice (auto-caricato), come manuale tecnico definitivo.

### 6. Rischi / questioni aperte
- Mantenere i due manuali **sincronizzati** quando cambiano regole/stack (aggiornarli insieme).

### 7. Prossimo passo consigliato
- Push su GitHub di istruzioni e docs, poi **Fase 0** in Claude Code (Fastify + MongoDB Atlas M0 + auth).

### 8. Valutazione sintetica (1–5)
- Avanzamento: 1/5 (impostazione) · Qualità: 4/5 · Aderenza alle regole: 5/5.

---

## Audit #2 — 19/06/2026 — Hosting: frontend su Railway, Vercel rimosso

**Autore:** Claude (Cowork) — sessione di kickoff con Andrea
**Sessione / obiettivo:** Valutare se ospitare anche il frontend su Railway ed eliminare Vercel.
**Fase roadmap:** Pre-Fase 0 (impostazione).

### 1. Lavoro svolto
- Analisi trade-off Railway-only vs hosting frontend separato (Vercel/Cloudflare Pages).
- Decisione: **frontend + API su Railway**, **Cloudflare davanti** come CDN/cache/SSL/WAF, **Vercel rimosso**.
- Aggiornati CLAUDE.md §4.2 e docs 00 (§B.2/B.3/B.6) e 01 (Fase 0).

### 2. File / aree toccate
- `CLAUDE.md`, `docs/00-GUIDA-STRATEGICA.md`, `docs/01-ROADMAP.md`, `docs/AUDIT-LOG.md`. Nessun codice.

### 3. Stato dei moduli prioritari (semaforo)
Invariato (solo decisione infrastrutturale).

### 4. Qualità tecnica
- Architettura più semplice e consolidata (una sola piattaforma di hosting).

### 5. Decisioni prese
- **Frontend su Railway** insieme all'API; **Cloudflare** davanti fornisce CDN globale/SSL/WAF, quindi
  il frontend statico resta veloce ovunque pur non usando un host dedicato.
- **Vercel eliminato** dallo stack (era solo una convenzione, nessun vantaggio decisivo per questo caso).
- Alternativa documentata e a costo zero, se in futuro si volesse separare il frontend: **Cloudflare Pages**.

### 6. Rischi / questioni aperte
- Il frontend su Railway è un container "sempre attivo": tenerlo piccolo e sfruttare la cache di
  Cloudflare per non pagare compute inutile.
- Configurare correttamente Cloudflare davanti a Railway (DNS, cache delle risorse statiche, regole SSL).

### 7. Prossimo passo consigliato
- Invariato: push su GitHub, poi **Fase 0** (Fastify + MongoDB Atlas M0 + Mongoose + auth) su Railway.

### 8. Valutazione sintetica (1–5)
- Avanzamento: 1/5 (impostazione) · Qualità decisione: 4/5 · Aderenza alle regole: 5/5.

---

## Audit #1 — 19/06/2026 — Decisione stack definitivo + analisi costi

**Autore:** Claude (Cowork) — sessione di kickoff con Andrea
**Sessione / obiettivo:** Allineare lo stack tecnico agli strumenti che Andrea già usa e fornire
un'analisi dei costi, evitando di introdurre nuovi servizi a pagamento.
**Fase roadmap:** Pre-Fase 0 (impostazione).

### 1. Lavoro svolto
- Rilevato lo stack reale dell'utente: **Railway, Vercel, MongoDB, Cloudflare, GitHub**.
- Verificati i **costi 2026** di tutti i servizi (ricerca web).
- Aggiornati CLAUDE.md (§4.2, §5, §6, §9) e docs (00 §B.2/B.3/B.5/B.6, 01 Fase 0, 02 modello dati)
  per riflettere **MongoDB/Mongoose** al posto di PostgreSQL/Prisma.
- Aggiunta sezione **B.6 Costi** alla guida strategica.

### 2. File / aree toccate
- `CLAUDE.md`, `docs/00-GUIDA-STRATEGICA.md`, `docs/01-ROADMAP.md`, `docs/02-MODELLO-DATI.md`,
  `docs/AUDIT-LOG.md`. Nessun codice applicativo toccato.

### 3. Stato dei moduli prioritari (semaforo)
Invariato rispetto all'Audit #0 (nessuno sviluppo, solo documentazione/decisioni).

### 4. Qualità tecnica
- Decisione architetturale presa e documentata; coerenza tra i documenti verificata.

### 5. Decisioni prese
- **Database: MongoDB (Atlas) + Mongoose**, non PostgreSQL. Motivo: l'utente lo usa già e lo paga;
  per un MVP è adeguato rispettando 3 regole (Decimal128, transazioni multi-documento, relazioni
  esplicite). Postgres rivalutabile solo se la reportistica diventerà molto complessa.
- **Frontend: Cloudflare Pages** consigliato (gratis e lecito per uso commerciale) invece di Vercel
  Pro ($20/mese), che resta opzione valida se preferito.
- **API: Fastify su Railway**; **documenti: Cloudflare R2**; **CI: GitHub Actions**.
- **Costo MVP stimato: ~$5–15/mese** (di fatto solo Railway). Nessun nuovo strumento a pagamento.

### 6. Rischi / questioni aperte
- Vercel Hobby **non** è ammesso per uso commerciale: se si usa Vercel, serve il piano Pro.
- Disciplina obbligatoria su MongoDB per le paghe (Decimal128 + transazioni): se ignorata, rischio di
  importi errati. Da coprire con test (Vitest).
- Resta aperto il push su GitHub (richiede autenticazione dell'utente).

### 7. Prossimo passo consigliato
- Push del repo su GitHub, poi **Fase 0** in Claude Code con lo stack confermato (Fastify + MongoDB
  Atlas M0 + Mongoose + auth reale).

### 8. Valutazione sintetica (1–5)
- Avanzamento: 1/5 (impostazione) · Qualità decisione: 4/5 · Aderenza alle regole: 5/5.

---

## Audit #0 — 19/06/2026 — Baseline: analisi stato iniziale e setup istruzioni di progetto

**Autore:** Claude (Cowork) — sessione di kickoff con Andrea
**Sessione / obiettivo:** Analizzare la repository `ATS-v1` esistente e creare le istruzioni
professionali di progetto (CLAUDE.md + guida strategica + roadmap + modello dati + sistema di audit).
**Fase roadmap:** Pre-Fase 0 (impostazione).

### 1. Lavoro svolto
- Analisi completa della repo `ATS-v1-main/app` (struttura, stack, pagine, dati).
- Verifica normativa 2026 su lavoro extra / intermittente / occasionale.
- Creati: `CLAUDE.md`, `docs/00-GUIDA-STRATEGICA.md`, `docs/01-ROADMAP.md`, `docs/02-MODELLO-DATI.md`,
  `docs/03-AUDIT-TEMPLATE.md`, `docs/AUDIT-LOG.md`.

### 2. File / aree toccate
- Solo nuova documentazione (nessun codice modificato). Frontend esistente intatto.

### 3. Stato dei moduli prioritari (semaforo)
| Modulo | Stato | Nota |
|---|---|---|
| Personale | 🟡 | UI presente (AdminEmployees) ma su dati mock; nessun CRUD reale. |
| Turni | 🟡 | UI ricca (AdminShifts, calendario, no-show) ma mock; nessuna persistenza. |
| Presenze/Ore | 🔴 | Esiste UI check-in QR (EmployeeCheckin) ma nessun calcolo ore reale. |
| Calcolo Paga | 🔴 | Solo `getHourlyRate` nei mock; nessun motore di calcolo. |
| Fatturazione | 🔴 | Esistono `InvoiceCard` UI; nessuna logica. |

### 4. Qualità tecnica
- TypeScript: **`@ts-nocheck` diffuso** nelle pagine → da sanare incrementalmente.
- Test: **assenti**.
- Sicurezza/GDPR: **auth non reale** (solo `localStorage` role switch); dati personali nei mock.
- Debito tecnico: alto sul backend (inesistente); frontend di buona qualità ma accoppiato ai mock.

### 5. Decisioni prese
- **Modello di business chiarito da Andrea:** attività di **catering** (appalto di servizi genuino) +
  a volte **solo personale**; **NON è un'APL autorizzata**. Documenti aggiornati (CLAUDE.md §1/§3,
  GUIDA §A.1, modello dati con `serviceType CATERING|STAFF_ONLY`).
- Stack target confermato: **Railway + PostgreSQL + Node/TS + Prisma**, framework API = **Fastify**
  (confermato dall'utente; NestJS scartato perché più pesante).
- Modello contrattuale di lavoro: **extra / intermittente / occasionale**.
- Approccio: **bilanciato** (rigore su dati/sicurezza/paghe, pragmatismo sul resto).
- **Repo definitivo: `ATS-v1-main`** (le istruzioni vivono alla radice, sopra `app/`); da pubblicare
  anche su **GitHub** (`github.com/formahub3d-cloud/ATS-v1`).
- Nota infrastruttura: in futuro i progetti Cloud verranno spostati su **SSD esterna** per alleggerire il Mac.
- Regola vincolante: **valori normativi/paga mai hardcodati**, vivono in `config/payroll` validata dal consulente.

### 6. Rischi / questioni aperte
- ⚠️ **Caso "solo personale"**: rischio somministrazione irregolare (azienda non autorizzata APL). Da
  strutturare come servizio con referente in loco e **validare col consulente del lavoro**.
- Push su GitHub: richiede autenticazione git dell'utente (da fare in sessione Claude Code o via setup credenziali).
- Conferma se esistono altri file/documenti da integrare (upload risultavano vuoti).

### 7. Prossimo passo consigliato
- Avviare **Fase 0** in Claude Code: scaffolding `api/` (Fastify), Postgres su Railway, Prisma con
  schema iniziale da `02-MODELLO-DATI.md`, auth reale base. Prima: commit & push del repo su GitHub.

### 8. Valutazione sintetica (1–5)
- Avanzamento: 1/5 (impostazione) · Qualità base esistente: 3/5 · Aderenza alle regole: n/a (regole appena create).
