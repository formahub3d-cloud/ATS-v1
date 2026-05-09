// AdminCalendar — vista calendario settimanale globale.
// Mostra tutti i turni della settimana selezionata in una griglia 7-giorni.
// Click su turno → drawer dettaglio (riusato il pattern di AdminShifts).

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, RefreshCw, Building2, MapPin, Clock, Calendar, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'
import WeeklyCalendar, { getMondayOfWeek, type CalendarShift } from '@/components/calendar/WeeklyCalendar'
import { supabase } from '@/lib/supabase'
import type { Database, ShiftStatus } from '@/lib/database.types'

type StructureRow = Database['public']['Tables']['structures']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']

const STATUS_LABEL: Record<ShiftStatus, string> = {
  open: 'Aperto', assigned: 'Assegnato', in_progress: 'In corso',
  completed: 'Completato', cancelled: 'Annullato', no_show: 'No-show',
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function AdminCalendar() {
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(new Date()))
  const [shifts, setShifts] = useState<CalendarShift[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selected, setSelected] = useState<CalendarShift | null>(null)

  const range = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    return { from: ymd(weekStart), to: ymd(end) }
  }, [weekStart])

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const [{ data: rawShifts, error: sErr }, { data: structs, error: stErr }, { data: profs, error: pErr }] =
        await Promise.all([
          supabase.from('shifts').select('*')
            .gte('shift_date', range.from).lte('shift_date', range.to)
            .order('shift_date', { ascending: true }),
          supabase.from('structures').select('id, ragione_sociale'),
          supabase.from('profiles').select('id, full_name').eq('role', 'employee'),
        ])
      if (sErr) throw sErr
      if (stErr) throw stErr
      if (pErr) throw pErr

      const structById = new Map((structs ?? []).map((s) => [s.id, s.ragione_sociale]))
      const profById = new Map((profs ?? []).map((p) => [p.id, p.full_name ?? '—']))

      const enriched: CalendarShift[] = (rawShifts ?? []).map((s) => ({
        ...s,
        structure_name: structById.get(s.structure_id) ?? null,
        employee_name: s.employee_id ? profById.get(s.employee_id) ?? null : null,
      }))
      setShifts(enriched)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore'
      console.error('[AdminCalendar] fetch error', err)
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [range.from, range.to])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Calendario"
        subtitle={`Vista settimanale di tutti i turni — ${shifts.length} questa settimana`}
        actions={
          <button
            onClick={load}
            disabled={loading}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-text-secondary border border-white/10 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            {loading ? 'Aggiornamento...' : 'Aggiorna'}
          </button>
        }
      />

      {fetchError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(240,69,69,0.08)] border border-[rgba(240,69,69,0.2)] text-sm text-[#F04545]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {fetchError}
        </div>
      )}

      <GlassCard>
        <WeeklyCalendar
          shifts={shifts}
          weekStart={weekStart}
          onWeekChange={setWeekStart}
          onShiftClick={setSelected}
          showLabel="both"
          loading={loading}
        />
      </GlassCard>

      {/* Drawer dettaglio (versione minimal) */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[440px] bg-[#0D1E34] border-l border-[rgba(255,255,255,0.08)] z-50 overflow-y-auto"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0D1E34]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)]">
                <h2 className="text-lg font-semibold text-white truncate pr-3">
                  {selected.role} · {new Date(selected.shift_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                </h2>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border"
                  style={{
                    color: '#5BB8F5',
                    backgroundColor: 'rgba(91,184,245,0.12)',
                    borderColor: 'rgba(91,184,245,0.3)',
                  }}
                >
                  {STATUS_LABEL[selected.status]}
                </span>
                <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,30,52,0.5)] divide-y divide-[rgba(255,255,255,0.04)]">
                  <DetailRow icon={Building2} label="Struttura" value={selected.structure_name ?? '—'} />
                  <DetailRow icon={UserIcon} label="Dipendente" value={selected.employee_name ?? '—'} />
                  <DetailRow icon={Calendar} label="Data" value={new Date(selected.shift_date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })} />
                  <DetailRow icon={Clock} label="Orario" value={`${selected.time_start.slice(0, 5)} – ${selected.time_end.slice(0, 5)}`} mono />
                  <DetailRow label="Paga oraria" value={`€ ${Number(selected.hourly_rate).toFixed(2)}/h`} mono />
                  {selected.notes && <DetailRow label="Note" value={selected.notes} multiline />}
                  {selected.check_in_at && <DetailRow label="Check-in" value={new Date(selected.check_in_at).toLocaleString('it-IT')} />}
                  {selected.check_out_at && <DetailRow label="Check-out" value={new Date(selected.check_out_at).toLocaleString('it-IT')} />}
                </div>
                <p className="text-xs text-text-muted">
                  Per modificare/annullare il turno, vai su <span className="text-sky-primary">/admin/shifts</span>.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function DetailRow({
  icon: Icon, label, value, mono, multiline,
}: {
  icon?: typeof Calendar
  label: string
  value: string
  mono?: boolean
  multiline?: boolean
}) {
  return (
    <div className={cn('flex gap-3 px-3 py-2.5', multiline ? 'flex-col items-start' : 'items-center justify-between')}>
      <span className="text-xs text-text-muted flex items-center gap-1.5 flex-shrink-0">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </span>
      <span className={cn('text-sm text-white', mono && 'font-mono', multiline ? 'whitespace-pre-line' : 'text-right truncate min-w-0')}>
        {value}
      </span>
    </div>
  )
}

/** Mappa lo status admin (testuale) per uso futuro nel drawer (lo includiamo
 *  nel modulo per coerenza con AdminShifts; al momento il dettaglio è
 *  read-only — le azioni vivono in AdminShifts). */
export const _STATUS_LABEL = STATUS_LABEL
