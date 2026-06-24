import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Eye, Edit, Ban, CheckCircle, X, ChevronRight,
  Calendar, Video, FileText, Trophy,
  Star, MapPin, Shield, Euro,
} from 'lucide-react'
import StatusPill from '@/components/admin/StatusPill'
import DataTable from '@/components/admin/DataTable'
import GlassCard from '@/components/admin/GlassCard'
import GlassBadge from '@/components/admin/GlassBadge'
import Avatar from '@/components/Avatar'
import { useToast } from '@/components/ui/ToastSystem'
import GlassTooltip from '@/components/ui/GlassTooltip'
import { mockEmployees, rankColors, getHourlyRate, zoneRates } from '@/data/mockAdmin'
import { cn } from '@/lib/utils'

interface Employee {
  id: number
  firstName: string
  lastName: string
  code: string
  role: string
  rank: string
  rankLevel: number
  rankPoints: number
  status: string
  shifts: number
  joinDate: string
  phone: string
  zone: string
  driver: boolean
}

const pipelineSteps = [
  { key: 'In attesa', label: 'In attesa', color: '#F5B800' },
  { key: 'Colloquio da fissare', label: 'Colloquio da fissare', color: '#5BB8F5' },
  { key: 'Colloquio fissato', label: 'Colloquio fissato', color: '#3AA3E8' },
  { key: 'In valutazione', label: 'In valutazione', color: '#5BB8F5' },
  { key: 'Attivo', label: 'Attivo', color: '#1EC99A' },
  { key: 'Sospeso', label: 'Sospeso', color: '#F04545' },
]

const statPills = [
  { label: 'Tutti', value: 'all' },
  { label: 'Attivi', value: 'Attivo' },
  { label: 'In pipeline', value: 'pipeline' },
  { label: 'Sospesi', value: 'Sospeso' },
]

const employeePhotos = [
  '/avatar-employee-1.jpg', '/avatar-employee-2.jpg', '/avatar-employee-3.jpg', '/avatar-employee-4.jpg',
  '/avatar-employee-5.jpg', '/avatar-employee-6.jpg', '/avatar-employee-7.jpg', '/avatar-employee-8.jpg',
]

export default function AdminEmployees() {
  const { addToast } = useToast()
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [activeTab, setActiveTab] = useState('profilo')
  const [docReviewOpen, setDocReviewOpen] = useState(false)
  const [interviewOpen, setInterviewOpen] = useState(false)
  const [selectedZone, setSelectedZone] = useState<string>('Centro')
  const [customRate, setCustomRate] = useState<number | null>(null)

  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    pipelineSteps.forEach(step => {
      counts[step.key] = mockEmployees.filter(e => e.status === step.key).length
    })
    return counts
  }, [])

  const filteredEmployees = useMemo(() => {
    return mockEmployees.filter(e => {
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'pipeline' ? !['Attivo', 'Sospeso'].includes(e.status) : e.status === statusFilter)
      const matchSearch = !searchQuery ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.phone.includes(searchQuery)
      return matchStatus && matchSearch
    })
  }, [statusFilter, searchQuery])

  const stats = useMemo(() => ({
    all: mockEmployees.length,
    active: mockEmployees.filter(e => e.status === 'Attivo').length,
    pipeline: mockEmployees.filter(e => !['Attivo', 'Sospeso'].includes(e.status)).length,
    suspended: mockEmployees.filter(e => e.status === 'Sospeso').length,
  }), [])

  const columns = [
    {
      key: 'name',
      header: 'Nome',
      render: (e: Employee) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={employeePhotos[(e.id - 1) % employeePhotos.length]}
            alt={`${e.firstName} ${e.lastName}`}
            size="sm"
            className="border-2"
            style={{ borderColor: rankColors[e.rank] || '#1A56A0' }}
          />
          <span className="text-sm font-semibold text-white">{e.firstName} {e.lastName[0]}.</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'code',
      header: 'Codice ATS',
      render: (e: Employee) => (
        <span className="font-mono text-xs text-sky-primary bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] rounded px-2 py-0.5">
          {e.code}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'role',
      header: 'Ruolo',
      render: (e: Employee) => <span className="text-sm text-text-secondary">{e.role}</span>,
      sortable: true,
    },
    {
      key: 'rank',
      header: 'Rank',
      render: (e: Employee) => (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium text-white shadow-[0_0_8px_rgba(91,184,245,0.2)]"
          style={{ background: rankColors[e.rank] || '#94A3B8' }}
        >
          <Star className="w-3 h-3" />
          {e.rank}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Stato',
      render: (e: Employee) => <StatusPill status={e.status} pulse={e.status === 'In attesa'} />,
      sortable: true,
    },
    {
      key: 'rate',
      header: 'Tariffa',
      render: (e: Employee) => {
        const rate = getHourlyRate(e.zone, e.role)
        return (
          <GlassBadge variant="sky" icon={<Euro className="w-3 h-3" />}>
            €{rate}/h
          </GlassBadge>
        )
      },
    },
    {
      key: 'shifts',
      header: 'Turni',
      render: (e: Employee) => <span className="text-sm text-text-secondary">{e.shifts || '-'}</span>,
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Azioni',
      render: (e: Employee) => (
        <div className="flex items-center gap-1">
          <GlassTooltip content="Visualizza dettagli">
            <button onClick={() => setSelectedEmployee(e)} className="p-1.5 rounded-md hover:bg-white/5 transition-colors">
              <Eye className="w-4 h-4 text-text-muted" />
            </button>
          </GlassTooltip>
          {e.status === 'In attesa' ? (
            <GlassTooltip content="Revisiona documenti">
              <button onClick={() => setDocReviewOpen(true)} className="p-1.5 rounded-md hover:bg-[rgba(30,201,154,0.1)] transition-colors">
                <FileText className="w-4 h-4 text-success" />
              </button>
            </GlassTooltip>
          ) : e.status === 'Sospeso' ? (
            <GlassTooltip content="Riattiva dipendente">
              <button className="p-1.5 rounded-md hover:bg-[rgba(30,201,154,0.1)] transition-colors">
                <CheckCircle className="w-4 h-4 text-success" />
              </button>
            </GlassTooltip>
          ) : (
            <>
              <GlassTooltip content="Modifica profilo">
                <button className="p-1.5 rounded-md hover:bg-[rgba(91,184,245,0.1)] transition-colors">
                  <Edit className="w-4 h-4 text-sky-primary" />
                </button>
              </GlassTooltip>
              <GlassTooltip content="Sospendi dipendente">
                <button className="p-1.5 rounded-md hover:bg-[rgba(240,69,69,0.1)] transition-colors">
                  <Ban className="w-4 h-4 text-error" />
                </button>
              </GlassTooltip>
            </>
          )}
        </div>
      ),
    },
  ]

  const tabs = [
    { key: 'profilo', label: 'Profilo' },
    { key: 'documenti', label: 'Documenti' },
    { key: 'turni', label: 'Turni' },
    { key: 'paghe', label: 'Paghe' },
    { key: 'rank', label: 'Rank' },
    { key: 'chat', label: 'Chat' },
  ]

  const zoneOptions = zoneRates.map(z => z.zone)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-semibold text-white">Gestione Dipendenti</h1>
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
            Esporta CSV
          </button>
          <button
            onClick={() => addToast({ type: 'info', title: 'Invita dipendente', message: 'Il link di invito è stato generato.' })}
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-inverse gradient-sky rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(91,184,245,0.2)]"
          >
            Invita dipendente
          </button>
        </div>
      </div>

      {/* Status Pipeline */}
      <GlassCard>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {pipelineSteps.map((step, i) => (
            <motion.button
              key={step.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              onClick={() => setStatusFilter(step.key === 'Attivo' ? 'Attivo' : step.key === 'Sospeso' ? 'Sospeso' : 'pipeline')}
              className="flex items-center gap-2 group"
            >
              <div className="flex flex-col items-center px-4 py-2 rounded-xl group-hover:bg-[rgba(91,184,245,0.08)] transition-colors cursor-pointer min-w-[100px]">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="font-playfair text-2xl font-bold"
                  style={{ color: step.color }}
                >
                  {pipelineCounts[step.key] || 0}
                </motion.span>
                <span className="text-[10px] text-text-muted text-center whitespace-nowrap mt-1">{step.label}</span>
              </div>
              {i < pipelineSteps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
              )}
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* Stats Pills */}
      <div className="flex flex-wrap gap-3">
        {statPills.map((pill, i) => (
          <motion.button
            key={pill.value}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setStatusFilter(pill.value)}
            className={cn(
              'px-4 py-2 rounded-xl border text-sm font-medium transition-all',
              statusFilter === pill.value
                ? 'bg-[rgba(91,184,245,0.1)] border-sky-primary text-sky-primary -translate-y-0.5 shadow-[0_0_20px_rgba(91,184,245,0.1)]'
                : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/[0.07]'
            )}
          >
            {pill.label}: {pill.value === 'all' ? stats.all : pill.value === 'Attivo' ? stats.active : pill.value === 'pipeline' ? stats.pipeline : stats.suspended}
          </motion.button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-text-muted mr-2" />
          <input
            type="text"
            placeholder="Cerca per nome, codice ATS, telefono..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-text-muted outline-none w-full"
          />
        </div>
        <select className="bg-[rgba(6,16,30,0.6)] text-sm text-text-secondary border border-white/10 rounded-xl px-3 py-2 outline-none backdrop-blur-sm">
          <option>Tutti i ruoli</option>
          <option>Cameriere</option>
          <option>Chef</option>
          <option>Barista</option>
          <option>Barman</option>
          <option>Receptionist</option>
          <option>SPA Staff</option>
        </select>
        <select className="bg-[rgba(6,16,30,0.6)] text-sm text-text-secondary border border-white/10 rounded-xl px-3 py-2 outline-none backdrop-blur-sm">
          <option>Tutti i rank</option>
          <option>Rookie</option>
          <option>Affidabile</option>
          <option>Senior</option>
          <option>Elite</option>
          <option>Ambassador</option>
        </select>
      </div>

      {/* Table */}
      <GlassCard delay={0.2}>
        <DataTable
          columns={columns}
          data={filteredEmployees}
          keyExtractor={e => e.id}
          onRowClick={setSelectedEmployee}
          rowClassName={(e: Employee) =>
            e.status === 'In attesa' ? 'border-l-2 border-l-warning' :
            e.status === 'Sospeso' ? 'border-l-2 border-l-error opacity-70' :
            e.status === 'Colloquio fissato' ? 'border-l-2 border-l-sky-primary' : ''
          }
          pageSize={10}
        />
      </GlassCard>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedEmployee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[rgba(6,16,30,0.8)] backdrop-blur-[12px] z-[200]"
            onClick={() => setSelectedEmployee(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
              onClick={e => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-full max-w-[560px] backdrop-blur-xl bg-[rgba(13,30,52,0.95)] border-l border-[rgba(91,184,245,0.1)] rounded-l-[20px] shadow-drawer overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[rgba(13,30,52,0.95)] border-b border-[rgba(255,255,255,0.06)] p-6 z-10 backdrop-blur-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={employeePhotos[(selectedEmployee.id - 1) % employeePhotos.length]}
                      alt={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
                      size="lg"
                      className="border-2"
                      style={{ borderColor: rankColors[selectedEmployee.rank] || '#1A56A0' }}
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-semibold text-white">{selectedEmployee.firstName} {selectedEmployee.lastName[0]}.</h2>
                        <span className="font-mono text-xs text-sky-primary bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] rounded px-2 py-0.5">
                          {selectedEmployee.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusPill status={selectedEmployee.status} pulse={selectedEmployee.status === 'In attesa'} />
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium text-white shadow-[0_0_8px_rgba(91,184,245,0.2)]"
                          style={{ background: rankColors[selectedEmployee.rank] || '#94A3B8' }}
                        >
                          <Trophy className="w-3 h-3" />
                          {selectedEmployee.rank}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedEmployee(null)} className="p-2 rounded-lg hover:bg-white/10 hover:rotate-90 transition-all">
                    <X className="w-5 h-5 text-text-muted" />
                  </button>
                </div>
                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto">
                  {tabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
                        activeTab === tab.key ? 'bg-[rgba(91,184,245,0.1)] text-sky-primary border-b-2 border-sky-primary' : 'text-text-muted hover:text-white hover:bg-white/[0.03]'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'profilo' && (
                    <motion.div
                      key="profilo"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Nome', value: selectedEmployee.firstName },
                          { label: 'Cognome', value: selectedEmployee.lastName },
                          { label: 'Telefono', value: selectedEmployee.phone, mono: true },
                          { label: 'Zona', value: selectedEmployee.zone },
                          { label: 'Ruolo', value: selectedEmployee.role },
                        ].map((item, i) => (
                          <div key={i} className="backdrop-blur-sm bg-white/[0.03] border border-white/5 rounded-xl p-3">
                            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">{item.label}</p>
                            <p className={`text-sm text-white ${item.mono ? 'font-mono' : ''}`}>{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* ZONAL HOURLY RATE */}
                      <div className="backdrop-blur-sm bg-white/[0.03] border border-[rgba(91,184,245,0.15)] rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Euro className="w-4 h-4 text-sky-primary" />
                          <h3 className="text-sm font-semibold text-white">Tariffa oraria zonale</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-text-muted mb-1 block">Zona tariffa</label>
                            <select
                              value={selectedZone}
                              onChange={(e) => {
                                setSelectedZone(e.target.value)
                                setCustomRate(null)
                              }}
                              className="w-full bg-[#06101E] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-primary"
                            >
                              {zoneOptions.map(z => (
                                <option key={z} value={z}>{z} (€{zoneRates.find(r => r.zone === z)?.baseRate}/h)</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-xs text-text-muted mb-1 block">Prezzo orario</label>
                              <div className="flex items-center gap-2">
                                <span className="text-text-muted">€</span>
                                <input
                                  type="number"
                                  value={customRate ?? getHourlyRate(selectedEmployee.rank, selectedZone)}
                                  onChange={(e) => setCustomRate(parseFloat(e.target.value))}
                                  step="0.5"
                                  className="w-24 bg-[#06101E] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-sky-primary"
                                />
                                <span className="text-text-muted">/h</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <GlassBadge variant="sky" icon={<Euro className="w-3 h-3" />} className="text-sm px-3 py-1.5">
                                €{customRate ?? getHourlyRate(selectedZone, selectedEmployee.role)}/h
                              </GlassBadge>
                              <p className="text-[10px] text-text-muted mt-1">{selectedZone} · {selectedEmployee.role}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-text-muted" />
                        <span className="text-xs text-text-muted">{selectedEmployee.zone} · Benevento</span>
                        {selectedEmployee.driver && (
                          <GlassBadge variant="success">Driver navetta</GlassBadge>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setDocReviewOpen(true)}
                          className="flex-1 px-4 py-2.5 text-sm text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-1"
                        >
                          <FileText className="w-4 h-4" /> Documenti
                        </button>
                        <button
                          onClick={() => setInterviewOpen(true)}
                          className="flex-1 px-4 py-2.5 text-sm text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-1"
                        >
                          <Calendar className="w-4 h-4" /> Colloquio
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'rank' && (
                    <motion.div key="rank" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                      <div className="text-center py-4">
                        <div
                          className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-[0_0_20px_rgba(91,184,245,0.3)]"
                          style={{ background: `linear-gradient(135deg, ${rankColors[selectedEmployee.rank]} 0%, #1A56A0 100%)` }}
                        >
                          <Trophy className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{selectedEmployee.rank}</h3>
                        <p className="text-sm text-text-muted">Livello {selectedEmployee.rankLevel}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-text-muted">Progresso al prossimo livello</span>
                          <span className="text-sm font-medium text-white">{selectedEmployee.rankPoints.toLocaleString('it-IT')} / {selectedEmployee.rankLevel === 5 ? 'MAX' : (selectedEmployee.rankLevel === 1 ? '500' : selectedEmployee.rankLevel === 2 ? '1.500' : selectedEmployee.rankLevel === 3 ? '3.000' : '5.000')} punti</span>
                        </div>
                        <div className="w-full h-3 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (selectedEmployee.rankPoints / (selectedEmployee.rankLevel === 1 ? 500 : selectedEmployee.rankLevel === 2 ? 1500 : selectedEmployee.rankLevel === 3 ? 3000 : selectedEmployee.rankLevel === 4 ? 5000 : 5000)) * 100)}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(135deg, ${rankColors[selectedEmployee.rank]} 0%, #5BB8F5 100%)` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {['documenti', 'turni', 'paghe', 'chat'].includes(activeTab) && (
                    <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 text-center">
                      <p className="text-text-muted text-sm">Sezione in sviluppo</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Review Modal */}
      <AnimatePresence>
        {docReviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[rgba(6,16,30,0.85)] backdrop-blur-[12px] z-[250] flex items-center justify-center p-4"
            onClick={() => setDocReviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="backdrop-blur-xl bg-[rgba(13,30,52,0.95)] border border-[rgba(91,184,245,0.15)] rounded-2xl shadow-drawer w-full max-w-[640px] p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Revisione documenti</h3>
                  <p className="text-xs text-text-muted">{selectedEmployee?.firstName} {selectedEmployee?.lastName[0]}. · {selectedEmployee?.code}</p>
                </div>
                <button onClick={() => setDocReviewOpen(false)} className="p-2 rounded-lg hover:bg-white/10 hover:rotate-90 transition-all">
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { icon: <FileText className="w-8 h-8 text-sky-primary mx-auto mb-2" />, label: 'Documento ID Fronte', action: 'Visualizza' },
                  { icon: <FileText className="w-8 h-8 text-sky-primary mx-auto mb-2" />, label: 'Documento ID Retro', action: 'Visualizza' },
                  { icon: <Shield className="w-8 h-8 text-success mx-auto mb-2" />, label: 'HACCP', status: 'Valido' },
                  { icon: <Video className="w-8 h-8 text-sky-primary mx-auto mb-2" />, label: 'Video attestazione', action: 'Riproduci' },
                ].map((doc, i) => (
                  <div key={i} className="backdrop-blur-sm bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center hover:border-[rgba(91,184,245,0.2)] transition-colors">
                    {doc.icon}
                    <p className="text-xs text-text-muted">{doc.label}</p>
                    {doc.action && <button className="text-xs text-sky-primary hover:underline mt-1">{doc.action}</button>}
                    {doc.status && <span className="text-xs text-success">{doc.status}</span>}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setDocReviewOpen(false); setInterviewOpen(true); addToast({ type: 'success', title: 'Documenti approvati', message: 'I documenti sono stati verificati e approvati.' }) }}
                  className="flex-1 px-4 py-2.5 text-sm text-text-inverse bg-success rounded-xl hover:bg-[#18B386] transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" /> Approva documenti
                </button>
                <button
                  onClick={() => { setDocReviewOpen(false); addToast({ type: 'warning', title: 'Documenti rifiutati', message: 'È stata richiesta la nuova documentazione.' }) }}
                  className="flex-1 px-4 py-2.5 text-sm text-error border border-error/30 rounded-xl hover:bg-[rgba(240,69,69,0.1)] transition-colors"
                >
                  Richiedi nuovi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interview Scheduling Modal */}
      <AnimatePresence>
        {interviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[rgba(6,16,30,0.85)] backdrop-blur-[12px] z-[250] flex items-center justify-center p-4"
            onClick={() => setInterviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="backdrop-blur-xl bg-[rgba(13,30,52,0.95)] border border-[rgba(91,184,245,0.15)] rounded-2xl shadow-drawer w-full max-w-[480px] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Fissa colloquio</h3>
                  <p className="text-xs text-text-muted">{selectedEmployee?.firstName} {selectedEmployee?.lastName[0]}.</p>
                </div>
                <button onClick={() => setInterviewOpen(false)} className="p-2 rounded-lg hover:bg-white/10 hover:rotate-90 transition-all">
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Data</label>
                  <input type="date" className="w-full bg-[#06101E] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-primary" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Ora</label>
                  <select className="w-full bg-[#06101E] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-primary">
                    {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Link Meet</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value="https://meet.google.com/ats-colloquio-xyz"
                      readOnly
                      className="flex-1 bg-[#06101E] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-text-muted outline-none"
                    />
                    <button className="px-3 py-2 bg-[rgba(91,184,245,0.1)] text-sky-primary rounded-xl text-sm hover:bg-[rgba(91,184,245,0.2)] transition-colors">
                      Genera
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setInterviewOpen(false)} className="flex-1 px-4 py-2.5 text-sm text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                  Annulla
                </button>
                <button
                  onClick={() => { setInterviewOpen(false); addToast({ type: 'success', title: 'Colloquio fissato', message: 'L\'invito è stato inviato al candidato.' }) }}
                  className="flex-1 px-4 py-2.5 text-sm text-text-inverse gradient-sky rounded-xl hover:brightness-110 transition-all"
                >
                  Conferma e invia
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
