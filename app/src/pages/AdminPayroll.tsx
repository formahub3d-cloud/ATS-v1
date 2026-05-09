// AdminPayroll — esportazione CSV buste paga per periodo (mensile).
// Calcola le ore lavorate per ogni dipendente nel mese selezionato (turni
// 'completed' con check_in_at e check_out_at valorizzati) e genera un CSV
// scaricabile per il commercialista o per la creazione manuale dei cedolini.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Download, Calendar, AlertCircle, Users, Clock, Euro, FileText,
  TrendingUp,
} from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/ToastSystem'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type ShiftRow = Database['public']['Tables']['shifts']['Row']

interface PayrollRow {
  employee_id: string
  employee_name: string
  shifts_count: number
  total_hours: number
  total_amount: number
  /** Tutti i turni che compongono il totale (per dettaglio + CSV). */
  shifts: Array<ShiftRow & { structure_name: string | null }>
}

function currentMonthValue(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthRange(monthStr: string): { from: string; to: string; label: string } {
  const [y, m] = monthStr.split('-').map(Number)
  const from = new Date(y, m - 1, 1)
  const to = new Date(y, m, 0) // ultimo giorno del mese
  const label = from.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    label,
  }
}

/** Calcola le ore di un turno: usa check_in/check_out se presenti, altrimenti
 *  estimated_hours, altrimenti differenza time_start↔time_end. */
function computeHours(s: ShiftRow): number {
  if (s.check_in_at && s.check_out_at) {
    const ms = new Date(s.check_out_at).getTime() - new Date(s.check_in_at).getTime()
    return Math.round((ms / 1000 / 3600) * 100) / 100
  }
  if (s.estimated_hours) return Number(s.estimated_hours)
  // Fallback su time_start/time_end (gestisce mezzanotte).
  const [h1, m1] = s.time_start.split(':').map(Number)
  const [h2, m2] = s.time_end.split(':').map(Number)
  let mins = (h2 * 60 + m2) - (h1 * 60 + m1)
  if (mins < 0) mins += 24 * 60
  return Math.round((mins / 60) * 100) / 100
}

/** Escapa valore CSV (gestisce virgole, virgolette, newline). */
function csvField(val: unknown): string {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export default function AdminPayroll() {
  const { addToast } = useToast()
  const [month, setMonth] = useState(currentMonthValue())
  const [rows, setRows] = useState<PayrollRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const range = useMemo(() => monthRange(month), [month])

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      // Tutti i turni completed nel periodo.
      const { data: shifts, error: sErr } = await supabase
        .from('shifts')
        .select('*')
        .eq('status', 'completed')
        .gte('shift_date', range.from)
        .lte('shift_date', range.to)
      if (sErr) throw sErr

      const empIds = Array.from(new Set((shifts ?? []).map((s) => s.employee_id).filter((x): x is string => !!x)))
      const structIds = Array.from(new Set((shifts ?? []).map((s) => s.structure_id)))

      const [{ data: profs, error: pErr }, { data: structs, error: stErr }] = await Promise.all([
        empIds.length === 0
          ? Promise.resolve({ data: [], error: null })
          : supabase.from('profiles').select('id, full_name').in('id', empIds),
        structIds.length === 0
          ? Promise.resolve({ data: [], error: null })
          : supabase.from('structures').select('id, ragione_sociale').in('id', structIds),
      ])
      if (pErr) throw pErr
      if (stErr) throw stErr

      const nameById = new Map((profs ?? []).map((p) => [p.id, p.full_name ?? '—']))
      const structById = new Map((structs ?? []).map((s) => [s.id, s.ragione_sociale]))

      // Aggrega per employee_id.
      const byEmp = new Map<string, PayrollRow>()
      for (const s of (shifts ?? [])) {
        if (!s.employee_id) continue
        const hours = computeHours(s)
        const amount = hours * Number(s.hourly_rate)
        const existing = byEmp.get(s.employee_id)
        const enriched = { ...s, structure_name: structById.get(s.structure_id) ?? null }
        if (existing) {
          existing.shifts_count++
          existing.total_hours += hours
          existing.total_amount += amount
          existing.shifts.push(enriched)
        } else {
          byEmp.set(s.employee_id, {
            employee_id: s.employee_id,
            employee_name: nameById.get(s.employee_id) ?? '—',
            shifts_count: 1,
            total_hours: hours,
            total_amount: amount,
            shifts: [enriched],
          })
        }
      }

      // Round e ordina per nome.
      const arr = Array.from(byEmp.values())
        .map((r) => ({
          ...r,
          total_hours: Math.round(r.total_hours * 100) / 100,
          total_amount: Math.round(r.total_amount * 100) / 100,
        }))
        .sort((a, b) => a.employee_name.localeCompare(b.employee_name))
      setRows(arr)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore caricamento payroll'
      console.error('[AdminPayroll] fetch error', err)
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [range.from, range.to])

  useEffect(() => {
    void load()
  }, [load])

  const totals = useMemo(() => {
    let totalHours = 0
    let totalAmount = 0
    let totalShifts = 0
    for (const r of rows) {
      totalHours += r.total_hours
      totalAmount += r.total_amount
      totalShifts += r.shifts_count
    }
    return {
      employees: rows.length,
      shifts: totalShifts,
      hours: Math.round(totalHours * 100) / 100,
      amount: Math.round(totalAmount * 100) / 100,
    }
  }, [rows])

  const handleExportCSV = () => {
    if (rows.length === 0) {
      addToast({ type: 'warning', title: 'Nessun dato', message: 'Non ci sono turni completati nel periodo selezionato.' })
      return
    }

    // CSV "dettagliato": una riga per turno con tutti i dati per cedolino.
    const header = [
      'Dipendente', 'Codice dipendente',
      'Struttura', 'Data turno', 'Inizio', 'Fine',
      'Ruolo', 'Ore', 'Paga oraria (€)', 'Totale (€)',
      'Check-in', 'Check-out',
    ]
    const lines: string[] = [header.map(csvField).join(',')]
    for (const r of rows) {
      for (const s of r.shifts) {
        const hours = computeHours(s)
        const amount = hours * Number(s.hourly_rate)
        lines.push([
          r.employee_name,
          r.employee_id.slice(0, 8).toUpperCase(),
          s.structure_name ?? '—',
          s.shift_date,
          s.time_start.slice(0, 5),
          s.time_end.slice(0, 5),
          s.role,
          hours.toFixed(2),
          Number(s.hourly_rate).toFixed(2),
          amount.toFixed(2),
          s.check_in_at ? new Date(s.check_in_at).toLocaleString('it-IT') : '',
          s.check_out_at ? new Date(s.check_out_at).toLocaleString('it-IT') : '',
        ].map(csvField).join(','))
      }
    }
    // Riga di totale finale.
    lines.push('')
    lines.push(['', '', '', '', '', '', 'TOTALE', totals.hours.toFixed(2), '', totals.amount.toFixed(2), '', ''].map(csvField).join(','))

    const csvContent = lines.join('\n')
    // BOM UTF-8 così Excel italiano apre il CSV con accenti corretti.
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ats-payroll-${month}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    addToast({ type: 'success', title: 'CSV esportato', message: `ats-payroll-${month}.csv scaricato.` })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Payroll"
        subtitle="Calcolo ore + paga per cedolini mensili. Export CSV per il commercialista."
      />

      {fetchError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(240,69,69,0.08)] border border-[rgba(240,69,69,0.2)] text-sm text-[#F04545]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Selettore periodo + export */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-text-muted font-semibold flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-sky-primary" />
            Mese
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
          onClick={handleExportCSV}
          disabled={loading || rows.length === 0}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-text-inverse rounded-xl gradient-sky hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Esporta CSV — {range.label}
        </button>
      </div>

      {/* KPI totali */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={Users} color="#5BB8F5" label="Dipendenti" value={totals.employees} loading={loading} />
        <KPI icon={Calendar} color="#3AA3E8" label="Turni completati" value={totals.shifts} loading={loading} />
        <KPI icon={Clock} color="#F5B800" label="Ore totali" value={totals.hours} suffix="h" loading={loading} />
        <KPI icon={Euro} color="#1EC99A" label="Compenso totale" value={totals.amount} prefix="€ " loading={loading} />
      </section>

      {/* Tabella aggregata per dipendente */}
      <GlassCard>
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24 ml-auto" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-text-muted">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nessun turno completato nel periodo selezionato.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Dipendente</th>
                  <th className="text-right px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Turni</th>
                  <th className="text-right px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Ore</th>
                  <th className="text-right px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Compenso</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <motion.tr
                    key={r.employee_id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(91,184,245,0.04)] transition-colors"
                  >
                    <td className="px-3 py-3">
                      <p className="text-sm font-medium text-white">{r.employee_name}</p>
                      <p className="text-[10px] font-mono text-text-muted">ATS-D-{r.employee_id.slice(0, 8).toUpperCase()}</p>
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-text-secondary font-mono">{r.shifts_count}</td>
                    <td className="px-3 py-3 text-right text-sm text-white font-mono">{r.total_hours.toFixed(2)} h</td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-sm font-semibold text-[#1EC99A] font-mono">€ {r.total_amount.toFixed(2)}</span>
                    </td>
                  </motion.tr>
                ))}
                <tr className="border-t-2 border-[rgba(91,184,245,0.3)] bg-[rgba(91,184,245,0.04)]">
                  <td className="px-3 py-3 text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-sky-primary" />
                    Totale {range.label}
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-bold text-white font-mono">{totals.shifts}</td>
                  <td className="px-3 py-3 text-right text-sm font-bold text-white font-mono">{totals.hours.toFixed(2)} h</td>
                  <td className="px-3 py-3 text-right text-base font-bold text-[#1EC99A] font-mono">€ {totals.amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}

function KPI({
  icon: Icon, color, label, value, prefix, suffix, loading,
}: {
  icon: typeof Calendar
  color: string
  label: string
  value: number
  prefix?: string
  suffix?: string
  loading: boolean
}) {
  return (
    <div className="rounded-2xl p-5 backdrop-blur-md bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-[0.08em] text-text-muted">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <p className="font-playfair text-[28px] font-bold text-white leading-none">
          {prefix}{typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 2) : value}{suffix}
        </p>
      )}
    </div>
  )
}

