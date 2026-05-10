// FAQ — pagina /faq.
// Domande organizzate per audience (Strutture, Lavoratori, Pagamenti).
// Accordion in pure React (no librerie extra).

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  HelpCircle, ChevronDown, Building2, User, Euro, ArrowRight,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { cn } from '@/lib/utils'

type Section = {
  id: string
  title: string
  icon: typeof Building2
  color: string
  items: Array<{ q: string; a: string }>
}

const SECTIONS: Section[] = [
  {
    id: 'strutture',
    title: 'Per le strutture HORECA',
    icon: Building2,
    color: '#5BB8F5',
    items: [
      {
        q: 'Quanto costa usare ATS?',
        a: 'Pagi solo i turni che richiedi. Non ci sono canoni mensili né costi di iscrizione. La tariffa al lavoratore include paga lorda, contributi, assicurazione e una piccola fee ATS, tutto trasparente nella fattura mensile.',
      },
      {
        q: 'Quanto tempo serve per registrarmi?',
        a: 'L\'onboarding (8 step) richiede circa 15 minuti. Dopodiché il nostro team verifica i dati entro 48h lavorative e ti attiva il portale.',
      },
      {
        q: 'Cosa succede se il dipendente non si presenta?',
        a: 'I no-show sono tracciati e penalizzati lato dipendente. Se il turno salta per causa nostra, riassegniamo o annulliamo la fatturazione.',
      },
      {
        q: 'Posso scegliere io chi viene al turno?',
        a: 'Sì. I dipendenti compatibili fanno "like" sui tuoi turni e tu confermi il candidato che preferisci. Vedi profilo, recensioni, livello e storico turni.',
      },
      {
        q: 'Come funzionano le ore extra a fine turno?',
        a: 'Il check-out registra l\'orario reale di uscita. Se il dipendente esce dopo l\'orario previsto, le ore extra sono fatturate alla stessa tariffa oraria.',
      },
    ],
  },
  {
    id: 'lavoratori',
    title: 'Per chi cerca lavoro',
    icon: User,
    color: '#1EC99A',
    items: [
      {
        q: 'Sono assunto da ATS o dalla struttura?',
        a: 'Sei assunto direttamente da ATS con contratto regolare. Le strutture sono nostri clienti: tu lavori per ATS, noi gestiamo paghe, contributi e contratti.',
      },
      {
        q: 'Quanto vengo pagato?',
        a: 'La paga lorda oraria viene mostrata su ogni turno prima che tu accetti. Il pagamento arriva sul tuo IBAN entro il 10 del mese successivo, accompagnato da busta paga ufficiale.',
      },
      {
        q: 'Devo avere già esperienza?',
        a: 'No, ma alcuni turni richiedono certificazioni (HACCP, somministrazione alcolici). Carichi i tuoi documenti durante l\'onboarding e ti proponiamo solo turni compatibili.',
      },
      {
        q: 'Posso rifiutare un turno?',
        a: 'Certo. Il sistema ti propone turni compatibili: tu fai "like" solo su quelli che ti interessano. Nessun obbligo, nessuna penalità.',
      },
      {
        q: 'Cos\'è il sistema rank?',
        a: 'Ogni turno completato bene, ogni recensione 4-5 stelle, ogni documento verificato ti dà punti. Sali di livello (Rookie → Affidabile → Senior → Elite → Ambassador) e accedi a turni e tariffe migliori.',
      },
    ],
  },
  {
    id: 'pagamenti',
    title: 'Pagamenti & contratti',
    icon: Euro,
    color: '#F5B800',
    items: [
      {
        q: 'Quando viene pagata la struttura?',
        a: 'A fine mese ricevi una sola fattura aggregata che riepiloga tutti i turni del periodo. Pagamento entro 30 giorni con SEPA o bonifico.',
      },
      {
        q: 'Quando viene pagato il lavoratore?',
        a: 'Lo stipendio del mese precedente viene accreditato entro il 10 del mese corrente sul tuo IBAN. Busta paga disponibile in app.',
      },
      {
        q: 'Che tipo di contratto firmo?',
        a: 'A seconda della frequenza dei turni: contratto a chiamata, tempo determinato, occasionale. Ti spieghiamo nell\'onboarding qual è la forma migliore per te.',
      },
      {
        q: 'I miei dati personali sono al sicuro?',
        a: 'Sì. Documenti e dati anagrafici sono storati su Supabase con accesso protetto da RLS. Solo te e il team admin vedete i tuoi documenti. Maggiori dettagli nella nostra Privacy Policy.',
      },
    ],
  },
]

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="min-h-[100dvh] bg-navy">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* HERO */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[900px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(91,184,245,0.25)] bg-[rgba(91,184,245,0.08)] mb-6"
          >
            <HelpCircle className="w-4 h-4 text-sky-primary" />
            <span className="text-xs font-medium text-sky-primary uppercase tracking-wider">FAQ</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-playfair font-bold text-white mb-4"
          >
            Domande frequenti
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-text-secondary"
          >
            Tutto quello che ci chiedono prima di iniziare. Se non trovi risposta,{' '}
            <Link to="/contatti" className="text-sky-primary hover:underline">scrivici</Link>.
          </motion.p>
        </section>

        {/* SEZIONI */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[900px] mx-auto mt-16 space-y-12">
          {SECTIONS.map((section, sIdx) => {
            const SectionIcon = section.icon
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: sIdx * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${section.color}18`, border: `1px solid ${section.color}30` }}
                  >
                    <SectionIcon className="w-5 h-5" style={{ color: section.color }} />
                  </div>
                  <h2 className="text-2xl font-playfair font-bold text-white">{section.title}</h2>
                </div>

                <div className="space-y-2">
                  {section.items.map((item, i) => {
                    const id = `${section.id}-${i}`
                    const isOpen = openId === id
                    return (
                      <div
                        key={id}
                        className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenId(isOpen ? null : id)}
                          className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                        >
                          <span className="text-sm sm:text-base font-medium text-white">{item.q}</span>
                          <ChevronDown
                            className={cn(
                              'w-5 h-5 text-text-muted flex-shrink-0 transition-transform',
                              isOpen && 'rotate-180',
                            )}
                          />
                        </button>
                        <motion.div
                          initial={false}
                          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-4 text-sm text-text-secondary leading-relaxed">{item.a}</p>
                        </motion.div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[900px] mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-[rgba(91,184,245,0.25)] bg-gradient-to-br from-[rgba(91,184,245,0.06)] to-transparent p-8 sm:p-10 text-center"
          >
            <h3 className="text-2xl font-playfair font-bold text-white mb-3">
              Hai un&apos;altra domanda?
            </h3>
            <p className="text-text-secondary mb-6 max-w-xl mx-auto">
              Rispondiamo entro 48h lavorative. Senza rompiscatole, senza newsletter.
            </p>
            <Link
              to="/contatti"
              className="inline-flex items-center gap-2 px-6 py-3 gradient-sky text-text-inverse font-medium rounded-xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Contattaci <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
