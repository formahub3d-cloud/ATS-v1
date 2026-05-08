import { cn } from '@/lib/utils'

interface StatusPillProps {
  status: string
  pulse?: boolean
  size?: 'sm' | 'md'
  className?: string
}

const statusColorMap: Record<string, { bg: string; text: string; dot: string }> = {
  'Attiva': { bg: 'bg-[rgba(30,201,154,0.15)]', text: 'text-[#1EC99A]', dot: 'bg-[#1EC99A]' },
  'Attivo': { bg: 'bg-[rgba(30,201,154,0.15)]', text: 'text-[#1EC99A]', dot: 'bg-[#1EC99A]' },
  'In attesa': { bg: 'bg-[rgba(245,184,0,0.15)]', text: 'text-[#F5B800]', dot: 'bg-[#F5B800]' },
  'Sospesa': { bg: 'bg-[rgba(240,69,69,0.15)]', text: 'text-[#F04545]', dot: 'bg-[#F04545]' },
  'Sospeso': { bg: 'bg-[rgba(240,69,69,0.15)]', text: 'text-[#F04545]', dot: 'bg-[#F04545]' },
  'Programmato': { bg: 'bg-[rgba(91,184,245,0.15)]', text: 'text-[#5BB8F5]', dot: 'bg-[#5BB8F5]' },
  'In corso': { bg: 'bg-[rgba(30,201,154,0.15)]', text: 'text-[#1EC99A]', dot: 'bg-[#1EC99A]' },
  'Completato': { bg: 'bg-[rgba(148,163,184,0.15)]', text: 'text-[#94A3B8]', dot: 'bg-[#94A3B8]' },
  'No-show': { bg: 'bg-[rgba(240,69,69,0.15)]', text: 'text-[#F04545]', dot: 'bg-[#F04545]' },
  'Da assegnare': { bg: 'bg-[rgba(245,184,0,0.15)]', text: 'text-[#F5B800]', dot: 'bg-[#F5B800]' },
  'Colloquio fissato': { bg: 'bg-[rgba(91,184,245,0.15)]', text: 'text-[#5BB8F5]', dot: 'bg-[#5BB8F5]' },
  'Colloquio da fissare': { bg: 'bg-[rgba(91,184,245,0.15)]', text: 'text-[#5BB8F5]', dot: 'bg-[#5BB8F5]' },
  'In valutazione': { bg: 'bg-[rgba(91,184,245,0.15)]', text: 'text-[#5BB8F5]', dot: 'bg-[#5BB8F5]' },
  'check-in': { bg: 'bg-[rgba(30,201,154,0.15)]', text: 'text-[#1EC99A]', dot: 'bg-[#1EC99A]' },
  'in-attesa': { bg: 'bg-[rgba(245,184,0,0.15)]', text: 'text-[#F5B800]', dot: 'bg-[#F5B800]' },
}

export default function StatusPill({ status, pulse = false, size = 'sm', className }: StatusPillProps) {
  const colors = statusColorMap[status] || { bg: 'bg-[rgba(148,163,184,0.15)]', text: 'text-[#94A3B8]', dot: 'bg-[#94A3B8]' }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-md border font-medium',
      colors.bg,
      colors.text,
      size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
      className
    )}
      style={{ borderColor: colors.dot.replace('bg-', '').replace('[', '').replace(']', '') + '30' }}
    >
      <span className={cn(
        'rounded-full',
        size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5',
        colors.dot,
        pulse && 'animate-status-pulse'
      )} />
      {status === 'check-in' ? 'Check-in' : status === 'in-attesa' ? 'In attesa' : status}
    </span>
  )
}
