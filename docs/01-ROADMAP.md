# 01 — Roadmap di sviluppo ATS

> Piano a fasi per portare ATS da prototipo a gestionale funzionante, partendo dalle priorità di
> Andrea: **turni, contratti, personale, calcolo orario e paga**. Approccio **bilanciato**: base
> tecnica pulita sui punti critici (dati, sicurezza, paghe), pragmatismo sul resto.
>
> Regola: a **fine di ogni fase/lavoro** si scrive un audit (`docs/AUDIT-TEMPLATE.md` → `AUDIT-LOG.md`).

---

## Fase 0 — Fondamenta tecniche (abilitante, prima di tutto)
**Obiettivo:** dare al progetto un "sotto" reale.
- [ ] Creare `api/` (Node/TS + **Fastify**) accanto ad `app/`, deploy su **Railway**.
- [ ] **MongoDB Atlas (M0)** + **Mongoose** con schemi iniziali (vedi `02-MODELLO-DATI.md`).
- [ ] **Auth reale** (login email/password, JWT, ruoli admin/struttura/dipendente) + RBAC base.
- [ ] Layer `src/services/` nel frontend che oggi incapsula i mock, domani chiama l'API.
- [ ] Frontend **su Railway** (stesso progetto dell'API) con **Cloudflare** davanti + **Cloudflare R2** per i documenti.
- [ ] Setup ambienti dev/staging + `.env.example` + CI minima su **GitHub Actions** (lint + test + build).
**Done quando:** un utente fa login reale e vede dati che arrivano dal DB (anche solo le anagrafiche).

## Fase 1 — Personale (anagrafiche e documenti)
**Obiettivo:** la fonte di verità su chi sono i lavoratori.
- [ ] CRUD lavoratori (anagrafica, CF, IBAN, ruoli, zona, mezzo, stato).
- [ ] Upload **documenti** (CI, permesso di soggiorno, HACCP, certificazioni) in storage privato.
- [ ] **Scadenze documenti** con alert (es. HACCP in scadenza).
- [ ] Anagrafica **strutture** (clienti) collegata al tariffario.
**Done quando:** l'admin gestisce persone e strutture reali, con documenti e alert scadenza.

## Fase 2 — Turni (shift)
**Obiettivo:** pianificare e assegnare il lavoro.
- [ ] CRUD turni (struttura, ruolo, data, orario, stato, **tipo rapporto**).
- [ ] Turni ricorrenti + vista **calendario settimanale** (già abbozzata in UI).
- [ ] Assegnazione/matching lavoratore ↔ turno (filtri: ruolo, zona, disponibilità, affidabilità).
- [ ] Gestione **no-show** con pool reperibili.
**Done quando:** si crea un turno, lo si assegna e lo si vede nei calendari dei 3 ruoli.

## Fase 3 — Presenze e Ore (timesheet)
**Obiettivo:** ore reali e affidabili (input del calcolo paga).
- [ ] **Check-in/check-out** reale (collegare il QR già presente in `EmployeeCheckin`).
- [ ] Calcolo ore effettive con pause, **mezzanotte**, arrotondamento configurabile.
- [ ] Flusso di **validazione** (dipendente dichiara → struttura conferma → admin valida).
- [ ] Correzioni manuali tracciate (chi/quando/perché).
**Done quando:** per ogni turno completato esiste un record ore **validato** e immutabile.

## Fase 4 — Calcolo orario e Paga (modulo critico)
**Obiettivo:** trasformare ore in importi, in modo tracciabile.
- [ ] Tabelle `config/payroll/` (tariffe per ruolo/livello, maggiorazioni, eventuali contributi) —
      **popolate e validate dal consulente**, non inventate.
- [ ] Motore di calcolo **isolato e testato** (Vitest): input ore validate → output lordo/netto stimato.
- [ ] Calcolo **importo da fatturare** alla struttura (ore × tariffa cliente + fee/markup).
- [ ] **Prospetti** per lavoratore e per struttura, esportabili (CSV/PDF), con dettaglio ricostruibile.
- [ ] Alert su **limiti di legge** (es. PrestO €5.000/anno, extra 3 giorni).
**Done quando:** dato un periodo, ATS produce prospetti corretti e verificabili per lavoratori e strutture.

## Fase 5 — Fatturazione e report
- [ ] Generazione fatture/proforma verso le strutture dai prospetti di Fase 4.
- [ ] Dashboard KPI reali (ore, fatturato, no-show, copertura turni).
- [ ] Export per il commercialista.

## Fase 6 — Rifinitura
- [ ] Rimozione completa di `@ts-nocheck`, hardening sicurezza, test estesi.
- [ ] Notifiche (email/whatsapp/push) per turni e scadenze.
- [ ] Eventuale app mobile / PWA per i dipendenti.

---

### Dipendenze tra fasi
`Fase 0` abilita tutto → `Personale` → `Turni` → `Presenze` → **`Paga`** → `Fatturazione`.
Non si può calcolare la paga senza ore validate; non ci sono ore senza turni; non ci sono turni senza
anagrafiche. Rispettare l'ordine evita di rifare il lavoro.

### Suggerimento operativo per le sessioni con Claude Code
Lavora **una fase (o sotto-task) per sessione**, chiudi con l'audit, poi apri la successiva. Sessioni
piccole e tracciate = meno errori e storia chiara del progetto.
