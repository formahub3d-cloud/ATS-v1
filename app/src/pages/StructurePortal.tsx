import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusCircle, Search, QrCode, FileText, MessageCircle,
  CheckCircle, UserCheck, CreditCard, MessageSquare,
  Star, ChevronRight, Calendar, Users, Clock,
  X, Info, Bell, BellRing, LayoutDashboard, HeartHandshake,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastSystem'
import GlassTooltip from '@/components/ui/GlassTooltip'
import { SkeletonKpiRow, SkeletonCard, SkeletonText } from '@/components/ui/skeleton'
import Avatar from '@/components/Avatar'
import CoverPhoto from '@/components/CoverPhoto'
import GlassShiftCard, { type GlassShift } from '@/components/structure/GlassShiftCard'
import MatchStatus, { type MatchState } from '@/components/structure/MatchStatus'

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

const shifts: GlassShift[] = [
  { id: '1', date: '2026-05-13', dayNum: '13', month: 'MAG', role: 'Cameriere', timeStart: '08:00', timeEnd: '16:00', employeeCode: 'ATS-D-0047', employeeAvatar: avatarMap['ATS-D-0047'], status: 'confirmed', structureCode: 'RIST-BN-0012', zone: 'Centro', note: 'Servizio sala principale, 80 coperti' },
  { id: '2', date: '2026-05-14', dayNum: '14', month: 'MAG', role: 'Chef de Partie', timeStart: '10:00', timeEnd: '18:00', status: 'pending', structureCode: 'RIST-BN-0012', zone: 'Centro' },
  { id: '3', date: '2026-05-15', dayNum: '15', month: 'MAG', role: 'Barman', timeStart: '18:00', timeEnd: '02:00', employeeCode: 'ATS-D-0023', employeeAvatar: avatarMap['ATS-D-0023'], status: 'confirmed', structureCode: 'RIST-BN-0012', zone: 'Centro' },
]

const matches: MatchState[] = [
  { id: 'm1', employeeCode: 'ATS-D-0047', employeeName: 'Giulia', role: 'Cameriere', matchScore: 94, phase: 'mutual' },
  { id: 'm2', employeeCode: 'ATS-D-0089', employeeName: 'Sofia', role: 'Barman', matchScore: 91, phase: 'assigned', shiftDate: '15/05' },
  { id: 'm3', employeeCode: 'ATS-D-0012', employeeName: 'Luca', role: 'Chef de Partie', matchScore: 88, phase: 'mutual' },
]

const notifications = [
  { id: 'n1', icon: CheckCircle, color: '#1EC99A', title: 'Check-in confermato', desc: 'ATS-D-0047 — 08:03', time: 'Ieri', unread: false },
  { id: 'n2', icon: UserCheck, color: '#5BB8F5', title: 'Nuovo match', desc: 'ATS-D-0156 — Cameriere, 91% compatibilita', time: '2 giorni fa', unread: true },
  { id: 'n3', icon: CreditCard, color: '#1EC99A', title: 'Pagamento addebitato', desc: '€120,00 — Turno 10/05', time: '3 giorni fa', unread: false },
  { id: 'n4', icon: MessageSquare, color: '#3AA3E8', title: 'Messaggio da ATS', desc: 'Confermato turno del 14/05', time: '4 giorni fa', unread: true },
]

const pendingRatings = [
  { id: 'r1', employeeCode: 'ATS-D-0047', employeeAvatar: avatarMap['ATS-D-0047'], date: '10/05/2026', role: 'Cameriere' },
  { id: 'r2', employeeCode: 'ATS-D-0012', employeeAvatar: avatarMap['ATS-D-0012'], date: '08/05/2026', role: 'Chef de Partie' },
]

const ratingTags = ['Puntualita', 'Professionalita', 'Pulizia', 'Velocita', 'Attitudine']

const kpiData = [
  { label: 'Turni mese', value: '24', delta: '+3 vs mese scorso', icon: Calendar, positive: true },
  { label: 'Spesa totale', value: '€3.456', delta: '-12% vs mese scorso', icon: CreditCard, positive: true },
  { label: 'Rating medio', value: '4.2', delta: 'su 5.0 stelle', icon: Star, positive: true },
  { label: 'Match attivi', value: '7', delta: '2 in attesa', icon: HeartHandshake, positive: true },
]

/* ─────────────── component ─────────────── */

export default function StructurePortal() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [showQRModal, setShowQRModal] = useState(false)
  const [showNewRequestModal, setShowNewRequestModal] = useState(false)
  const [ratings, setRatings] = useState<Record<string, number[]>>({})
  const [dismissedRatings, setDismissedRatings] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const progressDemo = 78

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  const handleRate = useCallback((id: string, tagIndex: number, value: number) => {
    setRatings(prev => {
      const current = prev[id] ? [...prev[id]] : new Array(5).fill(0)
      current[tagIndex] = value
      return { ...prev, [id]: current }
    })
  }, [])

  const handleSaveRating = useCallback((id: string) => {
    setDismissedRatings(prev => [...prev, id])
    addToast({ type: 'success', title: 'Valutazione salvata', message: 'Grazie per il tuo feedback' })
  }, [addToast])

  const handleSkipRating = useCallback((id: string) => {
    setDismissedRatings(prev => [...prev, id])
  }, [])

  const visibleRatings = pendingRatings.filter(r => !dismissedRatings.includes(r.id))
  const unreadCount = notifications.filter(n => n.unread).length

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#06101E] pt-[72px]">
        <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
          <SkeletonKpiRow count={4} />
          <SkeletonCard />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#06101E] pt-[72px]">
      <div className="max-w-[1200px] mx-auto px-6 py-8">

        {/* ── Hero / Welcome Banner with Cover Photo ── */}
        <motion.section
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
          className="relative rounded-[20px] overflow-hidden mb-8"
        >
          <div className="absolute inset-0">
            <CoverPhoto src="/structure-1.jpg" alt="Ristorante Il Torchio" className="w-full h-full rounded-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(13,30,52,0.95)] via-[rgba(13,30,52,0.8)] to-transparent" />
          </div>

          <div className="relative p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="font-playfair text-[28px] font-bold text-white mb-2">
                Benvenuto, Ristorante Il Torchio
              </h1>
              <p className="text-sm text-[#94A3B8] mb-3">
                Fee annuale: €900/anno · Sconto: -10% (128 turni pianificati)
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[rgba(30,201,154,0.15)] text-[#1EC99A] border border-[rgba(30,201,154,0.3)]">
                  <CheckCircle className="w-3 h-3" />
                  Turni completati: 24
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[rgba(91,184,245,0.12)] text-[#5BB8F5] border border-[rgba(91,184,245,0.25)]">
                  <Star className="w-3 h-3" />
                  Rating medio personale: 4.2/5
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[rgba(245,184,0,0.15)] text-[#F5B800] border border-[rgba(245,184,0,0.3)]">
                  <Clock className="w-3 h-3" />
                  Prossimo turno: domani 08:00
                </span>
              </div>
            </div>
            <div className="hidden lg:block flex-shrink-0">
              <CoverPhoto
                src="/structure-1.jpg"
                alt="Ristorante"
                className="w-[200px] h-[150px] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
              />
            </div>
          </div>
        </motion.section>

        {/* ── KPI Stat Cards ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {kpiData.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={cn(
                'rounded-2xl p-6 backdrop-blur-md bg-white/5 border border-white/10',
                'hover:border-[rgba(91,184,245,0.25)] hover:shadow-[0_12px_48px_rgba(91,184,245,0.08)] hover:-translate-y-[3px]',
                'transition-all duration-350 cursor-pointer group'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-[0.08em] text-[#5E7A95]">{kpi.label}</span>
                <kpi.icon className="w-4 h-4 text-[#5BB8F5] opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="font-playfair text-[32px] font-bold text-white leading-tight mb-1">{kpi.value}</p>
              <p className={cn('text-xs', kpi.positive ? 'text-[#1EC99A]' : 'text-[#F04545]')}>{kpi.delta}</p>
            </motion.div>
          ))}
        </section>

        {/* ── Profile completion ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className={cn(
            'mb-8 p-5 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10',
            'hover:border-[rgba(91,184,245,0.2)] transition-all duration-300'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#5BB8F5]" />
              <span className="text-sm font-medium text-[#94A3B8]">Completamento profilo</span>
            </div>
            <span className="text-sm font-bold text-[#5BB8F5]">{progressDemo}%</span>
          </div>
          <div className="w-full h-2.5 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressDemo}%` }}
              transition={{ duration: 1, delay: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
              className="h-full rounded-full gradient-sky shadow-[0_0_10px_rgba(91,184,245,0.3)]"
            />
          </div>
        </motion.section>

        {/* ── Upcoming Shifts ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-playfair text-2xl font-bold text-white">Turni in programma</h2>
            <button
              onClick={() => navigate('/structure/history')}
              className="flex items-center gap-1 text-sm text-[#5BB8F5] hover:text-[#3AA3E8] transition-colors"
            >
              Vedi tutti <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {shifts.map((shift, i) => (
              <GlassShiftCard
                key={shift.id}
                shift={shift}
                index={i}
                featured={i === 0}
                onViewDetails={(s) => {
                  if (s.status === 'pending') {
                    navigate('/structure/matching')
                  } else {
                    addToast({ type: 'info', title: 'Dettaglio turno', message: `Turno ${s.role} del ${s.dayNum} ${s.month}` })
                  }
                }}
              />
            ))}
          </div>
        </motion.section>

        {/* ── Two Column: Match Status + Quick Actions ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Match Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className={cn(
              'rounded-2xl p-6 backdrop-blur-md bg-white/5 border border-white/10',
              'hover:border-[rgba(91,184,245,0.2)] transition-all duration-300'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-playfair text-2xl font-bold text-white">I tuoi match</h2>
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[rgba(91,184,245,0.12)] text-[#5BB8F5] border border-[rgba(91,184,245,0.25)]">
                {matches.length}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {matches.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3">
                  <Avatar
                    src={avatarMap[m.employeeCode]}
                    alt={m.employeeName}
                    size={48}
                    borderColor="#1A56A0"
                    className="hidden sm:flex"
                  />
                  <div className="flex-1">
                    <MatchStatus match={m} index={i} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-[rgba(91,184,245,0.05)] border border-[rgba(91,184,245,0.1)]">
              <Info className="w-4 h-4 text-[#5BB8F5] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#94A3B8]">
                Ricorda: il match reciproco non genera un turno. ATS gestisce l&apos;assegnazione finale.
              </p>
            </div>

            <button
              onClick={() => {
                navigate('/structure/matching')
                addToast({ type: 'info', title: 'Cerca personale', message: 'Navigazione alla pagina di matching' })
              }}
              className="w-full mt-4 py-3 text-sm font-medium text-[#06101E] gradient-sky rounded-xl hover:brightness-110 hover:shadow-[0_0_30px_rgba(91,184,245,0.3)] transition-all"
            >
              Cerca nuovi profili
            </button>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className={cn(
              'rounded-2xl p-6 backdrop-blur-md bg-white/5 border border-white/10',
              'hover:border-[rgba(91,184,245,0.2)] transition-all duration-300'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-playfair text-2xl font-bold text-white">Azioni rapide</h2>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors relative"
                >
                  {unreadCount > 0 ? <BellRing className="w-5 h-5 text-[#F5B800]" /> : <Bell className="w-5 h-5 text-[#5E7A95]" />}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F04545] text-[10px] font-bold text-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { icon: PlusCircle, label: 'Nuova richiesta', variant: 'primary', action: () => setShowNewRequestModal(true), tooltip: 'Pubblica un nuovo turno' },
                { icon: Search, label: 'Cerca personale', variant: 'secondary', action: () => navigate('/structure/matching'), tooltip: 'Trova dipendenti disponibili' },
                { icon: HeartHandshake, label: 'I miei match', variant: 'secondary', action: () => navigate('/structure/matching'), tooltip: 'Vedi i tuoi match attivi' },
                { icon: Calendar, label: 'Calendario turni', variant: 'ghost', action: () => navigate('/structure/history'), tooltip: 'Vedi tutti i turni' },
                { icon: FileText, label: 'Fatture', variant: 'ghost', action: () => navigate('/structure/history'), tooltip: 'Gestisci le fatture' },
                { icon: MessageSquare, label: 'Chat con ATS', variant: 'ghost', action: () => addToast({ type: 'info', title: 'Chat', message: 'Funzionalita in arrivo' }), tooltip: 'Contatta il supporto ATS' },
              ].map((btn, i) => (
                <motion.div
                  key={btn.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06, duration: 0.4 }}
                >
                  <GlassTooltip content={btn.tooltip}>
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={btn.action}
                      className={cn(
                        'w-full flex items-center gap-3 px-5 py-3 rounded-xl text-left font-medium transition-all duration-200 group',
                        btn.variant === 'primary' && 'gradient-sky text-white hover:brightness-110 hover:shadow-[0_0_30px_rgba(91,184,245,0.3)] active:scale-[0.98]',
                        btn.variant === 'secondary' && 'text-[#5BB8F5] border border-[#5BB8F5] hover:bg-[rgba(91,184,245,0.1)] hover:shadow-[0_0_20px_rgba(91,184,245,0.1)]',
                        btn.variant === 'ghost' && 'text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                      )}
                    >
                      <btn.icon className={cn(
                        'w-5 h-5',
                        btn.variant === 'primary' ? 'text-white' : btn.variant === 'secondary' ? 'text-[#5BB8F5]' : 'text-[#94A3B8] group-hover:text-white'
                      )} />
                      <span className="flex-1">{btn.label}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  </GlassTooltip>
                </motion.div>
              ))}
            </div>

            {/* QR quick action */}
            <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <GlassTooltip content="Scarica il kit QR per check-in">
                <button
                  onClick={() => setShowQRModal(true)}
                  className="w-full flex items-center gap-3 px-5 py-3 rounded-xl text-left font-medium text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all group"
                >
                  <QrCode className="w-5 h-5 text-[#94A3B8] group-hover:text-white" />
                  <span className="flex-1">Scarica kit QR check-in</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </GlassTooltip>
            </div>
          </motion.div>
        </section>

        {/* ── Pending Ratings ── */}
        <AnimatePresence>
          {visibleRatings.length > 0 && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 overflow-hidden"
            >
              <div className={cn(
                'rounded-2xl p-6 backdrop-blur-md bg-white/5 border border-white/10',
                'hover:border-[rgba(91,184,245,0.2)] transition-all duration-300'
              )}>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="font-playfair text-2xl font-bold text-white">Valutazioni in attesa</h2>
                  <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[rgba(245,184,0,0.15)] text-[#F5B800] border border-[rgba(245,184,0,0.3)]">
                    {visibleRatings.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {visibleRatings.map((rating) => (
                    <motion.div
                      key={rating.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar src={rating.employeeAvatar} alt={rating.employeeCode} size={40} borderColor="#1A56A0" />
                        <p className="text-sm text-[#94A3B8]">
                          Valuta <span className="font-mono text-[#5BB8F5]">{rating.employeeCode}</span> — Turno del {rating.date} ({rating.role})
                        </p>
                      </div>

                      <div className="space-y-2">
                        {ratingTags.map((tag, tagIndex) => {
                          const currentVal = ratings[rating.id]?.[tagIndex] || 0
                          return (
                            <div key={tag} className="flex items-center gap-3">
                              <span className="w-28 text-xs text-[#5E7A95] text-right">{tag}</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <motion.button
                                    key={star}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleRate(rating.id, tagIndex, star)}
                                    className="focus:outline-none"
                                  >
                                    <Star
                                      className={cn(
                                        'w-4 h-4 transition-colors',
                                        star <= currentVal ? 'text-[#F5B800] fill-[#F5B800]' : 'text-[#5E7A95]'
                                      )}
                                    />
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => handleSaveRating(rating.id)}
                          className="px-4 py-2 text-sm font-medium text-[#06101E] gradient-sky rounded-xl hover:brightness-110 transition-all"
                        >
                          Salva valutazione
                        </button>
                        <button
                          onClick={() => handleSkipRating(rating.id)}
                          className="text-sm text-[#5E7A95] hover:text-[#94A3B8] transition-colors"
                        >
                          Salta per ora
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Recent Activity ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mb-8"
        >
          <div className={cn(
            'rounded-2xl p-6 backdrop-blur-md bg-white/5 border border-white/10',
            'hover:border-[rgba(91,184,245,0.2)] transition-all duration-300'
          )}>
            <h2 className="font-playfair text-2xl font-bold text-white mb-4">Attivita recente</h2>

            <div className="space-y-3">
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.06, duration: 0.4 }}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl transition-colors',
                    n.unread ? 'bg-[rgba(91,184,245,0.04)] border-l-2 border-l-[#5BB8F5]' : 'hover:bg-[rgba(255,255,255,0.02)]'
                  )}
                >
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${n.color}15` }}
                  >
                    <n.icon className="w-4 h-4" style={{ color: n.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <p className="text-xs text-[#94A3B8]">{n.desc}</p>
                  </div>
                  <span className="text-xs text-[#5E7A95] flex-shrink-0">{n.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>

      {/* ── QR Code Modal ── */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(6,16,30,0.88)] backdrop-blur-[12px] p-6"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
              className={cn(
                'w-full max-w-md rounded-[20px] p-8',
                'backdrop-blur-md bg-white/5 border border-white/10',
                'shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(91,184,245,0.05)]'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-playfair text-xl font-bold text-white">Kit QR Check-in</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-1 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  <X className="w-5 h-5 text-[#94A3B8]" />
                </button>
              </div>

              <p className="text-sm text-[#94A3B8] mb-6">
                Stampa e posiziona questi QR code all&apos;ingresso e all&apos;uscita della tua struttura.
                I dipendenti scansioneranno all&apos;arrivo e alla partenza.
              </p>

              <div className="flex justify-center gap-8 mb-6">
                {['Ingresso', 'Uscita'].map((label, i) => (
                  <motion.div
                    key={label}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-[140px] h-[140px] rounded-xl bg-white p-3 flex items-center justify-center">
                      <div className="w-full h-full grid grid-cols-5 grid-rows-5 gap-[2px]">
                        {Array.from({ length: 25 }).map((_, j) => (
                          <div
                            key={j}
                            className={cn(
                              'rounded-[1px]',
                              ((i * 7 + j * 3) % 5 > 1) ? 'bg-[#06101E]' : 'bg-transparent'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#94A3B8]">{label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    addToast({ type: 'success', title: 'QR scaricato', message: 'Il kit QR e stato scaricato' })
                    setShowQRModal(false)
                  }}
                  className="w-full py-3 text-sm font-medium text-[#06101E] gradient-sky rounded-xl hover:brightness-110 transition-all"
                >
                  Scarica PDF stampabile
                </button>
                <button
                  onClick={() => {
                    addToast({ type: 'info', title: 'Email inviata', message: 'Il kit QR e stato inviato via email' })
                    setShowQRModal(false)
                  }}
                  className="w-full py-3 text-sm font-medium text-[#5BB8F5] border border-[#5BB8F5] rounded-xl hover:bg-[rgba(91,184,245,0.1)] transition-colors"
                >
                  Invia via email
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── New Request Modal ── */}
      <AnimatePresence>
        {showNewRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(6,16,30,0.88)] backdrop-blur-[12px] p-6"
            onClick={() => setShowNewRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
              className={cn(
                'w-full max-w-lg rounded-[20px] p-8',
                'backdrop-blur-md bg-white/5 border border-white/10',
                'shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(91,184,245,0.05)]'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-playfair text-xl font-bold text-white">Nuova richiesta turno</h3>
                <button
                  onClick={() => setShowNewRequestModal(false)}
                  className="p-1 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  <X className="w-5 h-5 text-[#94A3B8]" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-1">Ruolo richiesto</label>
                  <select className="w-full bg-[rgba(13,30,52,0.8)] backdrop-blur-sm border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-sm focus:border-[#5BB8F5] focus:shadow-[0_0_0_4px_rgba(91,184,245,0.1)] outline-none transition-all">
                    <option>Seleziona ruolo...</option>
                    <option>Cameriere</option>
                    <option>Chef de Partie</option>
                    <option>Barman</option>
                    <option>Barista</option>
                    <option>Receptionist</option>
                    <option>Sommelier</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#94A3B8] mb-1">Data</label>
                    <input
                      type="date"
                      className="w-full bg-[rgba(13,30,52,0.8)] backdrop-blur-sm border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-sm focus:border-[#5BB8F5] focus:shadow-[0_0_0_4px_rgba(91,184,245,0.1)] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#94A3B8] mb-1">Ora inizio</label>
                    <input
                      type="time"
                      className="w-full bg-[rgba(13,30,52,0.8)] backdrop-blur-sm border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-sm focus:border-[#5BB8F5] focus:shadow-[0_0_0_4px_rgba(91,184,245,0.1)] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#94A3B8] mb-1">Note aggiuntive</label>
                  <textarea
                    rows={3}
                    placeholder="Es. servizio sala principale, 80 coperti..."
                    className="w-full bg-[rgba(13,30,52,0.8)] backdrop-blur-sm border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-sm focus:border-[#5BB8F5] focus:shadow-[0_0_0_4px_rgba(91,184,245,0.1)] outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      addToast({ type: 'success', title: 'Richiesta inviata', message: 'ATS elaborera la tua richiesta' })
                      setShowNewRequestModal(false)
                    }}
                    className="flex-1 py-3 text-sm font-medium text-[#06101E] gradient-sky rounded-xl hover:brightness-110 transition-all"
                  >
                    Invia richiesta
                  </button>
                  <button
                    onClick={() => setShowNewRequestModal(false)}
                    className="px-6 py-3 text-sm font-medium text-[#94A3B8] border border-[rgba(255,255,255,0.1)] rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
