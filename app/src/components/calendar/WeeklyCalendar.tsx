// WeeklyCalendar — vista settimanale dei turni, 7 colonne (Lun→Dom).
// Riusabile da admin (tutti i turni) ed employee/structure (solo i propri).
// I turni vengono raggruppati per giorno e ordinati per ora di inizio.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Building2, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database, ShiftStatus } from '@/lib/database.types'

type ShiftRow = Database['public']['Tables']['shifts']['Row']

export interface CalendarShift extends ShiftRow {
  /** Nome struttura (per visualizzazione su employee/admin). */
  structure_name?: string | null
  /** Nome dipendente (per visualizzazione admin/structure). */
  employee_name?: string | null
}

interface WeeklyCalendarProps {
  shifts: CalendarShift[]
  /** Settimana corrente (lunedì) — controlled. */
  weekStart: Date
  onWeekChange: (newWeekStart: Date) => void
  /** Click su un turno (apre dettaglio). */
  onShiftClick?: (shift: CalendarShift) => void
  /** Mostra il nome dipendente o struttura nelle card (in base al ruolo
   *  che usa il calendario). */
  showLabel?: 'employee' | 'structure' | 'both'
  loading?: boolean
}

const DAYS_IT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const STATUS_COLOR: Record<ShiftStatus, { bg: string; border: string; text: string; dot: string }> = {
  open:        { bg: 'rgba(245,184,0,0.10)', border: 'rgba(245,184,0,0.30)', text: '#F5B800', dot: '#F5B800' },
  assigned:    { bg: 'rgba(91,184,245,0.10)', border: 'rgba(91,184,245,0.30)', text: '#5BB8F5', dot: '#5BB8F5' },
  in_progress: { bg: 'rgba(58,163,232,0.12)', border: 'rgba(58,163,232,0.30)', text: '#3AA3E8', dot: '#3AA3E8' },
  completed:   { bg: 'rgba(30,201,154,0.10)', border: 'rgba(30,201,154,0.30)', text: '#1EC99A', dot: '#1EC99A' },
  cancelled:   { bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.20)', text: '#94A3B8', dot: '#94A3B8' },
  no_show:     { bg: 'rgba(240,69,69,0.10)', border: 'rgba(240,69,69,0.30)', text: '#F04545', dot: '#F04545' },
}

/** Lunedì della settimana che contiene `d` (00:00 locale). */
export function getMondayOfWeek(d: Date): Date {
  const day = new Date(d)
  day.setHours(0, 0, 0, 0)
  const dow = day.getDay() === 0 ? 7 : day.getDay() // 1=lun..7=dom
  day.setDate(day.getDate() - (dow - 1))
  return day
}

function formatYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatRange(weekStart: Date): string {
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)
  const sameMonth = weekStart.getMonth() === end.getMonth()
  const monthLabel = sameMonth
    ? end.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
    : `${weekStart.toLocaleDateString('it-IT', { month: 'short' })} – ${end.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}`
  return `${weekStart.getDate()} – ${end.getDate()} ${monthLabel}`
}

export default function WeeklyCalendar({
  shifts, weekStart, onWeekChange, onShiftClick, showLabel = 'both', loading,
}: WeeklyCalendarProps) {
  // Costruisce 7 giorni a partire dal lunedì.
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [weekStart])

  // Raggruppa i turni per giorno (YMD) e ordina per ora.
  const shiftsByDay = useMemo(() => {
    const m = new Map<string, CalendarShift[]>()
    for (const s of shifts) {
      const arr = m.get(s.shift_date) ?? []
      arr.push(s)
      m.set(s.shift_date, arr)
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => a.time_start.localeCompare(b.time_start))
    }
    return m
  }, [shifts])

  const todayYMD = formatYMD(new Date())

  const goPrev = () => {
    const d = new Date(weekStart); d.setDate(d.getDate() - 7); onWeekChange(d)
  }
  const goNext = () => {
    const d = new Date(weekStart); d.setDate(d.getDate() + 7); onWeekChange(d)
  }
  const goToday = () => onWeekChange(getMondayOfWeek(new Date()))

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Settimana precedente"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-semibold text-white whitespace-nowrap min-w-[200px] text-center">
            {formatRange(weekStart)}
          </h2>
          <button
            type="button"
            onClick={goNext}
            className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Settimana successiva"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={goToday}
          className="px-3 py-1.5 text-xs font-medium text-text-secondary border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
        >
          Oggi
        </button>
      </div>

      {/* Griglia 7 giorni */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {days.map((d, i) => {
          const ymd = formatYMD(d)
          const isToday = ymd === todayYMD
          const dayShifts = shiftsByDay.get(ymd) ?? []
          return (
            <motion.div
              key={ymd}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className={cn(
                'rounded-xl border backdrop-blur-md p-3 min-h-[140px] flex flex-col',
                isToday
                  ? 'border-[rgba(91,184,245,0.4)] bg-[rgba(91,184,245,0.06)]'
                  : 'border-[rgba(255,255,255,0.06)] bg-[rgba(13,30,52,0.4)]',
              )}
            >
              {/* Header giorno */}
              <div className="flex items-baseline justify-between mb-2 pb-2 border-b border-[rgba(255,255,255,0.06)]">
                <span className={cn(
                  'text-xs uppercase tracking-wider font-semibold',
                  isToday ? 'text-sky-primary' : 'text-text-muted',
                )}>
                  {DAYS_IT[i]}
                </span>
                <span className={cn(
                  'text-lg font-bold font-mono',
                  isToday ? 'text-white' : 'text-text-secondary',
                )}>
                  {d.getDate()}
                </span>
              </div>

              {/* Lista turni del giorno */}
              {loading ? (
                <div className="space-y-2">
                  <div className="h-12 rounded bg-white/[0.04] animate-pulse" />
                  <div className="h-12 rounded bg-white/[0.04] animate-pulse" />
                </div>
              ) : dayShifts.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-[10px] text-text-muted opacity-50">
                  —
                </div>
              ) : (
                <div className="space-y-1.5 flex-1">
                  {dayShifts.map((s) => {
                    const c = STATUS_COLOR[s.status]
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onShiftClick?.(s)}
                        className="w-full text-left rounded-lg p-2 text-xs transition-all hover:scale-[1.02] hover:brightness-110"
                        style={{
                          backgroundColor: c.bg,
                          border: `1px solid ${c.border}`,
                          color: c.text,
                        }}
                      >
                        <div className="flex items-center gap-1 font-mono text-[11px] mb-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {s.time_start.slice(0, 5)}–{s.time_end.slice(0, 5)}
                        </div>
                        <p className="text-[11px] font-semibold text-white truncate">{s.role}</p>
                        {showLabel !== 'employee' && s.structure_name && (
                          <p className="text-[10px] text-text-muted truncate flex items-center gap-1">
                            <Building2 className="w-2.5 h-2.5" />
                            {s.structure_name}
                          </p>
                        )}
                        {showLabel !== 'structure' && s.employee_name && (
                          <p className="text-[10px] text-text-muted truncate flex items-center gap-1">
                            <UserIcon className="w-2.5 h-2.5" />
                            {s.employee_name}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 text-[10px] text-text-muted pt-1">
        {(['open', 'assigned', 'in_progress', 'completed', 'cancelled', 'no_show'] as ShiftStatus[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[s].dot }} />
            {{
              open: 'Aperto', assigned: 'Assegnato', in_progress: 'In corso',
              completed: 'Completato', cancelled: 'Annullato', no_show: 'No-show',
            }[s]}
          </span>
        ))}
      </div>

      {/* Empty hint quando non c'è alcun turno nella settimana */}
      {!loading && shifts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-text-muted">
          <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Nessun turno questa settimana.
        </div>
      )}
    </div>
  )
}
