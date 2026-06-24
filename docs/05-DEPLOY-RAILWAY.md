# 05 — Deploy su Railway (+ MongoDB, Environments, dominio Cloudflare)

> Guida operativa per mettere online ATS. **Cosa fa Claude Code:** prepara il repo (config di build,
> `railway.json`, variabili documentate). **Cosa fai tu (Andrea) nelle dashboard:** crei DB, incolli i
> segreti, colleghi il dominio — azioni che richiedono i tuoi account (io non vi ho accesso).
>
> Decisioni prese (24/06/2026): Frontend **su Railway**, DB **Railway MongoDB**, **Railway Environments**
> (main→production, staging→staging), dominio **già posseduto** su Cloudflare.

---

## 0. Architettura target

```
Railway project "Al Tuo Servizio - ATS"
├─ Environment: production   (branch GitHub: main)
│   ├─ service: web   (root dir: app/)   → serve il frontend statico
│   ├─ service: api   (root dir: api/)   → Fastify REST /api/v1
│   └─ plugin:  MongoDB                    → database
└─ Environment: staging      (branch GitHub: staging)
    ├─ web · api · MongoDB (separati o con DB dedicato)

Cloudflare (DNS + CDN/SSL davanti):
  app.<dominio>  → service web
  api.<dominio>  → service api
```

I file `app/railway.json` e `api/railway.json` sono già nel repo: Railway li usa in automatico
(build + start + healthcheck).

---

## 1. Database — MongoDB (plugin Railway)

1. Nel progetto Railway → **New → Database → Add MongoDB**.
2. Apri il servizio MongoDB → tab **Variables**: troverai la connection string (es. `MONGO_URL`).
3. La useremo nell'API come `MONGODB_URI` tramite **reference** (vedi §2), così non si copia a mano.
   - Suggerito: usare un database dedicato per ambiente (es. `…/ats` in production, `…/ats_staging`
     in staging) aggiungendo il nome DB in fondo alla URI.

---

## 2. Service API (cartella `api/`)

1. **New → GitHub Repo** → seleziona `formahub3d-cloud/ats-v1`.
2. Service Settings → **Root Directory** = `api` (così legge `api/railway.json`).
3. Settings → **Variables** (production):
   | Variabile | Valore |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | `${{MongoDB.MONGO_URL}}/ats` *(adatta il nome del servizio/variabile MongoDB)* |
   | `JWT_ACCESS_SECRET` | genera: `openssl rand -hex 32` |
   | `JWT_REFRESH_SECRET` | genera: `openssl rand -hex 32` (diverso dal precedente) |
   | `JWT_ACCESS_TTL` | `15m` |
   | `JWT_REFRESH_TTL` | `7d` |
   | `CORS_ORIGIN` | URL pubblico del frontend (vedi §3 / §5) |
   - **`PORT` NON va impostata**: Railway la inietta e l'API la usa già (`0.0.0.0:$PORT`).
4. Build/Start/Healthcheck arrivano da `api/railway.json` (`/api/v1/health`).
5. Dopo il deploy: apri `https://<api>.up.railway.app/api/v1/health` → deve rispondere `{"status":"ok"}`.

> Nota: i segreti di default `dev-*` sono **bloccati in produzione** dal codice (`assertProductionSecrets`):
> se l'API non parte, è perché mancano i secret reali → impostali.

---

## 3. Service Web (cartella `app/`)

1. **New → GitHub Repo** → stesso repo.
2. Root Directory = `app` (legge `app/railway.json`; build Vite + `serve -s dist`).
3. Variabili:
   | Variabile | Valore | Nota |
   |---|---|---|
   | `VITE_API_URL` | URL pubblico dell'API | **Build-time**: cambiarla richiede un nuovo build |
   - `PORT` automatica.
   - ⚠️ Oggi il frontend usa ancora i **mock**, quindi `VITE_API_URL` non è strettamente necessaria
     finché non colleghiamo i service all'API (passo successivo del piano).
4. Dopo il deploy: apri l'URL pubblico → deve caricare l'app.

---

## 4. Environments (staging + production)

1. Railway → progetto → menu **Environments** → l'ambiente attuale rinominalo/usalo come **production**.
2. **New Environment → "staging"** (puoi duplicare production per ereditare i servizi).
3. Per ciascun ambiente, in ogni service → Settings → **Source / Branch**:
   - **production** → branch `main`
   - **staging** → branch `staging`  *(già esistente su GitHub)*
4. Variabili per-ambiente: in staging usa **DB/segreti separati** (es. `MONGODB_URI …/ats_staging`,
   `CORS_ORIGIN` = dominio staging). Non condividere il DB di produzione.
5. Auto-deploy: ad ogni push su `staging` → si aggiorna staging; su `main` → produzione.

> ⚠️ **Importante sul branch di produzione:** il lavoro recente è sul branch
> `claude/web-app-improvements-3modcu` (e `staging`). Il branch `main` è ancora la baseline vecchia.
> Quando sei soddisfatto di staging, fai il **merge in `main`** (o, temporaneamente, punta l'ambiente
> production a questo branch) per pubblicare la versione aggiornata.

---

## 5. Dominio + DNS (Cloudflare)

> Servono i nomi esatti: dimmi **qual è il dominio** e quali sottodomini vuoi (consigliati
> `app.` per il frontend e `api.` per l'API) e preparo la tabella DNS precisa. Schema generale:

1. **In Railway**, per ciascun service → Settings → **Networking → Custom Domain**:
   - su `web` aggiungi `app.<dominio>` (o il dominio root)
   - su `api` aggiungi `api.<dominio>`
   - Railway mostra un **target CNAME** (es. `xxxx.up.railway.app`).
2. **In Cloudflare** (DNS del dominio) → Add record:
   | Type | Name | Target | Proxy |
   |---|---|---|---|
   | CNAME | `app` | *(target del service web)* | DNS only (grigio) all'inizio |
   | CNAME | `api` | *(target del service api)* | DNS only (grigio) all'inizio |
   - Lascia **DNS only** finché Railway non emette il certificato; poi puoi attivare il **proxy
     (arancione)** con SSL **Full (strict)** per avere CDN/cache/WAF Cloudflare davanti.
   - Per il dominio **root** (apex), Cloudflare supporta CNAME flattening.
3. Aggiorna le variabili: `CORS_ORIGIN` (API) = `https://app.<dominio>`; `VITE_API_URL` (web) =
   `https://api.<dominio>` → rifai il build del web.

---

## 6. Generare i segreti

```bash
openssl rand -hex 32   # per JWT_ACCESS_SECRET
openssl rand -hex 32   # per JWT_REFRESH_SECRET
```
Non committarli mai: vivono solo nelle Variables di Railway (per ambiente).

---

## 7. Checklist finale

- [ ] MongoDB plugin attivo (production e staging con DB separati)
- [ ] Service `api`: variabili impostate, `/api/v1/health` = ok
- [ ] Service `web`: build ok, app raggiungibile
- [ ] Environments: production→`main`, staging→`staging`
- [ ] Dominio: CNAME `app`/`api` su Cloudflare, SSL ok, `CORS_ORIGIN`/`VITE_API_URL` aggiornati
- [ ] (Dopo) collegare i service del frontend all'API reale al posto dei mock

---

## 8. Prossimo passo tecnico (dopo l'infrastruttura)

Collegare `app/src/services/*` all'API: sostituire `simulate(...)` con `fetch(import.meta.env.VITE_API_URL + '/api/v1/...')`. Le **pagine non cambiano** (usano già gli hook/service), quindi il passaggio è isolato allo strato service.
