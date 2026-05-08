import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import GlassCard from './GlassCard'

interface KPIData {
  label: string
  value: string
  delta?: string
  deltaPositive?: boolean
  children?: React.ReactNode
}

interface KPIRowProps {
  kpis: KPIData[]
  delay?: number
}

function AnimatedCounter({ value, delay = 0 }: { value: string; delay?: number }) {
  const [displayValue, setDisplayValue] = useState('0')
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const numericMatch = value.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.')
      const numericVal = parseFloat(numericMatch) || 0
      const suffix = value.replace(/[\d.,]/g, '')

      if (numericVal === 0) {
        setDisplayValue(value)
        setHasAnimated(true)
        return
      }

      const duration = 1400
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const current = numericVal * eased
        setDisplayValue(Math.round(current).toLocaleString('it-IT') + suffix)

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

  return <span>{displayValue}</span>
}

export default function KPIRow({ kpis, delay = 0 }: KPIRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {kpis.map((kpi, i) => (
        <GlassCard key={kpi.label} delay={delay + i * 0.12} className="p-7">
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-[0.06em] mb-2">
            {kpi.label}
          </p>
          <p className="font-playfair text-[44px] font-bold text-white leading-tight mb-2">
            <AnimatedCounter value={kpi.value} delay={delay * 1000 + i * 120} />
          </p>
          {kpi.delta && (
            <div className="flex items-center gap-1 mb-3">
              {kpi.deltaPositive ? (
                <TrendingUp className="w-3 h-3 text-success" />
              ) : (
                <TrendingDown className="w-3 h-3 text-error" />
              )}
              <span className={`text-xs font-medium ${kpi.deltaPositive ? 'text-success' : 'text-error'}`}>
                {kpi.delta}
              </span>
            </div>
          )}
          {kpi.children}
        </GlassCard>
      ))}
    </div>
  )
}

export { AnimatedCounter }
