// NotFound — pagina 404 custom.
// Niente angoscia, niente "errore 404" tecnico. Suggeriamo dove andare.

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Compass, Home, Building2, User, MessageSquare } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageMeta from '@/components/PageMeta'

const SUGGESTIONS = [
  { to: '/',           icon: Home,           label: 'Homepage' },
  { to: '/strutture',  icon: Building2,      label: 'Per le strutture' },
  { to: '/lavoratori', icon: User,           label: 'Per i lavoratori' },
  { to: '/contatti',   icon: MessageSquare,  label: 'Contattaci' },
]

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-navy flex flex-col">
      <PageMeta
        title="Pagina non trovata"
        description="La pagina che cercavi non esiste o è stata spostata."
        noindex
      />
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-[640px] w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[rgba(91,184,245,0.1)] border border-[rgba(91,184,245,0.3)] flex items-center justify-center"
          >
            <Compass className="w-10 h-10 text-sky-primary" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xs uppercase tracking-[0.2em] text-text-muted mb-2"
          >
            Errore 404
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl sm:text-5xl font-playfair font-bold text-white mb-4"
          >
            Questa pagina non esiste.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-text-secondary mb-10"
          >
            Forse hai seguito un link vecchio, o l&apos;abbiamo spostata noi. In ogni caso,
            ecco dove puoi andare.
          </motion.p>

          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {SUGGESTIONS.map((s, i) => (
              <motion.div
                key={s.to}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
              >
                <Link
                  to={s.to}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(91,184,245,0.06)] hover:border-[rgba(91,184,245,0.25)] transition-all"
                >
                  <s.icon className="w-5 h-5 text-sky-primary" />
                  <span className="text-sm text-white font-medium">{s.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
