import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, Search, Calendar, CreditCard, Star,
  CheckCircle, Clock, AlertCircle, ChevronRight,
  Filter, FileText, Truck, X, MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastSystem'
import GlassTooltip from '@/components/ui/GlassTooltip'
import { SkeletonTable, SkeletonKpiRow, SkeletonText } from '@/components/ui/skeleton'
import Avatar from '@/components/Avatar'
import GlassInvoiceCard from '@/components/structure/GlassInvoiceCard'
import type { GlassInvoice } from '@/components/structure/GlassInvoiceCard'
import PageHeader from '@/components/ui/PageHeader'

/* ─────────────── helpers ─────────────── */

const avatarMap: Record<string, string> = {
  'ATS-D-0047': '/avatar-employee-1.jpg',
  'ATS-D-0012': '/avatar-employee-2.jpg',
  'ATS-D-0089': '/avatar-employee-3.jpg',
  'ATS-D-0156': '/avatar-employee-4.jpg',
  'ATS-D-0023': '/avatar-employee-5.jpg',
  'ATS-D-0078': '/avatar-employee-6.jpg',
  'ATS-D-0091': '/avatar-employee-7.jpg',
  'ATS-D-0034': '/avatar-employee-8.jpg',
}

/* ─────────────── mock data ─────────────── */

const invoices: GlassInvoice[] = [
  {
    id: 'f1',
    number: 'F-2025-0042',
    period: '1-30 Apr 2025',
    amount: 1200.00,
    hours: 96,
    status: 'paid',
    dueDate: '20/05/2025',
    issueDate: '01/05/2025',
    turns: [
      { date: '10/04', employeeCode: 'ATS-D-0047', role: 'Cameriere', hours: 8, amount: 120.00 },
      { date: '08/04', employeeCode: 'ATS-D-0012', role: 'Chef de Partie', hours: 8, amount: 136.00 },
    ],
  },
  {
    id: 'f2',
    number: 'F-2025-0038',
    period: '1-31 Mar 2025',
    amount: 960.00,
    hours: 80,
    status: 'paid',
    dueDate: '20/04/2025',
    issueDate: '01/04/2025',
    turns: [
      { date: '28/03', employeeCode: 'ATS-D-0047', role: 'Cameriere', hours: 8, amount: 120.00 },
      { date: '22/03', employeeCode: 'ATS-D-0012', role: 'Chef de Partie', hours: 8, amount: 136.00 },
    ],
  },
  {
    id: 'f3',
    number: 'F-2025-0031',
    period: '1-28 Feb 2025',
    amount: 1440.00,
    hours: 120,
    status: 'paid',
    dueDate: '20/03/2025',
    issueDate: '01/03/2025',
    turns: [
      { date: '15/02', employeeCode: 'ATS-D-0089', role: 'Barman', hours: 8, amount: 128.00 },
      { date: '10/02', employeeCode: 'ATS-D-0047', role: 'Cameriere', hours: 8, amount: 120.00 },
    ],
  },
  {
    id: 'f4',
    number: 'F-2025-0025',
    period: '1-31 Gen 2025',
    amount: 720.00,
    hours: 48,
    status: 'pending',
    dueDate: '20/02/2025',
    issueDate: '01/02/2025',
    turns: [
      { date: '20/01', employeeCode: 'ATS-D-0156', role: 'Cameriere', hours: 8, amount: 120.00 },
    ],
  },
]

const payments = [
  { id: 'p1', date: '15/05/2025', amount: 1200.00, method: 'Stripe SEPA', status: 'charged' as const, invoice: 'F-2025-0042' },
  { id: 'p2', date: '15/04/2025', amount: 960.00, method: 'Stripe SEPA', status: 'charged' as const, invoice: 'F-2025-0038' },
  { id: 'p3', date: '15/03/2025', amount: 1440.00, method: 'Stripe SEPA', status: 'charged' as const, invoice: 'F-2025-0031' },
  { id: 'p4', date: '15/02/2025', amount: 720.00, method: 'Carta', status: 'pending' as const, invoice: 'F-2025-0025' },
]

const shiftHistory = [
  { id: 'h1', date: '2026-05-10', dayNum: '10', month: 'MAG', role: 'Cameriere', timeStart: '08:00', timeEnd: '16:00', employeeCode: 'ATS-D-0047', status: 'completed' as const, structureCode: 'RIST-BN-0012', amount: 120 },
  { id: 'h2', date: '2026-05-08', dayNum: '08', month: 'MAG', role: 'Chef de Partie', timeStart: '10:00', timeEnd: '18:00', employeeCode: 'ATS-D-0012', status: 'completed' as const, structureCode: 'RIST-BN-0012', amount: 136 },
  { id: 'h3', date: '2026-05-03', dayNum: '03', month: 'MAG', role: 'Barman', timeStart: '18:00', timeEnd: '02:00', employeeCode: 'ATS-D-0089', status: 'completed' as const, structureCode: 'RIST-BN-0012', amount: 128 },
  { id: 'h4', date: '2026-05-01', dayNum: '01', month: 'MAG', role: 'Cameriere', timeStart: '08:00', timeEnd: '16:00', employeeCode: 'ATS-D-0047', status: 'completed' as const, structureCode: 'RIST-BN-0012', amount: 180 },
  { id: 'h5', date: '2026-04-28', dayNum: '28', month: 'APR', role: 'Cameriere', timeStart: '08:00', timeEnd: '16:00', employeeCode: 'ATS-D-0156', status: 'completed' as const, structureCode: 'RIST-BN-0012', amount: 120 },
  { id: 'h6', date: '2026-04-25', dayNum: '25', month: 'APR', role: 'Cameriere', timeStart: '08:00', timeEnd: '16:00', employeeCode: 'ATS-D-0047', status: 'completed' as const, structureCode: 'RIST-BN-0012', amount: 160 },
]

const ratingsGiven = [
  { id: 'rg1', employeeCode: 'ATS-D-0047', employeeName: 'Giulia', role: 'Cameriere', average: 4.5, punctuality: 5, professionalism: 4, cleanliness: 5, speed: 4, attitude: 5, date: '10/05/2026', comment: 'Ottima prestazione, molto veloce e gentile.' },
  { id: 'rg2', employeeCode: 'ATS-D-0012', employeeName: 'Luca', role: 'Chef de Partie', average: 4.8, punctuality: 5, professionalism: 5, cleanliness: 5, speed: 4, attitude: 5, date: '08/05/2026', comment: 'Chef eccellente, organizza il lavoro in modo impeccabile.' },
  { id: 'rg3', employeeCode: 'ATS-D-0089', employeeName: 'Sofia', role: 'Barman', average: 4.2, punctuality: 4, professionalism: 4, cleanliness: 4, speed: 5, attitude: 4, date: '03/05/2026', comment: 'Brava con i cocktail, ha gestito bene la serata.' },
]

const ratingBreakdown = [
  { stars: 5, count: 12 },
  { stars: 4, count: 5 },
  { stars: 3, count: 2 },
  { stars: 2, count: 1 },
  { stars: 1, count: 0 },
]

/* ─────────────── status configs ─────────────── */

const shiftStatusConfig = {
  completed: { label: 'Completato', className: 'bg-[rgba(30,201,154,0.15)] text-[#1EC99A] border-[rgba(30,201,154,0.3)]' },
  confirmed: { label: 'Confermato', className: 'bg-[rgba(30,201,154,0.15)] text-[#1EC99A] border-[rgba(30,201,154,0.3)]' },
  pending: { label: 'In attesa', className: 'bg-[rgba(245,184,0,0.15)] text-[#F5B800] border-[rgba(245,184,0,0.3)]' },
  noshow: { label: 'No-show', className: 'bg-[rgba(240,69,69,0.15)] text-[#F04545] border-[rgba(240,69,69,0.3)]' },
}

const paymentStatusConfig = {
  charged: { label: 'Addebitato', icon: CheckCircle, className: 'bg-[rgba(30,201,154,0.15)] text-[#1EC99A] border-[rgba(30,201,154,0.3)]' },
  failed: { label: 'Fallito', icon: AlertCircle, className: 'bg-[rgba(240,69,69,0.15)] text-[#F04545] border-[rgba(240,69,69,0.3)]' },
  pending: { label: 'In attesa', icon: Clock, className: 'bg-[rgba(245,184,0,0.15)] text-[#F5B800] border-[rgba(245,184,0,0.3)]' },
}

type TabKey = 'shifts' | 'invoices' | 'payments' | 'ratings'

/* ─────────────── component ─────────────── */

export default function StructureHistory() {
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState<TabKey>('shifts')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [expandedShift, setExpandedShift] = useState<string | null>(null)
  const [, setDownloadingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(t)
  }, [])

  /* derived data */
  const roles = useMemo(() => {
    const set = new Set(shiftHistory.map((s) => s.role))
    return Array.from(set)
  }, [])

  const filteredShifts = useMemo(() => {
    return shiftHistory.filter((s) => {
      if (searchQuery && !((s.employeeCode || '').toLowerCase().includes(searchQuery.toLowerCase()) || s.role.toLowerCase().includes(searchQuery.toLowerCase()))) return false
      if (roleFilter && s.role !== roleFilter) return false
      return true
    })
  }, [searchQuery, roleFilter])

  const totals = useMemo(() => {
    const totalShifts = filteredShifts.length
    const totalHours = filteredShifts.reduce((acc, s) => {
      const start = parseInt(s.timeStart.split(':')[0])
      const end = parseInt(s.timeEnd.split(':')[0])
      return acc + (end > start ? end - start : 24 - start + end)
    }, 0)
    const totalAmount = filteredShifts.reduce((acc, s) => acc + s.amount, 0)
    return { totalShifts, totalHours, totalAmount }
  }, [filteredShifts])

  const averageRating = useMemo(() => {
    return ratingsGiven.reduce((acc, r) => acc + r.average, 0) / ratingsGiven.length
  }, [])

  /* handlers */
  const handleDownload = useCallback((invoice: GlassInvoice) => {
    setDownloadingId(invoice.id)
    addToast({ type: 'success', title: 'PDF scaricato', message: `Fattura ${invoice.number} scaricata` })
    setTimeout(() => setDownloadingId(null), 1500)
  }, [addToast])

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'shifts', label: 'Turni' },
    { key: 'invoices', label: 'Fatture' },
    { key: 'payments', label: 'Pagamenti' },
    { key: 'ratings', label: 'Valutazioni' },
  ]

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#06101E] pt-[72px]">
        <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">
          <SkeletonKpiRow count={4} />
          <SkeletonTable rows={5} cols={6} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#06101E] pt-[72px]">
      <div className="max-w-[1200px] mx-auto px-6 py-8">

        <PageHeader
          title="Storico & Pagamenti"
          subtitle="Tutti i turni, fatture e valutazioni della tua struttura"
          showBack
          backTo="/structure"
          backLabel="Dashboard"
          variant="display"
        />

        {/* ── Summary Cards ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
        >
          {[
            { label: 'Turni completati', value: '32', icon: CheckCircle, color: '#1EC99A' },
            { label: 'Totale pagato', value: '€7.200', icon: CreditCard, color: '#5BB8F5' },
            { label: 'Rating medio', value: averageRating.toFixed(1), icon: Star, color: '#F5B800' },
            { label: 'Prossima fattura', value: '€480', sub: '20/05', icon: FileText, color: '#F5B800', warning: true },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
              className={cn(
                'rounded-2xl p-6 backdrop-blur-md bg-white/5 border border-white/10',
                'hover:border-[rgba(91,184,245,0.25)] hover:shadow-[0_12px_48px_rgba(91,184,245,0.08)] hover:-translate-y-[3px]',
                'transition-all duration-350'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-[0.08em] text-[#5E7A95]">{kpi.label}</span>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <p className="font-playfair text-[28px] font-bold text-white leading-tight">
                {kpi.value}
                {kpi.sub && <span className="text-sm text-[#F5B800] ml-2">— {kpi.sub}</span>}
              </p>
            </motion.div>
          ))}
        </motion.section>

        {/* ── Glass Tab Bar ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className={cn(
            'rounded-2xl p-2 mb-6 backdrop-blur-md bg-white/5 border border-white/10',
            'flex flex-wrap gap-1'
          )}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                activeTab === tab.key
                  ? 'gradient-sky text-white shadow-[0_0_20px_rgba(91,184,245,0.2)]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </motion.section>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* ── SHIFTS TAB ── */}
            {activeTab === 'shifts' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E7A95]" />
                    <input
                      type="text"
                      placeholder="Cerca per codice o ruolo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(13,30,52,0.8)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:border-[#5BB8F5] focus:shadow-[0_0_0_4px_rgba(91,184,245,0.1)] outline-none transition-all"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-[rgba(13,30,52,0.8)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:border-[#5BB8F5] outline-none transition-all"
                  >
                    <option value="">Tutti i ruoli</option>
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Shift list */}
                <div className="space-y-3">
                  {filteredShifts.map((shift, i) => {
                    const status = shiftStatusConfig[shift.status]
                    const isExpanded = expandedShift === shift.id
                    return (
                      <motion.div
                        key={shift.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.4 }}
                        className={cn(
                          'rounded-2xl overflow-hidden backdrop-blur-md bg-white/5 border border-white/10',
                          'hover:border-[rgba(91,184,245,0.2)] transition-all duration-300'
                        )}
                      >
                        <div
                          className="flex items-center gap-4 p-4 cursor-pointer"
                          onClick={() => setExpandedShift(isExpanded ? null : shift.id)}
                        >
                          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] flex flex-col items-center justify-center">
                            <span className="font-playfair text-xl font-bold text-white leading-tight">{shift.dayNum}</span>
                            <span className="text-[10px] font-medium text-[#5E7A95] uppercase tracking-wider">{shift.month}</span>
                          </div>
                          <Avatar
                            src={avatarMap[shift.employeeCode || '']}
                            alt={shift.employeeCode}
                            size={48}
                            borderColor="#1A56A0"
                            className="hidden sm:flex flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs text-[#5BB8F5] bg-[rgba(91,184,245,0.08)] px-1.5 py-0.5 rounded">{shift.employeeCode}</span>
                              <span className="text-sm font-semibold text-white">{shift.role}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[#5E7A95]">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {shift.timeStart}-{shift.timeEnd}
                              </span>
                              <span>€{shift.amount}</span>
                            </div>
                          </div>
                          <span className={cn('flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-medium border', status.className)}>
                            {status.label}
                          </span>
                          <ChevronRight className={cn('w-4 h-4 text-[#5E7A95] transition-transform', isExpanded && 'rotate-90')} />
                        </div>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-[rgba(255,255,255,0.06)] p-4"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                <p className="text-xs uppercase tracking-wider text-[#5E7A95]">Check-in</p>
                                <p className="text-white">{shift.timeStart} — Confermato</p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs uppercase tracking-wider text-[#5E7A95]">Check-out</p>
                                <p className="text-white">{shift.timeEnd} — Confermato</p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs uppercase tracking-wider text-[#5E7A95]">Importo</p>
                                <p className="text-white font-semibold">€{shift.amount.toFixed(2)}</p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs uppercase tracking-wider text-[#5E7A95]">Durata</p>
                                <p className="text-white">
                                  {(() => {
                                    const start = parseInt(shift.timeStart.split(':')[0])
                                    const end = parseInt(shift.timeEnd.split(':')[0])
                                    return end > start ? end - start : 24 - start + end
                                  })()}h
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {/* Totals */}
                <div className={cn(
                  'rounded-2xl p-5 backdrop-blur-md bg-white/5 border border-white/10',
                  'flex flex-wrap gap-6 items-center justify-between'
                )}>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#5E7A95]">Totale turni</p>
                      <p className="font-playfair text-xl font-bold text-white">{totals.totalShifts}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#5E7A95]">Ore totali</p>
                      <p className="font-playfair text-xl font-bold text-white">{totals.totalHours}h</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wider text-[#5E7A95]">Importo totale</p>
                    <p className="font-playfair text-2xl font-bold text-white">€{totals.totalAmount.toLocaleString('it-IT')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── INVOICES TAB ── */}
            {activeTab === 'invoices' && (
              <div className="space-y-4">
                {invoices.map((inv, i) => (
                  <GlassInvoiceCard
                    key={inv.id}
                    invoice={inv}
                    index={i}
                    onDownload={handleDownload}
                    glass
                  />
                ))}
              </div>
            )}

            {/* ── PAYMENTS TAB ── */}
            {activeTab === 'payments' && (
              <div className={cn(
                'rounded-2xl overflow-hidden backdrop-blur-md bg-white/5 border border-white/10'
              )}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.06)]">
                        {['Data', 'Fattura', 'Importo', 'Metodo', 'Stato', 'Azioni'].map((h) => (
                          <th key={h} className="px-5 py-4 text-left text-[11px] uppercase tracking-[0.08em] text-[#94A3B8] font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p, i) => {
                        const status = paymentStatusConfig[p.status]
                        const StatusIcon = status.icon
                        return (
                          <motion.tr
                            key={p.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.4 }}
                            className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(91,184,245,0.04)] transition-colors"
                          >
                            <td className="px-5 py-4 text-sm text-white">{p.date}</td>
                            <td className="px-5 py-4 text-sm font-mono text-[#5BB8F5]">{p.invoice}</td>
                            <td className="px-5 py-4 text-sm font-semibold text-white">€{p.amount.toFixed(2)}</td>
                            <td className="px-5 py-4 text-sm text-[#94A3B8]">{p.method}</td>
                            <td className="px-5 py-4">
                              <span className={cn('flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border w-fit', status.className)}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <GlassTooltip content="Scarica ricevuta">
                                <button
                                  onClick={() => addToast({ type: 'success', title: 'Ricevuta scaricata', message: `Pagamento ${p.id}` })}
                                  className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-[#5E7A95] hover:text-[#5BB8F5] transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </GlassTooltip>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── RATINGS TAB ── */}
            {activeTab === 'ratings' && (
              <div className="space-y-6">
                {/* Rating summary */}
                <div className={cn(
                  'rounded-2xl p-6 backdrop-blur-md bg-white/5 border border-white/10'
                )}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
                    <div className="text-center sm:text-left">
                      <p className="font-playfair text-[48px] font-bold text-white leading-none">{averageRating.toFixed(1)}<span className="text-xl text-[#5E7A95]">/5.0</span></p>
                      <div className="flex items-center gap-1 mt-2 justify-center sm:justify-start">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              'w-5 h-5',
                              s <= Math.round(averageRating) ? 'text-[#F5B800] fill-[#F5B800]' : 'text-[#5E7A95]'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {ratingBreakdown.map((row) => (
                        <div key={row.stars} className="flex items-center gap-3">
                          <span className="text-xs text-[#5E7A95] w-4">{row.stars}★</span>
                          <div className="flex-1 h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(row.count / 20) * 100}%` }}
                              transition={{ delay: row.stars * 0.08, duration: 0.6, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
                              className={cn(
                                'h-full rounded-full',
                                row.stars === 5 ? 'bg-[#1EC99A]' :
                                row.stars === 4 ? 'bg-[#5BB8F5]' :
                                row.stars === 3 ? 'bg-[#F5B800]' :
                                row.stars === 2 ? 'bg-[#F04545]' : 'bg-[#5E7A95]'
                              )}
                            />
                          </div>
                          <span className="text-xs text-[#5E7A95] w-6 text-right">{row.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Individual ratings */}
                <div className="space-y-4">
                  {ratingsGiven.map((rating, i) => (
                    <motion.div
                      key={rating.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      className={cn(
                        'rounded-2xl p-5 backdrop-blur-md bg-white/5 border border-white/10',
                        'hover:border-[rgba(91,184,245,0.2)] transition-all duration-300'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={avatarMap[rating.employeeCode]}
                          alt={rating.employeeName}
                          size={56}
                          borderColor="#1A56A0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-[#5BB8F5] bg-[rgba(91,184,245,0.08)] px-1.5 py-0.5 rounded">{rating.employeeCode}</span>
                            <span className="text-sm font-semibold text-white">{rating.role}</span>
                            <div className="flex items-center gap-1 ml-auto">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={cn(
                                    'w-4 h-4',
                                    s <= Math.round(rating.average) ? 'text-[#F5B800] fill-[#F5B800]' : 'text-[#5E7A95]'
                                  )}
                                />
                              ))}
                              <span className="text-sm font-bold text-[#F5B800] ml-1">{rating.average.toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="text-xs text-[#5E7A95] mb-2">{rating.date}</p>
                          <p className="text-sm text-[#94A3B8] italic mb-3">&ldquo;{rating.comment}&rdquo;</p>
                          <div className="grid grid-cols-5 gap-2">
                            {[
                              { label: 'Puntualita', value: rating.punctuality },
                              { label: 'Professionalita', value: rating.professionalism },
                              { label: 'Pulizia', value: rating.cleanliness },
                              { label: 'Velocita', value: rating.speed },
                              { label: 'Attitudine', value: rating.attitude },
                            ].map((tag) => (
                              <div key={tag.label} className="text-center p-2 rounded-lg bg-[rgba(255,255,255,0.02)]">
                                <p className="text-[10px] text-[#5E7A95] mb-1">{tag.label}</p>
                                <div className="flex justify-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={cn(
                                        'w-2.5 h-2.5',
                                        s <= tag.value ? 'text-[#F5B800] fill-[#F5B800]' : 'text-[#5E7A95]'
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
