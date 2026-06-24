# config/payroll — tabelle paga/contributi (VALIDATE DAL CONSULENTE)

> ⚠️ I valori normativi/contabili (tariffe, minimi, maggiorazioni, contributi) **non vanno
> hardcodati nel codice** (vedi `CLAUDE.md` §3/§7.4). Vivono qui come file versionati e **validati
> dal consulente del lavoro**. Il motore paghe (Fase 4) li leggerà da qui.

- `rates.example.json` è solo un **esempio di struttura**, non valori reali da usare in produzione.
- Quando il consulente fornirà i dati definitivi, creare `rates.json` (versionato) con le tabelle reali.
- Ogni modifica resta tracciabile in git (niente migrazioni dati per cambi normativi).
