// EmployeeCalendar — vista settimanale dei propri turni assegnati/in corso/
// completati. Mostra anche, in colore diverso, i turni `open` compatibili
// (così l'employee vede a colpo d'occhio dove può candidarsi).

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw } from 'lucide-react'
import GlassBottomNav from '@/components/employee/GlassBottomNav'
import StatusScreen from '@/components/structure/StatusScreen'
import WeeklyCalendar, { getMondayOfWeek, type CalendarShift } from '@/components/calendar/WeeklyCalendar'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuth } from '@/context/AuthContext'

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function EmployeeCalendar() {
  usePageTitle('Calendario')
  const navigate = useNavigate()
  const { user, status: authStatus } = useAuth()
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(new Date()))
  const [shifts, setShifts] = useState<CalendarShift[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const range = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    return { from: ymd(weekStart), to: ymd(end) }
  }, [weekStart])

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setFetchError(null)
    try {
      // RLS già filtra: l'employee vede SOLO i suoi assigned/in_progress/
      // completed + tutti gli open. Niente filtro client-side aggiuntivo.
      const { data: rawShifts, error: sErr } = await supabase
        .from('shifts')
        .select('*')
        .gte('shift_date', range.from)
        .lte('shift_date', range.to)
      if (sErr) throw sErr

      const structIds = Array.from(new Set((rawShifts ?? []).map((s) => s.structure_id)))
      const structRes = structIds.length === 0
        ? { data: [] as Array<{ id: string; ragione_sociale: string }> }
        : await supabase.from('structures').select('id, ragione_sociale').in('id', structIds)
      const structById = new Map((structRes.data ?? []).map((s) => [s.id, s.ragione_sociale]))

      const enriched: CalendarShift[] = (rawShifts ?? []).map((s) => ({
        ...s,
        structure_name: structById.get(s.structure_id) ?? null,
      }))
      setShifts(enriched)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore caricamento turni'
      console.error('[EmployeeCalendar] fetch error', err)
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [user, range.from, range.to])

  useEffect(() => {
    if (authStatus === 'loading') return
    if (authStatus === 'anonymous' || !user) {
      navigate('/auth')
      return
    }
    void load()
  }, [authStatus, user, load, navigate])

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#06101E] pb-24">
        <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(6,16,30,0.9)] backdrop-blur-xl">
          <div className="max-w-[1100px] mx-auto px-4 h-16 flex items-center">
            <h1 className="text-xl font-bold text-white">Calendario</h1>
          </div>
        </header>
        <div className="max-w-[1100px] mx-auto px-4 py-6 space-y-3">
          <Skeleton className="h-12 w-60 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
        <GlassBottomNav />
      </div>
    )
  }

  if (fetchError) {
    return (
      <>
        <StatusScreen
          icon={AlertCircle}
          iconColor="#F04545"
          title="Impossibile caricare il calendario"
          description={fetchError}
          primaryAction={{ label: 'Riprova', onClick: () => void load() }}
        />
        <GlassBottomNav />
      </>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-[100dvh] bg-[#06101E] pb-24"
    >
      <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(6,16,30,0.9)] backdrop-blur-xl">
        <div className="max-w-[1100px] mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Calendario</h1>
            <p className="text-xs text-text-muted">{shifts.length} turn{shifts.length === 1 ? 'o' : 'i'} questa settimana</p>
          </div>
          <button
            onClick={() => void load()}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Aggiorna"
          >
            <RefreshCw className="w-5 h-5 text-text-muted" />
          </button>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-4 py-6">
        <WeeklyCalendar
          shifts={shifts}
          weekStart={weekStart}
          onWeekChange={setWeekStart}
          onShiftClick={(s) => {
            // Click: porta al check-in (se mio assegnato/in_progress) o al
            // matching (se open per fare like).
            if (s.status === 'assigned' || s.status === 'in_progress') {
              navigate('/employee/checkin')
            } else if (s.status === 'open') {
              navigate('/employee/matching')
            }
          }}
          showLabel="structure"
          loading={loading}
        />
      </div>

      <GlassBottomNav />
    </motion.div>
  )
}
