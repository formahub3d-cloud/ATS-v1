// AdminEmployees — vista admin dei dipendenti registrati.
// Versione collegata a Supabase: legge da `public.profiles` filtrando role='employee'
// e join opzionale con `public.employees` (anagrafica fiscale, contratto).
//
// Stato attuale: l'onboarding dipendente non è ancora wirato a DB (è la prossima
// fetta del piano), quindi la tabella sarà inizialmente vuota o quasi. La pagina
// è pronta a popolarsi non appena lo schema employees verrà usato dal wizard.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, AlertCircle, MapPin, Phone, Briefcase, Euro, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'
import Avatar from '@/components/Avatar'
import { supabase } from '@/lib/supabase'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { ContractType, EmployeeRankLevel } from '@/lib/database.types'

const LEVEL_COLOR: Record<EmployeeRankLevel, string> = {
  rookie: '#94A3B8',
  affidabile: '#5BB8F5',
  senior: '#3AA3E8',
  elite: '#1EC99A',
  ambassador: '#F5B800',
}

// Vista combinata: profile + employee row (profile è canonico, employee è opzionale
// per i dipendenti che non hanno ancora completato l'onboarding).
interface EmployeeRow {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  // Da public.employees:
  cf?: string | null
  iban?: string | null
  preferred_zone?: string | null
  skills?: unknown[]
  tag_valori?: string[]
  contract_type?: ContractType | null
  hourly_rate?: number | null
  active?: boolean
  onboarding_completed_at?: string | null
  // Da public.employee_total_points:
  total_points?: number
  level?: EmployeeRankLevel
}

export default function AdminEmployees() {
  usePageTitle('Dipendenti')
  const [employees, setEmployees] = useState<EmployeeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      // Fetch combinato: profili employee + employees row in parallelo, poi join
      // client-side. Più semplice e performante dei nested embed di postgrest
      // su tabelle che a volte non hanno la riga employees (signUp ma onboarding
      // non completato).
      const [{ data: profiles, error: pErr }, { data: emps, error: eErr }, { data: pointsRows, error: ptErr }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, phone, avatar_url, created_at')
          .eq('role', 'employee')
          .order('created_at', { ascending: false }),
        supabase
          .from('employees')
          .select('id, cf, iban, preferred_zone, skills, tag_valori, contract_type, hourly_rate, active, onboarding_completed_at'),
        supabase.from('employee_total_points').select('employee_id, total_points, level'),
      ])
      if (pErr) throw pErr
      if (eErr) throw eErr
      if (ptErr) throw ptErr

      const empById = new Map((emps ?? []).map((e) => [e.id, e]))
      const ptsById = new Map((pointsRows ?? []).map((p) => [p.employee_id, p]))
      const merged: EmployeeRow[] = (profiles ?? []).map((p) => {
        const pts = ptsById.get(p.id)
        return {
          ...p,
          ...(empById.get(p.id) ?? {}),
          total_points: pts?.total_points,
          level: pts?.level,
        }
      })
      setEmployees(merged)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore caricamento dipendenti'
      console.error('[AdminEmployees] fetch error', err)
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    if (!searchQuery) return employees
    const q = searchQuery.toLowerCase()
    return employees.filter((e) =>
      (e.full_name ?? '').toLowerCase().includes(q) ||
      (e.phone ?? '').includes(q) ||
      (e.cf ?? '').toLowerCase().includes(q) ||
      (e.preferred_zone ?? '').toLowerCase().includes(q),
    )
  }, [employees, searchQuery])

  // Stats rapide per le pillole.
  const stats = useMemo(() => {
    let onboardingCompleted = 0
    let pending = 0
    for (const e of employees) {
      if (e.onboarding_completed_at) onboardingCompleted++
      else pending++
    }
    return { onboardingCompleted, pending, total: employees.length }
  }, [employees])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Gestione Dipendenti"
        subtitle={`${employees.length} dipendent${employees.length === 1 ? 'e' : 'i'} registrat${employees.length === 1 ? 'o' : 'i'}`}
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

      {fetchError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(240,69,69,0.08)] border border-[rgba(240,69,69,0.2)] text-sm text-[#F04545]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Stats pills */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-text-secondary">
          Tutti: <span className="text-white font-semibold">{stats.total}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgba(30,201,154,0.2)] bg-[rgba(30,201,154,0.06)] text-sm text-text-secondary">
          Onboarding completato: <span className="text-[#1EC99A] font-semibold">{stats.onboardingCompleted}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgba(245,184,0,0.2)] bg-[rgba(245,184,0,0.06)] text-sm text-text-secondary">
          In sospeso: <span className="text-[#F5B800] font-semibold">{stats.pending}</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 max-w-[420px]">
        <Search className="w-4 h-4 text-text-muted mr-2 flex-shrink-0" />
        <input
          type="text"
          placeholder="Cerca per nome, CF, telefono o zona..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-sm text-white placeholder-text-muted outline-none flex-1"
        />
      </div>

      <GlassCard>
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-28 ml-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-text-muted">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              {employees.length === 0
                ? 'Nessun dipendente ancora registrato.'
                : 'Nessun dipendente corrisponde alla ricerca.'}
            </p>
            {employees.length === 0 && (
              <p className="text-xs mt-2 opacity-70">
                I dipendenti compariranno qui non appena completeranno l'onboarding di registrazione.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Dipendente</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">CF</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Skills · Zona</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Contratto</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Rank</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Stato</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => {
                  const onboardingDone = !!e.onboarding_completed_at
                  const skills = (e.skills as string[]) ?? []
                  return (
                    <motion.tr
                      key={e.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(91,184,245,0.04)] transition-colors"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={e.avatar_url ?? undefined}
                            alt={e.full_name ?? 'Dipendente'}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{e.full_name ?? '—'}</p>
                            {e.phone && (
                              <p className="text-xs text-text-muted flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {e.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs font-mono text-text-secondary">{e.cf ?? '—'}</td>
                      <td className="px-3 py-3 text-sm text-text-secondary">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Briefcase className="w-3 h-3 text-text-muted" />
                          {skills.length > 0 ? skills.slice(0, 2).join(', ') + (skills.length > 2 ? '...' : '') : '—'}
                        </div>
                        {e.preferred_zone && (
                          <div className="text-xs text-text-muted flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" /> {e.preferred_zone}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm">
                        {e.contract_type ? (
                          <span className="text-xs text-white">{e.contract_type.replace(/_/g, ' ')}</span>
                        ) : (
                          <span className="text-xs text-text-muted">non assegnato</span>
                        )}
                        {e.hourly_rate && (
                          <div className="text-xs text-[#1EC99A] flex items-center gap-1 font-mono">
                            <Euro className="w-3 h-3" /> {e.hourly_rate}/h
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {e.level && e.total_points !== undefined ? (
                          <div>
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider"
                              style={{
                                color: LEVEL_COLOR[e.level],
                                backgroundColor: `${LEVEL_COLOR[e.level]}15`,
                                border: `1px solid ${LEVEL_COLOR[e.level]}30`,
                              }}
                            >
                              <Trophy className="w-3 h-3" />
                              {e.level}
                            </span>
                            <div className="text-[10px] text-text-muted font-mono mt-0.5">{e.total_points} pt</div>
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {onboardingDone ? (
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[rgba(30,201,154,0.12)] text-[#1EC99A] border border-[rgba(30,201,154,0.25)]">
                            Pronto
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[rgba(245,184,0,0.12)] text-[#F5B800] border border-[rgba(245,184,0,0.25)]">
                            Onboarding incompleto
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}
