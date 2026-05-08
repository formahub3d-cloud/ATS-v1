import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string
  delta?: string
  deltaPositive?: boolean
  children?: React.ReactNode
  delay?: number
}

export default function KPICard({ label, value, delta, deltaPositive = true, children, delay = 0 }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState('0')
  const [hasAnimated, setHasAnimated] = useState(false)
  const numericRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const numericMatch = value.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.')
      const numericVal = parseFloat(numericMatch) || 0
      const suffix = value.replace(/[\d.,]/g, '')
      const hasDecimal = value.includes(',') || value.includes('.')

      if (numericVal === 0) {
        setDisplayValue(value)
        setHasAnimated(true)
        return
      }

      const duration = 1200
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const current = numericVal * eased

        if (hasDecimal && numericVal < 100) {
          setDisplayValue(Math.round(current).toLocaleString('it-IT') + suffix)
        } else {
          setDisplayValue(Math.round(current).toLocaleString('it-IT') + suffix)
        }

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setDisplayValue(value)
          setHasAnimated(true)
        }
      }

      requestAnimationFrame(animate)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      className="bg-[#0D1E34] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 shadow-card hover:border-[rgba(91,184,245,0.3)] hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
    >
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">{label}</p>
      <p ref={numericRef} className="font-playfair text-[40px] font-bold text-white leading-tight mb-2">
        {displayValue}
      </p>
      {delta && (
        <div className="flex items-center gap-1 mb-3">
          {deltaPositive ? (
            <TrendingUp className="w-3 h-3 text-success" />
          ) : (
            <TrendingDown className="w-3 h-3 text-error" />
          )}
          <span className={`text-xs font-medium ${deltaPositive ? 'text-success' : 'text-error'}`}>{delta}</span>
        </div>
      )}
      {children}
    </motion.div>
  )
}
