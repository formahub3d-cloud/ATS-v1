// LandingStructures — pagina dedicata alle strutture HORECA che cercano
// personale. Spiega chiaramente cosa fa ATS dal loro punto di vista e li
// guida verso la registrazione.

import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2, ArrowRight, CheckCircle, Clock, ShieldCheck, Users,
  HeartHandshake, FileText, Sparkles, ChevronRight,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageMeta from '@/components/PageMeta'

const PAIN_POINTS = [
  { title: 'WhatsApp e gruppi caotici', text: 'Trovi personale dell\'ultimo minuto su gruppi senza nessuna garanzia di risposta.' },
  { title: 'Accordi verbali, zero traccia', text: 'Niente contratto, niente fattura, niente prova. Se qualcosa va storto, sei solo.' },
  { title: 'Personale non formato', text: 'No-show, ritardi, mancanza di certificazioni HACCP. La tua struttura resta scoperta.' },
]

const BENEFITS = [
  { icon: Users, title: 'Personale già selezionato', text: 'Riceviamo, formiamo e certifichiamo i migliori professionisti dell\'hospitality. Tu vedi solo chi è davvero pronto.' },
  { icon: ShieldCheck, title: 'Tutto sotto contratto', text: 'Ogni turno è regolare: noi assumiamo il dipendente, tu paghi solo le ore effettive con fattura tracciata.' },
  { icon: Clock, title: 'Garanzia di presenza', text: 'Check-in QR + GPS al turno. Se il dipendente non si presenta, copriamo noi con un sostituto compatibile.' },
  { icon: HeartHandshake, title: 'Matching intelligente', text: 'L\'algoritmo propone profili compatibili per zona, ruolo, tag valori. Tu confermi con un click.' },
  { icon: FileText, title: 'Fatturazione automatica', text: 'A fine mese ricevi una sola fattura aggregata. Ore, paga, fee ATS, tutto trasparente.' },
  { icon: Sparkles, title: 'Recensioni bilaterali', text: 'Recensisci ogni turno. I migliori dipendenti salgono di livello e diventano i tuoi preferiti.' },
]

const STEPS = [
  { n: 1, title: 'Registri la struttura', text: 'Compili il wizard di onboarding (8 step): dati aziendali, foto ambienti, ruoli cercati.' },
  { n: 2, title: 'Aspetti l\'approvazione', text: 'Il nostro team verifica i tuoi dati entro 48 ore lavorative.' },
  { n: 3, title: 'Pubblichi un turno', text: 'Indichi data, orario, ruolo, paga. Lo vedono i dipendenti compatibili.' },
  { n: 4, title: 'Confermi un candidato', text: 'I dipendenti che vogliono il turno fanno like. Tu scegli il migliore con un click.' },
  { n: 5, title: 'Il dipendente arriva', text: 'Mostra il QR per il check-in. GPS verificato. Le ore vengono tracciate automaticamente.' },
  { n: 6, title: 'Recensisci e paghi', text: 'A fine turno lasci una recensione. A fine mese ricevi una sola fattura aggregata.' },
]

export default function LandingStructures() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[100dvh] bg-navy">
      <PageMeta
        title="Per le strutture HORECA"
        description="Stop al caos su WhatsApp. ATS gestisce contratti, paghe e qualità del personale. Tu pubblichi i turni, noi mandiamo professionisti formati e regolari."
        path="/strutture"
      />
      <Navbar />

      <main className="pt-24 pb-12">
        {/* HERO — sky-dominant per identificare la pagina B2B.
            Ambient glow più presente, badge B2B, trust strip sotto CTA. */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-[1100px] mx-auto text-center">
          {/* Ambient glow sky */}
          <div
            className="absolute inset-x-0 top-0 h-[420px] -z-10 pointer-events-none opacity-60"
            style={{
              background:
                'radial-gradient(ellipse at center top, rgba(91,184,245,0.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 40%, rgba(91,184,245,0.08) 0%, transparent 70%)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(91,184,245,0.3)] bg-[rgba(91,184,245,0.1)] mb-6"
          >
            <Building2 className="w-4 h-4 text-sky-primary" />
            <span className="text-xs font-medium text-sky-primary uppercase tracking-wider">B2B · Per strutture HORECA</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-playfair text-[clamp(36px,5vw,56px)] font-bold text-white leading-[1.1] mb-6"
          >
            Il personale giusto,<br />
            <span className="text-gradient-sky">al momento giusto.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-[680px] mx-auto mb-8"
          >
            ATS è la prima piattaforma di catering HORECA con dipendenti diretti. Non sei solo: noi
            assumiamo, formiamo e certifichiamo. Tu prenoti il personale già pronto.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={() => navigate('/auth')}
              className="px-7 py-3.5 text-sm font-semibold text-text-inverse rounded-xl gradient-sky hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_8px_24px_rgba(91,184,245,0.3)]"
            >
              Registra la tua struttura
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/lavoratori"
              className="px-6 py-3.5 text-sm text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
            >
              Sei un lavoratore? →
            </Link>
          </motion.div>

          {/* Trust strip B2B sotto CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-text-muted"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-primary" />
              Fatturazione mensile aggregata
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-primary" />
              Personale certificato HACCP
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-primary" />
              Zero canoni, paghi solo i turni
            </span>
          </motion.div>
        </section>

        {/* PROBLEMI ATTUALI */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1100px] mx-auto mt-24 sm:mt-32">
          <p className="text-xs uppercase tracking-[0.2em] text-[#F04545] font-semibold mb-3">Il problema</p>
          <h2 className="font-playfair text-[clamp(28px,4vw,40px)] font-bold text-white leading-[1.2] mb-12 max-w-[680px]">
            Trovare personale qualificato all'ultimo minuto è un incubo.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PAIN_POINTS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-2xl p-6 border border-[rgba(240,69,69,0.2)] bg-[rgba(240,69,69,0.04)]"
              >
                <h3 className="text-base font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SOLUZIONE */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1100px] mx-auto mt-24 sm:mt-32">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-primary font-semibold mb-3">Come ti aiutiamo</p>
          <h2 className="font-playfair text-[clamp(28px,4vw,40px)] font-bold text-white leading-[1.2] mb-12 max-w-[680px]">
            Una piattaforma sola per tutto il ciclo del personale.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="rounded-2xl p-6 border border-white/10 bg-white/[0.03] hover:border-[rgba(91,184,245,0.25)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[rgba(91,184,245,0.12)] border border-[rgba(91,184,245,0.25)] flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-sky-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{b.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{b.text}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* COME FUNZIONA: 6 step */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[900px] mx-auto mt-24 sm:mt-32">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-primary font-semibold mb-3">Come funziona</p>
          <h2 className="font-playfair text-[clamp(28px,4vw,40px)] font-bold text-white leading-[1.2] mb-12">
            Dal primo turno alla fattura finale, in 6 passi.
          </h2>
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="flex items-start gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.02]"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[rgba(91,184,245,0.15)] border border-[rgba(91,184,245,0.3)] flex items-center justify-center font-playfair text-lg font-bold text-sky-primary">
                  {s.n}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{s.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{s.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA FINALE */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[800px] mx-auto mt-24 sm:mt-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl p-8 sm:p-12 border border-[rgba(91,184,245,0.25)] bg-[rgba(13,30,52,0.6)] backdrop-blur-md"
          >
            <CheckCircle className="w-12 h-12 mx-auto text-[#1EC99A] mb-4" />
            <h2 className="font-playfair text-[clamp(24px,3.5vw,36px)] font-bold text-white mb-3">
              Pronti a smettere di rincorrere il personale?
            </h2>
            <p className="text-sm sm:text-base text-text-secondary mb-6 max-w-[560px] mx-auto">
              Registra la tua struttura adesso. La nostra approvazione arriva entro 48 ore.
              Nessun costo iniziale: paghi solo le ore effettive lavorate.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-text-inverse rounded-xl gradient-sky hover:brightness-110 transition-all"
            >
              Registra ora <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
