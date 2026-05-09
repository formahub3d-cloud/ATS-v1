// AdminStructures — vista admin delle strutture cliente.
// Versione collegata a Supabase reale: fetch da `public.structures`, filtri
// per stato, azioni Approva/Rigetta che aggiornano lo stato DB.
//
// Quello che NON è ancora qui (e arriverà nelle fette successive):
// - tabs Turni/Fatture/Pagamenti/Penali del drawer dettaglio (servono le
//   tabelle relative, ancora non esistenti)
// - signed URL per le foto strutture (per ora non visualizziamo cover)

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, CheckCircle, X, Building2, MapPin, Mail,
  Phone, FileText, Hourglass, Ban, ShieldCheck, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastSystem'
import GlassTooltip from '@/components/ui/GlassTooltip'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Database, StructureStatus } from '@/lib/database.types'

type StructureRow = Database['public']['Tables']['structures']['Row']

const statusOptions: Array<{ value: StructureStatus | 'all'; label: string; color: string }> = [
  { value: 'all', label: 'Tutte', color: 'text-text-muted' },
  { value: 'pending_review', label: 'In attesa', color: 'text-[#F5B800]' },
  { value: 'approved', label: 'Approvate', color: 'text-[#1EC99A]' },
  { value: 'rejected', label: 'Respinte', color: 'text-[#F04545]' },
  { value: 'suspended', label: 'Sospese', color: 'text-[#F5B800]' },
]

const STATUS_META: Record<StructureStatus, { label: string; color: string; bg: string; border: string; icon: typeof Hourglass }> = {
  pending_review: { label: 'In attesa', color: '#F5B800', bg: 'rgba(245,184,0,0.12)', border: 'rgba(245,184,0,0.3)', icon: Hourglass },
  approved:       { label: 'Approvata', color: '#1EC99A', bg: 'rgba(30,201,154,0.12)', border: 'rgba(30,201,154,0.3)', icon: ShieldCheck },
  rejected:       { label: 'Respinta',  color: '#F04545', bg: 'rgba(240,69,69,0.12)',  border: 'rgba(240,69,69,0.3)',  icon: X },
  suspended:      { label: 'Sospesa',   color: '#F5B800', bg: 'rgba(245,184,0,0.12)',  border: 'rgba(245,184,0,0.3)',  icon: Ban },
}

function StatusBadge({ status }: { status: StructureStatus }) {
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

export default function AdminStructures() {
  const { addToast } = useToast()
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<StructureStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [structures, setStructures] = useState<StructureRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selected, setSelected] = useState<StructureRow | null>(null)
  const [pendingAction, setPendingAction] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const fetchStructures = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const { data, error } = await supabase
        .from('structures')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setStructures(data ?? [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto'
      console.error('[AdminStructures] fetch error', err)
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchStructures()
  }, [fetchStructures])

  // Filtraggio + ricerca client-side (i volumi sono ridotti per MVP).
  const filtered = useMemo(() => {
    return structures.filter((s) => {
      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      if (!matchStatus) return false
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        s.ragione_sociale.toLowerCase().includes(q) ||
        s.piva.toLowerCase().includes(q) ||
        (s.referente_email ?? '').toLowerCase().includes(q) ||
        (s.zona ?? '').toLowerCase().includes(q)
      )
    })
  }, [structures, statusFilter, searchQuery])

  const stats = useMemo(() => {
    const counts: Record<StructureStatus | 'all', number> = {
      all: structures.length,
      pending_review: 0,
      approved: 0,
      rejected: 0,
      suspended: 0,
    }
    for (const s of structures) counts[s.status]++
    return counts
  }, [structures])

  const handleApprove = async (s: StructureRow) => {
    if (!user) return
    setPendingAction({ id: s.id, type: 'approve' })
    try {
      const { error } = await supabase
        .from('structures')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        })
        .eq('id', s.id)
      if (error) throw error
      addToast({
        type: 'success',
        title: 'Struttura approvata',
        message: `${s.ragione_sociale} è ora attiva sulla piattaforma.`,
      })
      await fetchStructures()
      setSelected(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore approvazione'
      addToast({ type: 'error', title: 'Errore', message })
    } finally {
      setPendingAction(null)
    }
  }

  const handleReject = async () => {
    if (!selected || !rejectReason.trim()) {
      addToast({ type: 'warning', title: 'Motivo richiesto', message: 'Inserisci una motivazione del rifiuto.' })
      return
    }
    setPendingAction({ id: selected.id, type: 'reject' })
    try {
      const { error } = await supabase
        .from('structures')
        .update({ status: 'rejected', rejection_reason: rejectReason.trim() })
        .eq('id', selected.id)
      if (error) throw error
      addToast({
        type: 'success',
        title: 'Candidatura respinta',
        message: `${selected.ragione_sociale} è stata notificata del rifiuto.`,
      })
      await fetchStructures()
      setSelected(null)
      setRejectReason('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore rifiuto'
      addToast({ type: 'error', title: 'Errore', message })
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
        title="Gestione Strutture"
        subtitle={`${structures.length} struttur${structures.length === 1 ? 'a' : 'e'} totali`}
        actions={
          <button
            onClick={fetchStructures}
            disabled={loading}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-text-secondary border border-white/10 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {loading ? 'Aggiornamento...' : 'Aggiorna'}
          </button>
        }
      />

      {/* Stats pills */}
      <div className="flex flex-wrap gap-3">
        {statusOptions.map((opt, i) => {
          const isActive = statusFilter === opt.value
          const count = stats[opt.value]
          return (
            <motion.button
              key={opt.value}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 backdrop-blur-sm',
                isActive
                  ? 'bg-[rgba(91,184,245,0.1)] border-sky-primary text-sky-primary -translate-y-0.5 shadow-[0_0_20px_rgba(91,184,245,0.1)]'
                  : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/[0.07]',
              )}
            >
              {opt.label}: <span className={cn('font-semibold', isActive ? 'text-sky-primary' : opt.color)}>{count}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Search */}
      <div className="flex items-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 max-w-[420px]">
        <Search className="w-4 h-4 text-text-muted mr-2 flex-shrink-0" />
        <input
          type="text"
          placeholder="Cerca per nome, P.IVA, email, zona..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-sm text-white placeholder-text-muted outline-none flex-1"
        />
      </div>

      {/* Table */}
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
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              {structures.length === 0
                ? 'Nessuna struttura registrata sulla piattaforma.'
                : 'Nessuna struttura corrisponde ai filtri.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Struttura</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">P.IVA</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Tipo · Zona</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Referente</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Stato</th>
                  <th className="text-right px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Azioni</th>
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
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[rgba(91,184,245,0.12)] border border-[rgba(91,184,245,0.2)] flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-sky-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{s.ragione_sociale}</p>
                          <p className="text-xs text-text-muted truncate">{new Date(s.created_at).toLocaleDateString('it-IT')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm font-mono text-text-secondary">{s.piva}</td>
                    <td className="px-3 py-3 text-sm text-text-secondary">
                      <div>{s.tipo_struttura ?? '—'}</div>
                      {s.zona && (
                        <div className="text-xs text-text-muted flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {s.zona}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-text-secondary">
                      <div className="truncate max-w-[200px]">{s.referente_nome ?? '—'}</div>
                      {s.referente_email && (
                        <div className="text-xs text-text-muted truncate max-w-[200px]">{s.referente_email}</div>
                      )}
                    </td>
                    <td className="px-3 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {s.status === 'pending_review' && (
                          <>
                            <GlassTooltip content="Approva subito">
                              <button
                                onClick={(e) => { e.stopPropagation(); void handleApprove(s) }}
                                disabled={!!pendingAction}
                                className="p-1.5 rounded-lg text-[#1EC99A] hover:bg-[rgba(30,201,154,0.1)] transition-colors disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </GlassTooltip>
                            <GlassTooltip content="Apri per respingere">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelected(s) }}
                                className="p-1.5 rounded-lg text-[#F04545] hover:bg-[rgba(240,69,69,0.1)] transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </GlassTooltip>
                          </>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelected(s) }}
                          className="text-xs text-sky-primary hover:underline px-2"
                        >
                          Dettaglio
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Drawer dettaglio */}
      <AnimatePresence>
        {selected && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelected(null); setRejectReason('') }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[520px] bg-[#0D1E34] border-l border-[rgba(255,255,255,0.08)] z-50 overflow-y-auto"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0D1E34]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)]">
                <h2 className="text-lg font-semibold text-white truncate pr-3">{selected.ragione_sociale}</h2>
                <button
                  onClick={() => { setSelected(null); setRejectReason('') }}
                  className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status */}
                <div className="flex items-center gap-3">
                  <StatusBadge status={selected.status} />
                  {selected.status === 'rejected' && selected.rejection_reason && (
                    <span className="text-xs text-text-muted">— {selected.rejection_reason}</span>
                  )}
                </div>

                {/* Sezione: Identità */}
                <DetailSection title="Identità struttura">
                  <DetailRow label="Tipo" value={selected.tipo_struttura} />
                  <DetailRow label="Zona" value={selected.zona} />
                  <DetailRow label="Descrizione" value={selected.descrizione} multiline />
                </DetailSection>

                {/* Sezione: Dati aziendali */}
                <DetailSection title="Dati aziendali">
                  <DetailRow label="P.IVA" value={selected.piva} mono />
                  <DetailRow label="Codice fiscale" value={selected.codice_fiscale} mono />
                  <DetailRow label="Sede legale" value={selected.sede_legale} />
                  <DetailRow label="Sede operativa" value={selected.sede_operativa} />
                </DetailSection>

                {/* Sezione: Referente */}
                <DetailSection title="Referente">
                  <DetailRow label="Nome" value={selected.referente_nome} />
                  <DetailRow label="Ruolo" value={selected.referente_ruolo} />
                  <DetailRow label="Telefono" value={selected.referente_telefono} icon={Phone} />
                  <DetailRow label="Email" value={selected.referente_email} icon={Mail} />
                </DetailSection>

                {/* Sezione: Esigenze */}
                <DetailSection title="Esigenze operative">
                  <DetailRow label="Ruoli cercati" value={selected.ruoli_cercati.join(', ') || '—'} />
                  <DetailRow label="Persone per turno" value={selected.persone_per_turno?.toString() ?? null} />
                  <DetailRow label="Servizi aggiuntivi" value={selected.servizi_aggiuntivi.join(', ') || '—'} />
                </DetailSection>

                {/* Sezione: Pagamento */}
                <DetailSection title="Pagamento">
                  <DetailRow label="Metodo" value={selected.metodo_pagamento === 'carta' ? 'Carta di credito' : selected.metodo_pagamento === 'sepa' ? 'Addebito SEPA' : null} />
                  <DetailRow label="Contratto firmato" value={selected.accettato_contratto ? 'Sì' : 'No'} />
                  <DetailRow label="Data contratto" value={selected.accettato_contratto_at ? new Date(selected.accettato_contratto_at).toLocaleString('it-IT') : null} />
                </DetailSection>

                {/* Audit */}
                <DetailSection title="Audit">
                  <DetailRow label="Inviata il" value={new Date(selected.created_at).toLocaleString('it-IT')} />
                  {selected.approved_at && <DetailRow label="Approvata il" value={new Date(selected.approved_at).toLocaleString('it-IT')} />}
                </DetailSection>

                {/* Actions */}
                {selected.status === 'pending_review' && (
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => void handleApprove(selected)}
                      disabled={!!pendingAction}
                      className="w-full py-3 text-sm font-semibold text-text-inverse rounded-xl flex items-center justify-center gap-2 bg-[#1EC99A] hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {pendingAction?.type === 'approve' ? 'Approvazione…' : 'Approva struttura'}
                    </button>

                    <div className="space-y-2">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Motivazione del rifiuto (visibile alla struttura)..."
                        rows={3}
                        className="w-full px-3 py-2 text-sm bg-[rgba(13,30,52,0.5)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder-text-muted resize-none focus:border-[#F04545] outline-none"
                      />
                      <button
                        onClick={() => void handleReject()}
                        disabled={!!pendingAction || !rejectReason.trim()}
                        className="w-full py-2.5 text-sm font-semibold text-white rounded-xl flex items-center justify-center gap-2 border border-[rgba(240,69,69,0.4)] text-[#F04545] hover:bg-[rgba(240,69,69,0.08)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                        {pendingAction?.type === 'reject' ? 'Invio rifiuto…' : 'Respingi candidatura'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── helper UI ─── */

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-sky-primary uppercase tracking-wider mb-2">{title}</h3>
      <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,30,52,0.5)] divide-y divide-[rgba(255,255,255,0.04)]">
        {children}
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
  mono,
  multiline,
  icon: Icon,
}: {
  label: string
  value: string | null | undefined
  mono?: boolean
  multiline?: boolean
  icon?: typeof Mail
}) {
  return (
    <div className={cn('flex gap-3 px-3 py-2.5', multiline ? 'flex-col items-start' : 'items-center justify-between')}>
      <span className="text-xs text-text-muted flex items-center gap-1.5 flex-shrink-0">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </span>
      <span className={cn('text-sm text-white', mono && 'font-mono', multiline ? 'text-left whitespace-pre-line' : 'text-right truncate min-w-0')}>
        {value || <span className="text-text-muted">—</span>}
      </span>
    </div>
  )
}
