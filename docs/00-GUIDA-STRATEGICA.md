# 00 — Guida Strategica ATS (lato amministrativo + tecnico)

> Documento di indirizzo per Andrea. Spiega **come impostare l'agenzia** (parte amministrativa/legale)
> e **come impostare lo sviluppo** (parte tecnica). Si legge insieme a `CLAUDE.md`, `01-ROADMAP.md`,
> `02-MODELLO-DATI.md`.
>
> ⚠️ **Disclaimer.** Le informazioni amministrative qui riportate sono **divulgative e da verificare**
> con un **consulente del lavoro** e un **commercialista**. Non sono consulenza legale né fiscale.
> Le norme cambiano: ogni valore (minimi, contributi, limiti) va confermato all'anno in corso.

---

## PARTE A — Lato amministrativo / business

### A.1 Il tuo modello reale: catering (appalto) + a volte "solo personale"

**Situazione dichiarata:** l'attività di base è il **catering** (servizio completo con proprio
personale), ma a volte i clienti chiedono **solo il personale**. **Non siete un'Agenzia per il Lavoro
autorizzata.** Questo è il punto più importante e ha conseguenze legali pesanti. Vanno distinte due cose:

1. **Rapporto Azienda ↔ Lavoratore** (che contratto firmi con il cameriere): hai indicato **extra /
   intermittente / occasionale** — vedi §A.2. Il cameriere è un **tuo dipendente/collaboratore**.
2. **Rapporto Azienda ↔ Cliente** (come "fornisci" quel cameriere): è qui che sta il rischio.

**Il catering è un "appalto di servizi" genuino** ed è la tua posizione corretta: non "presti" persone,
**vendi un servizio** (servizio di sala/banqueting per l'evento X) con tuoi dipendenti, tua
organizzazione, tue attrezzature e **tuo coordinamento**. Tutto regolare.

**La richiesta di "solo personale" è la zona grigia.** Se mandi un tuo lavoratore a operare nel locale
del cliente **sotto la direzione e il controllo del cliente**, di fatto stai facendo
**"somministrazione di lavoro"**, attività **riservata alle Agenzie per il Lavoro (APL) autorizzate**.
Poiché **non lo siete**, farlo in quel modo è irregolare (sanzioni per entrambe le parti).

Come restare nel lecito anche sul "solo personale" (da validare col consulente):
- Strutturarlo comunque come **servizio**: squadra con un **vostro referente/capo-servizio in loco**,
  vostra organizzazione del lavoro, vostre regole → resta **appalto genuino**, non cessione di manodopera.
- Evitare l'"**appalto non genuino**" (di fatto somministrazione mascherata): il segnale di rischio è
  il lavoratore eterodiretto dal cliente, senza alcuna organizzazione vostra.
- In alternativa, per quei casi, **appoggiarsi a un'APL autorizzata** o valutarne i requisiti.

👉 **Azione concreta:** verbalizza con un **consulente del lavoro** come gestite i due casi (catering
vs solo personale) e mettilo per iscritto nei contratti con i clienti. Nel software: marca ogni
commessa come **"Servizio catering"** o **"Solo personale"**, così i casi sensibili sono sempre visibili.

### A.2 Gli strumenti contrattuali "flessibili" (dati 2026, da validare)

| Strumento | A cosa serve | Punti chiave (verificare con consulente) |
|---|---|---|
| **Contratto "extra"** (CCNL Turismo / Pubblici Esercizi, base L. 56/1987) | Eventi, banqueting, matrimoni, fiere, picchi imprevedibili | Max **3 giorni consecutivi**; previsto dal CCNL di settore; CCNL rinnovato a **marzo 2025** con aumenti dei minimi (anche per extra/surroga). |
| **Lavoro intermittente / "a chiamata"** | Lavoro discontinuo ricorrente | Per **turismo/pubblici esercizi/spettacolo NON si applica** il limite generale delle 400 giornate/3 anni; requisiti soggettivi tipici (under 24 / over 55); **indennità di disponibilità ≥ 20%**; **comunicazione preventiva obbligatoria** prima della chiamata. |
| **Contratto di prestazione occasionale (PrestO)** | Prestazioni davvero occasionali | Tetti 2026: **€5.000/anno per lavoratore** (da tutti i committenti), **€2.500 da un singolo committente**, compenso **min €9/h**; limiti dimensionali per le imprese; nuovo **portale INPS dal 2026**. Poco adatto come strumento "ordinario" di un'agenzia strutturata. |

**Lettura pratica:** per un'agenzia che lavora su eventi e picchi, l'asse principale è di solito
**extra + intermittente**; il PrestO è marginale e va usato con cautela per i suoi tetti bassi.

### A.3 Cosa devi predisporre amministrativamente (checklist)
- [ ] Inquadramento dell'attività (modello a/b/c di §A.1) confermato dal consulente.
- [ ] Eventuali autorizzazioni/iscrizioni richieste (se modello somministrazione/APL).
- [ ] **CCNL di riferimento** scelto (Turismo/Pubblici Esercizi) e tabella minimi per livello/ruolo.
- [ ] Modelli di **contratto** per ciascun tipo di rapporto (extra, intermittente, occasionale).
- [ ] Procedure **contributi/INPS, INAIL, comunicazioni obbligatorie** (gestite con il consulente).
- [ ] **Tariffario verso le strutture** (prezzo orario per ruolo + eventuale fee/markup).
- [ ] **Registro/GDPR**: informativa privacy per lavoratori e strutture, base giuridica, conservazione documenti.
- [ ] Polizze assicurative e sicurezza sul lavoro per il personale in trasferta.

### A.4 Cosa tieni nel software vs. cosa lasci al consulente
- **Nel software (ATS):** anagrafiche, documenti e scadenze, turni, presenze, **ore validate**,
  **prospetti di calcolo** (lordo stimato, importi da fatturare), report e fatture verso le strutture,
  alert sui limiti di legge.
- **Al consulente del lavoro / commercialista:** elaborazione **cedolini** ufficiali, versamenti
  contributivi, dichiarazioni, conformità CCNL. ATS gli passa **export ordinati** (ore per lavoratore
  per periodo), riducendo errori e tempi.

> Questa divisione è già scritta come regola vincolante per gli agenti in `CLAUDE.md` §3 e §7.4.

---

## PARTE B — Lato tecnico / sviluppo

### B.1 Principio guida: trasformare il prototipo in prodotto, senza buttarlo
Hai già un frontend curato (React 19, Tailwind, shadcn, 3 ruoli, pagine turni/dipendenti/check-in).
È un'ottima base. Manca **tutto il "sotto"**: database, autenticazione, API, motore di calcolo.
La strategia è **aggiungere il backend e collegare il frontend ai dati reali**, modulo per modulo,
non riscrivere da zero.

### B.2 Architettura consigliata (con i TUOI strumenti attuali — nessun nuovo vendor)
Strumenti già in uso da Andrea: **Railway, MongoDB, Cloudflare, GitHub** (Vercel non serve).
```
                 ┌──────────── Cloudflare (DNS, CDN, cache, SSL, WAF) ───────────┐
Browser ─────────►  Frontend React/Vite   +   API Node/TS + Fastify  ──► MongoDB (Atlas)
                    (su Railway)               (su Railway)               via Mongoose
                                               │
                                               ├─ Auth (JWT access+refresh, RBAC per ruolo)
                                               ├─ config/payroll (tabelle validate dal consulente)
                                               └─ documenti su Cloudflare R2 (URL firmati)
   GitHub: codice + CI (Actions).
```
- **Frontend + API entrambi su Railway** (un solo progetto, una sola fattura), con **Cloudflare
  davanti** che fa da CDN/cache globale, SSL e protezione (WAF). Così il frontend statico è veloce
  ovunque pur restando su Railway. **Vercel non è necessario.**
- **Perché non Vercel:** è solo la convenzione "da manuale" per i frontend statici; aggiungerlo
  significa un altro vendor/fattura senza vantaggi decisivi, dato che con Cloudflare hai già la CDN.
  *(Alternativa gratuita, se un giorno vuoi separare il frontend: **Cloudflare Pages**.)*
- **API** Node/TS + **Fastify** su **Railway** (backend separato, non semplici "serverless function":
  il motore paghe deve essere testabile, riusabile e tracciabile).
- **Database MongoDB** con **Mongoose**: già nel tuo stack, parte dal tier gratuito.
- **Documenti** (CI, HACCP, permessi) su **Cloudflare R2**: storage privato con URL firmati, costo
  bassissimo e niente egress.

**MongoDB va bene per questo progetto?** Sì. Le paghe sono dati "relazionali" (turni→ore→tariffe→importi)
e in teoria PostgreSQL è il riferimento da manuale per i dati finanziari. Ma MongoDB è pienamente
adeguato per un MVP, **se** si rispettano 3 regole: (1) importi in **`Decimal128`** (esatto, mai float);
(2) ogni calcolo paga che tocca più documenti dentro una **transazione**; (3) relazioni modellate in
modo esplicito (riferimenti per le entità con vita propria, embedding solo per dati "figli"). Poiché lo
usi già e lo paghi, **resta su MongoDB**: cambiare a Postgres aggiungerebbe uno strumento da gestire
senza un beneficio decisivo a questo stadio. Se in futuro la reportistica diventasse molto complessa,
si potrà rivalutare (Railway ospita Postgres senza aggiungere un nuovo fornitore).

### B.3 Scelte tecniche puntuali
| Tema | Scelta | Note |
|---|---|---|
| Frontend host | **Railway** (+ Cloudflare davanti) | Tutto su una piattaforma; CDN/SSL da Cloudflare. Alternativa gratuita: Cloudflare Pages. |
| Framework API | **Fastify** (confermato) | Leggero; NestJS scartato perché più pesante. |
| Database / ODM | **MongoDB (Atlas) + Mongoose** | Già nel tuo stack; si parte dal tier M0 gratuito. |
| Storage documenti | **Cloudflare R2** | S3-compatibile, URL firmati, niente egress. |
| Auth | JWT access+refresh + RBAC, hashing **argon2** | In MVP basta email+password+ruolo; OTP già presente in UI. |
| Validazione | **zod** condiviso FE/BE | Stessi schemi su form e API. |
| Soldi/ore | **interi in centesimi** o **`Decimal128`** | Mai `float`. |
| Transazioni | **transazioni multi-documento** per le paghe | MongoDB le supporta (replica set/Atlas). |
| Fuso orario | DB in **UTC**, UI in **Europe/Rome** | Gestire turni oltre mezzanotte. |
| Test | **Vitest** | Copertura prioritaria sul motore paghe. |
| CI | **GitHub Actions** | lint + test + build ad ogni push. |
| Segreti | **Env Railway** + `.env.example` | Mai in git. |

### B.4 Debito tecnico da sanare (dallo stato attuale)
1. **`@ts-nocheck` diffuso** → riattivare TypeScript strict in modo incrementale, file per file.
2. **Dati mock ovunque** → introdurre `src/services/` come unico punto che oggi legge i mock e domani
   chiama l'API: si cambia un file, non 15 pagine.
3. **Nessuna auth reale** (solo `localStorage` role switch) → sostituire con login + RBAC.
4. **Logica di calcolo assente** → costruire il modulo paghe isolato e testato (vedi roadmap).

### B.5 Ambienti e rilascio
- **Dev** (locale) → **Staging** (Railway) → **Produzione** (Railway), con database separati.
- Script di migrazione applicati in pipeline, mai a mano in produzione.
- Backup DB automatici (MongoDB Atlas) + prova di ripristino periodica.

### B.6 Costi (stima 2026, prezzi in USD — verificare sui siti ufficiali, cambiano spesso)
| Strumento | A cosa serve | Piano | Costo |
|---|---|---|---|
| **GitHub** | Codice + CI | Free | **$0** — repo privati illimitati, 2.000 min Actions/mese |
| **Cloudflare** | DNS/CDN/SSL/WAF davanti a Railway + R2 (documenti) | Free | **$0** per partire; R2: 10 GB gratis, poi **$0,015/GB-mese**, **egress gratis** |
| **Railway** | **Frontend + API Fastify** (sempre attive) | Hobby | **$5/mese** minimo (include $5 di consumo); MVP piccolo ~**$5–15/mese**; un container 1vCPU/1GB 24/7 ≈ $30 |
| **MongoDB Atlas** | Database | M0 / Flex | **M0 = $0** (5 GB, condiviso) per MVP/dev; in produzione **Flex ~$8–30/mese** |
| ~~Vercel~~ | *(rimosso dallo stack)* | — | Non necessario: il frontend sta su Railway. |

**Stima realistica per l'MVP: circa $5–15/mese** — in pratica **solo Railway** (frontend + API insieme),
con **MongoDB M0** (gratis), **Cloudflare** e **R2** in free tier e **GitHub** Free.

**Come tenere i costi bassi:**
- **Tutto su Railway** + **Cloudflare davanti**: niente Vercel, una sola fattura. Il frontend statico,
  servito da un container piccolo e messo in cache da Cloudflare, incide pochissimo.
- Resta su **MongoDB M0** finché i dati sono pochi; passa a Flex solo quando serve.
- Su Railway, dimensiona piccolo il container e spegni gli ambienti di staging quando non servono.
- **GitHub Free** è sufficiente: non serve il piano Team finché lavori da solo/in pochi.
- *(Opzione a costo zero per il frontend: spostarlo su **Cloudflare Pages**, separandolo da Railway.)*

> In sintesi: **non devi pagare nessuno strumento nuovo** e puoi anche **togliere Vercel**. Con i
> servizi che già usi, il costo incrementale di questo progetto è minimo (pochi dollari al mese all'inizio).

---

## Riferimenti normativi consultati (giugno 2026, da riverificare)
- Contratto intermittente / a chiamata — guide 2025/2026 (Randstad, FiscoeTasse, Centro Fiscale, Jobtech).
- Contratto "extra" Turismo e Pubblici Esercizi — INPS (chiarimenti 03/2025), CCNL 21/03/2025, ADAPT.
- Prestazione occasionale / PrestO 2026 — INPS, FiscoeTasse, Studio Polli.

*(Elenco completo dei link nel riepilogo della chat. I valori vanno sempre confermati con il consulente.)*
