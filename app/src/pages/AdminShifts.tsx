// AdminShifts — gestione turni admin.
// Placeholder: la tabella `shifts` non è ancora nel DB. Verrà aggiunta nella
// prossima fetta verticale insieme al matching e all'assegnazione.

import { motion } from 'framer-motion'
import { Calendar, HeartHandshake, CheckCircle, CreditCard } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'

const phases = [
  { icon: Calendar, title: 'Schema turni', text: 'Tabella `shifts` con date, fasce orarie, ruolo richiesto, struttura.' },
  { icon: HeartHandshake, title: 'Matching automatico', text: 'Algoritmo che propone dipendenti compatibili per zona, ruolo, calendario.' },
  { icon: CheckCircle, title: 'Check-in QR', text: 'QR code generato per ogni turno, GPS verificato all’arrivo.' },
  { icon: CreditCard, title: 'Pagamenti', text: 'Addebito struttura + bonifico dipendente al termine del turno.' },
]

export default function AdminShifts() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Gestione Turni"
        subtitle="Modulo in costruzione — arriverà subito dopo la fetta strutture/dipendenti."
      />

      <GlassCard>
        <div className="text-center py-8 mb-6">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-sky-primary opacity-60" />
          <h2 className="text-xl font-semibold text-white mb-2">Nessun turno ancora</h2>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Lo schema turni e il matching non sono ancora attivi. Vengono dopo l'onboarding
            dipendenti e l'approvazione strutture, che sono i prerequisiti.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {phases.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.title}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10"
              >
                <div className="w-9 h-9 rounded-lg bg-[rgba(91,184,245,0.1)] border border-[rgba(91,184,245,0.2)] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-sky-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-0.5">{p.title}</p>
                  <p className="text-xs text-text-muted leading-relaxed">{p.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </GlassCard>
    </motion.div>
  )
}
