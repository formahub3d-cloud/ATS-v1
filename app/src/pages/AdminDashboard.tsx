// AdminDashboard — pagina di overview per gli admin ATS.
// Versione collegata a Supabase: KPI reali su strutture/dipendenti, lista
// candidature pending. Le aree non ancora supportate dal DB (turni, matching,
// pagamenti) mostrano placeholder onesti "Nessun dato ancora".

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Building2, Users, Hourglass, ShieldCheck, Calendar, CreditCard,
  HeartHandshake, ChevronRight, Bell, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'
import NotificationsBell from '@/components/notifications/NotificationsBell'
import { supabase } from '@/lib/supabase'
import type { Database, StructureStatus } from '@/lib/database.types'

type StructureRow = Database['public']['Tables']['structures']['Row']

interface DashboardStats {
  structuresTotal: number
  structuresPending: number
  structuresApproved: number
  employeesTotal: number
  recentPending: StructureRow[]
}

const initialStats: DashboardStats = {
  structuresTotal: 0,
  structuresPending: 0,
  structuresApproved: 0,
  employeesTotal: 0,
  recentPending: [],
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      // Eseguo le query in parallelo: 4 conteggi + 1 select leggera per le pending recenti.
      const [
        { count: structuresTotal, error: e1 },
        { count: structuresPending, error: e2 },
        { count: structuresApproved, error: e3 },
        { count: employeesTotal, error: e4 },
        { data: recentPending, error: e5 },
      ] = await Promise.all([
        supabase.from('structures').select('*', { count: 'exact', head: true }),
        supabase.from('structures').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
        supabase.from('structures').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employee'),
        supabase.from('structures').select('*').eq('status', 'pending_review').order('created_at', { ascending: false }).limit(5),
      ])

      const firstError = e1 || e2 || e3 || e4 || e5
      if (firstError) throw firstError

      setStats({
        structuresTotal: structuresTotal ?? 0,
        structuresPending: structuresPending ?? 0,
        structuresApproved: structuresApproved ?? 0,
        employeesTotal: employeesTotal ?? 0,
        recentPending: recentPending ?? [],
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

      {/* KPI grid */}
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

      {/* Coming soon — sezioni future */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ComingSoonCard
          title="Turni & matching"
          description="Lista turni attivi, matching automatico e assegnazioni manuali."
          icon={HeartHandshake}
          color="#5BB8F5"
        />
        <ComingSoonCard
          title="Pagamenti"
          description="Addebiti strutture, bonifici dipendenti, fatture e penali."
          icon={CreditCard}
          color="#1EC99A"
        />
        <ComingSoonCard
          title="Calendario"
          description="Vista settimanale di tutti i turni pianificati per struttura e zona."
          icon={Calendar}
          color="#F5B800"
        />
      </section>
    </motion.div>
  )
}

function ComingSoonCard({
  title,
  description,
  icon: Icon,
  color,
}: {
  title: string
  description: string
  icon: typeof Bell
  color: string
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
