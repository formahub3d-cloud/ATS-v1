// LegalLayout — wrapper condiviso per Privacy / Termini / Cookie.
// Tipografia leggibile + indice scrollabile + nota onesta "draft v1".

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Scale, AlertTriangle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageMeta from '@/components/PageMeta'

export default function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  sections,
  path,
}: {
  title: string
  subtitle: string
  lastUpdated: string
  sections: Array<{ id: string; title: string; body: React.ReactNode }>
  path: string
}) {
  return (
    <div className="min-h-[100dvh] bg-navy">
      <PageMeta title={title} description={subtitle} path={path} type="article" />
      <Navbar />

      <main className="pt-24 pb-16">
        <section className="px-4 sm:px-6 lg:px-8 max-w-[900px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(255,255,255,0.1)] bg-white/[0.03] mb-6">
              <Scale className="w-4 h-4 text-text-muted" />
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Legal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-playfair font-bold text-white mb-3">{title}</h1>
            <p className="text-lg text-text-secondary">{subtitle}</p>
            <p className="text-xs text-text-muted mt-2">Ultimo aggiornamento: {lastUpdated}</p>
          </motion.div>

          {/* Disclaimer onesto */}
          <div className="rounded-xl border border-[rgba(245,184,0,0.25)] bg-[rgba(245,184,0,0.05)] p-4 mb-10 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F5B800] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-text-secondary leading-relaxed">
              <strong className="text-white">Versione v1 — work in progress.</strong> Questa pagina sarà
              integrata da consulenza legale prima del lancio commerciale. Per dubbi specifici scrivi a{' '}
              <a href="mailto:legal@ats-servizio.it" className="text-sky-primary hover:underline">
                legal@ats-servizio.it
              </a>{' '}
              o contattaci dalla pagina <Link to="/contatti" className="text-sky-primary hover:underline">Contatti</Link>.
            </div>
          </div>

          {/* Indice */}
          <nav className="rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] p-5 mb-10">
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">In questa pagina</p>
            <ol className="space-y-1.5 text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-text-secondary hover:text-sky-primary transition-colors"
                  >
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sezioni */}
          <div className="space-y-12">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-2xl font-playfair font-bold text-white mb-4">{s.title}</h2>
                <div className="space-y-3 text-text-secondary leading-relaxed [&_a]:text-sky-primary [&_a]:hover:underline [&_strong]:text-white [&_li]:list-disc [&_li]:ml-5">
                  {s.body}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
