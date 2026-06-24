# AUDIT GENERALE — Stato del progetto ATS

> Audit **olistico** dello stato del progetto, aggiornato all'ultimo intervento. A differenza di
> `AUDIT-LOG.md` (registro cronologico per ogni lavoro), questo documento è la **fotografia complessiva**
> + il **backlog ragionato** + le **istruzioni per il prossimo agente**.
>
> **Ultimo aggiornamento:** 24/06/2026 · **Branch:** `claude/web-app-improvements-3modcu` (+ `staging`)
> · **Autore:** Claude Code · Riferimenti: `CLAUDE.md`, `docs/01-ROADMAP.md`, `docs/04-TASK-MIGLIORAMENTI-WEBAPP.md`, `docs/AUDIT-LOG.md` (Audit #0→#6).

---

## 1. Sintesi esecutiva

ATS è oggi un **frontend React/Vite curato e tecnicamente pulito**, alimentato **solo da dati mock**:
non esiste backend, né autenticazione reale, né motore paghe. Nelle ultime sessioni il frontend è
stato risanato (lint a zero, `@ts-nocheck` rimossi, bug reali corretti), dotato di **architettura dati
pronta all'API** (service layer + tipi + hook), **route guard**, **stati UI**, **code splitting**,
**ErrorBoundary** e prime **migliorie di accessibilità**.

Il prodotto **non è ancora utilizzabile in produzione**: ciò che manca non è cosmetico ma strutturale
— **backend + auth + dati reali + motore paghe** (Fase 0–4 della roadmap). Il frontend, però, è in
ottimo stato per accoglierli con poco attrito.

---

## 2. Valutazione (punteggio 1–10)

| Dimensione | Voto | Motivazione sintetica |
|---|:---:|---|
| Documentazione & processo | **9** | Manuali chiari, disciplina di audit costante, roadmap e modello dati definiti. |
| Qualità codice / type-safety | **8** | 0 errori lint, 0 `@ts-nocheck`, build pulita. Restano 32 warning RC e nessun test. |
| Architettura frontend | **7** | Service layer, tipi centralizzati, guards, code splitting. Migrazione pagine ancora parziale. |
| UI / UX | **7** | Design coerente e ricco, responsive, scroll restoration, icone nav corrette. Manca QA visiva. |
| Performance | **7** | Code splitting: bundle iniziale ~1.48 MB → ~415 kB. `recharts` ancora pesante (lazy). |
| Accessibilità (a11y) | **5** | Focus visibile, reduced-motion, aria di base. Contrasto e form ancora da sistemare. |
| DevOps / CI | **6** | CI lint+build su GitHub Actions. Mancano test, deploy automatico, preview. |
| Sicurezza / Auth | **2** | Nessuna auth reale; ruolo in `localStorage`; guard solo lato client. |
| Backend / dati reali | **1** | Assente: tutto su mock. |
| Test automatici | **1** | Nessun test (step Vitest predisposto in CI). |

### Punteggio complessivo: **5.5 / 10**
> Frontend ~7.5/10, ma il prodotto nel suo insieme è frenato da backend/auth/test assenti. Il numero
> salirà rapidamente con la **Fase 0** (auth + API + un primo modulo su dati reali).

---

## 3. Cosa è stato fatto (cumulativo, Audit #0→#6)

- **Fondamenta tecniche:** `.nvmrc` + `engines`; CI GitHub Actions (lint+build); ESLint riallineato.
- **Risanamento:** lint **139 → 0** errori; **6 `@ts-nocheck` → 0**; rimossi **15 file morti** + dipendenze
  `gsap`/`@gsap/react`.
- **Bug reali corretti** (emersi togliendo `@ts-nocheck`): `Avatar` con `size` stringa (rendering rotto);
  `getHourlyRate` con parametri invertiti; `zoneRates` (array) usato come mappa; `Math.random` in render.
- **Architettura dati:** `src/services/*` (mock dietro funzioni async), `src/types/domain.ts`,
  hook `useAsync`; `EmployeeDashboard` migrata come esempio.
- **Struttura & UX:** `RoleGuard` + rotta 404; stati `Loading/Empty/Error`; **code splitting** (lazy
  routes + Suspense); `ScrollToTop`; `ErrorBoundary` globale; `index.html` (favicon, theme-color, OG);
  a11y base (focus-visible, reduced-motion, aria, icone nav reali).
- **Documentazione:** audit in MD + HTML rigenerabile (`scripts/md2html.mjs`).

---

## 4. Stato dei moduli (semaforo)

| Modulo | Stato | Nota |
|---|:---:|---|
| Personale | 🟡 | UI ricca su mock dietro `adminService` tipato; nessun CRUD/persistenza. |
| Turni | 🟡 | UI/calendario su mock; nessuna persistenza, nessun matching reale. |
| Presenze/Ore | 🔴 | Solo UI check-in QR; nessun calcolo ore. |
| Calcolo Paga | 🔴 | Nessun motore; tariffe mock (non validate). |
| Fatturazione | 🔴 | Solo UI. |

---

## 5. Backlog ragionato (aggiungere · migliorare · automatizzare · implementare)

> Priorità: **P0** abilitante · **P1** importante · **P2** desiderabile. Stima: S/M/L.

### 5.1 ➕ AGGIUNGERE (non c'è ancora)
| ID | Voce | Prio | Stima |
|---|---|:--:|:--:|
| A1 | **Backend `api/`** (Fastify + MongoDB Atlas + Mongoose), REST `/api/v1` versionata | P0 | L |
| A2 | **Auth reale** (login email/password, JWT access+refresh, hashing argon2/bcrypt) | P0 | L |
| A3 | **RBAC server-side** su ogni endpoint (ruolo + proprietà del dato) | P0 | M |
| A4 | **Test** Vitest (unit/integrazione) — partire da `useAsync`, services, `RoleGuard`, schemi zod | P1 | M |
| A5 | **Validazione zod** condivisa FE/BE nei form (Auth/onboarding) — T7 | P1 | M |
| A6 | **Gestione documenti** (CI, HACCP, permessi) su Cloudflare R2 con URL firmati | P1 | M |
| A7 | **Notifiche** reali (email/push) per turni e scadenze documenti | P2 | L |
| A8 | **PWA** (manifest + service worker) per i dipendenti — T12 residuo | P2 | M |
| A9 | **i18n** centralizzazione stringhe (`src/i18n`) — T11 | P2 | M |
| A10 | **Storybook / catalogo componenti** per i numerosi `Glass*` | P2 | M |

### 5.2 ⬆️ MIGLIORARE (esiste ma è migliorabile)
| ID | Voce | Prio | Stima |
|---|---|:--:|:--:|
| M1 | **Migrare le ~13 pagine restanti** al service layer + stati Loading/Empty/Error — T4/T6 | P1 | L |
| M2 | **Accessibilità completa** — T9: contrasto testi `text-muted`, `aria-invalid`/label nei form, Lighthouse ≥ 90 | P1 | M |
| M3 | **Alleggerire il bundle**: `recharts` (~430 kB) lazy/alternativa, valutare `manualChunks` per i vendor | P2 | M |
| M4 | **Sostituire i `@ts-nocheck` residui**: già 0 — mantenere, vietare reintroduzioni via CI | P1 | S |
| M5 | **Ridurre i 32 warning RC** (set-state-in-effect, static-components) affrontandoli nel codice nostro | P2 | M |
| M6 | **Consolidare i duplicati `Glass*` vs base** (rinominare le varianti uniche, eliminare il prefisso) | P2 | M |
| M7 | **Tipi denaro/tempo**: introdurre tipi/utility per centesimi e ore (mai float) già lato FE | P1 | S |
| M8 | **Error/empty state ovunque** + retry reale (oggi `window.location.reload`) | P2 | S |

### 5.3 🤖 AUTOMATIZZARE
| ID | Voce | Prio | Stima |
|---|---|:--:|:--:|
| AU1 | **CI: abilitare lo step test** (Vitest) e renderlo bloccante | P1 | S |
| AU2 | **CI: type-check dedicato** (`tsc --noEmit`) separato dal build | P1 | S |
| AU3 | **Deploy automatico** su Railway da `staging`/`main` (preview per branch) | P1 | M |
| AU4 | **Dependabot/renovate** per aggiornamenti dipendenze + audit sicurezza | P2 | S |
| AU5 | **Pre-commit hook** (lint-staged + eslint) per non rompere la CI | P2 | S |
| AU6 | **Rigenerazione audit HTML** in CI (`scripts/md2html.mjs`) ad ogni modifica del MD | P2 | S |
| AU7 | **Lighthouse CI** (performance/a11y budget) su PR | P2 | M |

### 5.4 🏗️ IMPLEMENTARE (logica di dominio — Fase 1→5)
| ID | Voce | Prio | Stima |
|---|---|:--:|:--:|
| I1 | **CRUD Personale** (anagrafica, CF, IBAN, ruoli, stato) su dati reali | P0 | L |
| I2 | **CRUD Strutture** + tariffario collegato | P1 | M |
| I3 | **CRUD Turni** + ricorrenze + matching + gestione no-show | P1 | L |
| I4 | **Presenze/Ore**: check-in/out reale, calcolo ore (pause, mezzanotte, arrotondamento), validazione | P1 | L |
| I5 | **Motore Paghe** isolato e testato, tariffe da `config/payroll/` **validate dal consulente** | P0 | L |
| I6 | **Fatturazione** verso strutture + export commercialista (CSV/PDF) | P2 | L |
| I7 | **Scadenze documenti** con alert (HACCP, permessi) | P1 | M |
| I8 | **GDPR**: cancellazione/anonimizzazione, registro trattamenti, backup+restore verificati | P1 | M |

---

## 6. Rischi e questioni aperte

- **QA visiva non eseguita** in queste sessioni (solo build+lint): fare un giro manuale prima del merge.
- **Tariffe mock** corrette per renderle coerenti: non hanno valore legale (il motore validato è da costruire).
- **Sicurezza**: il `RoleGuard` è solo UX — la sicurezza reale richiede A2/A3.
- **Decisioni con valore legale/fiscale** (contratti, minimi, contributi): **non improvvisare**, rimandare
  al consulente del lavoro (CLAUDE.md §3/§11).

---

## 7. ISTRUZIONI PER IL PROSSIMO AGENTE

**Onboarding (5 min):**
1. Leggi `CLAUDE.md`, poi `docs/AUDIT-LOG.md` (Audit #6→#4) e questo file.
2. Branch di lavoro: `claude/web-app-improvements-3modcu`. Setup: `cd app && npm ci && npm run lint && npm run build`.

**Regole non negoziabili (da CLAUDE.md):**
- Niente `@ts-nocheck`/`any` nuovi; TypeScript strict.
- **Valori normativi/paga mai hardcodati** → `config/payroll/` validata dal consulente.
- Soldi in **centesimi/Decimal128**, ore senza `float`; date in UTC, fuso solo in presentazione; attenzione ai turni a cavallo di mezzanotte.
- UI in italiano; codice/DB in inglese.
- **Audit a fine di OGNI lavoro**: voce in cima a `docs/AUDIT-LOG.md`, aggiorna questo `AUDIT-GENERALE.md`, rigenera l'HTML (`node scripts/md2html.mjs docs/AUDIT-LOG.md docs/AUDIT-LOG.html`).
- Commit Conventional; push su branch di lavoro (e `staging` se richiesto); **niente PR senza richiesta esplicita**.

**Ordine di lavoro consigliato:**
1. **M1** — migrare le pagine restanti al service layer + stati (modello: `EmployeeDashboard.tsx`). Una pagina per commit.
2. **A5/A4** — zod nei form + primi test Vitest; poi **AU1/AU2** (CI test + type-check).
3. **M2** — completare l'accessibilità (contrasto, form, Lighthouse).
4. **Fase 0 backend** (**A1→A2→A3**): scaffolding `api/` Fastify + MongoDB Atlas M0 + auth JWT/RBAC; poi i service del FE passano da mock a `fetch` (firme già pronte: cambia solo `src/services/*` + `simulate`).
5. Moduli di dominio in ordine roadmap: **I1 Personale → I3 Turni → I4 Presenze → I5 Paga → I6 Fatturazione**, con test obbligatori su ore/paga.

**Dove intervenire (mappa rapida):**
- Dati/mock → `app/src/services/*`, `app/src/data/mockAdmin.ts`, `app/src/components/employee/mockData.ts`.
- Tipi dominio → `app/src/types/domain.ts`.
- Routing/guard → `app/src/App.tsx`, `app/src/components/RoleGuard.tsx`.
- Stati UI → `app/src/components/states/`.
- Layout/nav → `app/src/components/Layout.tsx`, `components/employee/GlassBottomNav.tsx`.

**Note tecniche:**
- Router = **HashRouter** (URL con `#`).
- 32 warning lint = regole sperimentali React Compiler **declassate a `warn`** di proposito; `react-hooks/purity` off sui vendored `src/components/ui/**`. Affrontarle è M5, non urgente.
- Build deve restare verde: `npm run lint` (0 errori) + `npm run build`.
