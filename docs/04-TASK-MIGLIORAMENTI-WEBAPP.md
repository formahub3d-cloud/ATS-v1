# 04 — Task di miglioramento della Web App (frontend `app/`)

> Backlog operativo di miglioramenti del **frontend esistente** (React/Vite in `app/`), ricavato da
> un'analisi tecnica del codice del 24/06/2026. Ogni task è pensata per essere lavorata in una
> sessione di Claude Code: ha **obiettivo, motivazione, file coinvolti, Definition of Done (DoD) e
> stima**. Le priorità seguono la regola del progetto: **dati/sicurezza/paghe prima, estetica dopo**.
>
> Allineamento roadmap (`01-ROADMAP.md`): queste task **non sostituiscono** le Fasi 0–6, ma
> preparano il frontend ad accoglierle (soprattutto **Fase 0** — service layer e auth reale) e sanano
> il **debito tecnico** (Fase 6 anticipata dove conviene).
>
> Legenda priorità: **P0** = bloccante/abilitante · **P1** = importante · **P2** = miglioria.
> Stima: S (≤½ giornata) · M (1 giornata) · L (2+ giornate).

---

## Riepilogo analisi (stato al 24/06/2026)

Eseguiti `npm install` pulito, `npm run build`, `npm run lint` e ispezione del sorgente.

| Area | Esito | Evidenza |
|---|---|---|
| Build di produzione | ✅ Passa | `npm run build` OK dopo install pulita (vedi nota T0). |
| Lint | ❌ **139 errori** in 83 file | 94 `no-unused-vars`, 14 `react-hooks/static-components`, 12 `react-refresh/only-export-components`, 7 `react-hooks/purity`, 6 `set-state-in-effect`, 6 `ban-ts-comment`. |
| `@ts-nocheck` | ⚠️ 6 file | `AdminDashboard`, `AdminEmployees`, `AdminShifts`, `AdminSettings`, `EmployeeCheckin`, `EmployeeRank`. |
| Bundle JS | ⚠️ **1.48 MB** (384 KB gzip) in un unico chunk | Nessun code splitting; warning Vite ">500 kB". |
| Layer dati | ❌ Assente | I mock sono importati **direttamente** nelle pagine (`src/data/*`, `components/employee/mockData.ts`). Nessuna cartella `src/services/`. |
| Auth / routing | ❌ Non protetto | `App.tsx` senza route-guard per ruolo e **senza rotta 404/fallback**; ruolo solo in `localStorage`. |
| Validazione form | ❌ `zod` e `react-hook-form` **dichiarati ma non usati** nel sorgente (validazione manuale in `Auth.tsx`). |
| Dipendenze morte | ⚠️ `gsap` + `@gsap/react` non usati nel sorgente. |
| Componenti duplicati/morti | ⚠️ Versioni "base" non usate accanto alle "Glass*" effettivamente montate. |
| Accessibilità (a11y) | ❌ Nessun `aria-label`/`alt`; contrasto dubbio sui testi "muted". |
| Stati UI (loading/empty/error) | ⚠️ Gestiti solo in ~3 pagine su 15. |

---

## P0 — Bloccanti / abilitanti

### T0 — Stabilizzare build e toolchain
**Perché:** in install incompleta il build falliva con `Cannot find module 'plugin-inspect-react-code'`
e `@babel/types`. Dopo `rm -rf node_modules package-lock.json && npm install` il build passa: il
problema è la riproducibilità dell'ambiente, non il codice. Va reso deterministico.
**Cosa fare:**
- Verificare/aggiornare `package-lock.json` committato e fissare la versione di Node in
  `package.json` (`"engines": { "node": ">=20" }`) e in un `.nvmrc`.
- Valutare se `plugin-inspect-react-code` (plugin di sviluppo in `vite.config.ts:4,9`) debba restare:
  è un tool di dev; spostarlo dietro un check `process.env` o rimuoverlo per build di produzione.
**File:** `app/package.json`, `app/package-lock.json`, `app/vite.config.ts`, `app/.nvmrc` (nuovo).
**DoD:** `npm ci && npm run build` riproducibile da zero senza errori; CI lo verifica (vedi T1).
**Stima:** S

### T1 — CI minima su GitHub Actions (lint + build)
**Perché:** la roadmap (Fase 0) richiede CI; oggi non c'è nulla che impedisca di rompere il build.
**Cosa fare:** workflow `.github/workflows/ci.yml` che su push/PR esegue `npm ci`, `npm run lint`,
`npm run build` nella cartella `app/`. (Predisporre lo step `test` per quando arriverà Vitest.)
**File:** `.github/workflows/ci.yml` (nuovo).
**DoD:** la pipeline gira sul branch e fallisce se lint o build falliscono.
**Stima:** S
**Nota:** dipende da T2 (altrimenti la CI è rossa per i 139 errori di lint). Fare T2 → poi rendere il lint bloccante.

### T2 — Azzerare gli errori di lint (139)
**Perché:** 94 sono semplici import/variabili inutilizzate; rimuoverli riduce bundle e rumore e
permette di rendere la CI affidabile.
**Cosa fare:** in ordine: (1) rimuovere import/var inutilizzati (`no-unused-vars`); (2) correggere
`react-hooks/purity` e `set-state-in-effect` (bug potenziali, **non** solo stile); (3) gestire
`react-refresh/only-export-components` separando le costanti esportate dai componenti; (4) i
`ban-ts-comment` confluiscono in T3.
**File:** 83 file (vedi output `npm run lint`), concentrati in `src/pages/*` e `src/components/*`.
**DoD:** `npm run lint` esce con 0 errori; nessun comportamento UI regredito (build OK).
**Stima:** M

### T3 — Rimuovere i 6 `@ts-nocheck` e attivare il type-check reale
**Perché:** regola d'oro CLAUDE.md §6/§11: niente `@ts-nocheck` nuovi e rimozione progressiva degli
esistenti. Oggi 6 pagine bypassano TypeScript, nascondendo errori reali.
**Cosa fare:** togliere `// @ts-nocheck` da una pagina alla volta e tipizzare ciò che emerge
(props, dati mock, handler). Centralizzare i tipi di dominio condivisi (vedi T4).
**File:** `src/pages/AdminDashboard.tsx`, `AdminEmployees.tsx`, `AdminShifts.tsx`,
`AdminSettings.tsx`, `EmployeeCheckin.tsx`, `EmployeeRank.tsx`.
**DoD:** 0 file con `@ts-nocheck`; `tsc -b` pulito; nessun `any` implicito introdotto.
**Stima:** L

### T4 — Service layer + tipi di dominio (abilita Fase 0)
**Perché:** oggi i mock sono importati direttamente in 15+ pagine: il passaggio all'API toccherebbe
ogni pagina. La roadmap Fase 0 chiede un `src/services/` che oggi incapsula i mock e domani chiama
l'API. È la singola task con più valore strategico.
**Cosa fare:**
- Creare `src/services/` con funzioni asincrone per dominio (`employees.ts`, `shifts.ts`,
  `structures.ts`, `invoices.ts`, `dashboard.ts`) che oggi restituiscono i mock dietro `Promise`.
- Definire i **tipi di dominio** in `src/types/` (o `packages/shared` se si va a monorepo), riusabili
  poi dal backend.
- Esporre hook `useEmployees()`, `useShifts()`, ecc. con stato `loading/error/data` (sblocca T6).
- Le pagine importano i servizi/hook, **non** più i file mock.
**File:** `src/services/*` (nuovo), `src/types/*` (nuovo), refactor di `src/pages/*`,
sorgenti mock `src/data/*` e `src/components/employee/mockData.ts` (spostati dietro i servizi).
**DoD:** nessuna pagina importa direttamente i file mock; cambiare la sorgente dati si fa solo nei
servizi; build e lint puliti.
**Stima:** L

### T5 — Route guard per ruolo + rotta 404
**Perché:** `App.tsx` espone tutte le rotte senza controllo di ruolo e non ha fallback per URL
sconosciuti (pagina bianca). CLAUDE.md §8 richiede RBAC; in attesa dell'auth reale serve almeno la
struttura di guardia lato frontend.
**Cosa fare:**
- Componente `<RoleGuard role="admin|structure|employee">` che usa `RoleContext` e reindirizza a
  `/auth` (o alla home del ruolo) se non autorizzato.
- Avvolgere i gruppi di rotte `/admin/*`, `/structure/*`, `/employee/*`.
- Aggiungere `<Route path="*" element={<NotFound/>} />`.
**File:** `src/App.tsx`, `src/components/RoleGuard.tsx` (nuovo), `src/pages/NotFound.tsx` (nuovo),
`src/context/RoleContext.tsx`.
**DoD:** un ruolo non può aprire le rotte di un altro; URL sconosciuto mostra 404.
**Nota:** è guardia **lato client** (UX), non sicurezza reale — quella arriva con auth/JWT in Fase 0
(la sicurezza vera è sul backend).
**Stima:** M

---

## P1 — Importanti

### T6 — Stati `loading / empty / error` standardizzati
**Perché:** solo ~3 pagine su 15 li gestiscono; quando i dati arriveranno dall'API (asincroni e
fallibili) ogni pagina ne avrà bisogno. CLAUDE.md §9 (DoD) li richiede.
**Cosa fare:** componenti riusabili (`<LoadingState/>` con `Skeleton`, `<EmptyState/>` con le icone
già presenti in `components/icons/EmptyStates.tsx`, `<ErrorState/>`); applicarli a tutte le pagine
basate sugli hook di T4.
**File:** `src/components/states/*` (nuovo), tutte le `src/pages/*`.
**DoD:** ogni pagina lista/dettaglio mostra correttamente caricamento, lista vuota ed errore.
**Stima:** M (dipende da T4)

### T7 — Validazione form con zod + react-hook-form
**Perché:** entrambe le librerie sono installate ma **non usate**; `Auth.tsx` valida a mano con
funzioni `canProceed*`. CLAUDE.md §4.2/§9 impone zod (e poi schemi condivisi col backend).
**Cosa fare:** definire schemi zod per onboarding struttura/dipendente e login; usare
`react-hook-form` + `@hookform/resolvers` con i `<FormField>` shadcn già presenti; messaggi di errore
in italiano e `aria-invalid` sui campi (collega T9).
**File:** `src/pages/Auth.tsx`, eventuali step in `src/components/auth/*`, `src/schemas/*` (nuovo).
**DoD:** i form bloccano input non validi con messaggi chiari; schemi riutilizzabili lato API.
**Stima:** M

### T8 — Code splitting delle rotte (bundle da 1.48 MB)
**Perché:** un unico chunk da 1.48 MB (384 KB gzip) viene caricato anche per la home. Pesa su mobile
(target dipendenti).
**Cosa fare:** `React.lazy` + `<Suspense>` per le pagine in `App.tsx`; valutare `manualChunks` per
isolare `recharts`/`framer-motion`; importare i grafici solo nelle pagine che li usano.
**File:** `src/App.tsx`, `vite.config.ts`.
**DoD:** ogni rotta è un chunk separato; il chunk iniziale scende sotto ~250 KB gzip; build senza
warning di dimensione.
**Stima:** S/M

### T9 — Accessibilità di base (a11y)
**Perché:** nessun `aria-label`/`alt`, contrasto dubbio sui testi "muted". L'app tratta dati di
lavoratori e va usata da utenti reali anche da tastiera/screen reader.
**Cosa fare:** `aria-label` sui bottoni-icona e sulla bottom nav; `alt` significativi sugli avatar
(`Avatar.tsx`, `CoverPhoto.tsx`); verificare contrasto dei colori `text-muted` (WCAG AA);
focus visibile e ordine di tab nelle form.
**File:** `src/components/Layout.tsx`, `Navbar.tsx`, `Avatar.tsx`, `components/employee/*Nav*`, form di `Auth.tsx`.
**DoD:** navigazione da tastiera completa sui flussi principali; audit Lighthouse a11y ≥ 90 sulle
pagine chiave.
**Stima:** M

---

## P2 — Migliorie / pulizia

### T10 — Rimuovere componenti duplicati/morti e dipendenze inutilizzate
**Perché:** riduce bundle e confusione. Verificato che le pagine usano le varianti **Glass\***; le
versioni base non sono importate da nessuna pagina; `gsap`/`@gsap/react` non sono usate.
**Cosa fare:**
- Eliminare i componenti base non importati (es. `structure/ShiftCard.tsx`, `structure/SwipeCard.tsx`,
  `structure/InvoiceCard.tsx`, `employee/ShiftCard.tsx`, `employee/SwipeCard.tsx`, `employee/BottomNav.tsx`
  e le varianti auth non-Glass) **dopo** averne confermato il non-uso (grep + build).
- Rimuovere `gsap` e `@gsap/react` da `package.json` se confermato il non-uso.
- Ripulire i tipi/riferimenti residui in `src/data/structureMock.ts`.
**File:** vari in `src/components/{structure,employee,auth}/`, `package.json`, `src/data/structureMock.ts`.
**DoD:** build/lint puliti dopo le rimozioni; bundle ridotto; nessun import rotto.
**Stima:** S
**Nota:** valutare se le varianti "Glass" debbano diventare le uniche (rinominandole) per eliminare il prefisso.

### T11 — Centralizzare le stringhe UI (predisporre i18n)
**Perché:** testi italiani hardcoded ovunque. Non urgente (l'app è IT-only), ma centralizzare le
stringhe ora costa poco e semplifica manutenzione e un eventuale i18n futuro.
**Cosa fare:** raccogliere le label in un modulo `src/i18n/it.ts` (o costanti per pagina) senza
introdurre subito una libreria; opzionale `react-i18next` solo se servirà multilingua.
**File:** `src/i18n/*` (nuovo), pagine/componenti con testi.
**DoD:** le stringhe principali provengono da un punto unico; nessun testo rivolto all'utente in inglese.
**Stima:** M

### T12 — Error boundary globale + favicon/meta/PWA base
**Perché:** robustezza UX e rifinitura. Un errore di rendering oggi rompe l'intera app.
**Cosa fare:** `<ErrorBoundary>` a livello di `App`/`Layout`; verificare `index.html`
(titolo, meta description, favicon); valutare manifest PWA (la roadmap Fase 6 cita PWA dipendenti).
**File:** `src/components/ErrorBoundary.tsx` (nuovo), `src/App.tsx`, `index.html`, `public/`.
**DoD:** un errore in una pagina mostra un fallback gestito invece della pagina bianca.
**Stima:** S

### T13 — Setup test frontend (Vitest)
**Perché:** test assenti; la roadmap impone test (soprattutto su ore/paga, ma utile partire dal FE).
**Cosa fare:** configurare Vitest + Testing Library; primi test su `RoleGuard` (T5), su un servizio
di T4 e su uno schema zod di T7; aggiungere lo step `test` alla CI (T1).
**File:** `vitest.config.ts` (nuovo), `src/**/*.test.ts(x)`, `.github/workflows/ci.yml`.
**DoD:** `npm test` verde in CI con almeno 3 test significativi.
**Stima:** M

---

## Ordine consigliato

1. **T0 → T2 → T1** (toolchain stabile, lint pulito, CI verde).
2. **T4 → T5 → T6** (service layer, guardie, stati UI: la spina dorsale per l'API).
3. **T3 → T7 → T8 → T9** (type-check reale, validazione, performance, a11y).
4. **T10 → T11 → T12 → T13** (pulizia, i18n, robustezza, test).

> Ogni task chiusa = un audit in `docs/AUDIT-LOG.md` (CLAUDE.md §10). Le decisioni con valore
> legale/contabile (paghe, contratti) **non** rientrano in questo backlog frontend: restano da
> validare col consulente nelle Fasi 1–4.
