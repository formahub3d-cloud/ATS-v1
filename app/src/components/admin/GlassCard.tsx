import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  delay?: number
  noPadding?: boolean
}

export default function GlassCard({ children, className, hover = true, delay = 0, noPadding = false }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      className={cn(
        'backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]',
        hover && 'hover:border-[rgba(91,184,245,0.25)] hover:shadow-[0_12px_48px_rgba(91,184,245,0.08)] hover:-translate-y-0.5',
        'transition-all duration-350',
        !noPadding && 'p-6',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
