// Termini di servizio — placeholder onesto v1.

import LegalLayout from './LegalLayout'

export default function Terms() {
  return (
    <LegalLayout
      title="Termini di servizio"
      subtitle="Le regole d'uso della piattaforma ATS."
      lastUpdated="10 maggio 2026"
      sections={[
        {
          id: 'oggetto',
          title: 'Oggetto del servizio',
          body: (
            <>
              <p>
                ATS è una piattaforma di intermediazione tra strutture HORECA (clienti) e lavoratori
                del settore hospitality (dipendenti diretti di ATS). Il servizio comprende:
              </p>
              <ul>
                <li>Pubblicazione e gestione di turni di lavoro.</li>
                <li>Matching automatizzato basato su zona, ruolo, tag valori, certificazioni.</li>
                <li>Check-in/check-out con tracciamento ore.</li>
                <li>Gestione contrattuale, retributiva e fiscale dei lavoratori.</li>
                <li>Fatturazione mensile aggregata alle strutture.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'account',
          title: 'Creazione account',
          body: (
            <>
              <p>
                L&apos;accesso alla piattaforma richiede registrazione. Ogni utente garantisce la veridicità
                dei dati forniti. Le strutture devono fornire P.IVA valida; i lavoratori devono fornire
                documento di identità e codice fiscale validi.
              </p>
              <p>
                ATS si riserva il diritto di rifiutare o sospendere account in caso di dati falsi,
                comportamenti scorretti o violazioni dei presenti termini.
              </p>
            </>
          ),
        },
        {
          id: 'rapporto-lavoro',
          title: 'Natura del rapporto di lavoro',
          body: (
            <>
              <p>
                <strong>I lavoratori sono dipendenti diretti di ATS</strong>, non delle strutture clienti.
                Le strutture pagano un corrispettivo ad ATS per il servizio erogato; ATS paga lo
                stipendio ai lavoratori secondo CCNL Pubblici Esercizi e contratto individuale.
              </p>
              <p>
                Non si tratta di somministrazione di lavoro né di lavoro interinale.
              </p>
            </>
          ),
        },
        {
          id: 'turni',
          title: 'Pubblicazione e accettazione turni',
          body: (
            <>
              <p>
                Le strutture pubblicano turni indicando data, orario, ruolo, paga oraria. I lavoratori
                visualizzano i turni compatibili e possono manifestare interesse (&quot;like&quot;).
                La struttura conferma il candidato.
              </p>
              <p>
                Una volta confermato, il turno è vincolante: cancellazioni unilaterali entro 24h sono
                penalizzate (per la struttura: addebito; per il lavoratore: punti rank negativi).
              </p>
            </>
          ),
        },
        {
          id: 'pagamenti',
          title: 'Corrispettivi e fatturazione',
          body: (
            <>
              <ul>
                <li><strong>Strutture:</strong> ricevono fattura mensile aggregata entro il 5 del mese successivo. Pagamento entro 30 giorni con SEPA o bonifico.</li>
                <li><strong>Lavoratori:</strong> stipendio accreditato sull&apos;IBAN entro il 10 del mese successivo. Busta paga disponibile in app.</li>
                <li>Ritardi di pagamento da parte delle strutture comportano interessi di mora ex art. 1284 c.c. e possibile sospensione del servizio.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'recensioni',
          title: 'Recensioni',
          body: (
            <>
              <p>
                Al termine di ogni turno entrambe le parti (struttura e lavoratore) possono lasciare
                una recensione (1-5 stelle + commento). Le recensioni sono pubbliche all&apos;interno
                della piattaforma e contribuiscono al sistema di rank.
              </p>
              <p>
                ATS si riserva di rimuovere recensioni offensive, discriminatorie o non veritiere.
              </p>
            </>
          ),
        },
        {
          id: 'limitazioni',
          title: 'Limitazione di responsabilità',
          body: (
            <>
              <p>
                ATS garantisce la piena qualità del servizio di intermediazione e la correttezza degli
                obblighi contrattuali, fiscali e previdenziali verso i propri dipendenti.
              </p>
              <p>
                ATS non risponde di danni indiretti, mancato guadagno o eventi di forza maggiore
                (interruzioni internet, disastri naturali). La responsabilità complessiva è limitata
                al corrispettivo del servizio erogato negli ultimi 12 mesi.
              </p>
            </>
          ),
        },
        {
          id: 'recesso',
          title: 'Recesso e cessazione',
          body: (
            <>
              <p>
                Strutture e lavoratori possono recedere in qualsiasi momento previa cessazione di
                tutti i turni attivi. Il rapporto contrattuale di lavoro segue le norme di legge
                in materia di preavviso.
              </p>
              <p>
                ATS può sospendere o chiudere account in caso di violazione dei termini, fornendo
                preavviso scritto via email salvo casi di gravità tale da richiedere intervento immediato.
              </p>
            </>
          ),
        },
        {
          id: 'foro',
          title: 'Legge applicabile e foro competente',
          body: (
            <>
              <p>
                I presenti termini sono regolati dalla legge italiana. Per le controversie è competente
                in via esclusiva il <strong>Foro di Benevento</strong>, fatta salva la competenza
                inderogabile del foro del consumatore.
              </p>
            </>
          ),
        },
      ]}
    />
  )
}
