// EmployeeMatching — feed turni open compatibili per il dipendente.
// Versione collegata a Supabase: legge da `public.shifts` con status='open',
// esclude quelli su cui ho già fatto azione (like/skip) e mostra metadata
// della struttura. Like = entry in shift_likes, struttura vede il candidato.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Heart, X, MapPin, Clock, Calendar, Building2, Briefcase,
  AlertCircle, Sparkles, RefreshCw, SlidersHorizontal, RotateCcw, Euro,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import GlassBottomNav from '@/components/employee/GlassBottomNav'
import StatusScreen from '@/components/structure/StatusScreen'
import { useToast } from '@/components/ui/ToastSystem'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuth } from '@/context/AuthContext'
import type { Database } from '@/lib/database.types'

type ShiftRow = Database['public']['Tables']['shifts']['Row']
type StructureRow = Database['public']['Tables']['structures']['Row']

interface ShiftWithStructure extends ShiftRow {
  structure?: Pick<StructureRow, 'ragione_sociale' | 'tipo_struttura' | 'zona'>
}

const MONTHS_IT = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

type PeriodFilter = 'all' | 'today' | 'week' | 'month'
const PERIOD_LABEL: Record<PeriodFilter, string> = {
  all: 'Tutti', today: 'Oggi', week: '7 giorni', month: '30 giorni',
}
const FILTERS_STORAGE_KEY = 'ats_emp_matching_filters'

interface FilterState {
  period: PeriodFilter
  zone: string | null
  minRate: number  // 0 = nessun minimo
}

const DEFAULT_FILTERS: FilterState = { period: 'all', zone: null, minRate: 0 }

function loadStoredFilters(): FilterState {
  try {
    const raw = localStorage.getItem(FILTERS_STORAGE_KEY)
    if (!raw) return DEFAULT_FILTERS
    const parsed = JSON.parse(raw) as Partial<FilterState>
    return {
      period: parsed.period ?? DEFAULT_FILTERS.period,
      zone: parsed.zone ?? null,
      minRate: typeof parsed.minRate === 'number' ? parsed.minRate : 0,
    }
  } catch { return DEFAULT_FILTERS }
}

export default function EmployeeMatching() {
  usePageTitle('Scopri turni')
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { user, status: authStatus } = useAuth()
  const [feed, setFeed] = useState<ShiftWithStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  // Filtri client-side. Volume turni nel feed è basso (max ~50), filtrare
  // dopo fetch è la scelta più semplice. Persist in localStorage per non
  // costringere il dipendente a re-impostare ogni volta.
  const [filters, setFilters] = useState<FilterState>(() => loadStoredFilters())
  const [filtersOpen, setFiltersOpen] = useState(false)
  useEffect(() => {
    try { localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters)) } catch { /* ignore */ }
  }, [filters])

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setFetchError(null)
    try {
      // Tutti i turni open (RLS già filtra: employee vede solo open o suoi
      // assigned). Filtriamo per data >= oggi. Il join structure è client-side.
      const today = new Date().toISOString().slice(0, 10)
      const [{ data: rawShifts, error: sErr }, { data: myLikes, error: lErr }, { data: structs, error: stErr }] =
        await Promise.all([
          supabase
            .from('shifts')
            .select('*')
            .eq('status', 'open')
            .gte('shift_date', today)
            .order('shift_date', { ascending: true }),
          supabase
            .from('shift_likes')
            .select('shift_id')
            .eq('employee_id', user.id),
          supabase
            .from('structures')
            .select('id, ragione_sociale, tipo_struttura, zona'),
        ])
      if (sErr) throw sErr
      if (lErr) throw lErr
      if (stErr) throw stErr

      const skipIds = new Set((myLikes ?? []).map((l) => l.shift_id))
      const structById = new Map((structs ?? []).map((s) => [s.id, s]))

      const visible = (rawShifts ?? [])
        .filter((s) => !skipIds.has(s.id))
        .map((s) => ({ ...s, structure: structById.get(s.structure_id) }))

      setFeed(visible)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore caricamento turni'
      console.error('[EmployeeMatching] fetch error', err)
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authStatus === 'loading') return
    if (authStatus === 'anonymous' || !user) {
      navigate('/auth')
      return
    }
    void load()
  }, [authStatus, user, load, navigate])

  const handleAction = async (shift: ShiftRow, action: 'like' | 'skip') => {
    if (!user) return
    setPendingAction(shift.id)
    try {
      const { error } = await supabase.from('shift_likes').insert({
        shift_id: shift.id,
        employee_id: user.id,
        action,
      })
      if (error) throw error
      // Ottimistic: rimuovo dal feed.
      setFeed((prev) => prev.filter((s) => s.id !== shift.id))
      addToast({
        type: action === 'like' ? 'success' : 'info',
        title: action === 'like' ? 'Mi piace ✨' : 'Saltato',
        message: action === 'like'
          ? 'La struttura ti vedrà tra i candidati. Riceverai notifica se ti sceglie.'
          : 'Turno nascosto dal feed.',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore'
      addToast({ type: 'error', title: 'Errore', message })
    } finally {
      setPendingAction(null)
    }
  }

  // Zone uniche estratte dal feed (per i chip filtro). Ordine alfabetico.
  const availableZones = useMemo(() => {
    const set = new Set<string>()
    for (const s of feed) {
      if (s.structure?.zona) set.add(s.structure.zona)
    }
    return Array.from(set).sort()
  }, [feed])

  // Feed filtrato applicando tutti i criteri attivi.
  const filteredFeed = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7)
    const monthEnd = new Date(now); monthEnd.setDate(monthEnd.getDate() + 30)
    const weekEndStr = weekEnd.toISOString().slice(0, 10)
    const monthEndStr = monthEnd.toISOString().slice(0, 10)

    return feed.filter((s) => {
      if (filters.minRate > 0 && Number(s.hourly_rate) < filters.minRate) return false
      if (filters.zone && s.structure?.zona !== filters.zone) return false
      if (filters.period === 'today' && s.shift_date !== todayStr) return false
      if (filters.period === 'week' && s.shift_date > weekEndStr) return false
      if (filters.period === 'month' && s.shift_date > monthEndStr) return false
      return true
    })
  }, [feed, filters])

  const activeFiltersCount =
    (filters.period !== 'all' ? 1 : 0) +
    (filters.zone ? 1 : 0) +
    (filters.minRate > 0 ? 1 : 0)

  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  const stats = useMemo(
    () => ({ available: feed.length, filtered: filteredFeed.length }),
    [feed.length, filteredFeed.length],
  )

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#06101E] pb-24">
        <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(6,16,30,0.9)] backdrop-blur-xl">
          <div className="max-w-[640px] mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Scopri turni</h1>
          </div>
        </header>
        <div className="max-w-[640px] mx-auto px-4 py-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
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
          title="Impossibile caricare i turni"
          description={fetchError}
          primaryAction={{ label: 'Riprova', onClick: () => void load() }}
        />
        <GlassBottomNav />
      </>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#06101E] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(6,16,30,0.9)] backdrop-blur-xl">
        <div className="max-w-[640px] mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Scopri turni</h1>
            <p className="text-xs text-text-muted">
              {activeFiltersCount > 0
                ? `${stats.filtered} di ${stats.available} (filtri attivi)`
                : `${stats.available} disponibili`}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={cn(
                'relative p-2 rounded-lg transition-colors',
                filtersOpen || activeFiltersCount > 0
                  ? 'bg-[rgba(91,184,245,0.15)] text-sky-primary'
                  : 'hover:bg-white/5 text-text-muted',
              )}
              aria-label="Filtri"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-sky-primary text-[10px] font-bold text-text-inverse flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button
              onClick={() => void load()}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Aggiorna"
            >
              <RefreshCw className="w-5 h-5 text-text-muted" />
            </button>
          </div>
        </div>

        {/* Pannello filtri espandibile */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-[rgba(255,255,255,0.06)]"
            >
              <div className="max-w-[640px] mx-auto px-4 py-3 space-y-3">
                {/* Periodo */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5">Quando</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', 'today', 'week', 'month'] as PeriodFilter[]).map((p) => {
                      const active = filters.period === p
                      return (
                        <button
                          key={p}
                          onClick={() => setFilters({ ...filters, period: p })}
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                            active
                              ? 'bg-[rgba(91,184,245,0.15)] border-sky-primary text-sky-primary'
                              : 'bg-white/[0.03] border-white/10 text-text-secondary hover:bg-white/[0.06]',
                          )}
                        >
                          {PERIOD_LABEL[p]}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Zona (mostrato solo se ci sono zone nel feed) */}
                {availableZones.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5">Zona</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setFilters({ ...filters, zone: null })}
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                          filters.zone === null
                            ? 'bg-[rgba(91,184,245,0.15)] border-sky-primary text-sky-primary'
                            : 'bg-white/[0.03] border-white/10 text-text-secondary hover:bg-white/[0.06]',
                        )}
                      >
                        Tutte
                      </button>
                      {availableZones.map((z) => {
                        const active = filters.zone === z
                        return (
                          <button
                            key={z}
                            onClick={() => setFilters({ ...filters, zone: z })}
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                              active
                                ? 'bg-[rgba(91,184,245,0.15)] border-sky-primary text-sky-primary'
                                : 'bg-white/[0.03] border-white/10 text-text-secondary hover:bg-white/[0.06]',
                            )}
                          >
                            {z}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Paga minima */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1.5">
                    <Euro className="w-3 h-3" />
                    Paga minima oraria
                    {filters.minRate > 0 && (
                      <span className="ml-auto text-sky-primary font-mono">€ {filters.minRate}/h</span>
                    )}
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    step={1}
                    value={filters.minRate}
                    onChange={(e) => setFilters({ ...filters, minRate: Number(e.target.value) })}
                    className="w-full accent-sky-primary"
                    aria-label="Paga minima oraria"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted mt-0.5 font-mono">
                    <span>€0</span><span>€25</span>
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors py-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Azzera filtri
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Feed */}
      <div className="max-w-[640px] mx-auto px-4 py-6 space-y-3">
        {filteredFeed.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center mt-12">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-sky-primary opacity-60" />
            {feed.length === 0 ? (
              <>
                <h2 className="text-lg font-semibold text-white mb-2">Nessun turno disponibile</h2>
                <p className="text-sm text-text-muted">
                  Non ci sono turni open compatibili in questo momento.
                  <br />Torna più tardi: nuove richieste arrivano spesso.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-white mb-2">Nessun turno con questi filtri</h2>
                <p className="text-sm text-text-muted mb-4">
                  Ci sono {feed.length} turni disponibili ma nessuno corrisponde ai filtri attivi.
                </p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-text-inverse rounded-lg gradient-sky hover:brightness-110 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Azzera filtri
                </button>
              </>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filteredFeed.map((shift, i) => (
              <motion.div
                key={shift.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -200 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="rounded-2xl border border-[rgba(91,184,245,0.15)] bg-[rgba(13,30,52,0.7)] backdrop-blur-md overflow-hidden"
              >
                <div className="p-5 space-y-3">
                  {/* Header card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-sky-primary flex-shrink-0" />
                        <p className="text-sm font-semibold text-white truncate">
                          {shift.structure?.ragione_sociale ?? 'Struttura'}
                        </p>
                      </div>
                      <p className="text-xs text-text-muted">
                        {shift.structure?.tipo_struttura ?? '—'}
                        {shift.structure?.zona && (
                          <>
                            {' · '}
                            <MapPin className="w-3 h-3 inline" /> {shift.structure.zona}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-[#1EC99A] font-mono leading-tight">
                        € {Number(shift.hourly_rate).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider">/ora</p>
                    </div>
                  </div>

                  {/* Ruolo */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[rgba(91,184,245,0.12)] text-sky-primary border border-[rgba(91,184,245,0.25)] w-fit">
                    <Briefcase className="w-3 h-3" />
                    {shift.role}
                  </div>

                  {/* Data + orario */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-text-muted" />
                      <span>
                        {new Date(shift.shift_date).getDate()} {MONTHS_IT[new Date(shift.shift_date).getMonth()]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-4 h-4 text-text-muted" />
                      <span>{shift.time_start.slice(0, 5)} – {shift.time_end.slice(0, 5)}</span>
                    </div>
                    {shift.estimated_hours && (
                      <span className="text-xs text-text-muted">
                        ({shift.estimated_hours}h ≈ € {(Number(shift.hourly_rate) * Number(shift.estimated_hours)).toFixed(2)})
                      </span>
                    )}
                  </div>

                  {/* Note */}
                  {shift.notes && (
                    <p className="text-sm text-text-secondary leading-relaxed border-l-2 border-[rgba(91,184,245,0.3)] pl-3 py-1">
                      {shift.notes}
                    </p>
                  )}

                  {/* Azioni */}
                  <div className="flex gap-3 pt-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => void handleAction(shift, 'skip')}
                      disabled={pendingAction === shift.id}
                      className="flex-1 py-2.5 text-sm font-semibold text-[#94A3B8] rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Salta
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => void handleAction(shift, 'like')}
                      disabled={pendingAction === shift.id}
                      className={cn(
                        'flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50',
                        'gradient-sky text-text-inverse hover:brightness-110',
                      )}
                    >
                      <Heart className="w-4 h-4" />
                      Mi piace
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <GlassBottomNav />
    </div>
  )
}
