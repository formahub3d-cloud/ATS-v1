// AdminInvoices — gestione fatturazione mensile.
// L'admin sceglie il mese, clicca "Genera fatture" → la RPC aggrega i turni
// completed di tutte le strutture e crea/aggiorna le righe `invoices`.
// Per ogni fattura può cambiare manualmente lo stato (sent/paid/overdue/void)
// in attesa dell'integrazione Stripe.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Calendar, AlertCircle, RefreshCw, CheckCircle, Send, X,
  Building2, Euro, Clock, Sparkles, Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/ToastSystem'
import { supabase } from '@/lib/supabase'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { Database, InvoiceStatus } from '@/lib/database.types'

type InvoiceRow = Database['public']['Tables']['invoices']['Row']

interface InvoiceWithStruct extends InvoiceRow {
  structure_name?: string | null
}

const STATUS_META: Record<InvoiceStatus, { label: string; cls: string }> = {
  draft:   { label: 'Bozza',     cls: 'bg-[rgba(148,163,184,0.10)] text-[#94A3B8] border-[rgba(148,163,184,0.25)]' },
  sent:    { label: 'Inviata',   cls: 'bg-[rgba(91,184,245,0.12)] text-[#5BB8F5] border-[rgba(91,184,245,0.30)]' },
  paid:    { label: 'Pagata',    cls: 'bg-[rgba(30,201,154,0.12)] text-[#1EC99A] border-[rgba(30,201,154,0.30)]' },
  overdue: { label: 'Scaduta',   cls: 'bg-[rgba(240,69,69,0.12)] text-[#F04545] border-[rgba(240,69,69,0.30)]' },
  void:    { label: 'Annullata', cls: 'bg-[rgba(148,163,184,0.10)] text-[#94A3B8] border-[rgba(148,163,184,0.25)] line-through' },
}

const MONTHS_IT = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

function currentMonthValue(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function csvField(val: unknown): string {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export default function AdminInvoices() {
  usePageTitle('Fatture')
  const { addToast } = useToast()
  const [month, setMonth] = useState(currentMonthValue())
  const [invoices, setInvoices] = useState<InvoiceWithStruct[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const [year, monthN] = useMemo(() => {
    const [y, m] = month.split('-').map(Number)
    return [y, m]
  }, [month])

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const [{ data: rawInvs, error: iErr }, { data: structs, error: sErr }] = await Promise.all([
        supabase.from('invoices').select('*').eq('period_year', year).eq('period_month', monthN)
          .order('grand_total', { ascending: false }),
        supabase.from('structures').select('id, ragione_sociale'),
      ])
      if (iErr) throw iErr
      if (sErr) throw sErr
      const sById = new Map((structs ?? []).map((s) => [s.id, s.ragione_sociale]))
      setInvoices((rawInvs ?? []).map((i) => ({ ...i, structure_name: sById.get(i.structure_id) ?? null })))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore caricamento'
      console.error('[AdminInvoices] fetch error', err)
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [year, monthN])

  useEffect(() => { void load() }, [load])

  const handleGenerateAll = async () => {
    setGenerating(true)
    try {
      const { data, error } = await supabase.rpc('generate_all_invoices_for_period', { p_year: year, p_month: monthN })
      if (error) throw error
      const count = data as unknown as number
      addToast({ type: 'success', title: 'Fatture generate', message: `${count} fatture create/aggiornate per il periodo.` })
      await load()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore generazione'
      addToast({ type: 'error', title: 'Errore', message })
    } finally {
      setGenerating(false)
    }
  }

  const updateStatus = async (inv: InvoiceWithStruct, newStatus: InvoiceStatus) => {
    setUpdatingId(inv.id)
    try {
      const patch: Partial<InvoiceRow> = { status: newStatus }
      const now = new Date().toISOString()
      if (newStatus === 'sent' && !inv.sent_at) patch.sent_at = now
      if (newStatus === 'paid' && !inv.paid_at) patch.paid_at = now
      const { error } = await supabase.from('invoices').update(patch).eq('id', inv.id)
      if (error) throw error
      addToast({ type: 'success', title: 'Stato aggiornato', message: `Fattura ora ${STATUS_META[newStatus].label}.` })
      await load()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore'
      addToast({ type: 'error', title: 'Errore', message })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleExportCSV = () => {
    if (invoices.length === 0) return
    const header = ['Struttura', 'Periodo', 'Turni', 'Ore', 'Compenso (€)', 'Fee (€)', 'Totale (€)', 'Stato', 'Scadenza', 'Inviata il', 'Pagata il']
    const lines = [header.map(csvField).join(',')]
    for (const i of invoices) {
      lines.push([
        i.structure_name ?? '—',
        `${MONTHS_IT[monthN - 1]} ${year}`,
        i.shifts_count, Number(i.total_hours).toFixed(2),
        Number(i.total_amount).toFixed(2), Number(i.fee_amount).toFixed(2), Number(i.grand_total).toFixed(2),
        STATUS_META[i.status].label,
        i.payment_due ?? '',
        i.sent_at ? new Date(i.sent_at).toLocaleDateString('it-IT') : '',
        i.paid_at ? new Date(i.paid_at).toLocaleDateString('it-IT') : '',
      ].map(csvField).join(','))
    }
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ats-invoices-${month}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    addToast({ type: 'success', title: 'CSV esportato', message: `ats-invoices-${month}.csv scaricato.` })
  }

  // Totali
  const totals = useMemo(() => {
    let totalAmount = 0; let totalFee = 0; let totalGrand = 0; let totalShifts = 0
    let pending = 0
    for (const i of invoices) {
      totalAmount += Number(i.total_amount)
      totalFee += Number(i.fee_amount)
      totalGrand += Number(i.grand_total)
      totalShifts += i.shifts_count
      if (i.status !== 'paid' && i.status !== 'void') pending += Number(i.grand_total)
    }
    return {
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalFee: Math.round(totalFee * 100) / 100,
      totalGrand: Math.round(totalGrand * 100) / 100,
      totalShifts,
      pending: Math.round(pending * 100) / 100,
    }
  }, [invoices])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Fatturazione"
        subtitle="Aggrega i turni completed e genera fatture mensili per le strutture. Stripe-ready."
      />

      {fetchError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(240,69,69,0.08)] border border-[rgba(240,69,69,0.2)] text-sm text-[#F04545]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Toolbar mese + azioni */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-text-muted font-semibold flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-sky-primary" /> Periodo
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-[rgba(13,30,52,0.6)] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-sm text-white focus:border-sky-primary outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleGenerateAll}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-text-inverse rounded-xl gradient-sky hover:brightness-110 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {generating ? 'Generazione…' : 'Genera fatture mese'}
        </button>
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={invoices.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Esporta CSV
        </button>
        <button
          onClick={load}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors ml-auto"
          aria-label="Aggiorna"
        >
          <RefreshCw className={cn('w-5 h-5 text-text-muted', loading && 'animate-spin')} />
        </button>
      </div>

      {/* KPI */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPI icon={FileText}    color="#5BB8F5" label="Fatture"        value={String(invoices.length)} />
        <KPI icon={Calendar}    color="#3AA3E8" label="Turni"          value={String(totals.totalShifts)} />
        <KPI icon={Clock}       color="#F5B800" label="Compenso erogato" value={`€ ${totals.totalAmount.toFixed(2)}`} />
        <KPI icon={Euro}        color="#1EC99A" label="Margine ATS"    value={`€ ${totals.totalFee.toFixed(2)}`} />
        <KPI icon={Send}        color="#F04545" label="Da incassare"   value={`€ ${totals.pending.toFixed(2)}`} sub="Non pagate" />
      </section>

      {/* Tabella */}
      <GlassCard>
        {loading ? (
          <div className="space-y-3">
            {[0,1,2].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24 ml-auto" />
              </div>
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center text-text-muted">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              Nessuna fattura per {MONTHS_IT[monthN - 1]} {year}.
              <br /><span className="text-xs opacity-70">Premi "Genera fatture mese" per crearle dai turni completati.</span>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">Struttura</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">Turni</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">Ore</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">Compenso</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">Fee ATS</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">Totale</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">Stato</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(91,184,245,0.04)] transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-sky-primary" />
                        <span className="text-sm text-white">{i.structure_name ?? '—'}</span>
                      </div>
                      {i.payment_due && (
                        <p className="text-[10px] text-text-muted mt-0.5">scad. {new Date(i.payment_due).toLocaleDateString('it-IT')}</p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-text-secondary font-mono">{i.shifts_count}</td>
                    <td className="px-3 py-3 text-right text-sm text-text-secondary font-mono">{Number(i.total_hours).toFixed(1)}h</td>
                    <td className="px-3 py-3 text-right text-sm text-text-secondary font-mono">€ {Number(i.total_amount).toFixed(2)}</td>
                    <td className="px-3 py-3 text-right text-sm text-[#F5B800] font-mono">€ {Number(i.fee_amount).toFixed(2)}</td>
                    <td className="px-3 py-3 text-right text-sm font-bold text-[#1EC99A] font-mono">€ {Number(i.grand_total).toFixed(2)}</td>
                    <td className="px-3 py-3">
                      <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium border whitespace-nowrap', STATUS_META[i.status].cls)}>
                        {STATUS_META[i.status].label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {i.status === 'draft' && (
                          <button
                            type="button"
                            onClick={() => void updateStatus(i, 'sent')}
                            disabled={updatingId === i.id}
                            className="p-1.5 rounded text-sky-primary hover:bg-[rgba(91,184,245,0.1)] transition-colors text-xs"
                            aria-label="Marca come inviata"
                            title="Marca come inviata"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(i.status === 'sent' || i.status === 'overdue') && (
                          <button
                            type="button"
                            onClick={() => void updateStatus(i, 'paid')}
                            disabled={updatingId === i.id}
                            className="p-1.5 rounded text-[#1EC99A] hover:bg-[rgba(30,201,154,0.1)] transition-colors text-xs"
                            aria-label="Marca come pagata"
                            title="Marca come pagata"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {i.status !== 'void' && i.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => void updateStatus(i, 'void')}
                            disabled={updatingId === i.id}
                            className="p-1.5 rounded text-[#F04545] hover:bg-[rgba(240,69,69,0.1)] transition-colors text-xs"
                            aria-label="Annulla fattura"
                            title="Annulla"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}

function KPI({
  icon: Icon, color, label, value, sub,
}: {
  icon: typeof Calendar; color: string; label: string; value: string; sub?: string
}) {
  return (
    <div className="rounded-2xl p-4 backdrop-blur-md bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{label}</span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
      </div>
      <p className="font-playfair text-[20px] font-bold text-white leading-none">{value}</p>
      {sub && <p className="text-[10px] text-text-muted mt-0.5">{sub}</p>}
    </div>
  )
}
