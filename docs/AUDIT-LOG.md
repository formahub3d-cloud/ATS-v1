# AUDIT-LOG — Registro cronologico degli audit ATS

> Audit più recente **in alto**. Si compila con `docs/03-AUDIT-TEMPLATE.md` a fine di ogni lavoro.
> Questo registro è la memoria condivisa del progetto: ogni nuovo agente lo legge prima di iniziare.

---

## Audit #4 — 24/06/2026 — Analisi web app e creazione backlog di miglioramenti

**Autore:** Claude Code — sessione di analisi tecnica del frontend
**Sessione / obiettivo:** Analizzare la web app esistente (`app/`) e produrre un backlog di task di
miglioramento prioritizzate e azionabili.
**Fase roadmap:** Pre-Fase 0 / Fase 0 (preparazione del frontend) + anticipo di rifiniture (Fase 6).

### 1. Lavoro svolto
- Eseguiti `npm install` pulito, `npm run build`, `npm run lint` e ispezione del sorgente `src/`.
- Verificate manualmente le criticità (componenti morti, librerie inutilizzate, layer dati, routing).
- Creato **`docs/04-TASK-MIGLIORAMENTI-WEBAPP.md`**: 14 task (T0–T13) con obiettivo, file, DoD, stima,
  priorità (P0/P1/P2) e ordine consigliato.

### 2. File / aree toccate
- `docs/04-TASK-MIGLIORAMENTI-WEBAPP.md` (nuovo) — backlog di miglioramenti del frontend.
- `docs/AUDIT-LOG.md` — questa voce. **Nessun codice applicativo modificato.**

### 3. Stato dei moduli prioritari (semaforo)
Invariato (analisi, nessuno sviluppo funzionale).
| Modulo | Stato | Nota |
|---|---|---|
| Personale | 🟡 | UI su mock, nessun CRUD reale. |
| Turni | 🟡 | UI ricca su mock, nessuna persistenza. |
| Presenze/Ore | 🔴 | Solo UI check-in QR. |
| Calcolo Paga | 🔴 | Nessun motore. |
| Fatturazione | 🔴 | Solo UI `GlassInvoiceCard`. |

### 4. Qualità tecnica
- Build: ✅ passa dopo install pulita (gli errori iniziali erano d'ambiente, non di codice → task T0).
- Lint: ❌ **139 errori** in 83 file (94 `no-unused-vars`, + hooks/refresh/ban-ts-comment).
- `@ts-nocheck`: ⚠️ 6 file. `any` espliciti: 0.
- Bundle: ⚠️ 1.48 MB (384 KB gzip) in un chunk unico, nessun code splitting.
- Layer dati: ❌ mock importati direttamente nelle pagine (manca `src/services/`).
- Auth/routing: ❌ nessuna guardia di ruolo né rotta 404; `zod`/`react-hook-form`/`gsap` non usati.
- Debito tecnico: **non introdotto** (solo documentazione); mappato e prioritizzato nel backlog.

### 5. Decisioni prese
- Backlog separato dalle Fasi 0–6: prepara il frontend (service layer, guardie, stati UI) e sana il
  debito tecnico, senza toccare scelte legali/contabili (che restano al consulente).
- Priorità: prima toolchain/lint/CI e service-layer/auth, poi performance/a11y, infine pulizia/test.

### 6. Rischi / questioni aperte
- Riproducibilità ambiente: il build falliva con dipendenze installate parzialmente → fissare Node e
  `package-lock` (T0) e introdurre CI (T1) prima di lavori più grandi.
- Refactor service-layer (T4) tocca molte pagine: farlo presto, prima che il debito cresca.
- Nessun punto da validare col consulente del lavoro in questo backlog (è tutto frontend tecnico).

### 7. Prossimo passo consigliato
- Partire da **T0 → T2 → T1** (toolchain stabile, lint a 0, CI verde), poi **T4** (service layer) come
  abilitatore della Fase 0.

### 8. Valutazione sintetica (1–5)
- Avanzamento: 1/5 (analisi) · Qualità: 4/5 · Aderenza alle regole (`CLAUDE.md`): 5/5.

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
