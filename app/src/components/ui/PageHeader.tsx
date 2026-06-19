import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import BackButton from './BackButton'

interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Slot a destra (icone tipo Bell, Search, filtri, pulsanti azione). */
  actions?: ReactNode
  /** Mostra/nasconde il BackButton. Default: false (passa a true sulle pagine non-root). */
  showBack?: boolean
  /** Etichetta del back. Default "Indietro". */
  backLabel?: string
  /** Route esplicita per il back button (vedi BackButton). */
  backTo?: string
  /** Componente d'eroe sopra il titolo (es. cover photo). */
  hero?: ReactNode
  className?: string
  /** Variante h1: 'standard' (28px, sans) o 'display' (40px, playfair) per portali pubblici. */
  variant?: 'standard' | 'display'
}

/**
 * Intestazione di pagina condivisa.
 *
 * Tre slot tipici:
 *   - back (a sinistra, opzionale)
 *   - titolo + sottotitolo (al centro)
 *   - actions (a destra)
 *
 * Spaziatura uniforme con il resto dell'app: pb-6 sotto, allineato verticalmente.
 * Usa `variant="display"` solo per pagine "vetrina" (Home, StructurePortal hero).
 */
export default function PageHeader({
  title,
  subtitle,
  actions,
  showBack = false,
  backLabel = 'Indietro',
  backTo,
  hero,
  className,
  variant = 'standard',
}: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn('w-full mb-6', className)}
    >
      {showBack && (
        <div className="mb-3">
          <BackButton label={backLabel} to={backTo} variant="inline" />
        </div>
      )}

      {hero}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1
            className={cn(
              'text-white tracking-tight truncate',
              variant === 'standard' && 'text-2xl sm:text-[28px] font-semibold',
              variant === 'display' && 'text-[28px] sm:text-[36px] font-bold font-playfair',
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        )}
      </div>
    </motion.header>
  )
}
