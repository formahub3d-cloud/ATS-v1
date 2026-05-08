import { motion } from 'framer-motion'
import { CheckCircle2, Clock, ArrowRight, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MatchPhase = 'liked' | 'mutual' | 'assigned' | 'completed'

export interface MatchState {
  id: string
  employeeCode: string
  employeeName: string
  role: string
  matchScore: number
  phase: MatchPhase
  shiftDate?: string
}

interface MatchStatusProps {
  match: MatchState
  index?: number
  compact?: boolean
}

const phaseConfig: Record<MatchPhase, { label: string; color: string; bg: string; border: string; icon: typeof Clock }> = {
  liked: {
    label: 'Ti interessa',
    color: '#94A3B8',
    bg: 'rgba(148,163,184,0.15)',
    border: 'rgba(148,163,184,0.3)',
    icon: UserCheck,
  },
  mutual: {
    label: 'In attesa di assegnazione ATS',
    color: '#5BB8F5',
    bg: 'rgba(91,184,245,0.15)',
    border: 'rgba(91,184,245,0.3)',
    icon: Clock,
  },
  assigned: {
    label: 'Assegnato',
    color: '#1EC99A',
    bg: 'rgba(30,201,154,0.15)',
    border: 'rgba(30,201,154,0.3)',
    icon: CheckCircle2,
  },
  completed: {
    label: 'Completato',
    color: '#94A3B8',
    bg: 'rgba(148,163,184,0.15)',
    border: 'rgba(148,163,184,0.3)',
    icon: CheckCircle2,
  },
}

export default function MatchStatus({ match, index = 0, compact = false }: MatchStatusProps) {
  const phase = phaseConfig[match.phase]
  const PhaseIcon = phase.icon
  const phases: MatchPhase[] = ['liked', 'mutual', 'assigned', 'completed']
  const currentPhaseIndex = phases.indexOf(match.phase)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0D1E34] hover:border-[rgba(91,184,245,0.2)] transition-colors duration-300',
        compact && 'p-3 gap-3'
      )}
    >
      {/* Employee avatar initial */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] flex items-center justify-center">
        <span className="font-playfair text-sm font-bold text-[#5BB8F5]">
          {match.employeeName.charAt(0)}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-[#5BB8F5] bg-[rgba(91,184,245,0.08)] px-1.5 py-0.5 rounded">
            {match.employeeCode}
          </span>
          <span className="text-xs text-[#94A3B8]">{match.role}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[#5BB8F5] font-medium">{match.matchScore}% match</span>
          {match.shiftDate && (
            <>
              <span className="text-[#5E7A95]">·</span>
              <span className="text-xs text-[#5E7A95]">Turno {match.shiftDate}</span>
            </>
          )}
        </div>

        {/* Progress stepper */}
        <div className="flex items-center gap-1 mt-2">
          {phases.map((p, i) => (
            <div key={p} className="flex items-center">
              <div
                className="w-2 h-2 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: i <= currentPhaseIndex ? phase.color : 'rgba(255,255,255,0.1)',
                }}
              />
              {i < phases.length - 1 && (
                <ArrowRight
                  className="w-3 h-3 mx-0.5"
                  style={{
                    color: i < currentPhaseIndex ? phase.color : 'rgba(255,255,255,0.1)',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status badge */}
      <span
        className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border"
        style={{
          color: phase.color,
          backgroundColor: phase.bg,
          borderColor: phase.border,
        }}
      >
        <PhaseIcon className="w-3 h-3" />
        {phase.label}
      </span>
    </motion.div>
  )
}

export function MatchStepper({ phase }: { phase: MatchPhase }) {
  const phases: MatchPhase[] = ['liked', 'mutual', 'assigned', 'completed']
  const labels = ['Like', 'Match', 'Assegnato', 'Completato']
  const currentIndex = phases.indexOf(phase)

  return (
    <div className="flex items-center gap-2">
      {phases.map((p, i) => (
        <div key={p} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                i <= currentIndex
                  ? 'border-[#5BB8F5] bg-[rgba(91,184,245,0.15)] text-[#5BB8F5]'
                  : 'border-[rgba(255,255,255,0.1)] bg-transparent text-[#5E7A95]'
              )}
            >
              <span className="text-xs font-bold">{i + 1}</span>
            </div>
            <span
              className={cn(
                'text-[10px] mt-1 font-medium',
                i <= currentIndex ? 'text-[#5BB8F5]' : 'text-[#5E7A95]'
              )}
            >
              {labels[i]}
            </span>
          </div>
          {i < phases.length - 1 && (
            <div
              className={cn(
                'w-8 h-[2px] mb-4 mx-1 transition-colors duration-300',
                i < currentIndex ? 'bg-[#5BB8F5]' : 'bg-[rgba(255,255,255,0.1)]'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
