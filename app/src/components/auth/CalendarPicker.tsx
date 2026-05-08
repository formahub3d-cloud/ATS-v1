import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DayStatus = 'available' | 'unavailable' | 'holiday'

export interface CalendarDay {
  date: number
  month: number
  year: number
  status: DayStatus
  isCurrentMonth: boolean
  holidayName?: string
  premium?: number
}

interface CalendarPickerProps {
  onChange: (days: CalendarDay[]) => void
  initialDays?: CalendarDay[]
  year?: number
  month?: number
}

const MONTH_NAMES = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
]

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

// Italian holidays 2025
const HOLIDAYS: Record<string, { name: string; premium: number }> = {
  '1-1': { name: 'Capodanno', premium: 100 },
  '1-6': { name: 'Epifania', premium: 100 },
  '4-20': { name: 'Pasqua', premium: 100 },
  '4-21': { name: 'Pasquetta', premium: 100 },
  '4-25': { name: 'Liberazione', premium: 50 },
  '5-1': { name: 'Festa Lavoro', premium: 100 },
  '6-2': { name: 'Republica', premium: 50 },
  '8-15': { name: 'Ferragosto', premium: 100 },
  '11-1': { name: 'Ognissanti', premium: 50 },
  '12-8': { name: 'Immacolata', premium: 50 },
  '12-25': { name: 'Natale', premium: 100 },
  '12-26': { name: 'S. Stefano', premium: 100 },
}

export default function CalendarPicker({
  onChange,
  initialDays = [],
  year: initialYear = new Date().getFullYear(),
  month: initialMonth = new Date().getMonth(),
}: CalendarPickerProps) {
  const [currentYear, setCurrentYear] = useState(initialYear)
  const [currentMonth, setCurrentMonth] = useState(initialMonth)
  const [days, setDays] = useState<CalendarDay[]>(initialDays)

  const getDaysInMonth = useCallback((year: number, month: number) => {
    const firstDayOfMonth = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Adjust for Monday start (0=Sunday in JS)
    let startDay = firstDayOfMonth.getDay() - 1
    if (startDay === -1) startDay = 6

    const dayCells: CalendarDay[] = []

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate()
    for (let i = startDay - 1; i >= 0; i--) {
      dayCells.push({
        date: prevMonthDays - i,
        month: month - 1,
        year,
        status: 'unavailable',
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const monthKey = `${month + 1}-${d}`
      const holiday = HOLIDAYS[monthKey]
      const existing = days.find((day) => day.date === d && day.month === month && day.year === year)

      dayCells.push({
        date: d,
        month,
        year,
        status: existing?.status || (holiday ? 'holiday' : 'unavailable'),
        isCurrentMonth: true,
        holidayName: holiday?.name,
        premium: holiday?.premium,
      })
    }

    // Next month padding to fill 6 rows
    const remainingCells = 42 - dayCells.length
    for (let d = 1; d <= remainingCells; d++) {
      dayCells.push({
        date: d,
        month: month + 1,
        year,
        status: 'unavailable',
        isCurrentMonth: false,
      })
    }

    return dayCells
  }, [days])

  const toggleDay = useCallback((clicked: CalendarDay) => {
    if (!clicked.isCurrentMonth) return

    setDays((prev) => {
      const updated = prev.filter(
        (d) => !(d.date === clicked.date && d.month === clicked.month && d.year === clicked.year)
      )

      let newStatus: DayStatus
      if (clicked.status === 'available') newStatus = 'unavailable'
      else if (clicked.status === 'unavailable') newStatus = 'available'
      else newStatus = 'available'

      const newDay = { ...clicked, status: newStatus }
      const result = [...updated, newDay]
      onChange(result)
      return result
    })
  }, [onChange])

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const markWeekendsAvailable = () => {
    const allDays = getDaysInMonth(currentYear, currentMonth)
    const newDays = [...days]
    allDays.forEach((day, index) => {
      if (!day.isCurrentMonth) return
      const dayOfWeek = (index % 7)
      if (dayOfWeek >= 5) {
        const existing = newDays.find((d) => d.date === day.date && d.month === day.month && d.year === day.year)
        if (!existing) {
          newDays.push({ ...day, status: 'available' as DayStatus })
        } else if (existing.status === 'unavailable') {
          existing.status = 'available'
        }
      }
    })
    setDays(newDays)
    onChange(newDays)
  }

  const calendarDays = getDaysInMonth(currentYear, currentMonth)

  const statusColor = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return 'bg-transparent text-text-muted/30'
    switch (day.status) {
      case 'available':
        return 'bg-success/20 text-success border-success/40'
      case 'unavailable':
        return 'bg-[rgba(255,255,255,0.02)] text-text-secondary border-[rgba(255,255,255,0.04)]'
      case 'holiday':
        return 'bg-warning/10 text-warning border-warning/30'
      default:
        return 'bg-[rgba(255,255,255,0.02)] text-text-secondary'
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.04)] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-base font-semibold text-text-primary">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h3>
        <button
          onClick={goToNextMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.04)] transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-[11px] font-medium text-text-muted py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <motion.button
            key={`${day.month}-${day.date}-${index}`}
            whileTap={{ scale: 0.9 }}
            whileHover={day.isCurrentMonth ? { scale: 1.05 } : {}}
            onClick={() => toggleDay(day)}
            className={cn(
              'relative aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium border transition-all duration-200',
              statusColor(day),
              !day.isCurrentMonth && 'cursor-default border-transparent'
            )}
          >
            {day.date}
            {day.premium && (
              <span className="text-[8px] font-bold mt-0.5">+{day.premium}%</span>
            )}
            {day.status === 'available' && day.isCurrentMonth && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-0.5 right-0.5"
              >
                <Check className="w-3 h-3 text-success" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-success/20 border border-success/40" />
          <span className="text-text-secondary">Disponibile</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]" />
          <span className="text-text-secondary">Non disp.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-warning/10 border border-warning/30" />
          <span className="text-text-secondary">Festivo +%</span>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={markWeekendsAvailable}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-primary bg-[rgba(91,184,245,0.08)] rounded-lg hover:bg-[rgba(91,184,245,0.12)] transition-colors"
        >
          <Check className="w-3 h-3" />
          Weekend disponibili
        </button>
        <button
          onClick={() => {
            setDays([])
            onChange([])
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-muted bg-[rgba(255,255,255,0.04)] rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Azzera
        </button>
      </div>
    </div>
  )
}
