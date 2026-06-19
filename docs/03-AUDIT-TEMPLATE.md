# 03 — Template di Audit (da compilare a fine di OGNI lavoro)

> Copia questo blocco, compilalo, e incollalo **in cima a `docs/AUDIT-LOG.md`** (audit più recente in
> alto). È il sistema di memoria del progetto: serve a far ripartire allineato qualsiasi nuovo agente
> o collaboratore. Tieni le risposte concrete e brevi.

---

```markdown
## Audit #<N> — <data> — <titolo del lavoro>

**Autore:** <agente / persona>
**Sessione / obiettivo:** <cosa si era prefissato>
**Fase roadmap:** <Fase 0–6 di riferimento>

### 1. Lavoro svolto
- <punto 1>
- <punto 2>

### 2. File / aree toccate
- `path/file` — <cosa è cambiato>

### 3. Stato dei moduli prioritari (semaforo)
| Modulo | Stato | Nota |
|---|---|---|
| Personale | 🔴/🟡/🟢 | |
| Turni | 🔴/🟡/🟢 | |
| Presenze/Ore | 🔴/🟡/🟢 | |
| Calcolo Paga | 🔴/🟡/🟢 | |
| Fatturazione | 🔴/🟡/🟢 | |
(🔴 non iniziato · 🟡 in corso · 🟢 funzionante)

### 4. Qualità tecnica
- TypeScript strict / `@ts-nocheck` residui: <stato>
- Test aggiunti/eseguiti: <stato>
- Sicurezza/GDPR toccati: <sì/no, cosa>
- Debito tecnico introdotto o ridotto: <descrizione>

### 5. Decisioni prese
- <decisione + motivo>

### 6. Rischi / questioni aperte
- <rischio> — <impatto> — <azione suggerita>
- Punti da verificare con il **consulente del lavoro / commercialista**: <…>

### 7. Prossimo passo consigliato
- <azione concreta successiva>

### 8. Valutazione sintetica (1–5)
- Avanzamento: <n>/5 · Qualità: <n>/5 · Aderenza alle regole (`CLAUDE.md`): <n>/5
```

---

### Come usarlo bene
- **Sempre**, anche per lavori piccoli (bastano poche righe).
- Numera in modo crescente e **non riscrivere** gli audit passati: sono lo storico.
- Se prendi una decisione che cambia `CLAUDE.md` o la roadmap, aggiorna **anche** quei file e citalo
  nell'audit (sezione 5).
