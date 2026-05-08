import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

interface GlassTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  position?: TooltipPosition
  delay?: number
  className?: string
}

export default function GlassTooltip({
  children,
  content,
  position = 'top',
  delay = 400,
  className,
}: GlassTooltipProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(true), delay)
  }

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const posClasses: Record<TooltipPosition, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses: Record<TooltipPosition, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[rgba(18,35,61,0.95)]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[rgba(18,35,61,0.95)]',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[rgba(18,35,61,0.95)]',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[rgba(18,35,61,0.95)]',
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: position === 'top' ? 4 : position === 'bottom' ? -4 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: position === 'top' ? 4 : position === 'bottom' ? -4 : 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'absolute z-[100] pointer-events-none',
              'bg-[rgba(18,35,61,0.95)] backdrop-blur-[12px]',
              'text-white text-[13px] font-dm',
              'border border-[rgba(91,184,245,0.15)] rounded-[10px]',
              'px-[14px] py-[10px] max-w-[280px] shadow-[0_4px_16px_rgba(0,0,0,0.3)]',
              posClasses[position],
              className
            )}
          >
            {content}
            <span
              className={cn(
                'absolute w-0 h-0 border-[6px] border-transparent',
                arrowClasses[position]
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
