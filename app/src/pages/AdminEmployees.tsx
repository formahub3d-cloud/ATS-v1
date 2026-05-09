// AdminEmployees — vista admin dei dipendenti registrati.
// Versione collegata a Supabase: legge da `public.profiles` filtrando role='employee'
// e join opzionale con `public.employees` (anagrafica fiscale, contratto).
//
// Stato attuale: l'onboarding dipendente non è ancora wirato a DB (è la prossima
// fetta del piano), quindi la tabella sarà inizialmente vuota o quasi. La pagina
// è pronta a popolarsi non appena lo schema employees verrà usato dal wizard.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, Mail, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'
import Avatar from '@/components/Avatar'
import { supabase } from '@/lib/supabase'

interface EmployeeRow {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  email?: string | null
}

export default function AdminEmployees() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url, created_at')
        .eq('role', 'employee')
        .order('created_at', { ascending: false })
      if (error) throw error
      setEmployees(data ?? [])
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
      (e.phone ?? '').includes(q),
    )
  }, [employees, searchQuery])

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

      {/* Search */}
      <div className="flex items-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 max-w-[420px]">
        <Search className="w-4 h-4 text-text-muted mr-2 flex-shrink-0" />
        <input
          type="text"
          placeholder="Cerca per nome o telefono..."
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
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Telefono</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Registrato il</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
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
                        <span className="text-sm font-medium text-white">{e.full_name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm font-mono text-text-secondary">{e.phone ?? '—'}</td>
                    <td className="px-3 py-3 text-sm text-text-muted">
                      {new Date(e.created_at).toLocaleDateString('it-IT')}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}
