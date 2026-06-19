import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetaRow {
  label: string
  value: string
}

interface ActionButton {
  label: string
  onClick: () => void
}

interface StatusScreenProps {
  icon: LucideIcon
  iconColor: string
  title: string
  description: string
  meta?: MetaRow[]
  primaryAction?: ActionButton
  secondaryAction?: ActionButton
  className?: string
}

/**
 * Schermata "vuota" / di stato per il portale Struttura.
 * La uso per: pending_review, approved (no data), rejected, suspended,
 * fetch error, struttura non trovata.
 *
 * Layout: hero centrato a tutta pagina, icona + titolo + descrizione
 * + (opz.) lista meta-data + (opz.) call-to-action.
 */
export default function StatusScreen({
  icon: Icon,
  iconColor,
  title,
  description,
  meta,
  primaryAction,
  secondaryAction,
  className,
}: StatusScreenProps) {
  return (
    <div className={cn('min-h-[100dvh] bg-[#06101E] flex items-center justify-center px-4 py-12', className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[560px] text-center"
      >
        {/* Icona con glow */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 backdrop-blur-md"
          style={{
            backgroundColor: `${iconColor}15`,
            border: `1px solid ${iconColor}30`,
            boxShadow: `0 0 40px ${iconColor}20`,
          }}
        >
          <Icon className="w-10 h-10" style={{ color: iconColor }} />
        </motion.div>

        <h1 className="font-playfair text-[28px] sm:text-[32px] font-bold text-white mb-3">
          {title}
        </h1>
        <p className="text-base text-text-secondary leading-relaxed mb-8 max-w-[460px] mx-auto">
          {description}
        </p>

        {meta && meta.length > 0 && (
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,30,52,0.5)] backdrop-blur-md p-5 mb-8 text-left">
            {meta.map((row, i) => (
              <div
                key={row.label}
                className={cn(
                  'flex items-center justify-between py-2.5 text-sm',
                  i < meta.length - 1 && 'border-b border-[rgba(255,255,255,0.04)]',
                )}
              >
                <span className="text-text-muted">{row.label}</span>
                <span className="font-medium text-white text-right truncate ml-4 max-w-[60%]">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {primaryAction && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={primaryAction.onClick}
                className="px-6 py-3 text-sm font-semibold text-text-inverse rounded-xl gradient-sky hover:brightness-110 transition-all"
              >
                {primaryAction.label}
              </motion.button>
            )}
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="px-6 py-3 text-sm font-medium text-text-secondary hover:text-white border border-[rgba(255,255,255,0.08)] rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-all"
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
