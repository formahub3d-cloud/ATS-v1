// AdminDashboard — pagina di overview per gli admin ATS.
// Versione collegata a Supabase: KPI reali su strutture/dipendenti, lista
// candidature pending. Le aree non ancora supportate dal DB (turni, matching,
// pagamenti) mostrano placeholder onesti "Nessun dato ancora".

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Building2, Users, Hourglass, ShieldCheck, CheckCircle,
  ChevronRight, AlertCircle, FileWarning, Inbox, Clock, Activity,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'
import NotificationsBell from '@/components/notifications/NotificationsBell'
import { supabase } from '@/lib/supabase'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useLastUpdated } from '@/hooks/useLastUpdated'
import type { Database, StructureStatus } from '@/lib/database.types'

type StructureRow = Database['public']['Tables']['structures']['Row']
type AuditRow = Database['public']['Tables']['audit_log']['Row']

interface DashboardStats {
  structuresTotal: number
  structuresPending: number
  structuresApproved: number
  employeesTotal: number
  docsExpiring: number          // documenti che scadono entro 30 giorni
  docsExpired: number           // documenti già scaduti
  // Operatività mese in corso
  shiftsCompletedMonth: number
  hoursWorkedMonth: number
  messagesUnhandled: number     // contact_messages con status new o in_progress
  recentPending: StructureRow[]
  recentActivity: AuditRow[]
}

const initialStats: DashboardStats = {
  structuresTotal: 0,
  structuresPending: 0,
  structuresApproved: 0,
  employeesTotal: 0,
  docsExpiring: 0,
  docsExpired: 0,
  shiftsCompletedMonth: 0,
  hoursWorkedMonth: 0,
  messagesUnhandled: 0,
  recentPending: [],
  recentActivity: [],
}

export default function AdminDashboard() {
  usePageTitle('Dashboard')
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const { label: updatedLabel } = useLastUpdated(loading)

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const in30 = new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10)
      // Inizio mese corrente per contare turni/ore del mese.
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      const monthStartIso = monthStart.toISOString().slice(0, 10)

      // 11 query in parallelo. Più del doppio di prima ma comunque sotto i 200ms
      // su Supabase regional (single roundtrip multiplexato).
      const [
        { count: structuresTotal, error: e1 },
        { count: structuresPending, error: e2 },
        { count: structuresApproved, error: e3 },
        { count: employeesTotal, error: e4 },
        { data: recentPending, error: e5 },
        { count: docsExpiring, error: e6 },
        { count: docsExpired, error: e7 },
        { data: shiftsMonth, error: e8 },
        { count: messagesUnhandled, error: e9 },
        { data: recentActivity, error: e10 },
      ] = await Promise.all([
        supabase.from('structures').select('*', { count: 'exact', head: true }),
        supabase.from('structures').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
        supabase.from('structures').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employee'),
        supabase.from('structures').select('*').eq('status', 'pending_review').order('created_at', { ascending: false }).limit(5),
        supabase.from('documents').select('*', { count: 'exact', head: true })
          .gte('expires_at', today).lte('expires_at', in30),
        supabase.from('documents').select('*', { count: 'exact', head: true })
          .lt('expires_at', today),
        // Turni completati del mese: prendiamo estimated_hours per somma ore.
        supabase.from('shifts').select('estimated_hours').eq('status', 'completed').gte('shift_date', monthStartIso),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).in('status', ['new', 'in_progress']),
        supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(6),
      ])

      const firstError = e1 || e2 || e3 || e4 || e5 || e6 || e7 || e8 || e9 || e10
      if (firstError) throw firstError

      const shiftsCompletedMonth = shiftsMonth?.length ?? 0
      const hoursWorkedMonth = (shiftsMonth ?? []).reduce(
        (sum, s) => sum + Number(s.estimated_hours ?? 0),
        0,
      )

      setStats({
        structuresTotal: structuresTotal ?? 0,
        structuresPending: structuresPending ?? 0,
        structuresApproved: structuresApproved ?? 0,
        employeesTotal: employeesTotal ?? 0,
        docsExpiring: docsExpiring ?? 0,
        docsExpired: docsExpired ?? 0,
        shiftsCompletedMonth,
        hoursWorkedMonth,
        messagesUnhandled: messagesUnhandled ?? 0,
        recentPending: recentPending ?? [],
        recentActivity: recentActivity ?? [],
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore caricamento dashboard'
      console.error('[AdminDashboard] fetch error', err)
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const kpis = useMemo(
    () => [
      {
        label: 'Strutture totali',
        value: stats.structuresTotal,
        icon: Building2,
        color: '#5BB8F5',
        link: '/admin/structures',
      },
      {
        label: 'In attesa di approvazione',
        value: stats.structuresPending,
        icon: Hourglass,
        color: '#F5B800',
        link: '/admin/structures',
        urgent: stats.structuresPending > 0,
      },
      {
        label: 'Strutture attive',
        value: stats.structuresApproved,
        icon: ShieldCheck,
        color: '#1EC99A',
        link: '/admin/structures',
      },
      {
        label: 'Dipendenti registrati',
        value: stats.employeesTotal,
        icon: Users,
        color: '#3AA3E8',
        link: '/admin/employees',
      },
      {
        label: 'Turni completati (mese)',
        value: stats.shiftsCompletedMonth,
        icon: CheckCircle,
        color: '#1EC99A',
        link: '/admin/shifts',
      },
      {
        label: 'Ore lavorate (mese)',
        value: Math.round(stats.hoursWorkedMonth),
        icon: Clock,
        color: '#5BB8F5',
        link: '/admin/payroll',
      },
      {
        label: 'Messaggi non gestiti',
        value: stats.messagesUnhandled,
        icon: Inbox,
        color: '#F5B800',
        link: '/admin/messages',
        urgent: stats.messagesUnhandled > 0,
      },
    ],
    [stats],
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        actions={
          <>
            <NotificationsBell />
            {updatedLabel && (
              <span className="hidden sm:inline text-xs text-text-muted font-mono">
                Aggiornato {updatedLabel}
              </span>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-text-secondary border border-white/10 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              {loading ? 'Aggiornamento...' : 'Aggiorna'}
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

      {/* Banner messaggi non gestiti */}
      {stats.messagesUnhandled > 0 && (
        <Link
          to="/admin/messages"
          className="flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-md transition-all hover:translate-y-[-1px] border-[rgba(245,184,0,0.3)] bg-[rgba(245,184,0,0.06)]"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: 'rgba(245,184,0,0.15)',
              border: '1px solid rgba(245,184,0,0.3)',
            }}
          >
            <MessageSquare className="w-5 h-5 text-[#F5B800]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              {stats.messagesUnhandled} messagg{stats.messagesUnhandled === 1 ? 'io' : 'i'} dal sito da gestire
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Apri /admin/messages per leggere e rispondere.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
        </Link>
      )}

      {/* Banner alert documenti scaduti / in scadenza */}
      {(stats.docsExpired > 0 || stats.docsExpiring > 0) && (
        <Link
          to="/admin/employees"
          className={cn(
            'flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-md transition-all hover:translate-y-[-1px]',
            stats.docsExpired > 0
              ? 'border-[rgba(240,69,69,0.3)] bg-[rgba(240,69,69,0.06)]'
              : 'border-[rgba(245,184,0,0.3)] bg-[rgba(245,184,0,0.06)]',
          )}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: stats.docsExpired > 0 ? 'rgba(240,69,69,0.15)' : 'rgba(245,184,0,0.15)',
              border: `1px solid ${stats.docsExpired > 0 ? 'rgba(240,69,69,0.3)' : 'rgba(245,184,0,0.3)'}`,
            }}
          >
            <FileWarning className={cn('w-5 h-5', stats.docsExpired > 0 ? 'text-[#F04545]' : 'text-[#F5B800]')} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Documenti dipendenti — attenzione</p>
            <p className="text-xs text-text-muted mt-0.5">
              {stats.docsExpired > 0 && (
                <span className="text-[#F04545] font-medium">{stats.docsExpired} scadut{stats.docsExpired === 1 ? 'o' : 'i'}</span>
              )}
              {stats.docsExpired > 0 && stats.docsExpiring > 0 && <span> · </span>}
              {stats.docsExpiring > 0 && (
                <span className="text-[#F5B800] font-medium">{stats.docsExpiring} in scadenza nei prossimi 30 giorni</span>
              )}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
        </Link>
      )}

      {/* KPI grid — 4-col su desktop wide, 7 KPI = 4 + 3 nella seconda riga */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <Link
              key={kpi.label}
              to={kpi.link}
              className="block group"
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className={cn(
                  'h-full rounded-2xl p-5 backdrop-blur-md bg-white/5 border border-white/10',
                  'transition-all duration-200 group-hover:-translate-y-0.5 group-hover:bg-white/[0.07]',
                  kpi.urgent && 'border-[rgba(245,184,0,0.4)] shadow-[0_0_20px_rgba(245,184,0,0.15)]',
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-text-muted">{kpi.label}</span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${kpi.color}18`, border: `1px solid ${kpi.color}30` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                  </div>
                </div>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="font-playfair text-[36px] font-bold text-white leading-none">{kpi.value}</p>
                )}
              </motion.div>
            </Link>
          )
        })}
      </section>

      {/* Pending review queue */}
      <GlassCard delay={0.2}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Candidature in revisione</h2>
            <p className="text-xs text-text-muted mt-0.5">
              {stats.structuresPending === 0
                ? 'Nessuna candidatura in attesa.'
                : `${stats.structuresPending} struttur${stats.structuresPending === 1 ? 'a' : 'e'} in attesa di approvazione.`}
            </p>
          </div>
          {stats.structuresPending > 0 && (
            <Link
              to="/admin/structures"
              className="text-sm text-sky-primary hover:underline flex items-center gap-1 group"
            >
              Vedi tutte <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24 ml-auto" />
              </div>
            ))}
          </div>
        ) : stats.recentPending.length === 0 ? (
          <div className="py-8 text-center text-sm text-text-muted">
            <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
            Nessuna candidatura da rivedere. ✨
          </div>
        ) : (
          <ul className="divide-y divide-[rgba(255,255,255,0.04)]">
            {stats.recentPending.map((s) => (
              <li key={s.id}>
                <Link
                  to="/admin/structures"
                  className="flex items-center gap-3 py-3 hover:bg-[rgba(91,184,245,0.04)] -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[rgba(91,184,245,0.12)] border border-[rgba(91,184,245,0.2)] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-sky-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{s.ragione_sociale}</p>
                    <p className="text-xs text-text-muted truncate">
                      {s.tipo_struttura ?? '—'} · {s.zona ?? '—'} · {new Date(s.created_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      {/* Activity feed — ultimi eventi dall'audit_log per dare polso operativo */}
      <GlassCard delay={0.3}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-primary" />
            <h2 className="text-lg font-semibold text-white">Attività recente</h2>
          </div>
          <Link
            to="/admin/audit"
            className="text-sm text-sky-primary hover:underline flex items-center gap-1 group"
          >
            Vedi tutto <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-3 w-12 ml-auto" />
              </div>
            ))}
          </div>
        ) : stats.recentActivity.length === 0 ? (
          <div className="py-8 text-center text-sm text-text-muted">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
            Nessun evento ancora.
          </div>
        ) : (
          <ul className="divide-y divide-[rgba(255,255,255,0.04)]">
            {stats.recentActivity.map((a) => (
              <li key={a.id} className="flex items-start gap-3 py-2.5">
                <div className="w-8 h-8 rounded-lg bg-[rgba(91,184,245,0.1)] border border-[rgba(91,184,245,0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity className="w-3.5 h-3.5 text-sky-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    {humanizeAuditEvent(a.event_type)}
                    {a.target_type && (
                      <span className="text-xs text-text-muted"> · {a.target_type}</span>
                    )}
                  </p>
                </div>
                <span className="text-[10px] text-text-muted font-mono flex-shrink-0 mt-1">
                  {timeAgo(a.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </motion.div>
  )
}

// Mappa event_type SQL → testo italiano leggibile.
function humanizeAuditEvent(t: string): string {
  const map: Record<string, string> = {
    structure_approved:    'Struttura approvata',
    structure_rejected:    'Struttura respinta',
    structure_suspended:   'Struttura sospesa',
    shift_assigned:        'Turno assegnato',
    shift_cancelled:       'Turno annullato',
    shift_completed:       'Turno completato',
    shift_no_show:         'Turno no-show',
    document_verified:     'Documento verificato',
    document_deleted:      'Documento cancellato',
    employee_activated:    'Dipendente attivato',
    employee_deactivated:  'Dipendente disattivato',
    role_changed:          'Cambio ruolo',
    points_adjusted:       'Punti aggiustati',
  }
  return map[t] ?? t
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'ora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m fa`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h fa`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}g fa`
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
}
