# ATS API (Fase 0)

Backend di ATS: **Node.js + TypeScript + Fastify + MongoDB (Mongoose)**, con autenticazione **JWT**
(access + refresh) e **RBAC**. Deploy target: **Railway** (vedi `CLAUDE.md` §4.2).

## Requisiti
- Node ≥ 20
- Una MongoDB (Atlas M0 in dev, oppure locale)

## Setup
```bash
cd api
cp .env.example .env      # compila MONGODB_URI e i segreti JWT
npm install
npm run dev               # avvio in watch (tsx)
```

## Script
- `npm run dev` — server in sviluppo (watch)
- `npm run build` — compila in `dist/`
- `npm start` — avvia il build di produzione
- `npm run typecheck` — solo type-check
- `npm test` — test Vitest (non richiedono DB)

## API (v1)
Base path: `/api/v1`
- `GET  /health` — stato servizio + DB
- `POST /auth/register` — `{ email, password, role }` → utente + token
- `POST /auth/login` — `{ email, password }` → utente + token
- `POST /auth/refresh` — `{ refreshToken }` → nuovi token
- `GET  /auth/me` — profilo (richiede access token)
- `GET  /employees` — lista (solo ADMIN)
- `POST /employees` — crea (solo ADMIN)
- `GET  /employees/:id` — dettaglio (solo ADMIN)

## Struttura
```
src/
  env.ts          # config d'ambiente validata con zod
  server.ts       # build dell'app Fastify (senza connessione DB → testabile con inject)
  index.ts        # avvio: connette DB + listen
  db.ts           # connessione Mongoose
  models/         # schemi Mongoose (User, Employee, Structure, Shift)
  auth/guards.ts  # preHandler requireAuth / requireRole (RBAC)
  services/       # logica (authService)
  routes/         # auth, employees, health
config/payroll/   # tabelle paga VALIDATE dal consulente (non hardcodare nel codice)
```

## Note
- Importi monetari in **Decimal128** (mai float); orari in **UTC**.
- I valori normativi/paga **non** sono nel codice: vivono in `config/payroll/` (Fase 4).
- Access e refresh oggi firmati dalla stessa istanza JWT (MVP); i due segreti separati in `.env`
  sono predisposti per istanze namespaced distinte in futuro.
- Prossimi passi: collegare il frontend (`app/src/services/*`) a queste API al posto dei mock;
  poi moduli Personale → Turni → Presenze → Paga → Fatturazione.
```
