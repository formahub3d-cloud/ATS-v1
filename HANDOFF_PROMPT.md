# Prompt di handoff — riprendere il progetto ATS su un nuovo PC

> Copia **tutto il blocco qui sotto** (dal titolo "# Riprendi il progetto ATS-v1" fino al fondo) e incollalo come **primo messaggio** in una nuova sessione di Claude Code sul nuovo PC. Claude eseguirà clonazione, setup ambiente, verifica build, e ti riporterà lo stato esatto del lavoro pronto a riprenderlo.

---

```markdown
# Riprendi il progetto ATS-v1 — setup nuovo PC

## Chi sono io e cosa stai facendo
Sono Andrea Aloia. Sto sviluppando **ATS**, una webapp gestionale per una società di **catering HORECA** con dipendenti propri. È un CRM operativo + portale dipendenti + portale clienti (strutture).

**Modello di business confermato**:
- ATS = azienda di catering, datore di lavoro diretto
- Strutture = clienti (hotel, ville, eventi)
- Dipendenti = assunti diretti ATS (camerieri, cuochi, baristi)
- Niente somministrazione, niente Albo ANPAL
- Payroll manuale via export CSV al consulente del lavoro

**FORMA è un progetto separato**: c'è un altro progetto di nome "FORMA" (SaaS stampa 3D), che NON va mai usato come riferimento, base, o fonte di porting per ATS. Sono due webapp distinte e separate.

## Stack tecnico
- **Frontend**: Vite 7 · React 19 · TypeScript · Tailwind 3 · shadcn/ui · Framer Motion · react-hook-form + zod
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime) — progetto `pvzbuitpgeowzgbognqa` (Frankfurt)
- **Repo GitHub**: `https://github.com/formahub3d-cloud/ATS-v1`
- **Branch attivo**: `claude/mystifying-brattain-457c03`
- **Deploy target**: Vercel + dominio `altuoservizio.online` su IONOS (non ancora deployato)

## Cosa voglio che tu faccia ADESSO

Esegui questi step IN ORDINE e dammi un report sintetico alla fine.

### 1. Clonazione e checkout

```bash
git clone https://github.com/formahub3d-cloud/ATS-v1.git ats-v1
cd ats-v1
git fetch origin
git checkout claude/mystifying-brattain-457c03
git pull
cd app
```

### 2. Installazione dipendenze

```bash
npm install
```

### 3. Crea il file `.env.local` in `app/.env.local`

Contenuto:
```
VITE_SUPABASE_URL=https://pvzbuitpgeowzgbognqa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Cvgmc9c3NgRJ4vzzGtb6zg_aTkaUUM-
```

> La publishable_key è sicura nel client (RLS protegge i dati). Non confondere con la secret_key del dashboard Supabase — quella resta solo nel dashboard.

### 4. Verifica build TypeScript

```bash
npx tsc --noEmit -p tsconfig.app.json
```

Atteso: exit 0, nessun errore.

### 5. Smoke-test dev server

```bash
npm run dev
```

Atteso: `VITE ready` su porta 3000 (o altra). Prova ad aprire `http://localhost:3000/admin/structures-live` — dovresti vedere una pagina con titolo "Strutture (clienti)" e pulsante "+ Nuova struttura".

### 6. Leggi e riportami una sintesi di:
- `TASKS.md` nel root del worktree (roadmap completa + stato sprint)
- `app/CLAUDE.md` se esiste (istruzioni codebase)
- I file più recenti committati con `git log --oneline -10`

## Cosa NON fare (regole assolute)

- ❌ **Non toccare il progetto FORMA**, anche se lo trovi nominato in commenti o file. È un'altra webapp.
- ❌ **Non auto-promuoverti admin** né suggerire signUp con `role: 'admin'`: c'è un trigger DB che lo blocca per ragioni di sicurezza. La promozione admin si fa solo via SQL Editor.
- ❌ **Non riscrivere le pagine `demo` di Kimi** (`Home.tsx`, `Auth.tsx`, `AdminStructures.tsx`, ecc.). Le sostituiremo in uno sprint Visual Polish dedicato, dopo aver chiuso il backend funzionale.
- ❌ **Non fare push --force su `main`**, mai. Lavora sempre su feature branch.
- ❌ **Non committare `.env.local`** né altre chiavi/segreti.

## Lavoro da riprendere (priorità)

Il prossimo task in coda è **Sprint 2B-2: EmployeeSelfLive** — la pagina che il dipendente loggato vede per:
1. Visualizzare il proprio profilo (full_name, phone, indirizzo, ecc.)
2. Modificare i propri dati anagrafici editabili (phone, indirizzo, IBAN)
3. Vedere e caricare i propri documenti tramite il componente `<EmployeeDocuments employeeId={user.id} canUpload canVerify={false} />` già esistente in `src/components/employees/EmployeeDocuments.tsx`

Vincoli:
- Route da aggiungere in `src/App.tsx`: `<Route path="/employee/profile-live" element={<EmployeeSelfLive />} />`
- Posizione file: `src/pages/employee/SelfLive.tsx` (crea la dir `employee/` se non esiste)
- Layout: deve girare dentro il branch `/employee/*` del `Layout.tsx`
- Solo utente con `role='employee'` deve vedere il contenuto; gli altri vedono "Accesso riservato"
- Pattern: identico a `StructuresLive.tsx` per stile shadcn (Card, Form, Toast)

Dopo `EmployeeSelfLive`, segue:
- **Sprint 2B-5**: build TS + commit + push
- **Fase 2**: deploy su Vercel + DNS IONOS (vedi `TASKS.md` per dettagli)
- **Fase 3**: test sul campo con un dipendente reale

## Convenzioni di codice da rispettare

- Tutte le query Supabase passano da `src/services/*.ts`, mai inline nelle pagine
- TypeScript strict, types dal DB in `src/lib/database.types.ts`
- Form: react-hook-form + zod, mai useState per form complessi
- Toast: `useToast` da `@/components/ui/ToastSystem`
- `data-testid` kebab-case su ogni elemento interattivo
- Migrazioni SQL: file numerati `YYYYMMDDHHMMSS_nome.sql` in `app/supabase/migrations/`
- Pagine agganciate a Supabase: suffisso `Live` (es. `StructuresLive.tsx`); pagine demo di Kimi: senza suffisso

## Domande prima di partire?

Se qualcosa non è chiaro dopo aver letto `TASKS.md`, chiedimi prima di scrivere codice. Se invece tutto è chiaro, partiamo con `EmployeeSelfLive`.
```

---

## Note per Andrea (non per Claude)

- Questo prompt è progettato per essere **standalone**: una nuova istanza di Claude Code non sa nulla del nostro lavoro precedente, ma con questo prompt + `TASKS.md` ha tutto il contesto necessario.
- La tua **memoria locale** (`~/.claude/projects/.../memory/MEMORY.md` e file collegati) **non è su GitHub** e quindi non viaggia col repo. Se vuoi mantenerla, puoi:
  - Copiarla manualmente nella nuova macchina sotto lo stesso path
  - Oppure ignorarla: il prompt sopra contiene tutte le decisioni chiave
- Quando finisci una sessione sul nuovo PC, ricordati di fare `git push` per mantenere allineato il vecchio PC.
- Se cambi le env vars (chiavi Supabase rigenerate), aggiorna `.env.local` su entrambi i PC.
