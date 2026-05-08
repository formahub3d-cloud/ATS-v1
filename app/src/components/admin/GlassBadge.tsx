import { cn } from '@/lib/utils'

interface GlassBadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'sky' | 'zone'
  pulse?: boolean
  className?: string
  icon?: React.ReactNode
}

const variantStyles = {
  success: 'bg-[rgba(30,201,154,0.15)] text-[#1EC99A] border-[rgba(30,201,154,0.3)] shadow-[0_0_8px_rgba(30,201,154,0.1)]',
  warning: 'bg-[rgba(245,184,0,0.15)] text-[#F5B800] border-[rgba(245,184,0,0.3)] shadow-[0_0_8px_rgba(245,184,0,0.1)]',
  error: 'bg-[rgba(240,69,69,0.15)] text-[#F04545] border-[rgba(240,69,69,0.3)] shadow-[0_0_8px_rgba(240,69,69,0.1)]',
  info: 'bg-[rgba(91,184,245,0.15)] text-[#5BB8F5] border-[rgba(91,184,245,0.3)] shadow-[0_0_8px_rgba(91,184,245,0.1)]',
  neutral: 'bg-[rgba(148,163,184,0.15)] text-[#94A3B8] border-[rgba(148,163,184,0.3)]',
  sky: 'bg-[rgba(91,184,245,0.12)] text-[#5BB8F5] border-[rgba(91,184,245,0.25)] shadow-[0_0_8px_rgba(91,184,245,0.1)]',
  zone: 'bg-[rgba(245,184,0,0.12)] text-[#F5B800] border-[rgba(245,184,0,0.25)]',
}

export default function GlassBadge({ children, variant = 'neutral', pulse = false, className, icon }: GlassBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium',
        variantStyles[variant],
        pulse && 'animate-status-pulse',
        className
      )}
    >
      {icon}
      {children}
    </span>
  )
}
