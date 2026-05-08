import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GlassStepIndicatorProps {
  steps: string[]
  currentStep: number
}

export default function GlassStepIndicator({ steps, currentStep }: GlassStepIndicatorProps) {
  const progressPercent = Math.max(0, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100))

  return (
    <div className="w-full mb-8">
      {/* Step circles with connecting line */}
      <div className="relative flex items-center justify-between">
        {steps.map((label, index) => {
          const stepNum = index + 1
          const isCompleted = stepNum < currentStep
          const isActive = stepNum === currentStep
          const isFuture = stepNum > currentStep

          return (
            <div key={index} className="flex flex-col items-center relative z-10 flex-1">
              {/* Step circle */}
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? [0.7, 1] : 1,
                }}
                transition={{
                  duration: 0.25,
                  ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
                }}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 relative',
                  isCompleted && 'bg-sky-primary border-sky-primary text-text-inverse',
                  isActive && 'bg-[rgba(91,184,245,0.2)] border-sky-primary text-sky-primary shadow-[0_0_12px_rgba(91,184,245,0.3)]',
                  isFuture && 'bg-[rgba(13,30,52,0.6)] border-[rgba(255,255,255,0.12)] text-text-muted'
                )}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                ) : (
                  stepNum
                )}
              </motion.div>

              {/* Label */}
              <span
                className={cn(
                  'mt-2.5 text-[11px] font-medium text-center leading-tight max-w-[90px] hidden sm:block transition-colors duration-300',
                  isActive && 'text-sky-primary',
                  isCompleted && 'text-sky-primary',
                  isFuture && 'text-text-muted opacity-50'
                )}
              >
                {label}
              </span>
            </div>
          )
        })}

        {/* Connecting line background */}
        <div className="absolute top-[19px] left-[5%] right-[5%] h-[2px] bg-[rgba(255,255,255,0.06)] -z-0 rounded-full" />

        {/* Connecting line fill */}
        <div className="absolute top-[19px] left-[5%] h-[2px] -z-0 rounded-full overflow-hidden"
          style={{ width: `${progressPercent * 0.9}%` }}
        >
          <motion.div
            className="h-full gradient-sky rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
          />
        </div>
      </div>

      {/* Mobile step counter */}
      <div className="sm:hidden text-center mt-4">
        <span className="text-sm text-sky-primary font-medium">
          Passo {currentStep} di {steps.length}
        </span>
        <span className="text-sm text-text-secondary ml-2">— {steps[currentStep - 1]}</span>
      </div>
    </div>
  )
}
