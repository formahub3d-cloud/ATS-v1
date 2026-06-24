import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Eye, Edit, Ban, CheckCircle, X,
  FileText, Download, Plus, AlertOctagon,
  Gavel, MapPin,
} from 'lucide-react'
import StatusPill from '@/components/admin/StatusPill'
import DataTable from '@/components/admin/DataTable'
import GlassCard from '@/components/admin/GlassCard'
import GlassBadge from '@/components/admin/GlassBadge'
import CoverPhoto from '@/components/CoverPhoto'
import { useToast } from '@/components/ui/ToastSystem'
import GlassTooltip from '@/components/ui/GlassTooltip'
import { LoadingState, ErrorState } from '@/components/states'
import { useAsync } from '@/hooks/useAsync'
import { getStructures, getPenalties } from '@/services/adminService'
import type { Structure } from '@/types/domain'
import { cn } from '@/lib/utils'

const statusOptions = [
  { label: 'Tutte', value: 'all', color: 'text-text-muted' },
  { label: 'Attive', value: 'Attiva', color: 'text-success' },
  { label: 'In attesa', value: 'In attesa', color: 'text-warning' },
  { label: 'Sospese', value: 'Sospesa', color: 'text-error' },
]

const structurePhotos = [
  '/structure-1.jpg', '/structure-2.jpg', '/structure-3.jpg', '/structure-4.jpg',
  '/structure-5.jpg', '/structure-6.jpg', '/structure-7.jpg', '/structure-8.jpg',
]

export default function AdminStructures() {
  const { addToast } = useToast()
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null)
  const [penaltyModalOpen, setPenaltyModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('profilo')
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [hourlyRateEdit, setHourlyRateEdit] = useState<string | null>(null)

  // Dati dal service layer (oggi mock async, domani API): stato uniforme loading/error/data.
  const structuresState = useAsync(getStructures, [])
  const penaltiesState = useAsync(getPenalties, [])
  const structures = useMemo(() => structuresState.data ?? [], [structuresState.data])
  const penalties = useMemo(() => penaltiesState.data ?? [], [penaltiesState.data])

  const filteredStructures = useMemo(() => {
    return structures.filter(s => {
      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      const matchSearch = !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.piva.includes(searchQuery)
      const matchType = typeFilter === 'all' || s.type === typeFilter
      return matchStatus && matchSearch && matchType
    })
  }, [structures, statusFilter, searchQuery, typeFilter])

  const stats = useMemo(() => ({
    all: structures.length,
    active: structures.filter(s => s.status === 'Attiva').length,
    pending: structures.filter(s => s.status === 'In attesa').length,
    suspended: structures.filter(s => s.status === 'Sospesa').length,
  }), [structures])

  const tabs = [
    { key: 'profilo', label: 'Profilo' },
    { key: 'turni', label: 'Turni' },
    { key: 'fatture', label: 'Fatture' },
    { key: 'pagamenti', label: 'Pagamenti' },
    { key: 'note', label: 'Note' },
    { key: 'penali', label: 'Penali' },
  ]

  const handleApprove = (s: Structure) => {
    addToast({ type: 'success', title: 'Struttura approvata', message: `${s.name} è ora attiva sulla piattaforma.` })
  }

  const handleReject = (s: Structure) => {
    addToast({ type: 'warning', title: 'Struttura rifiutata', message: `${s.name} è stata rifiutata.` })
  }

  const handleSuspend = (s: Structure) => {
    addToast({ type: 'error', title: 'Struttura sospesa', message: `${s.name} non può più richiedere turni.` })
  }

  const handleApplyPenalty = () => {
    setPenaltyModalOpen(false)
    addToast({ type: 'error', title: 'Penale applicata', message: 'La penale è stata registrata e notificata alla struttura.' })
  }

  const handleExport = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      addToast({ type: 'success', title: 'Esportazione completata', message: 'Il file CSV è stato generato con successo.' })
    }, 1500)
  }

  const columns = [
    {
      key: 'name',
      header: 'Struttura',
      render: (s: Structure) => (
        <div className="flex items-center gap-3">
          <CoverPhoto
            src={structurePhotos[(s.id - 1) % structurePhotos.length]}
            alt={s.name}
            className="w-12 h-12 rounded-xl flex-shrink-0"
          />
          <span className="text-sm font-semibold text-white">{s.name}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'code',
      header: 'Codice',
      render: (s: Structure) => (
        <span className="font-mono text-xs text-sky-primary bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] rounded px-2 py-0.5">
          {s.code}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (s: Structure) => <span className="text-sm text-text-secondary">{s.type}</span>,
      sortable: true,
    },
    {
      key: 'zone',
      header: 'Zona',
      render: (s: Structure) => (
        <GlassBadge variant="zone" icon={<MapPin className="w-3 h-3" />}>
          {s.zone}
        </GlassBadge>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Stato',
      render: (s: Structure) => <StatusPill status={s.status} pulse={s.status === 'In attesa'} />,
      sortable: true,
    },
    {
      key: 'shiftsMonth',
      header: 'Turni/mese',
      render: (s: Structure) => <span className="text-sm text-text-secondary">{s.shiftsMonth || '-'}</span>,
      sortable: true,
    },
    {
      key: 'revenueMonth',
      header: 'Fatturato',
      render: (s: Structure) => <span className="text-sm text-text-secondary">{s.revenueMonth ? `€${s.revenueMonth.toLocaleString('it-IT')}` : '-'}</span>,
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Azioni',
      render: (s: Structure) => (
        <div className="flex items-center gap-1">
          <GlassTooltip content="Visualizza dettagli">
            <button onClick={() => setSelectedStructure(s)} className="p-1.5 rounded-md hover:bg-white/5 transition-colors">
              <Eye className="w-4 h-4 text-text-muted" />
            </button>
          </GlassTooltip>
          {s.status === 'In attesa' ? (
            <>
              <GlassTooltip content="Approva struttura">
                <button onClick={() => handleApprove(s)} className="p-1.5 rounded-md hover:bg-[rgba(30,201,154,0.1)] transition-colors">
                  <CheckCircle className="w-4 h-4 text-success" />
                </button>
              </GlassTooltip>
              <GlassTooltip content="Rifiuta struttura">
                <button onClick={() => handleReject(s)} className="p-1.5 rounded-md hover:bg-[rgba(240,69,69,0.1)] transition-colors">
                  <X className="w-4 h-4 text-error" />
                </button>
              </GlassTooltip>
            </>
          ) : s.status === 'Sospesa' ? (
            <GlassTooltip content="Riattiva struttura">
              <button onClick={() => handleApprove(s)} className="p-1.5 rounded-md hover:bg-[rgba(30,201,154,0.1)] transition-colors">
                <CheckCircle className="w-4 h-4 text-success" />
              </button>
            </GlassTooltip>
          ) : (
            <>
              <GlassTooltip content="Modifica struttura">
                <button className="p-1.5 rounded-md hover:bg-[rgba(91,184,245,0.1)] transition-colors">
                  <Edit className="w-4 h-4 text-sky-primary" />
                </button>
              </GlassTooltip>
              <GlassTooltip content="Sospendi struttura">
                <button onClick={() => handleSuspend(s)} className="p-1.5 rounded-md hover:bg-[rgba(240,69,69,0.1)] transition-colors">
                  <Ban className="w-4 h-4 text-error" />
                </button>
              </GlassTooltip>
            </>
          )}
        </div>
      ),
    },
  ]

  const dataLoading = structuresState.loading || penaltiesState.loading
  const dataError = structuresState.error || penaltiesState.error

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <LoadingState rows={6} />
      </div>
    )
  }

  if (dataError || !structuresState.data || !penaltiesState.data) {
    return (
      <div className="space-y-6">
        <ErrorState onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-semibold text-white">Gestione Strutture</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={loading}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-text-secondary border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
          >
            {loading ? <Download className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Esporta CSV
          </button>
          <button
            onClick={() => addToast({ type: 'info', title: 'Nuova struttura', message: 'Il wizard di registrazione verrà aperto.' })}
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-inverse gradient-sky rounded-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(91,184,245,0.2)]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Aggiungi struttura</span>
          </button>
        </div>
      </div>

      {/* Stats Pills */}
      <div className="flex flex-wrap gap-3">
        {statusOptions.map((opt, i) => (
          <motion.button
            key={opt.value}
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            onClick={() => setStatusFilter(opt.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 backdrop-blur-sm',
              statusFilter === opt.value
                ? 'bg-[rgba(91,184,245,0.1)] border-sky-primary text-sky-primary -translate-y-0.5 shadow-[0_0_20px_rgba(91,184,245,0.1)]'
                : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/[0.07]'
            )}
          >
            {opt.value === 'all' ? 'Tutte' : opt.label}: <span className={statusFilter === opt.value ? 'text-sky-primary' : opt.color}>{opt.value === 'all' ? stats.all : opt.value === 'Attiva' ? stats.active : opt.value === 'In attesa' ? stats.pending : stats.suspended}</span>
            {opt.value === 'Attiva' && <span className="w-2 h-2 bg-success rounded-full animate-status-pulse" />}
          </motion.button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-text-muted mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Cerca per nome, codice, P.IVA..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-text-muted outline-none w-full"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-[rgba(6,16,30,0.6)] text-sm text-text-secondary border border-white/10 rounded-xl px-3 py-2 outline-none backdrop-blur-sm"
        >
          <option value="all">Tutti i tipi</option>
          <option value="Ristorante">Ristorante</option>
          <option value="Hotel">Hotel</option>
          <option value="Bar">Bar</option>
          <option value="SPA">SPA</option>
          <option value="Location">Location</option>
          <option value="Resort">Resort</option>
        </select>
      </div>

      {/* Table */}
      <GlassCard delay={0.2}>
        <DataTable
          columns={columns}
          data={filteredStructures}
          keyExtractor={s => s.id}
          onRowClick={setSelectedStructure}
          rowClassName={(s: Structure) =>
            s.status === 'In attesa' ? 'border-l-[3px] border-l-warning bg-[rgba(245,184,0,0.03)]' :
            s.status === 'Sospesa' ? 'border-l-[3px] border-l-error' : ''
          }
          pageSize={8}
        />
      </GlassCard>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedStructure && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[rgba(6,16,30,0.88)] backdrop-blur-[12px] z-[200]"
            onClick={() => setSelectedStructure(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
              onClick={e => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-full max-w-[600px] backdrop-blur-xl bg-[rgba(13,30,52,0.95)] border-l border-[rgba(91,184,245,0.1)] rounded-l-[20px] shadow-drawer overflow-y-auto"
            >
              {/* Drawer Header with Cover */}
              <div className="relative h-[200px] overflow-hidden rounded-tl-[20px]">
                <CoverPhoto
                  src={structurePhotos[(selectedStructure.id - 1) % structurePhotos.length]}
                  alt={selectedStructure.name}
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,30,52,0.95)] via-[rgba(13,30,52,0.4)] to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-playfair font-bold text-white">{selectedStructure.name}</h2>
                        <span className="font-mono text-xs text-sky-primary bg-[rgba(91,184,245,0.12)] border border-[rgba(91,184,245,0.2)] rounded px-2 py-0.5 backdrop-blur-sm">
                          {selectedStructure.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusPill status={selectedStructure.status} pulse={selectedStructure.status === 'In attesa'} />
                        <GlassBadge variant="zone" icon={<MapPin className="w-3 h-3" />}>
                          {selectedStructure.zone}
                        </GlassBadge>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedStructure(null)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors hover:rotate-90 duration-200"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="sticky top-0 bg-[rgba(13,30,52,0.95)] border-b border-[rgba(255,255,255,0.06)] px-6 py-3 z-10 backdrop-blur-xl">
                <div className="flex gap-1 overflow-x-auto">
                  {tabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
                        activeTab === tab.key
                          ? 'bg-[rgba(91,184,245,0.1)] text-sky-primary border-b-2 border-sky-primary'
                          : 'text-text-muted hover:text-white hover:bg-white/[0.03]'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'profilo' && (
                    <motion.div
                      key="profilo"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Ragione sociale', value: `${selectedStructure.name} S.r.l.` },
                          { label: 'P.IVA', value: selectedStructure.piva, mono: true },
                          { label: 'Indirizzo', value: selectedStructure.address },
                          { label: 'Zona', value: selectedStructure.zone },
                          { label: 'Referente', value: selectedStructure.contact },
                          { label: 'Telefono', value: selectedStructure.phone, mono: true },
                          { label: 'Fee annuale', value: `€${selectedStructure.fee.toLocaleString('it-IT')}` },
                          { label: 'Data iscrizione', value: selectedStructure.joinDate },
                        ].map((item, i) => (
                          <div key={i} className="backdrop-blur-sm bg-white/[0.03] border border-white/5 rounded-xl p-3">
                            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">{item.label}</p>
                            <p className={`text-sm text-white ${item.mono ? 'font-mono' : ''}`}>{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Tariffa oraria */}
                      <div className="backdrop-blur-sm bg-white/[0.03] border border-white/5 rounded-xl p-4">
                        <p className="text-xs text-text-muted mb-2">Tariffa oraria corrente</p>
                        <div className="flex items-center gap-2">
                          {hourlyRateEdit === selectedStructure.code ? (
                            <div className="flex items-center gap-2">
                              <span className="text-text-muted">€</span>
                              <input
                                type="number"
                                defaultValue={18}
                                className="w-20 bg-[#06101E] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-sky-primary"
                                autoFocus
                              />
                              <span className="text-text-muted">/h</span>
                              <button
                                onClick={() => { setHourlyRateEdit(null); addToast({ type: 'success', title: 'Tariffa aggiornata', message: 'La nuova tariffa oraria è stata salvata.' }) }}
                                className="p-1 rounded-md bg-success/20 text-success"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-sky-primary">€18/h</span>
                              <button
                                onClick={() => setHourlyRateEdit(selectedStructure.code)}
                                className="p-1 rounded-md hover:bg-white/5 transition-colors"
                              >
                                <Edit className="w-3 h-3 text-text-muted" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contract */}
                      <div className="backdrop-blur-sm bg-white/[0.03] border border-white/5 rounded-xl p-4">
                        <p className="text-xs text-text-muted mb-2">Stato contratto</p>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm text-success font-medium">Contratto firmato</span>
                          <span className="text-xs text-text-muted">15/01/2025</span>
                        </div>
                        <button className="text-xs text-sky-primary hover:underline mt-2 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Scarica PDF
                        </button>
                      </div>

                      {/* Photos */}
                      <div>
                        <p className="text-xs text-text-muted mb-2">Foto struttura</p>
                        <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                          {structurePhotos.slice(0, 4).map((src, i) => (
                            <CoverPhoto
                              key={i}
                              src={src}
                              alt={`Foto ${i + 1}`}
                              className="w-[120px] h-[90px] rounded-xl flex-shrink-0 snap-start hover:scale-105 transition-transform duration-200"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-3">
                        <button className="flex-1 px-4 py-2.5 text-sm text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                          Modifica tariffa
                        </button>
                        <button
                          onClick={() => setPenaltyModalOpen(true)}
                          className="flex-1 px-4 py-2.5 text-sm text-error border border-error/30 rounded-xl hover:bg-[rgba(240,69,69,0.1)] transition-colors flex items-center justify-center gap-1"
                        >
                          <Gavel className="w-3 h-3" /> Applica penale
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'penali' && (
                    <motion.div
                      key="penali"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {penalties.map(p => (
                        <div key={p.id} className="backdrop-blur-sm bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-[rgba(240,69,69,0.3)] hover:-translate-y-0.5 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">{p.type}</span>
                            <StatusPill status={p.status} pulse={p.status === 'In attesa'} />
                          </div>
                          <p className="text-xs text-text-muted">Importo: €{p.amount.toLocaleString('it-IT')} · {p.condition}</p>
                          <p className="text-xs text-text-muted mt-1">{p.date}</p>
                        </div>
                      ))}
                      <button
                        onClick={() => setPenaltyModalOpen(true)}
                        className="w-full py-2.5 text-sm text-error border border-dashed border-error/30 rounded-xl hover:bg-[rgba(240,69,69,0.05)] transition-colors flex items-center justify-center gap-1"
                      >
                        <Gavel className="w-4 h-4" /> Applica nuova penale
                      </button>
                    </motion.div>
                  )}

                  {activeTab === 'turni' && (
                    <motion.div key="turni" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        {[
                          { value: selectedStructure.shiftsMonth, label: 'Turni/mese' },
                          { value: `${Math.round(selectedStructure.shiftsMonth * 8 * 0.78)}h`, label: 'Ore totali' },
                          { value: '3%', label: 'Tasso cancell.', color: 'text-success' },
                          { value: '4.8', label: 'Valutaz.' },
                        ].map((stat, i) => (
                          <div key={i} className="backdrop-blur-sm bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
                            <p className={`text-lg font-playfair font-bold ${stat.color || 'text-white'}`}>{stat.value}</p>
                            <p className="text-[10px] text-text-muted">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-text-muted text-center py-8">Lista turni disponibile nella sezione dedicata</p>
                    </motion.div>
                  )}

                  {['fatture', 'pagamenti', 'note'].includes(activeTab) && (
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

      {/* Penalty Modal */}
      <AnimatePresence>
        {penaltyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[rgba(6,16,30,0.85)] backdrop-blur-[12px] z-[250] flex items-center justify-center p-4"
            onClick={() => setPenaltyModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="backdrop-blur-xl bg-[rgba(13,30,52,0.95)] border border-[rgba(91,184,245,0.15)] rounded-2xl shadow-drawer w-full max-w-[480px] p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[rgba(240,69,69,0.15)] flex items-center justify-center">
                  <AlertOctagon className="w-5 h-5 text-error" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Applica penale</h3>
                  <p className="text-xs text-text-muted">{selectedStructure?.name}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Tipo penalità</label>
                  <select className="w-full bg-[#06101E] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-primary">
                    <option>Cancellazione &lt; 24h</option>
                    <option>Cancellazione 24-48h</option>
                    <option>Rapporto diretto</option>
                    <option>Assunzione diretta</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Importo (€)</label>
                  <input
                    type="number"
                    defaultValue={150}
                    className="w-full bg-[#06101E] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Motivazione</label>
                  <textarea
                    rows={3}
                    className="w-full bg-[#06101E] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-primary resize-none"
                    placeholder="Inserisci motivazione..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setPenaltyModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleApplyPenalty}
                  className="flex-1 px-4 py-2 text-sm text-white bg-error rounded-xl hover:bg-[#D93A3A] transition-colors"
                >
                  Applica penale
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
