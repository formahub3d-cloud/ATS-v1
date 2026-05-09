// StructureHistory — storico turni e recensioni della struttura.
// Versione wirata: turni completed/cancelled reali + recensioni date dalla
// struttura ai dipendenti + KPI aggregati. Le sezioni "fatture" e
// "pagamenti" mostrano placeholder onesti finché non avremo lo schema
// fatturazione (prossima fetta).

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar, Clock, Star, Euro, CheckCircle, AlertCircle, RefreshCw,
  FileText, CreditCard, MessageSquare, Briefcase, User as UserIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'
import StatusScreen from '@/components/structure/StatusScreen'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Database, ShiftStatus } from '@/lib/database.types'

type ShiftRow = Database['public']['Tables']['shifts']['Row']
type ReviewRow = Database['public']['Tables']['reviews']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']

interface ShiftWithEmp extends ShiftRow {
  employee_name?: string | null
}

interface ReviewWithEmp extends ReviewRow {
  employee_name?: string | null
  shift_date?: string | null
  shift_role?: string | null
}

const MONTHS_IT = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

const STATUS_BADGE: Record<ShiftStatus, { label: string; cls: string }> = {
  open:        { label: 'Aperto',     cls: 'bg-[rgba(245,184,0,0.12)] text-[#F5B800] border-[rgba(245,184,0,0.3)]' },
  assigned:    { label: 'Assegnato',  cls: 'bg-[rgba(91,184,245,0.12)] text-[#5BB8F5] border-[rgba(91,184,245,0.3)]' },
  in_progress: { label: 'In corso',   cls: 'bg-[rgba(58,163,232,0.12)] text-[#3AA3E8] border-[rgba(58,163,232,0.3)]' },
  completed:   { label: 'Completato', cls: 'bg-[rgba(30,201,154,0.12)] text-[#1EC99A] border-[rgba(30,201,154,0.3)]' },
  cancelled:   { label: 'Annullato',  cls: 'bg-[rgba(148,163,184,0.10)] text-[#94A3B8] border-[rgba(148,163,184,0.25)]' },
  no_show:     { label: 'No-show',    cls: 'bg-[rgba(240,69,69,0.12)] text-[#F04545] border-[rgba(240,69,69,0.3)]' },
}

function computeHours(s: ShiftRow): number {
  if (s.check_in_at && s.check_out_at) {
    return Math.round(((new Date(s.check_out_at).getTime() - new Date(s.check_in_at).getTime()) / 3_600_000) * 100) / 100
  }
  if (s.estimated_hours) return Number(s.estimated_hours)
  const [h1, m1] = s.time_start.split(':').map(Number)
  const [h2, m2] = s.time_end.split(':').map(Number)
  let mins = (h2 * 60 + m2) - (h1 * 60 + m1)
  if (mins < 0) mins += 24 * 60
  return Math.round((mins / 60) * 100) / 100
}

export default function StructureHistory() {
  const navigate = useNavigate()
  const { user, status: authStatus } = useAuth()
  const [structureId, setStructureId] = useState<string | null>(null)
  const [shifts, setShifts] = useState<ShiftWithEmp[]>([])
  const [reviews, setReviews] = useState<ReviewWithEmp[]>([])
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [totalReviewsReceived, setTotalReviewsReceived] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setFetchError(null)
    try {
      // 1) Trova la struttura.
      const { data: structRow, error: stErr } = await supabase
        .from('structures').select('id').eq('user_id', user.id).maybeSingle()
      if (stErr) throw stErr
      if (!structRow) {
        setShifts([]); setReviews([]); return
      }
      setStructureId(structRow.id)

      // 2) Tutti i turni passati (status != open + non futuri).
      const today = new Date().toISOString().slice(0, 10)
      const { data: rawShifts, error: sErr } = await supabase
        .from('shifts').select('*')
        .eq('structure_id', structRow.id)
        .or(`status.eq.completed,status.eq.cancelled,status.eq.no_show,and(shift_date.lt.${today},status.neq.open)`)
        .order('shift_date', { ascending: false })
        .limit(50)
      if (sErr) throw sErr

      // 3) Recensioni date (dalla struttura) + ricevute (dagli employee).
      const [{ data: givenReviews }, { data: ratingRow }] = await Promise.all([
        supabase.from('reviews').select('*').eq('reviewer_id', user.id)
          .order('created_at', { ascending: false }),
        supabase.from('structure_rating_summary').select('avg_rating, total_reviews')
          .eq('structure_id', structRow.id).maybeSingle(),
      ])

      // 4) Lookup nomi dipendenti.
      const empIds = Array.from(new Set([
        ...(rawShifts ?? []).map((s) => s.employee_id).filter((x): x is string => !!x),
      ]))
      let nameById = new Map<string, string>()
      if (empIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles').select('id, full_name').in('id', empIds)
        nameById = new Map((profs ?? []).map((p) => [p.id, (p as Pick<ProfileRow, 'full_name'>).full_name ?? '—']))
      }
      const shiftById = new Map((rawShifts ?? []).map((s) => [s.id, s]))

      setShifts((rawShifts ?? []).map((s) => ({
        ...s,
        employee_name: s.employee_id ? nameById.get(s.employee_id) ?? null : null,
      })))

      setReviews((givenReviews ?? []).map((r) => {
        const sh = shiftById.get(r.shift_id)
        return {
          ...r,
          employee_name: sh?.employee_id ? nameById.get(sh.employee_id) ?? null : null,
          shift_date: sh?.shift_date ?? null,
          shift_role: sh?.role ?? null,
        }
      }))

      setAvgRating(ratingRow?.avg_rating != null ? Number(ratingRow.avg_rating) : null)
      setTotalReviewsReceived(ratingRow?.total_reviews ?? 0)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore caricamento storico'
      console.error('[StructureHistory] fetch error', err)
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

  // Aggregati
  const stats = useMemo(() => {
    const completed = shifts.filter((s) => s.status === 'completed')
    const totalSpend = completed.reduce((acc, s) => acc + computeHours(s) * Number(s.hourly_rate), 0)
    return {
      completedCount: completed.length,
      totalSpend: Math.round(totalSpend * 100) / 100,
      cancelled: shifts.filter((s) => s.status === 'cancelled' || s.status === 'no_show').length,
    }
  }, [shifts])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-60 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <StatusScreen
        icon={AlertCircle}
        iconColor="#F04545"
        title="Impossibile caricare lo storico"
        description={fetchError}
        primaryAction={{ label: 'Riprova', onClick: () => void load() }}
      />
    )
  }

  if (!structureId) {
    return (
      <StatusScreen
        icon={AlertCircle}
        iconColor="#5BB8F5"
        title="Struttura non trovata"
        description="Non c'è una struttura associata al tuo account."
        primaryAction={{ label: 'Vai al portale', onClick: () => navigate('/structure') }}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Storico"
        subtitle={`${stats.completedCount} turni completati · €${stats.totalSpend.toFixed(2)} di compensi totali`}
        showBack
        backTo="/structure"
        backLabel="Dashboard"
        variant="display"
        actions={
          <button
            onClick={load}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Aggiorna"
          >
            <RefreshCw className="w-5 h-5 text-text-muted" />
          </button>
        }
      />

      {/* KPI cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={CheckCircle} color="#1EC99A" label="Completati" value={String(stats.completedCount)} />
        <KPI icon={Euro} color="#5BB8F5" label="Compenso totale" value={`€ ${stats.totalSpend.toFixed(2)}`} />
        <KPI
          icon={Star}
          color="#F5B800"
          label="Rating medio"
          value={avgRating != null ? `${avgRating.toFixed(1)} / 5` : '—'}
          sub={totalReviewsReceived > 0 ? `${totalReviewsReceived} recensioni` : 'Nessuna recensione'}
        />
        <KPI icon={AlertCircle} color="#F04545" label="Annullati / no-show" value={String(stats.cancelled)} />
      </section>

      {/* Lista turni passati */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-primary" />
            Turni passati
          </h2>
          <span className="text-xs text-text-muted">Ultimi {Math.min(shifts.length, 50)}</span>
        </div>
        {shifts.length === 0 ? (
          <div className="py-12 text-center text-text-muted">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nessun turno passato.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">Data</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">Ruolo · Dipendente</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">Orario</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">Compenso</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">Stato</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s) => (
                  <tr key={s.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(91,184,245,0.04)] transition-colors">
                    <td className="px-3 py-3 text-sm">
                      <div className="font-medium text-white">{new Date(s.shift_date).getDate()} {MONTHS_IT[new Date(s.shift_date).getMonth()]}</div>
                      <div className="text-[10px] text-text-muted">{new Date(s.shift_date).getFullYear()}</div>
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <div className="flex items-center gap-1.5 text-white">
                        <Briefcase className="w-3 h-3 text-text-muted" />
                        {s.role}
                      </div>
                      <div className="text-xs text-text-muted flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        {s.employee_name ?? '—'}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-text-secondary font-mono">
                      {s.time_start.slice(0, 5)}–{s.time_end.slice(0, 5)}
                      <div className="text-[10px] text-text-muted">{computeHours(s).toFixed(1)} h</div>
                    </td>
                    <td className="px-3 py-3 text-right text-sm font-mono text-[#1EC99A]">
                      € {(computeHours(s) * Number(s.hourly_rate)).toFixed(2)}
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium border whitespace-nowrap', STATUS_BADGE[s.status].cls)}>
                        {STATUS_BADGE[s.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Recensioni date */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-[#F5B800]" />
            Recensioni che hai dato
          </h2>
          <span className="text-xs text-text-muted">{reviews.length}</span>
        </div>
        {reviews.length === 0 ? (
          <div className="py-10 text-center text-text-muted">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Non hai ancora lasciato recensioni.</p>
            <p className="text-xs mt-1 opacity-70">Quando un turno è completato, lo trovi in /structure/matching → "Recensisci".</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,30,52,0.5)] p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-white">
                    {r.employee_name ?? '—'}
                    {r.shift_role && <span className="text-text-muted ml-2 text-xs">({r.shift_role})</span>}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} className={cn('w-3.5 h-3.5', n <= r.rating ? 'fill-[#F5B800] text-[#F5B800]' : 'fill-transparent text-text-muted')} />
                    ))}
                  </div>
                </div>
                {r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {r.tags.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-[rgba(91,184,245,0.1)] text-sky-primary">{t}</span>
                    ))}
                  </div>
                )}
                {r.comment && <p className="text-xs text-text-secondary leading-relaxed italic">"{r.comment}"</p>}
                <p className="text-[10px] text-text-muted mt-1.5">
                  {r.shift_date && (<>Turno del {new Date(r.shift_date).toLocaleDateString('it-IT')} · </>)}
                  scritto il {new Date(r.created_at).toLocaleDateString('it-IT')}
                </p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Fatture & Pagamenti — placeholder onesti */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ComingSoon
          title="Fatture"
          icon={FileText}
          color="#5BB8F5"
          description="Fatturazione automatica dei turni completati. Schema fatture (numero, periodo, importo) in arrivo."
        />
        <ComingSoon
          title="Pagamenti"
          icon={CreditCard}
          color="#1EC99A"
          description="Storico addebiti (carta/SEPA) e bonifici dipendenti. Integrazione Stripe in fetta dedicata."
        />
      </section>
    </motion.div>
  )
}

function KPI({
  icon: Icon, color, label, value, sub,
}: {
  icon: typeof Calendar
  color: string
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-2xl p-5 backdrop-blur-md bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-[0.08em] text-text-muted">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="font-playfair text-[24px] font-bold text-white leading-none">{value}</p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  )
}

function ComingSoon({
  title, icon: Icon, color, description,
}: {
  title: string
  icon: typeof Calendar
  color: string
  description: string
}) {
  return (
    <div className="rounded-2xl p-5 backdrop-blur-md bg-white/[0.025] border border-dashed border-white/10">
      <div className="flex items-start gap-3 mb-2">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}12`, border: `1px solid ${color}25` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-text-muted">
              In arrivo
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs text-text-muted leading-relaxed">{description}</p>
    </div>
  )
}

// Helper non usato direttamente ma esportato per riusabilità (es. AdminShifts).
export { computeHours as _computeHours }
