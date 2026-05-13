// AdminLeaderboard — top dipendenti per punti.
// Vista hall-of-fame: top 3 sul podio + classifica completa sotto.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Crown, AlertCircle, RefreshCw, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'
import Avatar from '@/components/Avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { EmployeeRankLevel } from '@/lib/database.types'

interface Entry {
  employee_id: string
  full_name: string
  avatar_url: string | null
  total_points: number
  level: EmployeeRankLevel
  rank: number
}

const LEVEL_COLOR: Record<EmployeeRankLevel, string> = {
  rookie: '#94A3B8',
  affidabile: '#5BB8F5',
  senior: '#3AA3E8',
  elite: '#1EC99A',
  ambassador: '#F5B800',
}

const PODIUM_HEIGHT = ['200px', '160px', '130px']
const PODIUM_COLORS = ['#F5B800', '#94A3B8', '#CD7F32']
const PODIUM_ICONS = [Crown, Medal, Trophy]

export default function AdminLeaderboard() {
  usePageTitle('Leaderboard')
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      // Tutti i dipendenti con punti, ordinati desc per punti.
      const [{ data: pts, error: pErr }, { data: profs, error: prErr }] = await Promise.all([
        supabase.from('employee_total_points').select('employee_id, total_points, level')
          .order('total_points', { ascending: false }).limit(50),
        supabase.from('profiles').select('id, full_name, avatar_url').eq('role', 'employee'),
      ])
      if (pErr) throw pErr
      if (prErr) throw prErr

      const profById = new Map((profs ?? []).map((p) => [p.id, p]))
      const ranked: Entry[] = (pts ?? [])
        .filter((p) => profById.has(p.employee_id))
        .map((p, i) => ({
          employee_id: p.employee_id,
          full_name: profById.get(p.employee_id)?.full_name ?? '—',
          avatar_url: profById.get(p.employee_id)?.avatar_url ?? null,
          total_points: p.total_points,
          level: p.level,
          rank: i + 1,
        }))
      setEntries(ranked)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore'
      console.error('[AdminLeaderboard] fetch error', err)
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const top3 = useMemo(() => entries.slice(0, 3), [entries])
  const rest = useMemo(() => entries.slice(3), [entries])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-60 rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[0,1,2].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
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
        title="Leaderboard"
        subtitle="Hall of fame dei migliori dipendenti per punti accumulati."
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

      {fetchError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(240,69,69,0.08)] border border-[rgba(240,69,69,0.2)] text-sm text-[#F04545]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {fetchError}
        </div>
      )}

      {entries.length === 0 ? (
        <GlassCard>
          <div className="py-12 text-center text-text-muted">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nessun dipendente ancora con punti.</p>
            <p className="text-xs mt-1 opacity-70">I punti vengono assegnati automaticamente per turni completati, recensioni 4-5★, documenti verificati.</p>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Podio top 3 */}
          {top3.length > 0 && (
            <section className="grid grid-cols-3 gap-3 items-end">
              {/* Riordino visivo: 2nd, 1st (più alto), 3rd */}
              {[1, 0, 2].map((origIdx) => {
                const e = top3[origIdx]
                if (!e) return <div key={`empty-${origIdx}`} />
                const Icon = PODIUM_ICONS[origIdx]
                const color = PODIUM_COLORS[origIdx]
                const height = PODIUM_HEIGHT[origIdx]
                return (
                  <motion.div
                    key={e.employee_id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: origIdx * 0.15, duration: 0.4 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative mb-3">
                      <Avatar
                        src={e.avatar_url ?? undefined}
                        alt={e.full_name}
                        size={origIdx === 0 ? 80 : 64}
                        borderColor={color}
                      />
                      <div
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: color, boxShadow: `0 0 16px ${color}80` }}
                      >
                        <Icon className="w-4 h-4 text-[#06101E]" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-white text-center truncate max-w-full px-2">{e.full_name}</p>
                    <p className="text-xs text-text-muted mb-2">{e.total_points} pt</p>
                    <div
                      className="w-full rounded-t-2xl flex items-start justify-center pt-3 font-playfair font-bold text-2xl"
                      style={{
                        height,
                        background: `linear-gradient(to top, ${color}40, ${color}10)`,
                        borderTop: `2px solid ${color}`,
                        color,
                      }}
                    >
                      #{origIdx + 1}
                    </div>
                  </motion.div>
                )
              })}
            </section>
          )}

          {/* Resto della classifica */}
          {rest.length > 0 && (
            <GlassCard>
              <h2 className="text-base font-semibold text-white mb-3">Classifica completa</h2>
              <ul className="divide-y divide-[rgba(255,255,255,0.04)]">
                {rest.map((e) => (
                  <li key={e.employee_id} className="flex items-center gap-3 py-3">
                    <span className="w-8 text-sm font-mono text-text-muted text-center">#{e.rank}</span>
                    <Avatar src={e.avatar_url ?? undefined} alt={e.full_name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{e.full_name}</p>
                      <span
                        className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5"
                        style={{
                          color: LEVEL_COLOR[e.level],
                          backgroundColor: `${LEVEL_COLOR[e.level]}15`,
                          border: `1px solid ${LEVEL_COLOR[e.level]}30`,
                        }}
                      >
                        {e.level}
                      </span>
                    </div>
                    <span className={cn('text-sm font-bold font-mono', e.total_points > 0 ? 'text-[#1EC99A]' : 'text-text-muted')}>
                      {e.total_points} pt
                    </span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}
        </>
      )}
    </motion.div>
  )
}
