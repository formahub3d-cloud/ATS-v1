import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingStepProps {
  children: React.ReactNode
  onNext: () => void
  onPrev: () => void
  isFirst: boolean
  isLast: boolean
  canProceed: boolean
  isSubmitting?: boolean
  nextLabel?: string
  prevLabel?: string
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
  }),
}

export default function OnboardingStep({
  children,
  onNext,
  onPrev,
  isFirst,
  isLast,
  canProceed,
  isSubmitting = false,
  nextLabel,
  prevLabel,
}: OnboardingStepProps) {
  return (
    <motion.div
      custom={1}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
      className="w-full"
    >
      <div className="mb-6">
        {children}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={onPrev}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
            isFirst
              ? 'invisible opacity-0'
              : 'text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.04)]'
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          {prevLabel || 'Indietro'}
        </button>

        <button
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
          className={cn(
            'flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
            canProceed && !isSubmitting
              ? 'text-text-inverse bg-gradient-to-r from-sky-primary to-sky-blue hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]'
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
        </button>
      </div>
    </motion.div>
  )
}
