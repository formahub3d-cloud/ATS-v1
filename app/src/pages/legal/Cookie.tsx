// Cookie Policy — placeholder onesto v1.

import LegalLayout from './LegalLayout'

export default function Cookie() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="Cookie e tecnologie simili usate da ATS."
      lastUpdated="10 maggio 2026"
      path="/cookie"
      sections={[
        {
          id: 'cosa-sono',
          title: 'Cosa sono i cookie',
          body: (
            <p>
              I cookie sono piccoli file di testo memorizzati dal tuo browser quando visiti un sito web.
              Permettono al sito di ricordarsi di te tra una visita e l&apos;altra (es. tenere la sessione
              di login attiva) o di raccogliere informazioni anonime sull&apos;uso.
            </p>
          ),
        },
        {
          id: 'quali-usiamo',
          title: 'Quali cookie usiamo',
          body: (
            <>
              <p>
                ATS usa <strong>solo cookie tecnici strettamente necessari</strong> al funzionamento
                della piattaforma:
              </p>
              <ul>
                <li>
                  <strong>Sessione Supabase</strong> — mantiene attiva la tua autenticazione tra ricariche
                  della pagina. Scade alla chiusura della sessione o dopo 30 giorni di inattività.
                </li>
                <li>
                  <strong>Preferenze locali</strong> (localStorage) — salva il ruolo attivo
                  (struttura/lavoratore) e bozze di onboarding non ancora inviate. Non viene mai
                  trasmesso ai nostri server senza tua azione esplicita.
                </li>
                <li>
                  <strong>PWA cache</strong> — il service worker memorizza in cache risorse statiche
                  per permettere il caricamento offline e l&apos;installazione come app.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: 'analytics',
          title: 'Analytics e tracking',
          body: (
            <>
              <p>
                <strong>Non usiamo cookie analitici di terze parti</strong> (Google Analytics, Meta Pixel,
                Hotjar, etc.). Nessuno dei tuoi click viene tracciato a fini pubblicitari.
              </p>
              <p>
                Se in futuro introdurremo strumenti analitici, ti chiederemo prima il consenso esplicito
                tramite banner cookie conforme al Provvedimento del Garante n. 231/2021.
              </p>
            </>
          ),
        },
        {
          id: 'gestione',
          title: 'Come gestire i cookie',
          body: (
            <>
              <p>
                Puoi disabilitare o cancellare i cookie dalle impostazioni del tuo browser:
              </p>
              <ul>
                <li>
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer">Chrome</a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" target="_blank" rel="noreferrer">Firefox</a>
                </li>
                <li>
                  <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer">Safari</a>
                </li>
                <li>
                  <a href="https://support.microsoft.com/it-it/microsoft-edge" target="_blank" rel="noreferrer">Edge</a>
                </li>
              </ul>
              <p>
                Disabilitando i cookie strettamente tecnici alcune funzionalità (login, salvataggio
                bozze, modalità offline) potrebbero non funzionare correttamente.
              </p>
            </>
          ),
        },
      ]}
    />
  )
}
