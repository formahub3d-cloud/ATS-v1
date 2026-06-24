# AUDIT-LOG — Registro cronologico degli audit ATS

> Audit più recente **in alto**. Si compila con `docs/03-AUDIT-TEMPLATE.md` a fine di ogni lavoro.
> Questo registro è la memoria condivisa del progetto: ogni nuovo agente lo legge prima di iniziare.

---

## Audit #8 — 24/06/2026 — M1: migrazione pagine Admin al service layer + stati

**Autore:** Claude Code (+ 4 sub-agenti) · **Branch:** `claude/web-app-improvements-3modcu` (+ `staging`)
**Sessione / obiettivo:** Avviare **M1** (vedi `AUDIT-GENERALE.md` §5.2): spostare le pagine dai mock
diretti al service layer async con stati loading/error.
**Fase roadmap:** abilitazione Fase 0 (frontend pronto all'API).

### 1. Lavoro svolto
- Espanso il service layer admin: aggiunti getter `getAlerts`, `getWeeklyDays`, `getReperibili`,
  `getPenalties`, `getRevenueData`, `getRoleDistribution` in `adminService` + tipi corrispondenti in
  `types/domain.ts` (`AdminAlert`, `WeeklyDay`, `Reperibile`, `Penalty`, `RevenuePoint`, `RoleDistributionSlice`).
- Migrate **4 pagine Admin** (`AdminDashboard`, `AdminEmployees`, `AdminShifts`, `AdminStructures`) al
  pattern `useAsync` + `LoadingState`/`ErrorState`, sostituendo gli import di dati record dai mock con i
  service. Config/helper di presentazione (`rankColors`, `statusColors`, `getHourlyRate`, `*Photos`)
  restano importati direttamente (non sono dati personali).
- Con `EmployeeDashboard` (Audit #5) sono **5 pagine** ora sul service layer.

### 2. File / aree toccate
- `app/src/services/adminService.ts`, `app/src/types/domain.ts` (nuovi getter/tipi).
- `app/src/pages/{AdminDashboard,AdminEmployees,AdminShifts,AdminStructures}.tsx` (migrazione).
- `docs/04-TASK-MIGLIORAMENTI-WEBAPP.md`, `docs/AUDIT-LOG.md`, HTML rigenerati.

### 3. Stato dei moduli prioritari (semaforo)
Invariato a livello funzionale (mock); migliorata la robustezza dello strato dati (loading/error reali).
Personale 🟡 · Turni 🟡 · Presenze/Ore 🔴 · Paga 🔴 · Fatturazione 🔴.

### 4. Qualità tecnica
- Build ✅ · Lint **0 errori** (35 warning: per lo più `react-hooks/exhaustive-deps` sulle nuove
  dipendenze, accettati) · `@ts-nocheck` 0.
- Le pagine admin non importano più i dati record dai mock: il passaggio all'API toccherà solo
  `src/services/*` e `simulate`.

### 5. Decisioni prese
- Migrazione delegata a 4 sub-agenti su file non sovrapposti, dopo aver completato i service (così
  nessun conflitto sui file di servizio). Integrazione verificata con build+lint complessivi.
- I dati **inline** delle pagine Structure*/Employee(Calendar/Matching/Rank) non sono stati spostati:
  sono co-locati e tipizzati; migrazione rinviata (minore valore/rischio). AdminSettings resta su
  config statica editabile.

### 6. Rischi / questioni aperte
- **QA visiva non eseguita** (solo build+lint): verificare le 4 pagine admin (tabelle, filtri, grafici,
  no-show pool, drawer) prima del merge.
- Restano da migrare: `AdminSettings` (config) + pagine con dati inline → completa M1.

### 7. Prossimo passo consigliato
- Completare M1 sulle pagine con dati inline (creando `structureService` ed estendendo
  `employeeService`), poi **A5** (zod nei form) e **A4** (primi test Vitest).

### 8. Valutazione sintetica (1–5)
- Avanzamento: 2/5 · Qualità: 4/5 · Aderenza alle regole (`CLAUDE.md`): 5/5.

---

## Audit #7 — 24/06/2026 — Audit generale del progetto (punteggi 1–10 + backlog + handoff)

**Autore:** Claude Code · **Branch:** `claude/web-app-improvements-3modcu` (+ `staging`)
**Sessione / obiettivo:** Produrre un **audit generale** olistico aggiornato all'ultimo intervento, con
valutazione 1–10, backlog esaustivo (aggiungere/migliorare/automatizzare/implementare) e istruzioni per
il prossimo agente. Nessuna modifica al codice applicativo.

### 1. Lavoro svolto
- Creato **`docs/AUDIT-GENERALE.md`**: fotografia complessiva, punteggi per dimensione (complessivo
  **5.5/10**), stato moduli, backlog ragionato e §7 **Istruzioni per il prossimo agente**.
- Aggiunta versione HTML: **`docs/AUDIT-GENERALE.html`** (generata da `scripts/md2html.mjs`).
- Rigenerato **`docs/AUDIT-LOG.html`** con questo Audit #7.

### 2. File / aree toccate
- `docs/AUDIT-GENERALE.md` (nuovo), `docs/AUDIT-GENERALE.html` (nuovo), `docs/AUDIT-LOG.md` (questa voce),
  `docs/AUDIT-LOG.html` (rigenerato). **Nessun codice applicativo toccato.**

### 3. Stato dei moduli prioritari (semaforo)
Invariato (documentazione). Personale 🟡 · Turni 🟡 · Presenze/Ore 🔴 · Paga 🔴 · Fatturazione 🔴.

### 4. Qualità tecnica
- Build ✅ · Lint 0 errori · `@ts-nocheck` 0. Nessun impatto sul codice.

### 5. Decisioni prese
- Separare l'**audit generale** (fotografia + backlog + handoff) dal **registro cronologico**
  (`AUDIT-LOG.md`), mantenendo entrambi e generando l'HTML da MD.

### 6. Rischi / questioni aperte
- Invariati rispetto ad Audit #6 (QA visiva mancante; sicurezza/backend assenti). Dettaglio in `AUDIT-GENERALE.md` §6.

### 7. Prossimo passo consigliato
- Seguire l'ordine in `AUDIT-GENERALE.md` §7: M1 (migrazione pagine) → A5/A4 (zod+test) → M2 (a11y) →
  Fase 0 backend (A1→A2→A3).

### 8. Valutazione sintetica (1–5)
- Avanzamento: 2/5 · Qualità: 5/5 · Aderenza alle regole (`CLAUDE.md`): 5/5.
- (Valutazione estesa 1–10 per dimensione in `docs/AUDIT-GENERALE.md` §2.)

---

## Audit #6 — 24/06/2026 — Miglioramenti UI/UX (T8, T9, T12 + ScrollToTop)

**Autore:** Claude Code — sessione UI/UX sul branch `claude/web-app-improvements-3modcu`
**Sessione / obiettivo:** Solo miglioramenti **UI/UX** (no Stripe, no dominio/legale): performance
percepita, robustezza, accessibilità e rifinitura. Poi audit aggiornato (MD + HTML), push su GitHub e
staging, e istruzioni per il prossimo agente.
**Fase roadmap:** rifinitura frontend (anticipo Fase 6) a supporto della Fase 0.

### 1. Lavoro svolto
- **T8 — Code splitting:** tutte le rotte ora in `React.lazy` + `<Suspense>` con `PageLoader`. Il
  chunk iniziale passa da **1.48 MB → ~415 kB**; `recharts` (~430 kB) si carica **solo** nella
  dashboard admin, non all'avvio.
- **ScrollToTop:** nuovo componente che riporta lo scroll in cima ad ogni cambio rotta (difetto UX
  classico delle SPA).
- **T12 — Robustezza + meta:** `ErrorBoundary` globale (niente più pagina bianca su errore di render);
  `index.html` arricchito (favicon SVG brandizzato, `theme-color`, `color-scheme: dark`, `viewport-fit`,
  Open Graph).
- **T9 — Accessibilità (parziale):** regole globali `:focus-visible` e `prefers-reduced-motion` in
  `index.css`; **icone reali** nella sidebar (prima un placeholder generico identico per ogni voce);
  `aria-label`/`aria-current` su nav desktop, bottom nav e bottoni-icona; `aria-hidden` sulle icone
  decorative.

### 2. File / aree toccate
- **Nuovi:** `app/src/components/{ScrollToTop,PageLoader,ErrorBoundary}.tsx`, `app/public/favicon.svg`.
- **Modificati:** `app/src/App.tsx` (lazy + Suspense + ErrorBoundary + ScrollToTop), `app/index.html`,
  `app/src/index.css` (a11y), `app/src/components/Layout.tsx` (icone reali + aria),
  `app/src/components/employee/GlassBottomNav.tsx` (aria), `app/src/pages/EmployeeDashboard.tsx` (aria).

### 3. Stato dei moduli prioritari (semaforo)
Invariato a livello funzionale (mock). Migliorata UX/performance/robustezza trasversale.
| Modulo | Stato | Nota |
|---|---|---|
| Personale | 🟡 | UI su mock dietro service tipato. |
| Turni | 🟡 | UI su mock. |
| Presenze/Ore | 🔴 | Solo UI. |
| Calcolo Paga | 🔴 | Nessun motore. |
| Fatturazione | 🔴 | Solo UI. |

### 4. Qualità tecnica
- **Build:** ✅ · **Lint:** 0 errori (32 warning RC noti) · **`@ts-nocheck`:** 0.
- **Performance:** bundle iniziale ridotto ~72% (≈1.48 MB → ≈0.42 MB) grazie al code splitting.
- **Accessibilità:** focus da tastiera visibile ovunque; rispetto di `prefers-reduced-motion`; nav con
  stato corrente annunciato; icone di navigazione finalmente distinte e semantiche.
- **Robustezza:** errori di rendering gestiti da `ErrorBoundary` con fallback e reload.

### 5. Decisioni prese
- Code splitting per-rotta (semplice ed efficace); nessun `manualChunks` custom per ora.
- A11y incrementale: regole globali + componenti condivisi adesso; audit fine (contrasto colori,
  label dei form lunghi come Auth) rinviato come task dedicato.

### 6. Rischi / questioni aperte
- **QA visiva non eseguita** (solo build+lint): consigliato giro manuale, soprattutto sidebar (nuove
  icone) e transizioni con `prefers-reduced-motion` attivo.
- A11y non completa: contrasto dei testi `text-muted` e label dei form ancora da verificare (T9 resta 🟡).
- Bundle: `AdminDashboard` ~435 kB per `recharts`; valutabile un alleggerimento futuro.

### 7. Prossimo passo consigliato
- Completare **T4/T6** (migrare le restanti pagine ai service + stati) e **T7** (zod nei form), poi
  **T13** (Vitest). In parallelo, avviare la **Fase 0** backend (vedi handoff in fondo all'Audit #5 §7).

### 8. Valutazione sintetica (1–5)
- Avanzamento: 2/5 (frontend; backend assente) · Qualità: 4/5 · Aderenza alle regole (`CLAUDE.md`): 5/5.

---

## Audit #5 — 24/06/2026 — Implementazione miglioramenti web app (T0–T6, T10) + piano per la produzione

**Autore:** Claude Code — sessione di implementazione sul branch `claude/web-app-improvements-3modcu`
**Sessione / obiettivo:** Eseguire i miglioramenti prioritari del frontend dal backlog (Audit #4) e
lasciare l'app funzionante, pulita e pronta ad accogliere il backend; chiudere con un audit che
elenchi tutte le task e i lavori mancanti per una **web app pronta all'uso**.
**Fase roadmap:** preparazione/abilitazione **Fase 0** + anticipo di rifiniture (Fase 6).

### 1. Lavoro svolto
- **T0 — Toolchain:** aggiunti `app/.nvmrc` (Node 20) e `engines` in `package.json` → build riproducibile.
- **T2 — Lint:** da **139 errori → 0** (restano 32 *warning* sulle regole sperimentali del React
  Compiler, declassate consapevolmente — vedi §5). Rimossi import/variabili inutilizzati in ~25 file
  (con l'aiuto di sub-agenti su gruppi non sovrapposti).
- **T3 — `@ts-nocheck`:** rimossi da **tutti e 6** i file; TypeScript ora controlla l'intero `src/`.
  Nel farlo sono emersi e sono stati **corretti bug reali** prima nascosti (vedi §4).
- **T10 — Pulizia:** rimossi **15 file morti** (componenti base non importati: varianti non-Glass di
  shift/swipe/invoice card, componenti auth duplicati, `BottomNav`, `structureMock.ts`) e le
  dipendenze inutilizzate **`gsap` + `@gsap/react`**.
- **T4 — Service layer (parziale):** creati `src/types/domain.ts` (tipi di dominio centralizzati),
  `src/services/` (`adminService`, `employeeService`, `simulate`) che incapsulano i mock dietro
  funzioni **async** (firma identica a una futura fetch API), e l'hook `src/hooks/useAsync.ts`
  (`{data, loading, error}`). Migrata `EmployeeDashboard` come esempio end-to-end.
- **T5 — Route guard + 404:** `src/components/RoleGuard.tsx` (UX per ruolo), `src/pages/NotFound.tsx`
  e rotta catch-all `*`; `App.tsx` ora protegge `/admin`, `/structure`, `/employee`.
- **T6 — Stati UI (parziale):** `src/components/states/` (`LoadingState/EmptyState/ErrorState`),
  applicati a `EmployeeDashboard`.
- **T1 — CI:** `.github/workflows/ci.yml` esegue `npm ci → lint → build` su push/PR (step `test`
  predisposto per Vitest).

### 2. File / aree toccate
- **Nuovi:** `app/.nvmrc`, `.github/workflows/ci.yml`, `app/src/components/RoleGuard.tsx`,
  `app/src/pages/NotFound.tsx`, `app/src/components/states/index.tsx`, `app/src/hooks/useAsync.ts`,
  `app/src/services/{simulate,adminService,employeeService}.ts`, `app/src/types/domain.ts`.
- **Rimossi (15):** `app/src/data/structureMock.ts`; `components/structure/{ShiftCard,InvoiceCard,EmployeeSwipeCard}.tsx`;
  `components/employee/{ShiftCard,SwipeCard,BottomNav}.tsx`;
  `components/auth/{CalendarPicker,DocumentUploader,OTPInput,OnboardingStep,RoleSelector,StepIndicator,TagSelector,VideoRecorder}.tsx`.
- **Modificati (principali):** `app/package.json`, `eslint.config.js`, `src/App.tsx`,
  `src/components/Avatar.tsx`, `src/data/mockAdmin.ts`, le 6 ex-`@ts-nocheck` (`AdminDashboard`,
  `AdminEmployees`, `AdminSettings`, `AdminShifts`, `EmployeeCheckin`, `EmployeeRank`),
  `src/pages/EmployeeDashboard.tsx`, `Home.tsx`, + pulizia import in ~15 altre pagine/componenti.

### 3. Stato dei moduli prioritari (semaforo)
Invariato a livello funzionale (i moduli restano su mock); migliorata la **base tecnica** sotto.
| Modulo | Stato | Nota |
|---|---|---|
| Personale | 🟡 | UI su mock, ora dietro `adminService` (tipato); manca CRUD reale/API. |
| Turni | 🟡 | UI su mock; manca persistenza. |
| Presenze/Ore | 🔴 | Solo UI check-in. |
| Calcolo Paga | 🔴 | Nessun motore (resta da fare in `api/`, con config validata). |
| Fatturazione | 🔴 | Solo UI. |

### 4. Qualità tecnica
- **TypeScript:** `@ts-nocheck` **0** (erano 6); `tsc -b` pulito; nessun `any` introdotto.
- **Lint:** **0 errori** (32 warning RC). **CI** attiva.
- **Bug reali corretti** (emersi togliendo `@ts-nocheck`):
  1. `Avatar` riceveva `size="sm"` (stringa) mentre attendeva un numero → `width:"sm"`/`NaN`: gli
     avatar erano **renderizzati rotti**. Ora `Avatar` accetta token (`xs/sm/md/lg/xl`) mappati a px
     e una prop `style`.
  2. `getHourlyRate(zone, role)` era chiamato con **parametri invertiti** (rank al posto della zona)
     in AdminEmployees/AdminSettings/AdminShifts → tariffe sbagliate/uniformi. Corretti.
  3. `zoneRates` (array) era usato come **mappa** (`Object.entries`/indici) in AdminEmployees/AdminSettings
     → si renderizzavano oggetti al posto dei numeri. Corretta l'iterazione.
  4. `Math.random` durante il render (Home, AdminShifts) → valori instabili: reso deterministico/statico.
- **Debito tecnico:** ridotto (codice morto, dipendenze, type-safety, architettura dati).
- **Sicurezza/GDPR:** invariata; `RoleGuard` è **solo UX** (la sicurezza reale è demandata al backend).

### 5. Decisioni prese
- **Regole React Compiler sperimentali** (`set-state-in-effect`, `static-components`,
  `react-refresh/only-export-components`) **declassate a `warn`** (non bloccano CI) e `react-hooks/purity`
  **disattivata sui componenti shadcn generati** (`src/components/ui/**`): troppo aggressive sul codice
  legacy/vendored. Da indirizzare progressivamente. Il codice *nostro* per `purity` è stato invece corretto.
- **T4 incrementale**, non big-bang: creata l'infrastruttura e migrata 1 pagina, per non rischiare
  regressioni su 15 pagine senza QA visiva. Le altre seguiranno una per volta.
- **`getHourlyRate`** allargata ad accettare `zone: string` (ha già un fallback) per togliere gli
  errori union senza inventare valori (resta logica mock, non motore paga).

### 6. Rischi / questioni aperte
- **Nessuna QA visiva** eseguita in questa sessione (solo `build`+`lint`): consigliato un giro manuale
  dell'app (specie pagine admin con tabelle tariffe ridisegnate) prima del merge.
- I **bug di tariffa** corretti cambiano i numeri mostrati: verificare che i nuovi valori siano quelli
  attesi a livello di UI (non hanno valore legale — il motore paga validato è ancora da costruire).
- Bundle ancora monolitico (~1.48 MB): vedi T8.
- Punti da validare col **consulente del lavoro / commercialista**: nessuno in questa sessione (lavoro
  puramente frontend/tecnico).

### 7. Lavori mancanti per una "web app pronta all'uso" (roadmap)
**A. Completare i miglioramenti frontend** (backlog `docs/04-...`): T4 (migrare le altre ~13 pagine ai
service), T6 (stati su tutte le pagine), **T7** (validazione zod nei form/onboarding), **T8** (code
splitting), **T9** (accessibilità), **T11** (i18n/stringhe), **T12** (error boundary + PWA), **T13**
(test Vitest, soprattutto futuri calcoli ore/paga).
**B. Backend reale (Fase 0–5, il vero blocco per la produzione):**
- `api/` Fastify + MongoDB Atlas + Mongoose; **auth reale** (JWT + RBAC), poi i service del frontend
  passano da mock a fetch (l'infrastruttura T4 è già pronta a questo).
- Moduli in ordine: **Personale → Turni → Presenze/Ore → Paga → Fatturazione** (vedi `01-ROADMAP.md`).
- **Motore paghe** isolato e testato, con tabelle `config/payroll/` **validate dal consulente**.
- Storage documenti su **Cloudflare R2** (URL firmati), backup DB, GDPR (cancellazione/anonimizzazione).
**C. Pre-produzione:** deploy su Railway + Cloudflare davanti, `.env`/segreti, hardening sicurezza,
monitoraggio, test di ripristino backup.
> In sintesi: il **frontend** è ora pulito e strutturato per l'API; ciò che separa l'app dall'uso
> reale è soprattutto il **backend + auth + motore paghe** (Fase 0 e successive).

### 8. Valutazione sintetica (1–5)
- Avanzamento: 2/5 (frontend solido, backend assente) · Qualità: 4/5 · Aderenza alle regole
  (`CLAUDE.md`): 5/5.

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
