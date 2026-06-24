import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Search, Plus,
  AlertOctagon, X, CheckCircle, Clock,
  UserCheck, Euro,
} from 'lucide-react'
import StatusPill from '@/components/admin/StatusPill'
import GlassCard from '@/components/admin/GlassCard'
import GlassBadge from '@/components/admin/GlassBadge'
import Avatar from '@/components/Avatar'
import { useToast } from '@/components/ui/ToastSystem'
import { mockShifts, mockEmployees, mockReperibili, getHourlyRate } from '@/data/mockAdmin'
import { cn } from '@/lib/utils'

interface Shift {
  id: number
  structureCode: string
  employeeCode: string | null
  role: string
  time: string
  status: string
  day: number
  date: string
}

const dayNames = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM']
const dayDates = ['12 Mag', '13 Mag', '14 Mag', '15 Mag', '16 Mag', '17 Mag', '18 Mag']

const statusStyles: Record<string, { bg: string; border: string; dot: string }> = {
  'Programmato': { bg: 'bg-[#0F2137]', border: 'border-l-[#5BB8F5]', dot: 'bg-[#5BB8F5]' },
  'In corso': { bg: 'bg-[rgba(30,201,154,0.08)]', border: 'border-l-[#1EC99A]', dot: 'bg-[#1EC99A]' },
  'Completato': { bg: 'bg-[rgba(148,163,184,0.05)]', border: 'border-l-[#5E7A95]', dot: 'bg-[#5E7A95]' },
  'No-show': { bg: 'bg-[rgba(240,69,69,0.08)]', border: 'border-l-[#F04545]', dot: 'bg-[#F04545]' },
  'Cancellato': { bg: 'bg-[rgba(148,163,184,0.05)]', border: 'border-l-[#5E7A95]', dot: 'bg-[#5E7A95]' },
  'Da assegnare': { bg: 'bg-[rgba(245,184,0,0.08)]', border: 'border-l-[#F5B800]', dot: 'bg-[#F5B800]' },
}

const rankColors: Record<string, string> = { Rookie: '#94A3B8', Affidabile: '#5BB8F5', Senior: '#3AA3E8', Elite: '#1EC99A', Ambassador: '#F5B800' }

const employeePhotos = [
  '/avatar-employee-1.jpg', '/avatar-employee-2.jpg', '/avatar-employee-3.jpg', '/avatar-employee-4.jpg',
  '/avatar-employee-5.jpg', '/avatar-employee-6.jpg', '/avatar-employee-7.jpg', '/avatar-employee-8.jpg',
]

export default function AdminShifts() {
  const { addToast } = useToast()
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [noShowActive, setNoShowActive] = useState(false)
  const [roleFilter, setRoleFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredShifts = useMemo(() => {
    return mockShifts.filter(s => {
      const matchRole = roleFilter === 'all' || s.role === roleFilter
      return matchRole
    })
  }, [roleFilter])

  const hasNoShow = mockShifts.some(s => s.status === 'No-show')

  const shiftsByDay = useMemo(() => {
    const byDay: Record<number, Shift[]> = {}
    for (let i = 0; i < 7; i++) byDay[i] = []
    filteredShifts.forEach(s => {
      if (byDay[s.day]) byDay[s.day].push(s)
    })
    return byDay
  }, [filteredShifts])

  const handleAssign = () => {
    setAssignOpen(false)
    addToast({ type: 'success', title: 'Dipendente assegnato', message: 'Il turno è stato assegnato con successo.' })
  }

  const handleNotifyAll = () => {
    addToast({ type: 'info', title: 'Notifica inviata', message: 'Tutti i reperibili disponibili sono stati notificati.' })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-[28px] font-semibold text-white">Gestione Turni</h1>
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
            Esporta settimana
          </button>
          <button
            onClick={() => addToast({ type: 'info', title: 'Nuovo turno', message: 'Il wizard di creazione turno verrà aperto.' })}
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-inverse gradient-sky rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(91,184,245,0.2)]"
          >
            <Plus className="w-4 h-4" /> Nuovo turno
          </button>
        </div>
      </div>

      {/* Calendar Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <span className="text-lg font-semibold text-white whitespace-nowrap">Settimana 20 — 12-18 Maggio 2026</span>
          <button className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </button>
          <button className="px-3 py-1.5 text-xs text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-colors ml-2">
            Oggi
          </button>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="bg-[rgba(6,16,30,0.6)] text-sm text-text-secondary border border-white/10 rounded-xl px-3 py-2 outline-none backdrop-blur-sm"
          >
            <option value="all">Tutti i ruoli</option>
            <option value="Cameriere">Cameriere</option>
            <option value="Chef">Chef</option>
            <option value="Chef de Partie">Chef de Partie</option>
            <option value="Barista">Barista</option>
            <option value="Barman">Barman</option>
            <option value="Receptionist">Receptionist</option>
            <option value="SPA Staff">SPA Staff</option>
          </select>
          {hasNoShow && (
            <GlassBadge variant="error" pulse>
              Alert attivi
            </GlassBadge>
          )}
        </div>
      </div>

      {/* No-Show Protocol Banner */}
      <AnimatePresence>
        {noShowActive && (
          <motion.div
            initial={{ y: -72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -72, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
            className="bg-[rgba(240,69,69,0.15)] backdrop-blur-md border border-[rgba(240,69,69,0.3)] rounded-xl px-5 py-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertOctagon className="w-5 h-5 text-error" />
                <span className="text-sm font-semibold text-error">
                  NO-SHOW RILEVATO: RIST-BN-0047 — Location Villa Rossi — Nessun check-in entro 15 min
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-error">Protocollo: 00:03:42</span>
                <button onClick={() => setNoShowActive(false)} className="text-error hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Reperibili Pool */}
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white">Pool reperibili disponibili</h4>
                <label className="flex items-center gap-2 text-xs text-text-muted">
                  <input type="checkbox" defaultChecked className="rounded accent-sky-primary" />
                  Solo reperibili attivi oggi
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mockReperibili.map((rep, i) => (
                  <motion.div
                    key={rep.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border backdrop-blur-sm',
                      rep.available
                        ? 'bg-[rgba(30,201,154,0.05)] border-[rgba(30,201,154,0.2)]'
                        : 'bg-white/[0.02] border-white/5 opacity-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={employeePhotos[(rep.id) % employeePhotos.length]}
                        alt={rep.name}
                        size="sm"
                        className={cn('border-2', rep.available ? 'border-success' : 'border-text-muted')}
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{rep.name} <span className="font-mono text-xs text-sky-primary">{rep.code}</span></p>
                        <p className="text-xs text-text-muted">{rep.rank} · {rep.distance}</p>
                      </div>
                    </div>
                    {rep.available && (
                      <button
                        onClick={() => addToast({ type: 'info', title: 'Notifica inviata', message: `${rep.name} è stato notificato.` })}
                        className="px-3 py-1 text-xs text-text-inverse gradient-sky rounded-lg hover:brightness-110 transition-all"
                      >
                        Notifica
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
              <button
                onClick={handleNotifyAll}
                className="w-full mt-3 py-2.5 text-sm text-text-inverse gradient-sky rounded-xl hover:brightness-110 transition-all"
              >
                Notifica tutti i disponibili
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Calendar Grid */}
      <GlassCard delay={0.2} noPadding>
        {/* Time slot header */}
        <div className="grid grid-cols-7 border-b border-[rgba(255,255,255,0.06)]">
          {dayNames.map((name, i) => (
            <div
              key={name}
              className={cn(
                'px-3 py-3 text-center border-r border-[rgba(255,255,255,0.04)]',
                i === 0 && 'bg-[rgba(91,184,245,0.05)]'
              )}
            >
              <p className="text-xs font-medium text-text-muted">{name}</p>
              <p className={cn('text-lg font-bold', i === 0 ? 'text-sky-primary' : 'text-white')}>{dayDates[i].split(' ')[0]}</p>
              <p className="text-[10px] text-text-muted">{dayDates[i]}</p>
            </div>
          ))}
        </div>
        {/* Shift columns */}
        <div className="grid grid-cols-7 min-h-[500px]">
          {dayNames.map((_, dayIndex) => (
            <div
              key={dayIndex}
              className={cn(
                'p-2 space-y-2 border-r border-[rgba(255,255,255,0.04)]',
                dayIndex === 0 && 'bg-[rgba(91,184,245,0.02)]'
              )}
            >
              {shiftsByDay[dayIndex]?.map((shift, si) => (
                <motion.div
                  key={shift.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + si * 0.03 }}
                  onClick={() => { setSelectedShift(shift); if (shift.status === 'No-show') setNoShowActive(true) }}
                  className={cn(
                    'p-3 rounded-xl border-l-[3px] cursor-pointer hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 backdrop-blur-sm bg-white/5',
                    statusStyles[shift.status]?.border || 'border-l-[#5BB8F5]'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-text-muted">{shift.time}</span>
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      statusStyles[shift.status]?.dot || 'bg-[#5BB8F5]',
                      (shift.status === 'No-show' || shift.status === 'In corso') && 'animate-status-pulse'
                    )} />
                  </div>
                  <p className="font-mono text-[10px] text-sky-primary mb-1">{shift.structureCode}</p>
                  <p className="text-xs font-semibold text-white">{shift.role}</p>
                  {shift.employeeCode ? (
                    <div className="flex items-center gap-1 mt-1">
                      <Avatar
                        src={employeePhotos[parseInt(shift.employeeCode.split('-')[2] || '0') % employeePhotos.length]}
                        alt={shift.employeeCode}
                        size="xs"
                        className="border border-white/10"
                      />
                      <p className="font-mono text-[10px] text-text-muted">{shift.employeeCode}</p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-warning font-medium mt-1">Da assegnare</p>
                  )}
                </motion.div>
              ))}
              {(!shiftsByDay[dayIndex] || shiftsByDay[dayIndex].length === 0) && (
                <p className="text-xs text-text-muted text-center py-8">Nessun turno</p>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-text-muted">
        {Object.entries(statusStyles).map(([status, style]) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className={cn('w-2 h-2 rounded-full', style.dot)} />
            {status}
          </span>
        ))}
      </div>

      {/* Shift Detail Drawer */}
      <AnimatePresence>
        {selectedShift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[rgba(6,16,30,0.8)] backdrop-blur-[12px] z-[200]"
            onClick={() => setSelectedShift(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
              onClick={e => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-full max-w-[480px] backdrop-blur-xl bg-[rgba(13,30,52,0.95)] border-l border-[rgba(91,184,245,0.1)] rounded-l-[20px] shadow-drawer overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-1">Turno {selectedShift.date}</h2>
                    <span className="font-mono text-xs text-sky-primary bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] rounded px-2 py-0.5">
                      {selectedShift.structureCode}
                    </span>
                  </div>
                  <button onClick={() => setSelectedShift(null)} className="p-2 rounded-lg hover:bg-white/10 hover:rotate-90 transition-all">
                    <X className="w-5 h-5 text-text-muted" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {[
                    { label: 'Stato', value: <StatusPill status={selectedShift.status === 'No-show' ? 'No-show' : selectedShift.status === 'In corso' ? 'In corso' : 'Programmato'} pulse={selectedShift.status === 'No-show' || selectedShift.status === 'In corso'} /> },
                    { label: 'Ruolo', value: <span className="text-sm text-white">{selectedShift.role}</span> },
                    { label: 'Orario', value: <span className="text-sm font-mono text-white">{selectedShift.time}</span> },
                    { label: 'Dipendente', value: selectedShift.employeeCode ? (
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={employeePhotos[parseInt(selectedShift.employeeCode.split('-')[2] || '0') % employeePhotos.length]}
                          alt={selectedShift.employeeCode}
                          size="sm"
                          className="border border-white/10"
                        />
                        <span className="font-mono text-sm text-sky-primary">{selectedShift.employeeCode}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-warning">Da assegnare</span>
                    ) },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)]">
                      <span className="text-sm text-text-muted">{item.label}</span>
                      {item.value}
                    </div>
                  ))}
                </div>

                {/* Status Timeline */}
                <div className="mb-6">
                  <p className="text-xs text-text-muted mb-3">Cronologia turno</p>
                  <div className="space-y-0">
                    {['Creato', 'Assegnato', 'Notificato', 'Confermato', 'Check-in', 'Check-out', 'Fatturato'].map((step, i) => {
                      const completed = i < 4
                      const current = i === 4
                      return (
                        <div key={step} className="flex items-center gap-3 py-1">
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center border-2',
                            completed ? 'bg-success border-success' : current ? 'bg-sky-primary border-sky-primary' : 'bg-transparent border-[rgba(255,255,255,0.1)]'
                          )}>
                            {completed ? <CheckCircle className="w-3 h-3 text-text-inverse" /> : current ? <Clock className="w-3 h-3 text-text-inverse animate-pulse" /> : <div className="w-2 h-2 rounded-full bg-text-muted" />}
                          </div>
                          <span className={cn('text-xs', completed ? 'text-success' : current ? 'text-sky-primary' : 'text-text-muted')}>{step}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  {!selectedShift.employeeCode && (
                    <button
                      onClick={() => { setAssignOpen(true); setSelectedShift(null) }}
                      className="w-full py-2.5 text-sm text-text-inverse gradient-sky rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(91,184,245,0.15)]"
                    >
                      <UserCheck className="w-4 h-4" /> Assegna dipendente
                    </button>
                  )}
                  {selectedShift.status === 'No-show' && (
                    <button
                      onClick={() => setNoShowActive(true)}
                      className="w-full py-2.5 text-sm text-warning border border-warning/30 rounded-xl hover:bg-[rgba(245,184,0,0.1)] transition-colors flex items-center justify-center gap-2"
                    >
                      <AlertOctagon className="w-4 h-4" /> Attiva pool reperibili
                    </button>
                  )}
                  <button className="w-full py-2.5 text-sm text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                    Modifica turno
                  </button>
                  <button
                    onClick={() => { setSelectedShift(null); addToast({ type: 'warning', title: 'Turno cancellato', message: 'Il turno è stato cancellato.' }) }}
                    className="w-full py-2.5 text-sm text-error border border-error/30 rounded-xl hover:bg-[rgba(240,69,69,0.1)] transition-colors"
                  >
                    Cancella turno
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Employee Modal */}
      <AnimatePresence>
        {assignOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[rgba(6,16,30,0.85)] backdrop-blur-[12px] z-[250] flex items-center justify-center p-4"
            onClick={() => setAssignOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="backdrop-blur-xl bg-[rgba(13,30,52,0.95)] border border-[rgba(91,184,245,0.15)] rounded-2xl shadow-drawer w-full max-w-[600px] p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Assegna dipendente</h3>
                  <p className="text-xs text-text-muted">Cameriere · RIST-BN-0012 · 08:00-16:00</p>
                </div>
                <button onClick={() => setAssignOpen(false)} className="p-2 rounded-lg hover:bg-white/10 hover:rotate-90 transition-all">
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>
              <div className="flex items-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 mb-4">
                <Search className="w-4 h-4 text-text-muted mr-2" />
                <input
                  type="text"
                  placeholder="Cerca per codice, nome, ruolo..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-white placeholder-text-muted outline-none w-full"
                />
              </div>
              <div className="space-y-2 mb-4">
                {mockEmployees
                  .filter(e => e.status === 'Attivo')
                  .slice(0, 8)
                  .map((emp, i) => {
                    const matchScore = 60 + ((emp.id * 7) % 41)
                    const rate = getHourlyRate(emp.zone, emp.role)
                    return (
                      <motion.div
                        key={emp.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center justify-between p-3 rounded-xl border border-white/5 hover:bg-[rgba(91,184,245,0.05)] hover:border-[rgba(91,184,245,0.2)] transition-all cursor-pointer backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-3">
                          <input type="radio" name="employee" className="accent-sky-primary" />
                          <Avatar
                            src={employeePhotos[(emp.id - 1) % employeePhotos.length]}
                            alt={`${emp.firstName} ${emp.lastName}`}
                            size="sm"
                            className="border-2"
                            style={{ borderColor: rankColors[emp.rank] || '#94A3B8' }}
                          />
                          <div>
                            <p className="text-sm font-medium text-white">{emp.firstName} {emp.lastName[0]}. <span className="font-mono text-xs text-sky-primary">{emp.code}</span></p>
                            <p className="text-xs text-text-muted">{emp.role} · {emp.rank} · {emp.zone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn('text-sm font-bold', matchScore > 80 ? 'text-sky-primary' : 'text-text-secondary')}>
                            {matchScore}%
                          </p>
                          <GlassBadge variant="sky" icon={<Euro className="w-3 h-3" />} className="mt-1">
                            €{rate}/h
                          </GlassBadge>
                        </div>
                      </motion.div>
                    )
                  })}
              </div>
              <div className="flex gap-3">
                <button onClick={handleAssign} className="flex-1 px-4 py-2.5 text-sm text-text-inverse gradient-sky rounded-xl hover:brightness-110 transition-all">
                  Assegna selezionato
                </button>
                <button onClick={() => setAssignOpen(false)} className="px-4 py-2.5 text-sm text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                  Notifica top 5
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
