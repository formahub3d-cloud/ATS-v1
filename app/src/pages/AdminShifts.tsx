// AdminShifts — gestione globale dei turni.
// Versione collegata a Supabase: lista da `public.shifts` con join su
// structures/employees per la display, filtri per stato + data, drawer
// di dettaglio con assegnazione manuale (set employee_id + status='assigned'
// + qr_token generato).

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, MapPin, Search, X, AlertCircle, Building2,
  User as UserIcon, CheckCircle, Hourglass, Ban, Play, Trophy, UserX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastSystem'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'
import Avatar from '@/components/Avatar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Database, ShiftStatus } from '@/lib/database.types'

type ShiftRow = Database['public']['Tables']['shifts']['Row']
type StructureRow = Database['public']['Tables']['structures']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']

interface ShiftWithJoins extends ShiftRow {
  structure?: Pick<StructureRow, 'id' | 'ragione_sociale' | 'zona' | 'tipo_struttura'>
  employee_profile?: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url'>
}

const statusOptions: Array<{ value: ShiftStatus | 'all'; label: string; color: string }> = [
  { value: 'all', label: 'Tutti', color: 'text-text-muted' },
  { value: 'open', label: 'Da assegnare', color: 'text-[#F5B800]' },
  { value: 'assigned', label: 'Assegnati', color: 'text-[#5BB8F5]' },
  { value: 'in_progress', label: 'In corso', color: 'text-[#3AA3E8]' },
  { value: 'completed', label: 'Completati', color: 'text-[#1EC99A]' },
  { value: 'cancelled', label: 'Annullati', color: 'text-[#94A3B8]' },
  { value: 'no_show', label: 'No-show', color: 'text-[#F04545]' },
]

const STATUS_META: Record<ShiftStatus, { label: string; color: string; bg: string; border: string; icon: typeof Hourglass }> = {
  open:        { label: 'Da assegnare', color: '#F5B800', bg: 'rgba(245,184,0,0.12)', border: 'rgba(245,184,0,0.3)', icon: Hourglass },
  assigned:    { label: 'Assegnato',    color: '#5BB8F5', bg: 'rgba(91,184,245,0.12)', border: 'rgba(91,184,245,0.3)', icon: UserIcon },
  in_progress: { label: 'In corso',     color: '#3AA3E8', bg: 'rgba(58,163,232,0.12)', border: 'rgba(58,163,232,0.3)', icon: Play },
  completed:   { label: 'Completato',   color: '#1EC99A', bg: 'rgba(30,201,154,0.12)', border: 'rgba(30,201,154,0.3)', icon: Trophy },
  cancelled:   { label: 'Annullato',    color: '#94A3B8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.25)', icon: Ban },
  no_show:     { label: 'No-show',      color: '#F04545', bg: 'rgba(240,69,69,0.12)', border: 'rgba(240,69,69,0.3)', icon: UserX },
}

function StatusBadge({ status }: { status: ShiftStatus }) {
  const meta = STATUS_META[status]
  const Icon = meta.icon
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border whitespace-nowrap"
      style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.border }}
    >
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  )
}

export default function AdminShifts() {
  const { addToast } = useToast()
  const { user } = useAuth()
  const [shifts, setShifts] = useState<ShiftWithJoins[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ShiftStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState<ShiftWithJoins | null>(null)
  const [pendingAction, setPendingAction] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      // Fetch shifts + join laterali via Map (più semplice degli embed nested
      // di postgrest che richiedono FK definite nella schema cache).
      const [{ data: rawShifts, error: sErr }, { data: structs, error: stErr }, { data: profs, error: prErr }] =
        await Promise.all([
          supabase.from('shifts').select('*').order('shift_date', { ascending: true }),
          supabase.from('structures').select('id, ragione_sociale, zona, tipo_struttura'),
          supabase.from('profiles').select('id, full_name, avatar_url').eq('role', 'employee'),
        ])
      if (sErr) throw sErr
      if (stErr) throw stErr
      if (prErr) throw prErr

      const structById = new Map((structs ?? []).map((s) => [s.id, s]))
      const profById = new Map((profs ?? []).map((p) => [p.id, p]))

      const merged: ShiftWithJoins[] = (rawShifts ?? []).map((s) => ({
        ...s,
        structure: structById.get(s.structure_id),
        employee_profile: s.employee_id ? profById.get(s.employee_id) : undefined,
      }))
      setShifts(merged)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore caricamento turni'
      console.error('[AdminShifts] fetch error', err)
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    return shifts.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        (s.structure?.ragione_sociale ?? '').toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        (s.employee_profile?.full_name ?? '').toLowerCase().includes(q)
      )
    })
  }, [shifts, statusFilter, searchQuery])

  const stats = useMemo(() => {
    const counts: Record<ShiftStatus | 'all', number> = {
      all: shifts.length,
      open: 0, assigned: 0, in_progress: 0, completed: 0, cancelled: 0, no_show: 0,
    }
    for (const s of shifts) counts[s.status]++
    return counts
  }, [shifts])

  const handleCancel = async (s: ShiftRow) => {
    if (!user) return
    setPendingAction(s.id)
    try {
      const { error } = await supabase
        .from('shifts')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Annullato dall\'admin',
        })
        .eq('id', s.id)
      if (error) throw error
      addToast({ type: 'success', title: 'Turno annullato', message: '' })
      await load()
      setSelected(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore'
      addToast({ type: 'error', title: 'Errore annullamento', message })
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Gestione Turni"
        subtitle={`${shifts.length} turn${shifts.length === 1 ? 'o' : 'i'} totali`}
        actions={
          <button
            onClick={load}
            disabled={loading}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-text-secondary border border-white/10 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {loading ? 'Aggiornamento...' : 'Aggiorna'}
          </button>
        }
      />

      {/* Stats pills */}
      <div className="flex flex-wrap gap-3">
        {statusOptions.map((opt) => {
          const isActive = statusFilter === opt.value
          const count = stats[opt.value]
          return (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 backdrop-blur-sm',
                isActive
                  ? 'bg-[rgba(91,184,245,0.1)] border-sky-primary text-sky-primary -translate-y-0.5'
                  : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/[0.07]',
              )}
            >
              {opt.label}: <span className={cn('font-semibold', isActive ? 'text-sky-primary' : opt.color)}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="flex items-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 max-w-[420px]">
        <Search className="w-4 h-4 text-text-muted mr-2 flex-shrink-0" />
        <input
          type="text"
          placeholder="Cerca per struttura, ruolo, dipendente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-sm text-white placeholder-text-muted outline-none flex-1"
        />
      </div>

      {/* Lista turni */}
      <GlassCard>
        {fetchError && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-[rgba(240,69,69,0.08)] border border-[rgba(240,69,69,0.2)] text-sm text-[#F04545]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {fetchError}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-text-muted">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              {shifts.length === 0
                ? 'Nessun turno ancora pubblicato. Le strutture creano i turni dal proprio portale.'
                : 'Nessun turno corrisponde ai filtri.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Quando</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Struttura · Zona</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Ruolo · Paga</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Dipendente</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Stato</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(91,184,245,0.04)] transition-colors cursor-pointer"
                    onClick={() => setSelected(s)}
                  >
                    <td className="px-3 py-3">
                      <div className="text-sm text-white font-medium">{new Date(s.shift_date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</div>
                      <div className="text-xs text-text-muted flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> {s.time_start.slice(0, 5)}–{s.time_end.slice(0, 5)}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-sm text-white truncate max-w-[200px]">{s.structure?.ragione_sociale ?? '—'}</div>
                      {s.structure?.zona && (
                        <div className="text-xs text-text-muted flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {s.structure.zona}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-sm text-white">{s.role}</div>
                      <div className="text-xs text-[#1EC99A] font-mono">€{Number(s.hourly_rate).toFixed(2)}/h</div>
                    </td>
                    <td className="px-3 py-3">
                      {s.employee_profile ? (
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={s.employee_profile.avatar_url ?? undefined}
                            alt={s.employee_profile.full_name ?? ''}
                            size="xs"
                          />
                          <span className="text-sm text-white truncate max-w-[140px]">{s.employee_profile.full_name ?? '—'}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted">— non assegnato</span>
                      )}
                    </td>
                    <td className="px-3 py-3"><StatusBadge status={s.status} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Drawer dettaglio turno */}
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
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-[#0D1E34] border-l border-[rgba(255,255,255,0.08)] z-50 overflow-y-auto"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0D1E34]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)]">
                <h2 className="text-lg font-semibold text-white truncate pr-3">
                  {selected.role} · {new Date(selected.shift_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                </h2>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <StatusBadge status={selected.status} />

                <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,30,52,0.5)] divide-y divide-[rgba(255,255,255,0.04)]">
                  <Row icon={Building2} label="Struttura" value={selected.structure?.ragione_sociale ?? '—'} />
                  <Row icon={MapPin} label="Zona" value={selected.structure?.zona ?? '—'} />
                  <Row icon={Calendar} label="Data" value={new Date(selected.shift_date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
                  <Row icon={Clock} label="Orario" value={`${selected.time_start.slice(0, 5)} – ${selected.time_end.slice(0, 5)}`} mono />
                  <Row icon={UserIcon} label="Dipendente" value={selected.employee_profile?.full_name ?? '— non assegnato'} />
                  <Row label="Paga oraria" value={`€ ${Number(selected.hourly_rate).toFixed(2)}/h`} mono />
                  {selected.estimated_hours && <Row label="Ore stimate" value={`${selected.estimated_hours}h`} />}
                  {selected.notes && <Row label="Note" value={selected.notes} multiline />}
                  {selected.qr_token && <Row label="QR token" value={selected.qr_token.slice(0, 12) + '…'} mono />}
                  {selected.check_in_at && <Row icon={CheckCircle} label="Check-in" value={new Date(selected.check_in_at).toLocaleString('it-IT')} />}
                  {selected.check_out_at && <Row icon={CheckCircle} label="Check-out" value={new Date(selected.check_out_at).toLocaleString('it-IT')} />}
                </div>

                {/* Audit */}
                <div className="text-xs text-text-muted space-y-1">
                  <div>Creato: {new Date(selected.created_at).toLocaleString('it-IT')}</div>
                  {selected.assigned_at && <div>Assegnato: {new Date(selected.assigned_at).toLocaleString('it-IT')}</div>}
                  {selected.cancelled_at && <div>Annullato: {new Date(selected.cancelled_at).toLocaleString('it-IT')}</div>}
                </div>

                {/* Azioni admin */}
                {(selected.status === 'open' || selected.status === 'assigned') && (
                  <button
                    onClick={() => void handleCancel(selected)}
                    disabled={pendingAction === selected.id}
                    className="w-full py-2.5 text-sm font-semibold text-[#F04545] rounded-xl flex items-center justify-center gap-2 border border-[rgba(240,69,69,0.4)] hover:bg-[rgba(240,69,69,0.08)] transition-all disabled:opacity-50"
                  >
                    <Ban className="w-4 h-4" />
                    {pendingAction === selected.id ? 'Annullamento…' : 'Annulla turno'}
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Row({
  icon: Icon,
  label,
  value,
  mono,
  multiline,
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
