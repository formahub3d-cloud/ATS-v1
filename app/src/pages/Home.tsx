import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Check, CheckCircle, ChevronDown, Coffee, CreditCard,
  GraduationCap, HeartHandshake, Hotel, MessageCircle,
  QrCode, ShieldCheck, Star, Trophy, Truck, Upload,
  Utensils, Quote, ArrowLeft, ArrowRight, Sparkles, FileX, AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

/* ────────────────────────── Animations ────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  })
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, delay }
  })
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 }
  }
}

const staggerItem = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  }
}

/* ────────────────────────── Particles ────────────────────────── */
function Particles() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: 2 + Math.random() * 2,
    left: Math.random() * 100,
    duration: 20 + Math.random() * 20,
    delay: Math.random() * 10,
    drift: Math.random() * 40 - 20,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size, height: p.size,
            left: `${p.left}%`, bottom: '-10px',
            background: 'rgba(91,184,245,0.15)',
            animation: `floatUp ${p.duration}s ${p.delay}s linear infinite`,
            '--drift': `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-110vh) translateX(var(--drift)); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

/* ────────────────────────── Animated Gradient BG ────────────────────────── */
function AnimatedGradientBg() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 animate-gradient-shift"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 40%, rgba(91,184,245,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 80% 60%, rgba(26,86,160,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 50% 20%, rgba(91,184,245,0.04) 0%, transparent 50%)
          `,
          backgroundSize: '200% 200%',
        }}
      />
    </div>
  )
}

/* ────────────────────────── Section Wrapper ────────────────────────── */
function Section({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn('relative', className)}>
      {children}
    </section>
  )
}

/* ────────────────────────── Trust Indicators ────────────────────────── */
function TrustIndicators() {
  const items = [
    { icon: Check, text: 'Contratti automatici' },
    { icon: QrCode, text: 'Check-in QR' },
    { icon: CreditCard, text: 'Pagamenti istantanei' },
  ]
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-center gap-6 mt-5"
    >
      {items.map((item, i) => (
        <motion.div
          key={i}
          variants={staggerItem}
          className="flex items-center gap-2 text-[13px] text-text-muted"
        >
          <item.icon className="w-4 h-4 text-sky-primary" />
          {item.text}
        </motion.div>
      ))}
    </motion.div>
  )
}

/* ═══════════════════════════ HOME PAGE ═══════════════════════════ */
export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-navy overflow-x-hidden">
      <Navbar />

      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Trust Bar */}
      <TrustBar />

      {/* 3. Il Problema */}
      <ProblemSection />

      {/* 4. Come Funziona */}
      <HowItWorksSection />

      {/* 5. I 3 Attori */}
      <ActorsSection />

      {/* 6. Sistema Rank */}
      <RankSection />

      {/* 7. Prezzi */}
      <PricingSection />

      {/* 8. Perché ATS */}
      <WhyAtsSection />

      {/* 9. Testimonials */}
      <TestimonialsSection />

      {/* 10. CTA Banner */}
      <CTABanner />

      {/* 11. Footer */}
      <Footer />
    </div>
  )
}

/* ═══════════════════════════ HERO ═══════════════════════════ */
function HeroSection() {
  return (
    <Section className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden">
      <AnimatedGradientBg />
      <Particles />

      <div className="relative z-10 max-w-[960px] mx-auto px-6 text-center pt-[76px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mb-8"
        >
          <span
            className={cn(
              'inline-block text-[13px] font-mono uppercase tracking-[0.12em] text-sky-primary',
              'px-[14px] py-[6px] rounded-md',
              'bg-[rgba(91,184,245,0.06)] border border-[rgba(91,184,245,0.2)]'
            )}
          >
            Piattaforma di intermediazione hospitality — Benevento
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="font-playfair text-[clamp(40px,8vw,80px)] font-bold text-white leading-[1.05] tracking-[-0.03em] max-w-[860px] mx-auto"
          style={{ textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}
        >
          Il personale giusto, al momento giusto
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7 }}
          className="mt-7 text-[clamp(17px,2vw,21px)] text-text-secondary leading-[1.7] max-w-[680px] mx-auto"
        >
          ATS assume, forma e certifica i migliori professionisti dell'hospitality. Tu li ricevi già pronti — con contratto, garanzia di presenza e check-in digitale.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/auth?role=structure"
            className={cn(
              'px-9 py-4 text-[17px] font-semibold text-white rounded-xl',
              'gradient-sky shadow-[0_8px_32px_rgba(91,184,245,0.25)]',
              'hover:shadow-[0_12px_40px_rgba(91,184,245,0.35)] hover:-translate-y-0.5',
              'active:scale-[0.98] transition-all duration-250'
            )}
          >
            Registra la tua struttura
          </Link>
          <Link
            to="/auth?role=employee"
            className={cn(
              'px-9 py-4 text-[17px] font-semibold text-white rounded-xl',
              'border border-white/30 bg-transparent',
              'hover:bg-[rgba(255,255,255,0.08)] hover:border-sky-primary hover:text-sky-primary',
              'active:scale-[0.98] transition-all duration-250'
            )}
          >
            Diventa dipendente ATS
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <p className="mt-5 text-[13px] text-text-muted">
            Nessun costo nascosto. Pagamento solo per le ore effettive.
          </p>
          <TrustIndicators />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[11px] text-text-muted uppercase tracking-wider">Scorri per scoprire</span>
        <ChevronDown className="w-5 h-5 text-text-muted opacity-50 animate-scroll-indicator" />
      </motion.div>
    </Section>
  )
}

/* ═══════════════════════════ TRUST BAR ═══════════════════════════ */
function TrustBar() {
  const brands = ['RT', 'HP', 'BC', 'SR', 'VR', 'L21', 'RC', 'GH']
  const doubled = [...brands, ...brands]

  return (
    <Section className="border-y border-[rgba(255,255,255,0.06)] py-0">
      <div
        className="flex items-center h-[96px] overflow-hidden"
        style={{ background: 'rgba(13,30,52,0.6)', backdropFilter: 'blur(12px)' }}
      >
        <div className="hidden lg:flex items-center gap-2 px-8 flex-shrink-0">
          <span className="w-2 h-2 bg-success rounded-full animate-status-pulse" />
          <span className="text-[13px] text-text-muted">Strutture che si affidano ad ATS</span>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused]">
            {doubled.map((brand, i) => (
              <div
                key={i}
                className={cn(
                  'flex-shrink-0 w-12 h-12 rounded-full',
                  'bg-[rgba(255,255,255,0.05)] flex items-center justify-center',
                  'text-text-secondary text-sm font-semibold',
                  'hover:bg-[rgba(91,184,245,0.1)] hover:scale-[1.15] hover:border hover:border-[rgba(91,184,245,0.2)]',
                  'transition-all duration-300 cursor-default'
                )}
              >
                {brand}
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8 px-8 flex-shrink-0">
          {[
            { num: '24/7', label: 'operativi' },
            { num: 'BN', label: 'Benevento & Provincia' },
            { num: '3→1', label: 'Attori, 1 Piattaforma' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-playfair text-[20px] text-white">{stat.num}</p>
              <p className="text-[11px] text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ═══════════════════════════ PROBLEM ═══════════════════════════ */
function ProblemSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const chaosCards = [
    { icon: MessageCircle, title: 'Trovi personale su WhatsApp', text: "Gruppi caotici, richieste all'ultimo momento, nessuna garanzia di risposta." },
    { icon: FileX, title: 'Accordi verbali, zero traccia', text: 'Nessun contratto, nessuna fattura, nessuna prova. In caso di problema, sei solo.' },
    { icon: AlertTriangle, title: 'Personale non formato, turni a rischio', text: 'No-show, ritardi, mancanza di certificazioni. La tua struttura resta scoperta.' },
  ]

  const solutionFeatures = [
    'Matching digitale con profili certificati',
    'Contratti automatici e fatturazione',
    'Check-in QR con verifica GPS',
    'Pagamenti automatici entro 24h',
    'Garanzia di presenza con pool reperibili',
  ]

  return (
    <Section className="bg-[#020810] py-16 sm:py-20 lg:py-24">
      <div ref={ref} className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUp}
          className="mb-16"
        >
          <p className="text-[13px] font-mono uppercase tracking-[0.1em] text-error mb-4">IL PROBLEMA</p>
          <h2 className="font-playfair text-[clamp(32px,5vw,56px)] font-bold text-white leading-[1.1] mb-4">
            L'hospitality di Benevento è fermo al passato
          </h2>
          <p className="text-[18px] text-text-secondary leading-[1.7] max-w-[640px]">
            WhatsApp, accordi verbali, personale non formato. Un mercato che perde tempo e soldi ogni giorno.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[55%_45%] gap-12">
          {/* Chaos cards */}
          <div className="space-y-5">
            {chaosCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.15 * i, duration: 0.6 }}
                className={cn(
                  'p-6 rounded-2xl',
                  'bg-[rgba(240,69,69,0.05)] border border-[rgba(240,69,69,0.15)]'
                )}
              >
                <div className="flex items-start gap-4">
                  <card.icon className="w-8 h-8 text-error flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{card.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{card.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Solution panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.7 }}
            className={cn(
              'p-10 rounded-[20px]',
              'bg-[rgba(13,30,52,0.72)] backdrop-blur-[20px] saturate-[1.2]',
              'border border-[rgba(91,184,245,0.12)]',
              'shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_40px_rgba(91,184,245,0.08)]'
            )}
          >
            <CheckCircle className="w-12 h-12 text-success mb-4" />
            <h3 className="font-playfair text-[32px] font-bold text-white mb-6">
              ATS risolve tutto
            </h3>
            <ul className="space-y-4 mb-8">
              {solutionFeatures.map((feat, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-success" />
                  </div>
                  <span className="text-[15px] text-text-secondary">{feat}</span>
                </motion.li>
              ))}
            </ul>
            <Link
              to="/auth"
              className={cn(
                'block w-full text-center py-3.5 rounded-xl font-semibold text-white',
                'gradient-sky hover:brightness-110 hover:scale-[1.02]',
                'active:scale-[0.98] transition-all duration-200'
              )}
            >
              Scopri come funziona
            </Link>
          </motion.div>
        </div>
      </div>
    </Section>
  )
}


/* ═══════════════════════════ HOW IT WORKS ═══════════════════════════ */
function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const steps = [
    {
      num: '01',
      icon: Upload,
      actor: 'Struttura',
      title: 'Pubblica il fabbisogno',
      text: 'Indica ruolo, data, fascia oraria e requisiti. Il motore di matching trova i profili compatibili in tempo reale.',
    },
    {
      num: '02',
      icon: HeartHandshake,
      actor: 'Entrambi',
      title: 'Fai swipe e trova il match',
      text: 'Strutture e dipendenti si scelgono a vicenda in modo anonimo. Il match scatta solo con like reciproco.',
    },
    {
      num: '03',
      icon: CreditCard,
      actor: 'Sistema',
      title: 'Check-in automatico e pagamento istantaneo',
      text: "QR code all'arrivo, GPS verificato, ore calcolate automaticamente. La struttura paga, il dipendente riceve.",
    },
  ]

  return (
    <Section id="how-it-works" className="bg-navy py-16 sm:py-20 lg:py-28">
      <div ref={ref} className="max-w-[1280px] mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUp}
          className="text-center mb-20"
        >
          <p className="text-[13px] font-mono uppercase tracking-[0.1em] text-sky-primary mb-4">COME FUNZIONA</p>
          <h2 className="font-playfair text-[clamp(32px,5vw,56px)] font-bold text-white leading-[1.1] mb-4">
            Tre passaggi. Zero complicazioni.
          </h2>
          <p className="text-[18px] text-text-secondary leading-[1.7] max-w-[640px] mx-auto">
            Dalla richiesta al check-out, tutto digitale, tracciato e garantito.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 relative">
          {/* Connection line - desktop only */}
          <div className="hidden md:block absolute top-20 left-[16.66%] right-[16.66%] h-[2px]">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-sky-primary/30 to-transparent" />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: 0.2 * i, duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className={cn(
                'relative p-10 rounded-[20px]',
                'bg-gradient-to-b from-[rgba(18,35,61,0.95)] to-[rgba(13,30,52,0.9)]',
                'border border-[rgba(91,184,245,0.15)]',
                'shadow-[0_12px_48px_rgba(0,0,0,0.4),0_0_60px_rgba(91,184,245,0.06)]',
                'hover:-translate-y-1 hover:border-[rgba(91,184,245,0.25)] transition-all duration-350'
              )}
            >
              <span className="absolute top-6 right-8 font-playfair text-[72px] font-bold text-[rgba(91,184,245,0.12)] leading-none">
                {step.num}
              </span>
              <div className="w-16 h-16 rounded-2xl bg-[rgba(91,184,245,0.1)] flex items-center justify-center mb-6">
                <step.icon className="w-8 h-8 text-sky-primary" />
              </div>
              <span className={cn(
                'inline-block text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-lg mb-4',
                'bg-[rgba(91,184,245,0.1)] text-sky-primary'
              )}>
                {step.actor}
              </span>
              <h3 className="text-[22px] font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-[15px] text-text-secondary leading-[1.7]">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ═══════════════════════════ 3 ACTORS ═══════════════════════════ */
function ActorsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const actors = [
    {
      color: '#5BB8F5',
      icon: ShieldCheck,
      title: 'Admin ATS',
      subtitle: 'Il centro di controllo totale',
      features: [
        'Dashboard operativa in tempo reale',
        'Gestione strutture e dipendenti',
        'Assegnazione turni e pool reperibili',
        'Fatturazione e pagamenti automatici',
        'Chat interna tracciata',
      ],
      cta: 'Vedi il pannello admin',
      ctaLink: '/admin',
    },
    {
      color: '#3AA3E8',
      icon: Hotel,
      title: 'Struttura',
      subtitle: 'Ristoranti, hotel, bar, location',
      features: [
        'Pubblica richieste in 30 secondi',
        'Sfoglia profili anonimi e fai swipe',
        'Vedi match e turni confermati',
        'Check-in QR e valutazioni post-turno',
        'Pagamento automatico addebito diretto',
      ],
      cta: 'Scopri il portale',
      ctaLink: '/structure',
    },
    {
      color: '#1EC99A',
      icon: Sparkles,
      title: 'Dipendente',
      subtitle: 'Camerieri, chef, baristi, receptionist',
      features: [
        'Turni flessibili, tu scegli quando lavorare',
        'Sistema rank: più lavori, più guadagni',
        'Check-in con un tap sul QR',
        'Paga maturata in tempo reale',
        'Corsi di formazione in-app',
      ],
      cta: 'Diventa dipendente',
      ctaLink: '/employee',
    },
  ]

  return (
    <Section id="actors" className="bg-card-bg py-16 sm:py-20 lg:py-28">
      <div ref={ref} className="max-w-[1280px] mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUp}
          className="text-center mb-20"
        >
          <p className="text-[13px] font-mono uppercase tracking-[0.1em] text-sky-primary mb-4">I 3 ATTORI</p>
          <h2 className="font-playfair text-[clamp(32px,5vw,56px)] font-bold text-white leading-[1.1] mb-4">
            Una piattaforma, tre prospettive
          </h2>
          <p className="text-[18px] text-text-secondary leading-[1.7] max-w-[640px] mx-auto">
            Ogni attore ha il suo pannello dedicato, ottimizzato per il suo ruolo.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {actors.map((actor, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60, scale: 0.92 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: 0.15 * i, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className={cn(
                'relative rounded-[24px] overflow-hidden',
                'bg-card-bg border border-[rgba(255,255,255,0.06)]',
                'shadow-[0_20px_60px_rgba(0,0,0,0.4)]',
                'hover:-translate-y-2 hover:shadow-[0_28px_80px_rgba(0,0,0,0.5)]',
                'transition-all duration-400'
              )}
              style={{
                ['--glow-color' as string]: actor.color,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 28px 80px rgba(0,0,0,0.5), 0 0 40px ${actor.color}15`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4)'
              }}
            >
              {/* Color strip */}
              <div
                className="h-[6px] w-full"
                style={{ background: actor.color }}
              />
              <div className="p-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: `${actor.color}15` }}
                >
                  <actor.icon className="w-8 h-8" style={{ color: actor.color }} />
                </div>
                <h3 className="font-playfair text-[32px] font-bold text-white mb-1">{actor.title}</h3>
                <p className="text-[15px] text-text-secondary mb-6">{actor.subtitle}</p>

                <ul className="space-y-3 mb-8">
                  {actor.features.map((feat, fi) => (
                    <motion.li
                      key={fi}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.5 + fi * 0.08 + i * 0.1, duration: 0.4 }}
                      className="flex items-start gap-3 text-[14px] text-text-secondary"
                    >
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: actor.color }} />
                      {feat}
                    </motion.li>
                  ))}
                </ul>

                <Link
                  to={actor.ctaLink}
                  className={cn(
                    'block w-full text-center py-3 rounded-xl font-semibold',
                    'border border-[rgba(255,255,255,0.15)] text-white',
                    'hover:bg-[rgba(255,255,255,0.05)] hover:border-sky-primary hover:text-sky-primary',
                    'transition-all duration-250'
                  )}
                >
                  {actor.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ═══════════════════════════ RANK ═══════════════════════════ */
function RankSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const ranks = [
    { level: 1, name: 'Rookie', points: 0, bonus: '€8/h base', color: '#94A3B8', achieved: true },
    { level: 2, name: 'Affidabile', points: 500, bonus: '+€0.50/h', color: '#5BB8F5', achieved: true },
    { level: 3, name: 'Senior', points: 1500, bonus: '+€1.00/h', color: '#3AA3E8', achieved: true, current: true },
    { level: 4, name: 'Elite', points: 3000, bonus: '+€1.50/h', color: '#1EC99A', achieved: false },
    { level: 5, name: 'Ambassador', points: 5000, bonus: '+€2.00/h', color: '#F5B800', achieved: false },
  ]

  return (
    <Section id="rank" className="bg-navy py-16 sm:py-20 lg:py-28">
      <div ref={ref} className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-[45%_55%] gap-16 items-start">
          {/* Left text */}
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={fadeUp}
          >
            <p className="text-[13px] font-mono uppercase tracking-[0.1em] text-sky-primary mb-4">CRESCITA PROFESSIONALE</p>
            <h2 className="font-playfair text-[clamp(32px,5vw,56px)] font-bold text-white leading-[1.1] mb-6">
              Lavora. Cresci. Guadagna di più.
            </h2>
            <p className="text-[18px] text-text-secondary leading-[1.7] mb-6">
              Il sistema rank trasforma ogni turno in un passo avanti. Più turni completi, più punti accumuli. Più punti hai, più sali di livello. Più alto è il tuo rank, più alta è la tua paga base.
            </p>
            <p className="font-playfair text-[24px] text-success mb-8">
              Fino a +€2,00/h in più al raggiungere Ambassador
            </p>
            <Link
              to="/employee/rank"
              className={cn(
                'inline-block px-8 py-3.5 rounded-xl font-semibold text-white',
                'gradient-sky hover:brightness-110 hover:scale-[1.02]',
                'active:scale-[0.98] transition-all duration-200'
              )}
            >
              Scopri il sistema rank
            </Link>
          </motion.div>

          {/* Right rank ladder */}
          <div className="space-y-4">
            {ranks.map((rank, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 60 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.12 * i, duration: 0.6 }}
                className={cn(
                  'flex items-center gap-4 p-5 rounded-[14px]',
                  'bg-[rgba(13,30,52,0.6)] border',
                  rank.current
                    ? 'border-[rgba(58,163,232,0.3)] shadow-[0_0_20px_rgba(58,163,232,0.15)]'
                    : 'border-[rgba(255,255,255,0.06)]',
                  !rank.achieved && 'opacity-50'
                )}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${rank.color}15` }}
                >
                  <Trophy className="w-6 h-6" style={{ color: rank.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-[17px] font-semibold text-white">{rank.name}</h4>
                    {rank.current && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[rgba(58,163,232,0.15)] text-[#3AA3E8]">
                        Attuale
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-text-muted">
                    {rank.points.toLocaleString()} punti · {rank.bonus}
                  </p>
                </div>
                {rank.achieved && (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: rank.color }} />
                )}
                {!rank.achieved && (
                  <div className="w-5 h-5 rounded-full border-2 border-text-muted flex-shrink-0" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}


/* ═══════════════════════════ PRICING ═══════════════════════════ */
function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const plans = [
    {
      badge: 'Per iniziare',
      badgeColor: 'text-sky-primary bg-[rgba(91,184,245,0.1)]',
      icon: Coffee,
      iconColor: '#94A3B8',
      price: '700',
      features: ['Fino a 50 turni/anno', 'Check-in QR incluso', 'Supporto via chat', 'Pagamento automatico'],
      cta: 'Richiedi accesso',
      featured: false,
    },
    {
      badge: 'Più richiesto',
      badgeColor: 'text-success bg-[rgba(30,201,154,0.1)]',
      icon: Utensils,
      iconColor: '#5BB8F5',
      price: '900',
      features: ['Fino a 50 turni/anno', 'Check-in QR incluso', 'Supporto via chat', 'Pagamento automatico', 'Supporto prioritario', 'Report mensili'],
      cta: 'Richiedi accesso',
      featured: true,
    },
    {
      badge: 'Alto volume',
      badgeColor: 'text-warning bg-[rgba(245,184,0,0.1)]',
      icon: Hotel,
      iconColor: '#F5B800',
      price: '1.200',
      features: ['Turni illimitati', 'Kit QR fisico', 'Supporto dedicato', 'Report avanzati', 'Sconto progressivo -30%', 'Check-in QR incluso', 'Pagamento automatico'],
      cta: 'Contattaci',
      featured: false,
    },
  ]

  return (
    <Section id="pricing" className="bg-card-bg py-16 sm:py-20 lg:py-28">
      <div ref={ref} className="max-w-[1100px] mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-mono uppercase tracking-[0.1em] text-sky-primary mb-4">PREZZI TRASPARENTI</p>
          <h2 className="font-playfair text-[clamp(32px,5vw,56px)] font-bold text-white leading-[1.1] mb-4">
            Paghi solo per le ore che usi
          </h2>
          <p className="text-[18px] text-text-secondary leading-[1.7] max-w-[640px] mx-auto">
            Fee annuale per accedere alla piattaforma + tariffa oraria per ogni turno. Nessuna sorpresa.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-7">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: 0.15 * i, duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className={cn(
                'relative rounded-[24px] p-10',
                'bg-card-bg border',
                plan.featured
                  ? 'border-[rgba(91,184,245,0.25)] shadow-[0_0_60px_rgba(91,184,245,0.08),0_12px_48px_rgba(0,0,0,0.3)]'
                  : 'border-[rgba(255,255,255,0.06)]',
                'hover:-translate-y-1.5 hover:border-[rgba(91,184,245,0.3)] transition-all duration-350'
              )}
            >
              {plan.featured && (
                <div className="absolute top-0 left-0 right-0 h-1 gradient-sky rounded-t-[24px]" />
              )}
              <span className={cn('inline-block text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-lg mb-6', plan.badgeColor)}>
                {plan.badge}
              </span>
              <div className="mb-6">
                <plan.icon className="w-9 h-9 mb-4" style={{ color: plan.iconColor }} />
                <div className="flex items-baseline gap-1">
                  <span className="font-playfair text-[48px] font-bold text-white">€{plan.price}</span>
                  <span className="text-[13px] text-text-muted">/anno</span>
                </div>
              </div>
              <div className="h-[1px] bg-[rgba(255,255,255,0.06)] mb-6" />
              <ul className="space-y-3 mb-8">
                {plan.features.map((feat, fi) => (
                  <li key={fi} className="flex items-center gap-3 text-[14px] text-text-secondary">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth?role=structure"
                className={cn(
                  'block w-full text-center py-3.5 rounded-xl font-semibold transition-all duration-200',
                  plan.featured
                    ? 'gradient-sky text-white hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]'
                    : 'border border-[rgba(255,255,255,0.15)] text-white hover:bg-[rgba(255,255,255,0.05)] hover:border-sky-primary hover:text-sky-primary'
                )}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 p-6 rounded-xl bg-[rgba(13,30,52,0.6)] border border-[rgba(255,255,255,0.06)]"
        >
          <p className="text-[13px] text-text-muted text-center">
            Tariffa oraria a partire da €15/h. Include paga dipendente, contributi INPS/INAIL, margini operativi.
          </p>
        </motion.div>
      </div>
    </Section>
  )
}

/* ═══════════════════════════ WHY ATS ═══════════════════════════ */
function WhyAtsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const features = [
    { icon: ShieldCheck, title: 'Antibypass strutturale', text: 'Contratti, anonimato tecnico e penali pre-liquidate rendono il bypass impossibile.' },
    { icon: QrCode, title: 'Check-in QR + GPS', text: 'Timbratura digitale con verifica posizione. Ore esatte, zero contestazioni.' },
    { icon: HeartHandshake, title: 'Matching intelligente', text: 'Algoritmo che considera distanza, esperienza, paga e disponibilità. Match solo con like reciproco.' },
    { icon: CreditCard, title: 'Pagamenti automatici', text: 'Addebito struttura entro 24h. Bonifico dipendente a fine mese. Zero manualità.' },
    { icon: Truck, title: 'Sistema navette', text: 'ATS mette a disposizione mezzi propri, o il dipendente driver guadagna extra.' },
    { icon: GraduationCap, title: 'Formazione in-app', text: 'Corsi HACCP, sicurezza, specializzazione. ATS anticipa il 50%, resto a rate dalla paga.' },
    { icon: Trophy, title: 'Rank & Punti', text: 'Gamification che premia affidabilità. Più punti = più paga, turni migliori, priorità nelle notifiche.' },
    { icon: MessageCircle, title: 'Chat tracciata', text: 'Solo canale verticale Admin↔Struttura e Admin↔Dipendente. Zero contatto diretto, tutto archiviato.' },
  ]

  return (
    <Section id="features" className="bg-navy py-16 sm:py-20 lg:py-28">
      <div ref={ref} className="max-w-[1280px] mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUp}
          className="text-center mb-20"
        >
          <p className="text-[13px] font-mono uppercase tracking-[0.1em] text-sky-primary mb-4">PERCHÉ SCEGLIERE ATS</p>
          <h2 className="font-playfair text-[clamp(32px,5vw,56px)] font-bold text-white leading-[1.1] mb-4">
            Tutto quello che le altre soluzioni non ti danno
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: 0.08 * i, duration: 0.6 }}
              className={cn(
                'group p-8 rounded-2xl',
                'bg-[rgba(13,30,52,0.5)] border border-[rgba(255,255,255,0.05)]',
                'hover:bg-[rgba(13,30,52,0.8)] hover:border-[rgba(91,184,245,0.15)]',
                'hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(91,184,245,0.06)]',
                'transition-all duration-350'
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-[rgba(91,184,245,0.08)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <feat.icon className="w-6 h-6 text-sky-primary" />
              </div>
              <h3 className="text-[18px] font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-[14px] text-text-secondary leading-[1.6]">{feat.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ═══════════════════════════ TESTIMONIALS ═══════════════════════════ */
function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [activeIndex, setActiveIndex] = useState(0)

  const testimonials = [
    {
      quote: "Prima trovavo personale all'ultimo momento su WhatsApp. Ora pubblico la richiesta e in un'ora ho il match confermato. Il check-in QR ha eliminato ogni discussione sulle ore.",
      avatar: '/avatar-employee-5.jpg',
      name: 'Marco R.',
      role: 'Proprietario, Ristorante Il Torchio — Benevento',
    },
    {
      quote: 'Faccio i turni che voglio, quando voglio. La paga arriva puntualmente e il sistema rank mi spinge a fare sempre meglio. Da Rookie a Senior in 8 mesi.',
      avatar: '/avatar-employee-2.jpg',
      name: 'Giulia D.',
      role: 'Chef de Partie — Livello Senior',
    },
    {
      quote: "Abbiamo provato agenzie di somministrazione e servizi esterni. ATS è l'unico che ci ha davvero liberato dalla gestione del personale. Tutto automatico, tutto tracciato.",
      avatar: '/avatar-employee-7.jpg',
      name: 'Luca B.',
      role: 'Direttore, Hotel Palazzo — Benevento',
    },
  ]

  const next = useCallback(() => setActiveIndex(i => (i + 1) % testimonials.length), [testimonials.length])
  const prev = useCallback(() => setActiveIndex(i => (i - 1 + testimonials.length) % testimonials.length), [testimonials.length])

  useEffect(() => {
    const timer = setInterval(next, 7000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <Section className="bg-card-bg py-16 sm:py-20 lg:py-28">
      <div ref={ref} className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-mono uppercase tracking-[0.1em] text-sky-primary mb-4">TESTIMONIANZE</p>
          <h2 className="font-playfair text-[clamp(32px,5vw,56px)] font-bold text-white leading-[1.1] mb-4">
            Cosa dicono chi già usa ATS
          </h2>
          <p className="text-[18px] text-text-secondary leading-[1.7] max-w-[640px] mx-auto">
            Strutture e dipendenti raccontano la loro esperienza.
          </p>
        </motion.div>

        <div className="relative">
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.93 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.12 * i, duration: 0.6 }}
                className={cn(
                  'relative p-10 rounded-[20px]',
                  'bg-[rgba(13,30,52,0.7)] backdrop-blur-[12px]',
                  'border border-[rgba(255,255,255,0.06)]',
                  activeIndex === i ? 'ring-1 ring-[rgba(91,184,245,0.2)]' : ''
                )}
              >
                <Quote className="w-7 h-7 text-[rgba(91,184,245,0.2)] mb-4" />
                <p className="text-[15px] text-text-secondary leading-[1.7] mb-6">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-[rgba(91,184,245,0.2)]" />
                  <div>
                    <p className="text-[15px] font-semibold text-white">{t.name}</p>
                    <p className="text-[13px] text-text-muted">{t.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 text-warning fill-warning" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full bg-[rgba(13,30,52,0.7)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-text-muted hover:text-white hover:border-sky-primary transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    activeIndex === i ? 'w-6 bg-sky-primary' : 'w-2 bg-[rgba(255,255,255,0.2)]'
                  )}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-12 h-12 rounded-full bg-[rgba(13,30,52,0.7)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-text-muted hover:text-white hover:border-sky-primary transition-all"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ═══════════════════════════ CTA BANNER ═══════════════════════════ */
function CTABanner() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <Section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      <div
        className="absolute inset-0 animate-gradient-shift"
        style={{
          background: 'linear-gradient(135deg, #5BB8F5 0%, #3AA3E8 50%, #1A56A0 100%)',
          backgroundSize: '200% 200%',
        }}
      />
      <div ref={ref} className="relative z-10 max-w-[800px] mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="font-playfair text-[clamp(32px,5vw,56px)] font-bold text-text-inverse leading-[1.1] mb-6"
        >
          Pronto a rivoluzionare il tuo staffing?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-[18px] text-[rgba(6,16,30,0.7)] leading-[1.7] max-w-[640px] mx-auto mb-10"
        >
          Registra la tua struttura o candidati come dipendente. Ti contattiamo entro 48 ore per attivare il tuo account.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <Link
            to="/auth?role=structure"
            className={cn(
              'px-9 py-4 text-[17px] font-semibold rounded-xl',
              'bg-text-inverse text-white',
              'hover:bg-[#0F2137] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]',
              'active:scale-[0.98] transition-all duration-250'
            )}
          >
            Registra struttura
          </Link>
          <Link
            to="/auth?role=employee"
            className={cn(
              'px-9 py-4 text-[17px] font-semibold rounded-xl',
              'bg-[rgba(6,16,30,0.15)] text-text-inverse border-2 border-text-inverse',
              'hover:bg-[rgba(6,16,30,0.25)]',
              'active:scale-[0.98] transition-all duration-250'
            )}
          >
            Candidati come dipendente
          </Link>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-5 text-[13px] text-[rgba(6,16,30,0.5)]"
        >
          Nessuna carta di credito richiesta per la candidatura.
        </motion.p>
      </div>
    </Section>
  )
}
