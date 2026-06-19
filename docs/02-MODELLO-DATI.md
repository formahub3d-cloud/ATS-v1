# 02 — Modello dati proposto (ATS)

> Bozza di modello dati per guidare lo sviluppo del backend (**MongoDB + Mongoose**). È un punto di
> partenza ragionato sullo stato attuale dei mock, **da rifinire** insieme al consulente del lavoro
> per la parte contrattuale/paghe. Nomi collection/campi in inglese (vedi convenzioni in `CLAUDE.md`).
>
> **Nota MongoDB:** ogni "entità" qui sotto è una **collection** di documenti. Le relazioni si
> realizzano con **riferimenti** (`ObjectId`) per le entità con vita propria (es. Employee, Shift) e
> con **embedding** solo per dati strettamente "figli" (es. le righe di una Invoice). Gli importi usano
> **`Decimal128`** (mai float) e i calcoli che toccano più documenti collegati (paga, fatture) vanno
> eseguiti in **transazione**.

---

## Entità principali e relazioni (vista d'insieme)

```
User ─1:1─ (Employee | StructureContact | AdminProfile)      ← un account, un ruolo
Structure ─1:N─ Shift
Employee  ─1:N─ Shift            (un turno assegnato a un lavoratore)
Employee  ─1:N─ EmployeeDocument
Employee  ─1:N─ Contract
Shift     ─1:1─ Timesheet        (presenze/ore di quel turno)
Timesheet ─N:1─ PayrollItem      (le ore validate confluiscono nel calcolo)
PayrollRun ─1:N─ PayrollItem     (un periodo di calcolo)
Structure ─1:N─ Invoice
PayrollItem/Shift ─N:1─ Invoice  (le ore di una struttura confluiscono nella fattura)
```

---

## Tabelle (campi chiave)

### User
`id, email, passwordHash, role (ADMIN|STRUCTURE|EMPLOYEE), status, createdAt, lastLoginAt`
Account e autenticazione. Collegato al profilo specifico via FK.

### Employee (lavoratore)
`id, userId?, firstName, lastName, fiscalCode, phone, email, iban, zone, hasVehicle,
status (ACTIVE|PENDING|SUSPENDED|REVIEW), rankLevel, rankPoints, joinDate, notes`
+ relazioni: `roles[]` (Cameriere, Chef, Barman, Receptionist, SPA…), `documents[]`, `contracts[]`, `shifts[]`.

### EmployeeDocument
`id, employeeId, type (ID|PERMIT|HACCP|CERT|OTHER), fileKey, issuedAt, expiresAt, status`
Storage privato; `expiresAt` alimenta gli alert di scadenza.

### Contract (rapporto di lavoro)
`id, employeeId, type (EXTRA|INTERMITTENT|OCCASIONAL), ccnlRef, level, startDate, endDate?,
status, signedFileKey?, notes`
Il `type` guida regole e limiti a valle (vedi `00-GUIDA-STRATEGICA.md`).

### Structure (cliente)
`id, name, code, type (Ristorante|Hotel|Bar|SPA|Location|Resort), status, address, zone, vatNumber,
contactName, phone, contractSigned, clientHourlyRate?, fee?, joinDate`
`clientHourlyRate`/`fee` alimentano il calcolo dell'importo da fatturare.

### Shift (turno)
`id, structureId, employeeId? (null = da assegnare), requiredRole, date, startTime, endTime,
contractType (EXTRA|INTERMITTENT|OCCASIONAL),
serviceType (CATERING|STAFF_ONLY),
status (TO_ASSIGN|SCHEDULED|IN_PROGRESS|DONE|NO_SHOW|CANCELLED),
recurrenceId?, createdBy, createdAt`
Nota: `startTime/endTime` in UTC; gestire turni oltre la mezzanotte.
`serviceType` distingue il **servizio catering** (appalto pieno) dalla richiesta di **solo personale**
(zona legalmente sensibile, vedi `00-GUIDA-STRATEGICA.md` §A.1): l'UI deve evidenziare i turni
`STAFF_ONLY` come da gestire con cautela (referente in loco). In futuro si può introdurre un'entità
**`Job`/`Commessa`** (cliente, evento, tipo servizio) che raggruppa più turni.

### Timesheet (presenza/ore di un turno)
`id, shiftId (1:1), checkInAt, checkOutAt, breakMinutes, workedMinutes,
validationState (DECLARED|STRUCTURE_CONFIRMED|ADMIN_VALIDATED),
adjustedBy?, adjustmentReason?, validatedAt`
`workedMinutes` calcolato; **solo `ADMIN_VALIDATED` entra in paga**.

### PayrollRun (ciclo di calcolo)
`id, periodStart, periodEnd, status (DRAFT|FINALIZED), createdBy, createdAt`

### PayrollItem (riga di calcolo per lavoratore)
`id, payrollRunId, employeeId, timesheetId?, shiftId?, workedMinutes, hourlyRate, multipliers (notturno/festivo),
grossAmount, contributions?, netEstimate, structureBillableAmount`
Tutti gli importi in **centesimi** o **`Decimal128`**. Ogni riga deve essere **ricostruibile** dal turno/ore.

### Invoice (fattura verso struttura)
`id, structureId, periodStart, periodEnd, lines[] (shift/ore/tariffa), subtotal, fee, total, status, issuedAt`

### AuditEntry (registro operazioni sensibili — opzionale ma consigliato)
`id, actorUserId, action, entity, entityId, before?, after?, createdAt`
Per tracciare chi modifica ore, paghe, contratti (utile per GDPR e controlli).

---

## Note di progettazione
- **`Tabelle` = collection MongoDB.** I campi `id` corrispondono a `_id` (ObjectId); i campi che
  finiscono in `Id` (es. `structureId`) sono **riferimenti** ad altri documenti.
- **Configurazione paga fuori dal database:** tariffe/minimi/maggiorazioni vivono in
  `api/config/payroll/` (file versionati e validati), referenziati al momento del calcolo. Così un
  aggiornamento normativo non richiede script di migrazione e resta tracciabile in git.
- **Immutabilità dei calcoli finalizzati:** una `PayrollRun` FINALIZED non si modifica; correzioni →
  nuova run di rettifica. Stessa logica per fatture emesse.
- **Enum espliciti** per stati e tipi: evitano stringhe libere incoerenti come negli attuali mock.
- **Soft delete / anonimizzazione** per i dati personali (GDPR), invece di cancellazioni fisiche cieche.

> Questo schema è una proposta: validarlo prima di scrivere i primi schemi Mongoose. La parte
> `Contract`/`PayrollItem` va allineata al CCNL e al modello legale scelto.
