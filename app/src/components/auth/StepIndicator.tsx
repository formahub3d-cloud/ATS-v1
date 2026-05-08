import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      {/* Progress bar background */}
      <div className="relative flex items-center justify-between mb-3">
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
                  scale: isActive ? 1 : 1,
                }}
                transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors duration-300',
                  isCompleted && 'bg-sky-primary border-sky-primary text-text-inverse',
                  isActive && 'bg-[rgba(91,184,245,0.15)] border-sky-primary text-sky-primary',
                  isFuture && 'bg-card-bg border-[rgba(255,255,255,0.12)] text-text-muted'
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
                  'mt-2 text-[11px] font-medium text-center leading-tight max-w-[80px] hidden sm:block transition-colors duration-300',
                  isActive && 'text-sky-primary',
                  isCompleted && 'text-sky-primary',
                  isFuture && 'text-text-muted'
                )}
              >
                {label}
              </span>
            </div>
          )
        })}

        {/* Connecting line */}
        <div className="absolute top-[17px] left-0 right-0 h-[2px] bg-[rgba(255,255,255,0.08)] -z-0 mx-[4.5%]">
          <motion.div
            className="h-full bg-gradient-to-r from-sky-primary to-sky-blue rounded-full"
            initial={{ width: '0%' }}
            animate={{
              width: `${Math.max(0, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100))}%`,
            }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
          />
        </div>
      </div>

      {/* Mobile step counter */}
      <div className="sm:hidden text-center">
        <span className="text-sm text-sky-primary font-medium">
          Passo {currentStep} di {steps.length}
        </span>
        <span className="text-sm text-text-secondary ml-2">— {steps[currentStep - 1]}</span>
      </div>
    </div>
  )
}
