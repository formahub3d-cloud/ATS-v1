// About — pagina /chi-siamo: chi siamo, missione, valori, come nasce il
// progetto. Niente team placeholder finto: meglio raccontare onestamente
// "siamo una squadra piccola di Benevento" che mettere stock photo.

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Heart, Compass, ShieldCheck, Sparkles, Users, MapPin, ArrowRight,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageMeta from '@/components/PageMeta'

const VALUES = [
  {
    icon: Heart,
    title: 'Persone, non profili',
    text: 'Ogni dipendente è una persona con un nome, un percorso, una vita. Non un CV da scartare.',
  },
  {
    icon: ShieldCheck,
    title: 'Tutto in regola, sempre',
    text: 'Niente nero, niente "passami la mancia". Contratti veri, fatture vere, contributi veri.',
  },
  {
    icon: Compass,
    title: 'Trasparenza radicale',
    text: 'Paghe, fee, tempi: sai sempre cosa ricevi e cosa paghi. Niente sorprese.',
  },
  {
    icon: Sparkles,
    title: 'Crescita continua',
    text: 'Formazione HACCP, soft skills, recensioni costruttive. Chi entra in ATS migliora ogni mese.',
  },
]

export default function About() {
  return (
    <div className="min-h-[100dvh] bg-navy">
      <PageMeta
        title="Chi siamo"
        description="ATS è una società di catering HORECA nata a Benevento. Assumiamo direttamente i nostri lavoratori e li facciamo crescere. La nostra missione: hospitality fatta bene, partendo dal nostro territorio."
        path="/chi-siamo"
      />
      <Navbar />

      <main className="pt-24 pb-16">
        {/* HERO */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1100px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(91,184,245,0.25)] bg-[rgba(91,184,245,0.08)] mb-6"
          >
            <Users className="w-4 h-4 text-sky-primary" />
            <span className="text-xs font-medium text-sky-primary uppercase tracking-wider">Chi siamo</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-bold text-white mb-6 leading-tight"
          >
            Hospitality fatta bene,<br />
            <span className="bg-gradient-to-r from-sky-primary to-[#3AA3E8] bg-clip-text text-transparent">
              partendo da Benevento.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-text-secondary max-w-2xl mx-auto"
          >
            ATS è una società di catering HORECA che assume direttamente il proprio personale.
            Nessuna agenzia interinale, nessun lavoro nero, nessun caos su WhatsApp.
          </motion.p>
        </section>

        {/* MISSIONE — su desktop: testo a sinistra, KPI strip a destra
            per riempire il viewport e dare immediato senso di concretezza. */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1100px] mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-[rgba(91,184,245,0.04)] to-transparent p-8 sm:p-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-14">
              <div>
                <h2 className="text-3xl font-playfair font-bold text-white mb-4">La nostra missione</h2>
                <p className="text-lg text-text-secondary leading-relaxed">
                  Vogliamo che chi lavora in cucina, in sala o dietro al banco abbia uno stipendio dignitoso,
                  un contratto regolare e la possibilità di crescere. E che chi gestisce un ristorante, un hotel,
                  un catering possa contare su personale formato senza dover passare ore su WhatsApp.
                </p>
                <p className="text-lg text-text-secondary leading-relaxed mt-4">
                  Per farlo costruiamo un&apos;unica cosa, semplice: una piattaforma in cui le strutture pubblicano
                  i turni, i nostri dipendenti li accettano, noi gestiamo contratti, paghe e qualità.
                  Nient&apos;altro.
                </p>
              </div>

              {/* KPI strip — numeri "promessa" non metriche reali (ancora). */}
              <div className="grid grid-cols-2 gap-3 self-center">
                <KpiTile big="100%" label="Contratti regolari" />
                <KpiTile big="48h" label="Risposta candidatura" />
                <KpiTile big="24h" label="Pubblicazione turno" />
                <KpiTile big="0€" label="Costo iscrizione" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* VALORI */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1100px] mx-auto mt-20">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-playfair font-bold text-white mb-3 text-center"
          >
            Quello in cui crediamo
          </motion.h2>
          <p className="text-text-secondary text-center mb-12 max-w-2xl mx-auto">
            Quattro principi che guidano ogni decisione di prodotto e ogni contratto che firmiamo.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 hover:bg-[rgba(255,255,255,0.04)] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[rgba(91,184,245,0.1)] flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-sky-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{v.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{v.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* TERRITORIO — onesto: siamo locali */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[900px] mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-8 sm:p-12"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgba(30,201,154,0.1)] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-playfair font-bold text-white mb-3">
                  Partiamo dal nostro territorio
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  ATS nasce a Benevento e oggi opera in tutta la provincia. Conosciamo le strutture,
                  conosciamo i lavoratori, e questo ci permette di garantire qualità e continuità.
                  Espansione futura? Sì, ma solo dove riusciremo a mantenere lo stesso standard di
                  vicinanza alle persone.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA finale */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1100px] mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <Link
              to="/strutture"
              className="group rounded-2xl border border-[rgba(91,184,245,0.25)] bg-gradient-to-br from-[rgba(91,184,245,0.08)] to-transparent p-8 hover:from-[rgba(91,184,245,0.14)] transition-all"
            >
              <h3 className="text-xl font-semibold text-white mb-2">Sei una struttura?</h3>
              <p className="text-sm text-text-secondary mb-4">Scopri come ATS può sollevarti dalla ricerca personale.</p>
              <span className="inline-flex items-center gap-2 text-sky-primary text-sm font-medium group-hover:gap-3 transition-all">
                Vai alla pagina strutture <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link
              to="/lavoratori"
              className="group rounded-2xl border border-[rgba(30,201,154,0.25)] bg-gradient-to-br from-[rgba(30,201,154,0.08)] to-transparent p-8 hover:from-[rgba(30,201,154,0.14)] transition-all"
            >
              <h3 className="text-xl font-semibold text-white mb-2">Cerchi lavoro?</h3>
              <p className="text-sm text-text-secondary mb-4">Noi assumiamo direttamente. E ti facciamo crescere.</p>
              <span className="inline-flex items-center gap-2 text-success text-sm font-medium group-hover:gap-3 transition-all">
                Vai alla pagina lavoratori <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function KpiTile({ big, label }: { big: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4 text-center">
      <p className="text-3xl font-playfair font-bold text-sky-primary leading-none">{big}</p>
      <p className="text-xs text-text-muted mt-1.5 uppercase tracking-wider">{label}</p>
    </div>
  )
}
