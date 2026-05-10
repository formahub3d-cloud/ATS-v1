// Privacy Policy — placeholder onesto v1.

import LegalLayout from './LegalLayout'

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Come trattiamo i tuoi dati personali."
      lastUpdated="10 maggio 2026"
      sections={[
        {
          id: 'titolare',
          title: 'Titolare del trattamento',
          body: (
            <>
              <p>
                Il titolare del trattamento dei dati personali raccolti tramite questa piattaforma è{' '}
                <strong>ATS — Al TuO Servizio Srl</strong>, con sede a Benevento (BN), Italia.
              </p>
              <p>
                Per qualsiasi richiesta puoi scrivere a{' '}
                <a href="mailto:privacy@ats-servizio.it">privacy@ats-servizio.it</a>.
              </p>
            </>
          ),
        },
        {
          id: 'dati-raccolti',
          title: 'Quali dati raccogliamo',
          body: (
            <>
              <p>A seconda del ruolo (struttura HORECA o lavoratore) raccogliamo:</p>
              <ul>
                <li>Dati anagrafici (nome, cognome, email, telefono).</li>
                <li>Per le strutture: ragione sociale, P.IVA, sede legale e operativa, foto ambienti.</li>
                <li>Per i lavoratori: documenti di identità, codice fiscale, IBAN, certificazioni HACCP, foto profilo.</li>
                <li>Dati di utilizzo della piattaforma (login, turni accettati, recensioni).</li>
                <li>Dati di check-in turno (timestamp, posizione GPS in caso di abilitazione).</li>
              </ul>
            </>
          ),
        },
        {
          id: 'finalita',
          title: 'Perché trattiamo i tuoi dati',
          body: (
            <>
              <p>I dati vengono usati esclusivamente per:</p>
              <ul>
                <li>Erogare il servizio di intermediazione tra strutture e lavoratori.</li>
                <li>Gestire contratti, paghe e fatturazione.</li>
                <li>Garantire la sicurezza degli accessi e l&apos;antifrode.</li>
                <li>Adempiere a obblighi legali, fiscali e contrattuali.</li>
                <li>Inviare comunicazioni di servizio (no marketing senza consenso esplicito).</li>
              </ul>
            </>
          ),
        },
        {
          id: 'condivisione',
          title: 'Con chi condividiamo i dati',
          body: (
            <>
              <p>Condividiamo i dati strettamente necessari con:</p>
              <ul>
                <li><strong>Supabase Inc.</strong> (provider cloud per database, auth, storage, hosting EU).</li>
                <li>Consulenti del lavoro e commercialisti per gestione contratti e buste paga.</li>
                <li>Autorità pubbliche su richiesta legale (INPS, Agenzia delle Entrate, Ispettorato del Lavoro).</li>
              </ul>
              <p>Non vendiamo né condividiamo dati con terzi a fini di marketing.</p>
            </>
          ),
        },
        {
          id: 'diritti',
          title: 'I tuoi diritti (GDPR)',
          body: (
            <>
              <p>In qualsiasi momento puoi esercitare i tuoi diritti previsti dal Regolamento UE 2016/679:</p>
              <ul>
                <li>Accesso ai tuoi dati.</li>
                <li>Rettifica di dati inesatti.</li>
                <li>Cancellazione (&quot;diritto all&apos;oblio&quot;).</li>
                <li>Limitazione del trattamento.</li>
                <li>Portabilità in formato strutturato.</li>
                <li>Opposizione al trattamento.</li>
                <li>Reclamo al Garante Privacy.</li>
              </ul>
              <p>
                Scrivi a <a href="mailto:privacy@ats-servizio.it">privacy@ats-servizio.it</a>.
                Rispondiamo entro 30 giorni.
              </p>
            </>
          ),
        },
        {
          id: 'conservazione',
          title: 'Per quanto tempo li conserviamo',
          body: (
            <>
              <ul>
                <li>Dati di account: per la durata del rapporto contrattuale + 10 anni (obblighi fiscali).</li>
                <li>Documenti contrattuali: 10 anni dalla cessazione (Codice Civile art. 2220).</li>
                <li>Log di accesso: 6 mesi.</li>
                <li>Dati di check-in/GPS: 12 mesi, poi anonimizzati.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'sicurezza',
          title: 'Sicurezza',
          body: (
            <>
              <p>
                Adottiamo misure tecniche e organizzative per proteggere i tuoi dati: accesso protetto da
                autenticazione, Row Level Security a livello database, cifratura in transito (TLS) e
                a riposo (AES-256), separazione dei ruoli admin/struttura/dipendente.
              </p>
            </>
          ),
        },
      ]}
    />
  )
}
