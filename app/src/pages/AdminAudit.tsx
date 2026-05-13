// AdminAudit — pagina di sicurezza/compliance: visualizza il log degli
// eventi critici (solo admin via RLS). Filtri per tipo evento + ricerca.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck, Search, AlertCircle, Building2, Calendar, FileText,
  User as UserIcon, Trophy, RefreshCw, Activity, Ban, X, CheckCircle, UserX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { supabase } from '@/lib/supabase'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useLastUpdated } from '@/hooks/useLastUpdated'
import type { Database, AuditEventType } from '@/lib/database.types'

type AuditRow = Database['public']['Tables']['audit_log']['Row']

interface AuditWithActor extends AuditRow {
  actor_name?: string | null
}

const EVENT_META: Record<AuditEventType, { label: string; icon: typeof ShieldCheck; color: string }> = {
  structure_approved:    { label: 'Struttura approvata',     icon: CheckCircle, color: '#1EC99A' },
  structure_rejected:    { label: 'Struttura respinta',      icon: X,           color: '#F04545' },
  structure_suspended:   { label: 'Struttura sospesa',       icon: Ban,         color: '#F5B800' },
  shift_assigned:        { label: 'Turno assegnato',         icon: Calendar,    color: '#5BB8F5' },
  shift_cancelled:       { label: 'Turno annullato',         icon: Ban,         color: '#94A3B8' },
  shift_completed:       { label: 'Turno completato',        icon: CheckCircle, color: '#1EC99A' },
  shift_no_show:         { label: 'Turno no-show',           icon: UserX,       color: '#F04545' },
  document_verified:     { label: 'Documento verificato',    icon: FileText,    color: '#3AA3E8' },
  document_deleted:      { label: 'Documento cancellato',    icon: FileText,    color: '#F04545' },
  employee_activated:    { label: 'Dipendente attivato',     icon: UserIcon,    color: '#1EC99A' },
  employee_deactivated:  { label: 'Dipendente disattivato',  icon: UserX,       color: '#F5B800' },
  role_changed:          { label: 'Cambio ruolo',            icon: ShieldCheck, color: '#3AA3E8' },
  points_adjusted:       { label: 'Punti aggiustati',        icon: Trophy,      color: '#F5B800' },
}

const FILTER_OPTIONS: Array<{ value: AuditEventType | 'all'; label: string }> = [
  { value: 'all', label: 'Tutti' },
  { value: 'structure_approved', label: 'Approvazioni' },
  { value: 'structure_rejected', label: 'Rifiuti' },
  { value: 'shift_assigned', label: 'Assegnazioni turni' },
  { value: 'shift_cancelled', label: 'Cancellazioni' },
  { value: 'document_verified', label: 'Verifiche doc' },
  { value: 'role_changed', label: 'Ruoli' },
]

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'ora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m fa`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h fa`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}g fa`
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminAudit() {
  usePageTitle('Audit log')
  const [logs, setLogs] = useState<AuditWithActor[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [filter, setFilter] = useState<AuditEventType | 'all'>('all')
  const { label: updatedLabel } = useLastUpdated(loading)
  const [searchQuery, setSearchQuery] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      // Ultimi 200 eventi.
      const { data: rawLogs, error } = await supabase
        .from('audit_log').select('*')
        .order('created_at', { ascending: false }).limit(200)
      if (error) throw error

      // Lookup nomi attori.
      const actorIds = Array.from(new Set((rawLogs ?? []).map((l) => l.actor_id).filter((x): x is string => !!x)))
      const profMap = new Map<string, string>()
      if (actorIds.length > 0) {
        const { data: profs } = await supabase.from('profiles').select('id, full_name').in('id', actorIds)
        for (const p of profs ?? []) profMap.set(p.id, p.full_name ?? '—')
      }

      setLogs((rawLogs ?? []).map((l) => ({ ...l, actor_name: l.actor_id ? profMap.get(l.actor_id) ?? null : null })))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore caricamento log'
      console.error('[AdminAudit] fetch error', err)
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (filter !== 'all' && l.event_type !== filter) return false
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        l.event_type.toLowerCase().includes(q) ||
        (l.actor_name ?? '').toLowerCase().includes(q) ||
        JSON.stringify(l.metadata ?? {}).toLowerCase().includes(q)
      )
    })
  }, [logs, filter, searchQuery])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Audit log"
        subtitle={`${logs.length} event${logs.length === 1 ? 'o' : 'i'} (ultimi 200) — solo admin.`}
        actions={
          <>
            {updatedLabel && (
              <span className="hidden sm:inline text-xs text-text-muted font-mono">
                Aggiornato {updatedLabel}
              </span>
            )}
            <button
              onClick={load}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Aggiorna"
            >
              <RefreshCw className={cn('w-5 h-5', loading && 'animate-spin')} />
            </button>
          </>
        }
      />

      {fetchError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(240,69,69,0.08)] border border-[rgba(240,69,69,0.2)] text-sm text-[#F04545]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Filtro pillole */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
              filter === opt.value
                ? 'bg-[rgba(91,184,245,0.15)] border-sky-primary text-sky-primary'
                : 'bg-white/[0.03] border-white/10 text-text-secondary hover:bg-white/[0.06]',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 max-w-[420px]">
        <Search className="w-4 h-4 text-text-muted mr-2 flex-shrink-0" />
        <input
          type="text"
          placeholder="Cerca per attore, evento, metadata..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-sm text-white placeholder-text-muted outline-none flex-1"
        />
      </div>

      {/* Lista */}
      <GlassCard>
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="h-4 w-60" />
                <Skeleton className="h-4 w-20 ml-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Activity}
            title={logs.length === 0 ? 'Nessun evento registrato' : 'Nessun evento corrisponde ai filtri'}
            description={
              logs.length === 0
                ? 'L\'audit log si popola automaticamente quando avvengono azioni amministrative (approvazioni, assegnazioni, rifiuti, ecc).'
                : 'Modifica i filtri o la ricerca per vedere altri eventi.'
            }
          />
        ) : (
          <ul className="divide-y divide-[rgba(255,255,255,0.04)]">
            {filtered.map((l) => {
              const meta = EVENT_META[l.event_type]
              const Icon = meta.icon
              return (
                <li key={l.id} className="py-3 flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium">{meta.label}</span>
                      {l.target_type && (
                        <span className="text-xs text-text-muted"> · {l.target_type}</span>
                      )}
                    </p>
                    <p className="text-xs text-text-muted">
                      {l.actor_name ? `da ${l.actor_name}` : 'sistema'}
                      {l.metadata && (
                        <>
                          {' · '}
                          <code className="text-[10px] text-sky-primary/70 font-mono break-all">
                            {Object.entries(l.metadata)
                              .filter(([k, v]) => k !== 'full_name' && v !== null)
                              .slice(0, 3)
                              .map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`)
                              .join(' ')}
                          </code>
                        </>
                      )}
                    </p>
                  </div>
                  <span className="text-[10px] text-text-muted font-mono flex-shrink-0">{timeAgo(l.created_at)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </GlassCard>
    </motion.div>
  )
}
