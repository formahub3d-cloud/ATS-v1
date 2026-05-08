import { motion } from 'framer-motion'
import { Clock, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Shift {
  id: string
  date: string
  dayNum: string
  month: string
  role: string
  timeStart: string
  timeEnd: string
  employeeCode?: string
  status: 'confirmed' | 'pending' | 'completed' | 'noshow'
  structureCode: string
}

interface ShiftCardProps {
  shift: Shift
  index?: number
  onViewDetails?: (shift: Shift) => void
  compact?: boolean
}

const statusConfig = {
  confirmed: {
    label: 'Confermato',
    className: 'bg-[rgba(30,201,154,0.15)] text-[#1EC99A] border-[rgba(30,201,154,0.3)]',
  },
  pending: {
    label: 'Da assegnare',
    className: 'bg-[rgba(245,184,0,0.15)] text-[#F5B800] border-[rgba(245,184,0,0.3)]',
  },
  completed: {
    label: 'Completato',
    className: 'bg-[rgba(148,163,184,0.15)] text-[#94A3B8] border-[rgba(148,163,184,0.3)]',
  },
  noshow: {
    label: 'No-show',
    className: 'bg-[rgba(240,69,69,0.15)] text-[#F04545] border-[rgba(240,69,69,0.3)]',
  },
}

export default function ShiftCard({ shift, index = 0, onViewDetails, compact = false }: ShiftCardProps) {
  const status = statusConfig[shift.status]

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0D1E34] hover:border-[rgba(91,184,245,0.3)] hover:shadow-[0_8px_32px_rgba(91,184,245,0.08)] hover:-translate-y-[2px] transition-all duration-300 cursor-pointer group',
        compact && 'p-3 gap-3'
      )}
      onClick={() => onViewDetails?.(shift)}
    >
      {/* Date block */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.06 + 0.1, duration: 0.2 }}
        className="flex-shrink-0 w-14 h-14 rounded-lg bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] flex flex-col items-center justify-center"
      >
        <span className="font-playfair text-xl font-bold text-white leading-tight">{shift.dayNum}</span>
        <span className="text-[10px] font-medium text-[#5E7A95] uppercase tracking-wider">{shift.month}</span>
      </motion.div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={cn('font-semibold text-white truncate', compact ? 'text-sm' : 'text-base')}>
            {shift.role}
          </h4>
        </div>
        <div className="flex items-center gap-3 text-[#5E7A95]">
          <span className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3" />
            {shift.timeStart}-{shift.timeEnd}
          </span>
          {shift.employeeCode && (
            <span className="flex items-center gap-1 text-xs font-mono text-[#5BB8F5] bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] px-1.5 py-0.5 rounded">
              {shift.employeeCode}
            </span>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.06 + 0.15, duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
          className={cn(
            'px-2.5 py-1 rounded-md text-xs font-medium border',
            status.className
          )}
        >
          {status.label}
        </motion.span>
        <ChevronRight className="w-4 h-4 text-[#5E7A95] group-hover:text-[#5BB8F5] transition-colors" />
      </div>
    </motion.div>
  )
}
