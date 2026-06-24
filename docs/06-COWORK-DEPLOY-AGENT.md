# 06 — Agente Cowork per il deploy (co-pilota browser)

> Come farti assistere da un **agente Cowork** (capace di usare il browser) per eseguire il deploy su
> Railway + DNS su SiteGround, seguendo `docs/05-DEPLOY-RAILWAY.md`. L'agente **ti guida schermata per
> schermata**; tu mantieni il controllo di **login, 2FA, pagamenti e segreti**.

---

## Regole di sicurezza (importanti)
- **Le credenziali le inserisci TU.** L'agente non chiede e non scrive username/password/2FA.
- **I segreti** (JWT) li generi tu e li incolli tu nelle Variables di Railway. **Non incollarli in
  chat** e non chiedere all'agente di conservarli.
- L'agente procede **un passo alla volta**, ti dice esattamente dove cliccare, **verifica** ciò che vede
  e **chiede conferma** prima di azioni irreversibili (eliminare servizi, cambiare DNS, ecc.).

---

## 1. Come creare l'agente
In Cowork apri una **nuova sessione/agente** e incolla questo **brief iniziale** (ruolo):

```
Sei il mio co-pilota di deploy per il progetto ATS (gestionale catering).
Obiettivo: aiutarmi a mettere online l'app su Railway e collegare il dominio su SiteGround,
guidandomi nel browser passo-passo.

Contesto tecnico (fonte di verità nel repo GitHub formahub3d-cloud/ats-v1):
- Monorepo: cartella app/ (frontend React/Vite) e api/ (backend Fastify) — già configurate per Railway
  (file app/railway.json e api/railway.json, healthcheck /api/v1/health).
- Decisioni: frontend su Railway, database = plugin MongoDB di Railway, ambienti = Railway Environments
  (branch main→production, staging→staging), dominio altuoservizio.online con DNS su SiteGround.
- Guida dettagliata: docs/05-DEPLOY-RAILWAY.md nel repo (leggila come riferimento).

Regole:
- Le credenziali, la 2FA e i pagamenti li gestisco io: tu non li chiedi e non li scrivi.
- I segreti JWT li genero e incollo io; non li voglio in chat.
- Procedi UN PASSO ALLA VOLTA: dimmi dove cliccare, cosa inserire, e verifica il risultato a schermo
  prima di passare oltre. Chiedi conferma prima di azioni irreversibili.
- Lavoriamo su: Railway (railway.app) e SiteGround (Site Tools → Domain → DNS Zone Editor).
Quando sei pronto, partiamo dallo Step 1.
```

---

## 2. Comandi (prompt) da dare all'agente, step per step

**Step 1 — Database MongoDB**
```
Step 1: nel mio progetto Railway "Al Tuo Servizio - ATS", guidami ad aggiungere un database MongoDB
(New → Database → Add MongoDB). Poi mostrami dove trovo la sua connection string (variabile MONGO_URL)
nel tab Variables. Non copiarla in chat: dimmi solo dove leggerla.
```

**Step 2 — Service API (cartella api/)**
```
Step 2: creiamo il service dell'API. Guidami a: New → GitHub Repo → formahub3d-cloud/ats-v1, poi
impostare Root Directory = api. Quindi nelle Variables del service aiutami a inserire:
NODE_ENV=production, MONGODB_URI con reference al MongoDB (es. ${{MongoDB.MONGO_URL}}/ats),
JWT_ACCESS_TTL=15m, JWT_REFRESH_TTL=7d, CORS_ORIGIN (lo mettiamo dopo, quando ho l'URL del web).
Per JWT_ACCESS_SECRET e JWT_REFRESH_SECRET dimmi solo di generarli io (openssl rand -hex 32) e dove
incollarli. NON impostare PORT. Alla fine verifichiamo che il deploy parta e che
/api/v1/health risponda {"status":"ok"}.
```

**Step 3 — Service Web (cartella app/)**
```
Step 3: creiamo il service del frontend. New → GitHub Repo (stesso repo) → Root Directory = app.
Verifichiamo che builda e che l'URL pubblico carichi l'app. Poi dammi l'URL pubblico del web.
```

**Step 4 — Collega CORS**
```
Step 4: ora che ho l'URL del web, guidami a impostare nel service api la variabile
CORS_ORIGIN = (URL del web) e a fare il redeploy.
```

**Step 5 — Environments (staging + production)**
```
Step 5: configuriamo gli ambienti. Guidami a impostare l'ambiente attuale come production legato al
branch main, e a creare un ambiente "staging" legato al branch staging. In staging voglio un DATABASE
SEPARATO (non quello di produzione). Verifica i mapping branch→environment.
```

**Step 6 — Dominio su SiteGround**
```
Step 6: colleghiamo il dominio altuoservizio.online (DNS su SiteGround).
6a) In Railway: nel service web aggiungi custom domain app.altuoservizio.online; nel service api
    aggiungi api.altuoservizio.online. Annota i due target CNAME che Railway mostra.
6b) In SiteGround (Site Tools → Domain → DNS Zone Editor) guidami a creare due record CNAME:
    app → (target web), api → (target api). Poi attendiamo SSL e propagazione.
Per il dominio root altuoservizio.online imposta un redirect verso https://app.altuoservizio.online.
```

**Step 7 — Verifica finale**
```
Step 7: verifichiamo tutto: https://api.altuoservizio.online/api/v1/health risponde ok,
https://app.altuoservizio.online carica l'app, gli ambienti staging/production sono distinti.
Fammi un riepilogo finale di URL, variabili impostate e cosa resta da fare.
```

---

## 3. Valori pronti da incollare
- Sottodomini: `app.altuoservizio.online` (web), `api.altuoservizio.online` (api)
- Variabili API: `NODE_ENV=production`, `JWT_ACCESS_TTL=15m`, `JWT_REFRESH_TTL=7d`,
  `MONGODB_URI=${{MongoDB.MONGO_URL}}/ats` (adatta al nome reale del servizio MongoDB),
  `CORS_ORIGIN=https://app.altuoservizio.online`
- Segreti (genera in un terminale, NON in chat): `openssl rand -hex 32` × 2
- Branch: production→`main`, staging→`staging`

> Nota: la versione aggiornata dell'app è sul branch di lavoro/`staging`. Per pubblicare in
> **production** va fatto il **merge in `main`** (chiedimelo e apro la PR).
