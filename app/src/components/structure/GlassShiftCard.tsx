import { motion } from 'framer-motion'
import { Clock, ChevronRight, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import Avatar from '@/components/Avatar'
import GlassTooltip from '@/components/ui/GlassTooltip'

export interface GlassShift {
  id: string
  date: string
  dayNum: string
  month: string
  role: string
  timeStart: string
  timeEnd: string
  employeeCode?: string
  employeeAvatar?: string
  status: 'confirmed' | 'pending' | 'completed' | 'noshow'
  structureCode: string
  zone?: string
  note?: string
}

interface GlassShiftCardProps {
  shift: GlassShift
  index?: number
  onViewDetails?: (shift: GlassShift) => void
  compact?: boolean
  featured?: boolean
}

const statusConfig = {
  confirmed: {
    label: 'Confermato',
    className: 'bg-[rgba(30,201,154,0.15)] text-[#1EC99A] border-[rgba(30,201,154,0.3)]',
    glow: 'shadow-[0_0_8px_rgba(30,201,154,0.1)]',
  },
  pending: {
    label: 'Da assegnare',
    className: 'bg-[rgba(245,184,0,0.15)] text-[#F5B800] border-[rgba(245,184,0,0.3)]',
    glow: 'shadow-[0_0_8px_rgba(245,184,0,0.1)]',
  },
  completed: {
    label: 'Completato',
    className: 'bg-[rgba(148,163,184,0.15)] text-[#94A3B8] border-[rgba(148,163,184,0.3)]',
    glow: '',
  },
  noshow: {
    label: 'No-show',
    className: 'bg-[rgba(240,69,69,0.15)] text-[#F04545] border-[rgba(240,69,69,0.3)]',
    glow: 'shadow-[0_0_8px_rgba(240,69,69,0.1)]',
  },
}

export default function GlassShiftCard({ shift, index = 0, onViewDetails, compact = false, featured = false }: GlassShiftCardProps) {
  const status = statusConfig[shift.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      className={cn(
        'relative flex items-center gap-4 p-5 rounded-2xl border backdrop-blur-md bg-white/5 border-white/10',
        'hover:border-[rgba(91,184,245,0.25)] hover:shadow-[0_12px_48px_rgba(91,184,245,0.08)] hover:-translate-y-[2px]',
        'transition-all duration-350 cursor-pointer group',
        featured && 'border-t-[4px] border-t-[#5BB8F5]',
        compact && 'p-4 gap-3'
      )}
    >
      {/* Date block */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.1 + 0.1, duration: 0.3 }}
        className={cn(
          'flex-shrink-0 rounded-xl bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] flex flex-col items-center justify-center',
          compact ? 'w-12 h-12' : 'w-14 h-14'
        )}
      >
        <span className={cn('font-playfair font-bold text-white leading-tight', compact ? 'text-lg' : 'text-xl')}>{shift.dayNum}</span>
        <span className="text-[10px] font-medium text-[#5E7A95] uppercase tracking-wider">{shift.month}</span>
      </motion.div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={cn('font-semibold text-white truncate', compact ? 'text-sm' : 'text-base')}>
            {shift.role}
          </h4>
          {shift.zone && (
            <span className="flex items-center gap-1 text-[10px] text-[#F5B800] bg-[rgba(245,184,0,0.12)] border border-[rgba(245,184,0,0.25)] px-1.5 py-0.5 rounded">
              <MapPin className="w-2.5 h-2.5" />
              {shift.zone}
            </span>
          )}
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
        {shift.note && !compact && (
          <p className="text-xs text-[#5E7A95] mt-1">{shift.note}</p>
        )}
      </div>

      {/* Employee avatar + status */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {shift.employeeAvatar && (
          <GlassTooltip content="Dipendente assegnato">
            <div className="hidden sm:block">
              <Avatar src={shift.employeeAvatar} alt={shift.employeeCode} size={40} borderColor="#1A56A0" />
            </div>
          </GlassTooltip>
        )}
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.15, duration: 0.25, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
          className={cn(
            'px-2.5 py-1 rounded-md text-xs font-medium border',
            status.className,
            status.glow
          )}
        >
          {status.label}
        </motion.span>
        <ChevronRight className="w-4 h-4 text-[#5E7A95] group-hover:text-[#5BB8F5] transition-colors" />
      </div>
    </motion.div>
  )
}
