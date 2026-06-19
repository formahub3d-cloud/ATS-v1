# CLAUDE.md — Istruzioni Maestre del progetto ATS

> Questo file è il **manuale tecnico ed esecutivo di Claude Code** (lo legge in automatico all'avvio) ed
> è la **fonte di verità** sul progetto per qualsiasi agente AI. Leggilo **per intero prima di scrivere
> codice**. Se una richiesta dell'utente contraddice queste regole, fermati e segnalalo.
>
> 👉 Per **come opera l'agente in Cowork** (strategia, ricerca, browser, orchestrazione) vedi
> `docs/ISTRUZIONI-COWORK.md`. Regola pratica: **Cowork pensa/decide/coordina, Claude Code costruisce.**
>
> **Posizione richiesta:** alla **radice del repository `ATS-v1`** (sopra la cartella `app/`).
> Documenti di approfondimento in `docs/`.
>
> Ultimo aggiornamento: 19/06/2026 · Owner: Andrea (formahub3d) · Lingua di lavoro: **Italiano**

---

> ## ⚠️ RETTIFICA STATO REALE — 19/06/2026 (leggere PRIMA del resto)
>
> Questo manuale è stato scritto pianificando una ricostruzione **da zero su MongoDB**. **NON corrisponde
> alla realtà del repo.** Una verifica del 19/06 ha accertato che su `main` esiste già un'**app ATS quasi
> completa, costruita su SUPABASE** (auth, CRM, turni, check-in QR, payroll, fatturazione, chat, notifiche,
> GDPR, PWA — 58 commit, build verde). Dettagli: `docs/AUDIT-LOG.md` → **Audit #4**.
>
> **Finché i docs non sono riallineati, valgono queste rettifiche sul resto del file:**
> - **Stack reale:** Frontend React/Vite + **Supabase** (PostgreSQL + Auth + Storage + Realtime).
>   → Le parti che impongono **MongoDB / Mongoose / Fastify / cartella `api/`** (§4, §5, §7.4, §11) sono **SUPERATE**.
> - **Stato reale:** **non** "Pre-Fase 0 / zero codice"; gran parte delle Fasi 1–5 è implementata.
> - **DB:** lo schema reale sono le **migration SQL** in `app/supabase/migrations/` (fonte di verità), non `02-MODELLO-DATI.md`.
> - **Deploy:** l'app è cablata per **Vercel** (`vercel.json` / `_redirects`); i docs dicono Railway/Cloudflare → **da decidere**.
>
> **Restano pienamente validi** (indipendenti dallo stack): modello di business e vincoli **legali** (§3),
> regole su **denaro/ore** (centesimi/Decimal, mai float), **sicurezza/GDPR** (§8) e l'**audit obbligatorio** (§10).

---

## 1. Cos'è ATS (in una frase)

ATS è la piattaforma gestionale di un'**attività di catering** che fornisce a strutture (ristoranti,
hotel, bar, location eventi) un **servizio completo** con proprio personale dell'hospitality
(camerieri, chef, barman, receptionist, staff SPA) e che, **su richiesta, fornisce anche il solo
personale**. Gestisce **turni, contratti, anagrafiche, presenze e calcolo di ore e paga**.

L'obiettivo della fase attuale **non è il marketing del prodotto** ma costruire il **motore
gestionale interno**: turni → presenze → ore → paga → fatturazione, con dati reali e affidabili.

> **Modello operativo (importante):** il business **principale è il catering = appalto di servizi
> genuino** (personale, organizzazione e coordinamento sono dell'azienda). La richiesta di **"solo
> personale"** è una **zona legalmente sensibile**: l'azienda **NON è un'Agenzia per il Lavoro
> autorizzata**, quindi quel personale non può essere "somministrato" come fa un'APL. Vedi §3.

---

## 2. Attori del sistema (3 ruoli)

| Ruolo | Chi è | Cosa fa nell'app |
|---|---|---|
| **Admin / Agenzia** | Andrea e il suo staff | Gestisce tutto: anagrafiche, contratti, pubblica e assegna turni, valida presenze, calcola paghe, emette fatture alle strutture. |
| **Struttura** | Ristorante / hotel / bar / location cliente | Richiede personale, vede i turni della propria sede, conferma presenze, riceve fatture. |
| **Dipendente** | Cameriere / chef / barman ecc. | Vede e accetta turni, fa check-in/check-out (QR), consulta ore e compenso, carica documenti. |

I tre ruoli **esistono già** nel frontend (`src/context/RoleContext.tsx`). In produzione **NON**
devono più essere selezionabili liberamente: ogni utente accede solo al proprio ruolo dopo
autenticazione reale (vedi §8).

---

## 3. Modello di business e vincoli legali (LEGGERE)

**Inquadramento dell'azienda:** attività di **catering** che opera in **appalto di servizi** (i
lavoratori sono propri dipendenti; fornisce servizio + organizzazione + coordinamento). **NON è
un'Agenzia per il Lavoro autorizzata** → **non può somministrare manodopera**.

Due tipi di commessa, da distinguere nel software:
- **Servizio catering** (caso principale): l'azienda eroga un servizio completo per l'evento/struttura.
- **Solo personale** (caso sensibile): il cliente chiede "solo i camerieri". Per restare nell'appalto
  genuino e fuori dalla somministrazione irregolare, va strutturato come **servizio** (es. squadra con
  un **referente/capo-partita dell'azienda in loco**, propria organizzazione), **non** come semplice
  cessione di lavoratori che operano sotto la direzione del cliente. ⚠️ Questo va **validato dal
  consulente del lavoro**: il software deve permettere di marcare la commessa come "solo personale" e
  ricordare la cautela, non decidere la legittimità.

Sul rapporto con i lavoratori la scelta è: **lavoro "extra" / intermittente (a chiamata) / occasionale**
(vedi `docs/00-GUIDA-STRATEGICA.md` per il dettaglio aggiornato 2026).

⚠️ **Regola d'oro per gli agenti:** le decisioni su tipo di contratto, minimi di paga, contributi e
modalità di fornitura del personale **hanno valore legale**. Gli agenti **non inventano** aliquote,
minimi tabellari, regole contributive o limiti normativi: questi valori vanno **letti da una tabella
di configurazione** (`config/payroll/*` — vedi §7.4) che è l'utente, con il proprio **consulente del
lavoro**, a validare. Mai "hardcodare" numeri normativi nel codice di business.

Implicazioni pratiche da rispettare nel software:
- Ogni **turno** deve poter essere collegato a un **tipo di rapporto** (extra max 3 giorni,
  intermittente, occasionale/PrestO) perché cambiano regole, limiti e calcolo.
- Vanno tracciati i **limiti di legge** (es. PrestO €5.000/anno per lavoratore; "extra" max 3 giorni
  consecutivi) con **alert automatici** quando ci si avvicina alla soglia.
- Vanno gestite le **comunicazioni obbligatorie** (es. comunicazione preventiva per intermittente) →
  almeno come promemoria/export, non necessariamente come invio automatico in MVP.

---

## 4. Stack tecnico

### 4.1 Attuale (frontend, già in repo)
- **React 19 + TypeScript + Vite 7**
- **Tailwind CSS 3** + **shadcn/ui** (40+ componenti in `src/components/ui`)
- **React Router 7**, **framer-motion**, **recharts**, **react-hook-form + zod**
- Stato: **solo dati mock** (`src/data/mockAdmin.ts`, `structureMock.ts`, `components/employee/mockData.ts`)
- Nessun backend, nessuna auth reale, `@ts-nocheck` diffuso → **debito tecnico da sanare**.

### 4.2 Target (stack confermato — solo strumenti già in uso, NESSUN nuovo vendor)
Si riusano gli strumenti che Andrea già possiede/paga.
- **Frontend:** React/Vite **su Railway** (stesso progetto dell'API), con **Cloudflare** davanti come
  CDN/cache/SSL/WAF → un'unica piattaforma, un'unica fattura. Alternativa gratuita per il solo hosting
  statico: **Cloudflare Pages**. **Vercel non è necessario.** Vedi `docs/00-GUIDA-STRATEGICA.md` §B.6.
- **Backend/API:** **Node.js + TypeScript** con **Fastify** (confermato), API **REST** versionata
  (`/api/v1`), deploy su **Railway**.
- **Database:** **MongoDB** (Atlas) con ODM **Mongoose**. Si parte dal tier gratuito **M0**.
- **Storage documenti** (CI, HACCP, permessi): **Cloudflare R2** (S3-compatibile, **URL firmati**,
  niente costi di egress; 10 GB gratis).
- **DNS / CDN / SSL / WAF:** **Cloudflare**.
- **Versionamento / CI:** **GitHub** (Free: repo privati illimitati + GitHub Actions per lint/test/build).
- **Auth:** JWT (access + refresh) con ruoli. Password con **argon2/bcrypt**.
- **Validazione:** **zod** condiviso tra frontend e backend.
- **Test:** **Vitest** (unit/integrazione), focus prioritario sul **motore paghe**.

> Confronto **MongoDB vs PostgreSQL** e dettaglio **costi 2026** in `docs/00-GUIDA-STRATEGICA.md` §B.2 e §B.6.

---

## 5. Struttura del progetto (target)

```
/ (root repo ATS-v1)
├─ CLAUDE.md                ← questo file
├─ docs/                    ← guida strategica, roadmap, modello dati, audit
│  ├─ 00-GUIDA-STRATEGICA.md
│  ├─ 01-ROADMAP.md
│  ├─ 02-MODELLO-DATI.md
│  ├─ 03-AUDIT-TEMPLATE.md
│  └─ AUDIT-LOG.md          ← registro cronologico degli audit (uno per lavoro)
├─ app/  (o /web)           ← frontend React/Vite ATTUALE
│  └─ src/...
├─ api/                     ← backend Node/TS + Fastify (da creare)
│  ├─ src/
│  │  ├─ models/            ← schemi Mongoose (collections MongoDB)
│  │  └─ services/          ← logica di dominio (incl. motore paghe)
│  └─ config/payroll/       ← tabelle paga/contributi validate dal consulente
└─ packages/shared/         ← tipi e schemi zod condivisi (opzionale, se monorepo)
```

Quando crei il backend, **non rompere** il frontend esistente: aggiungi `api/` accanto ad `app/`.

---

## 6. Convenzioni di codice e di lavoro

1. **TypeScript strict.** Obiettivo: **rimuovere progressivamente `@ts-nocheck`**. Non aggiungerne di
   nuovi. Niente `any` impliciti nel codice nuovo.
2. **Tipi di dominio centralizzati** in un solo punto (`shared` o `api/src/types`); il frontend li importa.
3. **Niente segreti nel codice.** Chiavi, stringhe di connessione, token → variabili d'ambiente
   Railway (`.env` mai committato; mantieni un `.env.example`).
4. **Denaro e tempo:** importi in **centesimi (interi)** o tipo **`Decimal128`** di MongoDB, **mai
   float**. Date/ore in **UTC** lato DB, conversione fuso (Europe/Rome) solo in presentazione.
   Attenzione ai **turni a cavallo della mezzanotte** (es. 18:00–02:00).
5. **Naming:** inglese per codice e tabelle DB (`shift`, `employee`, `timesheet`); italiano per UI e
   contenuti rivolti all'utente.
6. **Commit:** stile Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`). Un commit =
   un'unità logica.
7. **Modello dati versionato** negli **schemi Mongoose**; per cambi di struttura su dati esistenti usa
   **script di migrazione versionati** (mai modifiche manuali ai dati in produzione). Operazioni che
   toccano più documenti collegati (es. calcolo paga) vanno in **transazione**.
8. **Mock → API:** sostituisci i mock dietro un layer di servizi (`src/services/`) così il passaggio a
   dati reali non tocca le pagine.

---

## 7. I 4 moduli prioritari (cosa costruire e con quali regole)

> Dettaglio sequenziale in `docs/01-ROADMAP.md`; entità in `docs/02-MODELLO-DATI.md`.
> Ordine di realizzazione consigliato: **Personale → Turni → Presenze/Ore → Paghe → Fatturazione**
> (i moduli a valle dipendono dai dati di quelli a monte).

### 7.1 Personale (anagrafiche)
- Dati lavoratore: anagrafica, contatti, **codice fiscale**, IBAN, ruolo/i, zona, mezzo proprio,
  documenti (CI, permesso di soggiorno, HACCP, certificazioni) con **scadenze e alert**.
- Stato del lavoratore (attivo, in attesa, sospeso, in valutazione).
- Storico turni e affidabilità (no-show, puntualità) → base del "rank".

### 7.2 Turni (shift)
- Un turno appartiene a **una struttura**, ha **ruolo richiesto**, **data**, **orario inizio/fine**,
  **stato** (da assegnare, programmato, in corso, completato, no-show, cancellato) e, una volta
  assegnato, **un lavoratore**.
- Funzioni: creazione (anche ricorrente), assegnazione/matching, gestione **no-show** con pool
  reperibili, vista calendario settimanale.
- Collega ogni turno al **tipo di rapporto** (vedi §3) per il calcolo a valle.

### 7.3 Presenze / Ore (timesheet)
- **Check-in/check-out** (il QR esiste già lato UI in `EmployeeCheckin`): registra timestamp reali.
- Calcolo **ore effettive** = (check-out − check-in) − pause, gestendo mezzanotte e arrotondamenti
  **secondo regola configurabile** (es. al quarto d'ora).
- Stati di validazione: dichiarato dal dipendente → confermato dalla struttura → validato dall'admin.
  **Solo le ore validate** entrano nel calcolo paga.

### 7.4 Calcolo orario e paga (il modulo critico)
- Input: ore validate + tipo rapporto + ruolo/livello + tariffa.
- **Le tariffe, i minimi, le maggiorazioni (notturno/festivo/straordinario) e i contributi NON sono
  hardcodati**: vivono in `api/config/payroll/` come tabelle dati versionate e **validate dal
  consulente del lavoro**. Il codice applica le regole, non le decide.
- Output per lavoratore: lordo, trattenute/contributi (se gestiti), **netto stimato**; per struttura:
  importo da fatturare (ore × tariffa cliente + eventuale fee/markup agenzia).
- **Tracciabilità totale:** ogni cifra deve essere ricostruibile (quali turni, quante ore, quale
  tariffa). Genera un **prospetto/estratto** esportabile (CSV/PDF).
- ⚠️ Il software **non sostituisce il cedolino del consulente**: produce dati di supporto e controllo.
  Indicalo chiaramente nell'UI.

---

## 8. Sicurezza e GDPR (non opzionale)

- L'app tratta **dati personali e documenti d'identità** → si applica il **GDPR**.
- **Autenticazione reale e autorizzazione per ruolo (RBAC):** ogni endpoint verifica ruolo e
  proprietà del dato (una struttura vede solo i propri turni, un dipendente solo i propri dati).
- **Niente** dati reali nei mock, nei log o nei messaggi di errore.
- Documenti in storage privato (Railway volume / bucket) con **URL firmati a scadenza**, mai pubblici.
- Cifratura in transito (HTTPS, automatico su Railway) e password con hashing forte.
- Prevedi **cancellazione/anonimizzazione** dei dati (diritto all'oblio) e un registro minimo dei trattamenti.
- Backup automatici del database (Railway) e verifica periodica del ripristino.

---

## 9. Definition of Done (una feature è "fatta" solo se…)

- [ ] Compila senza errori TS **senza** aggiungere `@ts-nocheck`.
- [ ] Validazione input con zod (lato API e lato form).
- [ ] Autorizzazione per ruolo verificata sugli endpoint coinvolti.
- [ ] Test sulle parti critiche (obbligatori per ore e paga).
- [ ] Nessun segreto committato; `.env.example` aggiornato.
- [ ] Schemi/indici Mongoose aggiornati; eventuali script di migrazione dati previsti.
- [ ] UI in italiano, stati di errore/vuoto/caricamento gestiti.
- [ ] **Audit di fine lavoro redatto** (vedi §10).

---

## 10. Processo con gli agenti + AUDIT obbligatorio (regola chiave del progetto)

> L'utente vuole, **dopo OGNI lavoro**, un audit generale dello stato di avanzamento, una valutazione
> degli aspetti toccati e un punto di riepilogo, così che ogni nuovo agente parta allineato.

**Due agenti, due manuali.** L'agente **Cowork** (manuale: `docs/ISTRUZIONI-COWORK.md`) si occupa di
strategia, ricerca, browser, decisioni e prepara le specifiche; **Claude Code** (questo manuale)
**esegue** la realizzazione tecnica. Claude Code riceve una spec (obiettivo, vincoli, file, Definition
of Done), la implementa e **scrive l'audit di fine lavoro**. In dubbio sull'obiettivo o su scelte di
business/legali, **non improvvisa**: chiede o rimanda a Cowork/consulente.

**Inizio di ogni sessione di lavoro:**
1. Leggi `CLAUDE.md` + `docs/AUDIT-LOG.md` (almeno gli ultimi 2 audit) per capire dove siamo.
2. Concorda con l'utente l'obiettivo della sessione e aggiorna la roadmap se serve.

**Fine di ogni lavoro (SEMPRE):**
1. Compila una nuova voce usando **`docs/03-AUDIT-TEMPLATE.md`**.
2. **Aggiungila in cima a `docs/AUDIT-LOG.md`** (audit più recente in alto), numerata e datata.
3. Riassumi all'utente in chat: cosa fatto, cosa manca, rischi, prossimo passo consigliato.

L'audit copre: lavoro svolto, file toccati, stato dei 4 moduli, qualità/sicurezza/debito tecnico,
rischi aperti, decisioni prese, prossimi passi. È il **memoria condivisa** del progetto.

---

## 11. Cosa NON fare

- ❌ Non inventare valori normativi/contabili (paghe, contributi, limiti): leggili dalla config validata.
- ❌ Non introdurre `@ts-nocheck` o `any` nel codice nuovo.
- ❌ Non committare segreti né dati personali reali.
- ❌ Non lasciare l'auth "a selettore di ruolo" in produzione.
- ❌ Non usare `float` per soldi/ore.
- ❌ Non chiudere un lavoro senza scrivere l'audit.
- ❌ In dubbio su scelte legali/fiscali: **fermati e rimanda al consulente del lavoro**, non improvvisare.

---

## 12. Comandi utili (frontend attuale)

```bash
cd app
npm install
npm run dev      # avvia Vite in sviluppo
npm run build    # build di produzione (tsc -b && vite build)
npm run lint     # eslint
```

I comandi backend verranno definiti quando si crea `api/` (Mongoose, dev server Fastify, test Vitest).
