// EmployeeMatching — feed turni open compatibili per il dipendente.
// Versione collegata a Supabase: legge da `public.shifts` con status='open',
// esclude quelli su cui ho già fatto azione (like/skip) e mostra metadata
// della struttura. Like = entry in shift_likes, struttura vede il candidato.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Heart, X, MapPin, Clock, Calendar, Building2, Briefcase,
  AlertCircle, Sparkles, RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import GlassBottomNav from '@/components/employee/GlassBottomNav'
import StatusScreen from '@/components/structure/StatusScreen'
import { useToast } from '@/components/ui/ToastSystem'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Database } from '@/lib/database.types'

type ShiftRow = Database['public']['Tables']['shifts']['Row']
type StructureRow = Database['public']['Tables']['structures']['Row']

interface ShiftWithStructure extends ShiftRow {
  structure?: Pick<StructureRow, 'ragione_sociale' | 'tipo_struttura' | 'zona'>
}

const MONTHS_IT = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

export default function EmployeeMatching() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { user, status: authStatus } = useAuth()
  const [feed, setFeed] = useState<ShiftWithStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<string | null>(null)

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

  const stats = useMemo(() => ({ available: feed.length }), [feed])

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
            <p className="text-xs text-text-muted">{stats.available} disponibili</p>
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

      {/* Feed */}
      <div className="max-w-[640px] mx-auto px-4 py-6 space-y-3">
        {feed.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center mt-12">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-sky-primary opacity-60" />
            <h2 className="text-lg font-semibold text-white mb-2">Nessun turno disponibile</h2>
            <p className="text-sm text-text-muted">
              Non ci sono turni open compatibili in questo momento.
              <br />Torna più tardi: nuove richieste arrivano spesso.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {feed.map((shift, i) => (
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
