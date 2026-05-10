// Home — landing page principale.
// Versione semplificata e focalizzata: hero con 2 CTA distinti
// (struttura vs lavoratore), sezione scroll-driven "Come funziona" con
// 4 step animati, prezzi chiari, FAQ veloce, CTA finale.

import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Building2, User, ArrowRight, Search, HeartHandshake, ScanLine, Star,
  CheckCircle, Sparkles, ChevronRight, Trophy, ShieldCheck,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageMeta from '@/components/PageMeta'

const HOW_IT_WORKS_STEPS = [
  {
    n: 1,
    title: 'La struttura pubblica un turno',
    text: 'Data, orario, ruolo, paga oraria. Lo vedono i dipendenti compatibili nella zona.',
    icon: Search,
    color: '#5BB8F5',
  },
  {
    n: 2,
    title: 'I dipendenti fanno match',
    text: 'I lavoratori del network ATS che vogliono il turno mettono "mi piace". La struttura vede tutti i candidati con rating e profilo.',
    icon: HeartHandshake,
    color: '#3AA3E8',
  },
  {
    n: 3,
    title: 'Conferma + check-in QR',
    text: 'La struttura sceglie con un click. Il dipendente arriva e scansiona il QR. GPS e ore tracciate automaticamente.',
    icon: ScanLine,
    color: '#1EC99A',
  },
  {
    n: 4,
    title: 'Recensioni e rank crescente',
    text: 'Fine turno: recensioni bilaterali. I dipendenti accumulano punti, salgono di livello, guadagnano di più.',
    icon: Star,
    color: '#F5B800',
  },
]

const WHY_ATS = [
  { icon: ShieldCheck, title: 'Tutto regolare', text: 'I dipendenti sono assunti da noi. Contratti, paghe, fatture, contributi: zero zona grigia.' },
  { icon: Trophy, title: 'Gamification reale', text: 'Sistema rank a punti per i lavoratori. Più sali, più guadagni. Più scelta hai.' },
  { icon: Sparkles, title: 'Solo profili formati', text: 'HACCP, idoneità sanitaria, formazione interna. Le strutture trovano solo personale già pronto.' },
]

export default function Home() {
  const navigate = useNavigate()
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  return (
    <div className="min-h-[100dvh] bg-navy">
      <PageMeta
        description="ATS è una società di catering HORECA con dipendenti diretti. Le strutture trovano personale formato in 24h, i lavoratori firmano contratti regolari e crescono con noi. Operiamo a Benevento e provincia."
        path="/"
      />
      <Navbar />

      <main>
        {/* ──────────── HERO ──────────── */}
        <section ref={heroRef} className="relative min-h-[100dvh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-24 pb-12">
          {/* Background ambient glow */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at top, rgba(91,184,245,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(30,201,154,0.10) 0%, transparent 50%)',
            }}
          />

          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 max-w-[1000px] mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(91,184,245,0.25)] bg-[rgba(91,184,245,0.08)] mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-primary" />
              <span className="text-xs font-medium text-sky-primary uppercase tracking-wider">WorkMatch · Catering HORECA · Benevento</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="font-playfair text-[clamp(40px,7vw,84px)] font-bold text-white leading-[0.95] mb-6 tracking-tight"
            >
              Il personale giusto,<br />
              <span className="text-gradient-sky">al momento giusto.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-base sm:text-xl text-text-secondary leading-relaxed max-w-[680px] mx-auto mb-10"
            >
              ATS è la prima piattaforma di catering HORECA con dipendenti diretti.
              <span className="text-white font-medium"> Noi assumiamo</span> i migliori professionisti dell'hospitality.
              <span className="text-white font-medium"> Le strutture</span> li prenotano già pronti — con contratto, garanzia di presenza e check-in digitale.
            </motion.p>

            {/* 2 CTA chiari */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <button
                onClick={() => navigate('/strutture')}
                className="group flex items-center gap-3 px-6 py-4 rounded-xl text-text-inverse gradient-sky shadow-[0_8px_24px_rgba(91,184,245,0.25)] hover:brightness-110 transition-all min-w-[260px]"
              >
                <Building2 className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left">
                  <span className="block text-[10px] uppercase tracking-wider opacity-80">Sono una struttura</span>
                  <span className="block text-sm font-semibold">Cerco personale qualificato</span>
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/lavoratori')}
                className="group flex items-center gap-3 px-6 py-4 rounded-xl text-white border border-[rgba(30,201,154,0.30)] bg-[rgba(30,201,154,0.06)] hover:bg-[rgba(30,201,154,0.12)] transition-all min-w-[260px]"
              >
                <User className="w-5 h-5 text-[#1EC99A] flex-shrink-0" />
                <span className="flex-1 text-left">
                  <span className="block text-[10px] uppercase tracking-wider text-[#1EC99A]">Cerco lavoro</span>
                  <span className="block text-sm font-semibold">Voglio essere assunto</span>
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#1EC99A]" />
              </button>
            </motion.div>

            {/* Micro proof */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-xs text-text-muted mt-8 flex items-center justify-center gap-2 flex-wrap"
            >
              <CheckCircle className="w-3 h-3 text-[#1EC99A]" />
              Contratti automatici
              <span className="opacity-50">·</span>
              <CheckCircle className="w-3 h-3 text-[#1EC99A]" />
              Check-in QR + GPS
              <span className="opacity-50">·</span>
              <CheckCircle className="w-3 h-3 text-[#1EC99A]" />
              Pagamenti istantanei
            </motion.p>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted text-xs uppercase tracking-[0.2em] font-medium pointer-events-none"
          >
            Scopri come funziona ↓
          </motion.div>
        </section>

        {/* ──────────── COME FUNZIONA (scroll-driven) ──────────── */}
        <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 bg-[#020810]">
          <div className="max-w-[1100px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-sky-primary font-semibold mb-3">Come funziona</p>
              <h2 className="font-playfair text-[clamp(32px,5vw,52px)] font-bold text-white leading-[1.1]">
                4 passaggi.<br />
                <span className="text-text-secondary">Zero complicazioni.</span>
              </h2>
            </motion.div>

            {/* Steps alternati left/right (scroll-driven) */}
            <div className="space-y-16 sm:space-y-24">
              {HOW_IT_WORKS_STEPS.map((step, i) => {
                const Icon = step.icon
                const isOdd = i % 2 === 1
                return (
                  <motion.div
                    key={step.n}
                    initial={{ opacity: 0, x: isOdd ? 60 : -60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-150px' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex flex-col ${isOdd ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-12`}
                  >
                    {/* Visual side */}
                    <div className="flex-1 flex justify-center">
                      <motion.div
                        whileInView={{ scale: [0.8, 1.05, 1] }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                      >
                        <div
                          className="w-32 h-32 sm:w-44 sm:h-44 rounded-3xl flex items-center justify-center"
                          style={{
                            backgroundColor: `${step.color}15`,
                            border: `2px solid ${step.color}40`,
                            boxShadow: `0 0 60px ${step.color}30`,
                          }}
                        >
                          <Icon className="w-16 h-16 sm:w-20 sm:h-20" style={{ color: step.color }} />
                        </div>
                        {/* Numero step grande in background */}
                        <div
                          className="absolute -top-6 -left-6 font-playfair text-[80px] sm:text-[120px] font-bold leading-none pointer-events-none select-none"
                          style={{ color: step.color, opacity: 0.12 }}
                        >
                          {step.n}
                        </div>
                      </motion.div>
                    </div>

                    {/* Text side */}
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: step.color }}>
                        Step {step.n}
                      </p>
                      <h3 className="font-playfair text-[clamp(24px,3.5vw,36px)] font-bold text-white leading-tight mb-4">
                        {step.title}
                      </h3>
                      <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-[520px] mx-auto md:mx-0">
                        {step.text}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ──────────── PERCHÉ ATS ──────────── */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 bg-navy">
          <div className="max-w-[1100px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-sky-primary font-semibold mb-3">Perché ATS</p>
              <h2 className="font-playfair text-[clamp(28px,4vw,44px)] font-bold text-white leading-[1.2]">
                Non un'agenzia. Non un freelance marketplace.<br />
                <span className="text-gradient-sky">Una squadra.</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {WHY_ATS.map((w, i) => {
                const Icon = w.icon
                return (
                  <motion.div
                    key={w.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="rounded-2xl p-6 sm:p-8 border border-white/10 bg-white/[0.03] hover:border-[rgba(91,184,245,0.25)] transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[rgba(91,184,245,0.12)] border border-[rgba(91,184,245,0.25)] flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-sky-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{w.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{w.text}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ──────────── DOPPIA CTA ──────────── */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 bg-[#020810]">
          <div className="max-w-[1100px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="font-playfair text-[clamp(28px,4vw,44px)] font-bold text-white leading-[1.2]">
                Da che parte stai?
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card struttura */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl p-8 border border-[rgba(91,184,245,0.25)] bg-gradient-to-br from-[rgba(91,184,245,0.08)] to-transparent"
              >
                <Building2 className="w-10 h-10 text-sky-primary mb-4" />
                <h3 className="font-playfair text-2xl font-bold text-white mb-2">Cerco personale</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  Ristoranti, hotel, bar, location eventi: registra la tua struttura e ricevi
                  proposte di personale già pronto, formato e contrattualizzato.
                </p>
                <Link
                  to="/strutture"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-text-inverse rounded-xl gradient-sky hover:brightness-110 transition-all"
                >
                  Scopri di più <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Card lavoratore */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl p-8 border border-[rgba(30,201,154,0.25)] bg-gradient-to-br from-[rgba(30,201,154,0.08)] to-transparent"
              >
                <User className="w-10 h-10 text-[#1EC99A] mb-4" />
                <h3 className="font-playfair text-2xl font-bold text-white mb-2">Cerco lavoro</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  Cameriere, chef, barista, receptionist: ti assumiamo con contratto regolare,
                  ti formiamo e ti facciamo crescere di livello e di paga.
                </p>
                <Link
                  to="/lavoratori"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-xl border border-[rgba(30,201,154,0.40)] bg-[rgba(30,201,154,0.10)] hover:bg-[rgba(30,201,154,0.18)] transition-all"
                >
                  Scopri di più <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
