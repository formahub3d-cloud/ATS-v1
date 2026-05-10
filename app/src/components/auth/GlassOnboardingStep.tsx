import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GlassOnboardingStepProps {
  children: React.ReactNode
  onNext: () => void
  onPrev: () => void
  isFirst: boolean
  isLast: boolean
  canProceed: boolean
  isSubmitting?: boolean
  nextLabel?: string
  prevLabel?: string
  // Lista "cosa manca per andare avanti" — mostrata sotto i bottoni quando
  // canProceed è false. Se vuoto, nessun hint (ottimizza il caso completo).
  missingFields?: string[]
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
}

export default function GlassOnboardingStep({
  children,
  onNext,
  onPrev,
  isFirst,
  isLast,
  canProceed,
  isSubmitting = false,
  nextLabel,
  prevLabel,
  missingFields,
}: GlassOnboardingStepProps) {
  const showHint = !canProceed && !isSubmitting && missingFields && missingFields.length > 0
  return (
    <motion.div
      custom={1}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
      className="w-full"
    >
      <div className="mb-6">
        {children}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-[rgba(255,255,255,0.06)]">
        <motion.button
          whileHover={isFirst ? {} : { x: -2 }}
          whileTap={isFirst ? {} : { scale: 0.97 }}
          onClick={onPrev}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
            isFirst
              ? 'invisible opacity-0'
              : 'text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.04)]'
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          {prevLabel || 'Indietro'}
        </motion.button>

        <motion.button
          whileHover={canProceed && !isSubmitting ? { scale: 1.03 } : {}}
          whileTap={canProceed && !isSubmitting ? { scale: 0.97 } : {}}
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
          className={cn(
            'flex items-center gap-2 px-7 py-3 text-sm font-semibold rounded-xl transition-all duration-200',
            canProceed && !isSubmitting
              ? 'text-text-inverse gradient-sky hover:brightness-115 shadow-[0_8px_24px_rgba(91,184,245,0.25)] active:scale-[0.98]'
              : 'bg-[rgba(255,255,255,0.06)] text-text-muted cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin" />
              <span>Invio...</span>
            </>
          ) : isLast ? (
            <>
              <Check className="w-4 h-4" />
              <span>{nextLabel || 'Completa registrazione'}</span>
            </>
          ) : (
            <>
              <span>{nextLabel || 'Avanti'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </div>

      {/* Hint "perché Avanti è disabilitato" — appare solo se mancano campi.
          L'utente sa subito cosa compilare invece di guardare il bottone grigio. */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-[rgba(245,184,0,0.08)] border border-[rgba(245,184,0,0.2)]"
          >
            <AlertCircle className="w-4 h-4 text-[#F5B800] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary leading-relaxed">
              <span className="text-[#F5B800] font-medium">Manca:</span>{' '}
              {missingFields!.join(' · ')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
