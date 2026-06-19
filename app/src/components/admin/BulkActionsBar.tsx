import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BulkAction {
  label: string
  icon: LucideIcon
  /** Variant del pulsante. */
  variant?: 'primary' | 'danger' | 'neutral'
  /** Disabilita il pulsante (es. mentre l'azione precedente è in corso). */
  disabled?: boolean
  onClick: () => void
}

interface BulkActionsBarProps {
  selectedCount: number
  itemLabel?: string                 // es. "struttur", "turn", "dipendent"
  onClear: () => void
  actions: BulkAction[]
}

/**
 * Barra fluttuante in basso che appare quando l'utente seleziona righe in
 * una tabella admin. Mostra il count selezionato + un set di azioni bulk.
 */
export default function BulkActionsBar({
  selectedCount, itemLabel = 'element', onClear, actions,
}: BulkActionsBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-[rgba(91,184,245,0.25)] bg-[rgba(13,30,52,0.95)] backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
            <span className="text-sm font-semibold text-white">
              {selectedCount} {itemLabel}{selectedCount === 1 ? 'o' : 'i'} selezionat{selectedCount === 1 ? 'o' : 'i'}
            </span>
            <div className="w-px h-6 bg-[rgba(255,255,255,0.08)]" />
            <div className="flex items-center gap-2">
              {actions.map((a) => {
                const Icon = a.icon
                return (
                  <button
                    key={a.label}
                    type="button"
                    onClick={a.onClick}
                    disabled={a.disabled}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                      a.variant === 'danger' && 'bg-[rgba(240,69,69,0.15)] border border-[rgba(240,69,69,0.3)] text-[#F04545] hover:bg-[rgba(240,69,69,0.25)]',
                      a.variant === 'primary' && 'gradient-sky text-text-inverse hover:brightness-110',
                      (!a.variant || a.variant === 'neutral') && 'border border-white/10 text-text-secondary hover:bg-white/5',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {a.label}
                  </button>
                )
              })}
            </div>
            <div className="w-px h-6 bg-[rgba(255,255,255,0.08)]" />
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Deseleziona tutti"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
