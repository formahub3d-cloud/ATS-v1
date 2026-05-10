// LandingWorkers — pagina dedicata ai lavoratori dell'hospitality che cercano
// un'occupazione stabile. Slogan: "Noi assumiamo e ti facciamo crescere".

import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  User, ArrowRight, Briefcase, Trophy, Euro, Calendar,
  GraduationCap, FileSignature, Heart, Sparkles, ChevronRight, ShieldCheck,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const PROMISES = [
  { icon: FileSignature, title: 'Sei assunto da noi', text: 'Contratto regolare con ATS — non sei un freelance, sei un dipendente. Tasse, contributi, ferie, tutto in regola.' },
  { icon: Calendar, title: 'Scegli i tuoi turni', text: 'Vedi tutti i turni compatibili nella tua zona. Decidi tu quali accettare. Niente vincoli, niente obblighi.' },
  { icon: Euro, title: 'Paga puntuale', text: 'A fine mese ricevi il bonifico. Tariffe orarie chiare per zona. Nessuna sorpresa.' },
  { icon: Trophy, title: 'Cresci di livello', text: 'Sistema rank a punti: turni completati, recensioni 5⭐, certificazioni. Più sali, più guadagni.' },
  { icon: GraduationCap, title: 'Formazione inclusa', text: 'HACCP, sicurezza alimentare, lingue straniere. I corsi li paghiamo noi. Salgono il tuo CV e la tua paga.' },
  { icon: Heart, title: 'Trattato con rispetto', text: 'Recensioni bilaterali: tu valuti la struttura, lei valuta te. Le strutture maleducate vengono filtrate.' },
]

const STEPS = [
  { n: 1, title: 'Ti registri', text: 'Compili il wizard (8 step): foto, video di attestazione, esperienze, certificazioni, disponibilità.' },
  { n: 2, title: 'Ti formiamo', text: 'Se hai bisogno di HACCP o altri corsi, te li offriamo gratis. Aggiorni il tuo profilo.' },
  { n: 3, title: 'Vedi i turni', text: 'Nel feed Matching trovi tutti i turni open compatibili per zona, ruolo, tag valori.' },
  { n: 4, title: 'Metti like', text: 'I turni che ti interessano li salvi con un like. La struttura ti vede tra i candidati.' },
  { n: 5, title: 'Vai a lavorare', text: 'Quando ti scelgono, ricevi un QR. Lo scanni all\'arrivo: check-in tracciato con GPS.' },
  { n: 6, title: 'Ricevi punti e paga', text: 'Fine turno: +100 punti. Recensione 5⭐: +50. Bonifico mensile. Sali di rank.' },
]

const RANK_LEVELS = [
  { name: 'Rookie', pts: '0', color: '#94A3B8', bonus: 'Tariffa standard' },
  { name: 'Affidabile', pts: '500', color: '#5BB8F5', bonus: 'Pool turni preferenziale' },
  { name: 'Senior', pts: '1.200', color: '#3AA3E8', bonus: '+€1/h bonus' },
  { name: 'Elite', pts: '2.000', color: '#1EC99A', bonus: '+€2/h + turni premium' },
  { name: 'Ambassador', pts: '3.500', color: '#F5B800', bonus: '+€3/h + tutti i benefit' },
]

export default function LandingWorkers() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[100dvh] bg-navy">
      <Navbar />

      <main className="pt-24 pb-12">
        {/* HERO */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1100px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(30,201,154,0.25)] bg-[rgba(30,201,154,0.08)] mb-6"
          >
            <User className="w-4 h-4 text-[#1EC99A]" />
            <span className="text-xs font-medium text-[#1EC99A] uppercase tracking-wider">Per chi cerca lavoro</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-playfair text-[clamp(36px,5vw,56px)] font-bold text-white leading-[1.1] mb-6"
          >
            Noi <span className="text-gradient-sky">ti assumiamo</span>.<br />
            E ti facciamo crescere.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-[680px] mx-auto mb-8"
          >
            Sei cameriere, chef, barista, receptionist? Lavorare nell'hospitality non significa più
            essere precario. Con ATS hai contratto, paga puntuale, formazione e crescita di rank.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={() => navigate('/auth')}
              className="px-7 py-3.5 text-sm font-semibold text-text-inverse rounded-xl gradient-sky hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_8px_24px_rgba(91,184,245,0.25)]"
            >
              Candidati ora
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/strutture"
              className="px-6 py-3.5 text-sm text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
            >
              Sei una struttura? →
            </Link>
          </motion.div>
        </section>

        {/* COSA TI PROMETTIAMO */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1100px] mx-auto mt-24 sm:mt-32">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-primary font-semibold mb-3">Cosa ti promettiamo</p>
          <h2 className="font-playfair text-[clamp(28px,4vw,40px)] font-bold text-white leading-[1.2] mb-12 max-w-[680px]">
            Lavoro vero. Paga vera. Crescita vera.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROMISES.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="rounded-2xl p-6 border border-white/10 bg-white/[0.03] hover:border-[rgba(30,201,154,0.25)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[rgba(30,201,154,0.12)] border border-[rgba(30,201,154,0.25)] flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-[#1EC99A]" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{p.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{p.text}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* SISTEMA RANK */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1100px] mx-auto mt-24 sm:mt-32">
          <p className="text-xs uppercase tracking-[0.2em] text-[#F5B800] font-semibold mb-3">Sistema rank</p>
          <h2 className="font-playfair text-[clamp(28px,4vw,40px)] font-bold text-white leading-[1.2] mb-12 max-w-[680px]">
            Più lavori bene, più guadagni.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {RANK_LEVELS.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded-2xl p-5 border backdrop-blur-md text-center"
                style={{
                  borderColor: `${r.color}40`,
                  background: `linear-gradient(180deg, ${r.color}12 0%, transparent 100%)`,
                }}
              >
                <Trophy className="w-6 h-6 mx-auto mb-2" style={{ color: r.color }} />
                <p className="text-base font-bold uppercase tracking-wider mb-1" style={{ color: r.color }}>{r.name}</p>
                <p className="text-xs text-text-muted font-mono mb-2">{r.pts} pt</p>
                <p className="text-xs text-text-secondary leading-relaxed">{r.bonus}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* COME FUNZIONA */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[900px] mx-auto mt-24 sm:mt-32">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-primary font-semibold mb-3">Come funziona</p>
          <h2 className="font-playfair text-[clamp(28px,4vw,40px)] font-bold text-white leading-[1.2] mb-12">
            Dalla candidatura al primo bonifico, in 6 passi.
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
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[rgba(30,201,154,0.15)] border border-[rgba(30,201,154,0.3)] flex items-center justify-center font-playfair text-lg font-bold text-[#1EC99A]">
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
            className="rounded-3xl p-8 sm:p-12 border border-[rgba(30,201,154,0.25)] bg-[rgba(13,30,52,0.6)] backdrop-blur-md"
          >
            <ShieldCheck className="w-12 h-12 mx-auto text-[#1EC99A] mb-4" />
            <h2 className="font-playfair text-[clamp(24px,3.5vw,36px)] font-bold text-white mb-3">
              Pronto a lavorare in regola?
            </h2>
            <p className="text-sm sm:text-base text-text-secondary mb-6 max-w-[560px] mx-auto">
              Compila la candidatura ATS in 8 step. Ti chiameremo entro 48 ore per un colloquio
              veloce. Niente trucchi, niente burocrazia.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-text-inverse rounded-xl gradient-sky hover:brightness-110 transition-all"
            >
              Inizia la candidatura <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
