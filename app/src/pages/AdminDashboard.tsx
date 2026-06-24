import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, AlertTriangle, X, CheckCircle, CreditCard,
  UserPlus, MessageCircle, Search,
  ChevronRight, PlusCircle, UserPlus as UserPlusIcon,
  Building, Send, FileText, MessageSquare,
} from 'lucide-react'
import KPICard from '@/components/admin/KPICard'
import StatusPill from '@/components/admin/StatusPill'
import GlassCard from '@/components/admin/GlassCard'
import GlassBadge from '@/components/admin/GlassBadge'
import Avatar from '@/components/Avatar'
import { useToast } from '@/components/ui/ToastSystem'
import GlassTooltip from '@/components/ui/GlassTooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/states'
import { useAsync } from '@/hooks/useAsync'
import {
  getActiveShifts, getAdminNotifications, getAlerts,
  getWeeklyDays, getShifts, getRevenueData, getRoleDistribution,
} from '@/services/adminService'
import type { AdminAlert, AdminNotification } from '@/types/domain'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'


const iconMap: Record<string, React.ReactNode> = {
  'check-circle': <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />,
  'alert-triangle': <AlertTriangle className="w-4 h-4 text-error flex-shrink-0" />,
  'credit-card': <CreditCard className="w-4 h-4 text-sky-primary flex-shrink-0" />,
  'user-plus': <UserPlus className="w-4 h-4 text-success flex-shrink-0" />,
  'message-circle': <MessageCircle className="w-4 h-4 text-sky-primary flex-shrink-0" />,
}

const employeeAvatars = [
  '/avatar-employee-1.jpg',
  '/avatar-employee-2.jpg',
  '/avatar-employee-3.jpg',
  '/avatar-employee-4.jpg',
  '/avatar-employee-5.jpg',
]

const structurePhotos = [
  '/structure-1.jpg',
  '/structure-2.jpg',
  '/structure-3.jpg',
  '/structure-6.jpg',
]

export default function AdminDashboard() {
  const { addToast } = useToast()
  const [notifOpen, setNotifOpen] = useState(false)

  // Dati dal service layer (oggi mock async, domani API): stato uniforme loading/error/data.
  const activeShiftsState = useAsync(getActiveShifts, [])
  const notificationsState = useAsync(getAdminNotifications, [])
  const alertsState = useAsync(getAlerts, [])
  const weeklyDaysState = useAsync(getWeeklyDays, [])
  const shiftsState = useAsync(getShifts, [])
  const revenueState = useAsync(getRevenueData, [])
  const roleDistributionState = useAsync(getRoleDistribution, [])

  const loading =
    activeShiftsState.loading || notificationsState.loading || alertsState.loading ||
    weeklyDaysState.loading || shiftsState.loading || revenueState.loading ||
    roleDistributionState.loading
  const error =
    activeShiftsState.error || notificationsState.error || alertsState.error ||
    weeklyDaysState.error || shiftsState.error || revenueState.error ||
    roleDistributionState.error

  // Alert e notifiche restano interattivi (dismiss / segna come lette) senza copiare i
  // dati del service in stato locale: si tracciano solo le mutazioni dell'utente e le
  // liste mostrate vengono derivate dai dati del service.
  const [dismissedAlertIds, setDismissedAlertIds] = useState<number[]>([])
  const [allRead, setAllRead] = useState(false)

  const alerts: AdminAlert[] = (alertsState.data ?? []).filter(a => !dismissedAlertIds.includes(a.id))
  const notifs: AdminNotification[] = (notificationsState.data ?? []).map(n =>
    allRead ? { ...n, read: true } : n
  )

  const dismissAlert = (id: number) => {
    setDismissedAlertIds(prev => [...prev, id])
    addToast({ type: 'info', title: 'Alert chiuso', message: 'L\'alert è stato rimosso dalla dashboard.' })
  }

  const markAllRead = () => {
    setAllRead(true)
    addToast({ type: 'success', title: 'Notifiche lette', message: 'Tutte le notifiche sono state marcate come lette.' })
  }

  const handleQuickAction = (label: string) => {
    addToast({ type: 'info', title: label, message: 'Funzionalità in fase di implementazione.' })
  }

  const unreadCount = notifs.filter(n => !n.read).length

  const quickActions = [
    { icon: PlusCircle, label: 'Nuovo turno' },
    { icon: UserPlusIcon, label: 'Nuovo dipendente' },
    { icon: Building, label: 'Nuova struttura' },
    { icon: Send, label: 'Notifica broadcast' },
    { icon: FileText, label: 'Genera report' },
    { icon: MessageSquare, label: 'Chat' },
  ]

  // Caso errore: dati non disponibili dopo il caricamento → stato di errore con retry.
  if (
    !loading &&
    (error ||
      !activeShiftsState.data || !weeklyDaysState.data || !shiftsState.data ||
      !revenueState.data || !roleDistributionState.data)
  ) {
    return <ErrorState onRetry={() => window.location.reload()} />
  }

  // Costanti locali dai service (durante il loading restano vuote: il JSX mostra gli skeleton).
  const activeShifts = activeShiftsState.data ?? []
  const weeklyDays = weeklyDaysState.data ?? []
  const shifts = shiftsState.data ?? []
  const revenue = revenueState.data ?? []
  const roleDist = roleDistributionState.data ?? []

  const sparklineData = revenue.slice(-7).map(d => d.revenue)
  const sparklineMax = Math.max(...sparklineData)
  const sparklinePoints = sparklineData.map((v, i) => `${(i / (sparklineData.length - 1)) * 80},${24 - (v / sparklineMax) * 24}`).join(' ')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-semibold text-white font-dm">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center backdrop-blur-md bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-[280px] focus-within:w-[360px] transition-all duration-300">
            <Search className="w-4 h-4 text-text-muted mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Cerca turni, strutture, dipendenti..."
              className="bg-transparent text-sm text-white placeholder-text-muted outline-none w-full"
            />
          </div>
          <span className="hidden lg:block text-sm font-mono text-text-muted">Lunedì 12 Maggio 2026</span>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Bell className="w-5 h-5 text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      <AnimatePresence>
        {alerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
            className="flex items-center justify-between bg-[rgba(240,69,69,0.08)] backdrop-blur-md border border-[rgba(240,69,69,0.2)] rounded-xl px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-error flex-shrink-0" />
              <span className="text-sm font-medium text-error">{alert.message}</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-xs text-error hover:underline">Vedi dettagli</button>
              <GlassTooltip content="Chiudi alert">
                <button onClick={() => dismissAlert(alert.id)} className="text-error hover:text-white transition-colors hover:rotate-90 duration-200">
                  <X className="w-4 h-4" />
                </button>
              </GlassTooltip>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[0, 1, 2, 3].map(i => (
            <GlassCard key={i} delay={i * 0.1} className="p-7 space-y-3">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-32 h-12" />
              <Skeleton className="w-20 h-3" />
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <KPICard label="Fatturato Maggio" value="€14.103" delta="+€2.128 vs aprile" deltaPositive delay={0}>
            <svg width="90" height="28" viewBox="0 0 90 28" className="mt-1">
              <polyline
                points={sparklinePoints}
                fill="none"
                stroke="#5BB8F5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </KPICard>
          <KPICard label="Ore lavorate" value="3.200h" delta="+512h vs aprile" deltaPositive delay={100}>
            <div className="w-full h-2.5 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '78%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-[#5BB8F5] via-[#3AA3E8] to-[#1A56A0]"
              />
            </div>
          </KPICard>
          <KPICard label="Tasso presenza" value="94%" delta="+1,3% vs mese scorso" deltaPositive delay={200}>
            <div className="relative w-12 h-12 mt-1">
              <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                <motion.circle
                  cx="20" cy="20" r="16" fill="none"
                  stroke="#5BB8F5"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${94.2 * 1.005} ${100 * 1.005}`}
                  initial={{ strokeDashoffset: 100 * 1.005 }}
                  animate={{ strokeDashoffset: (100 - 94.2) * 1.005 }}
                  transition={{ duration: 1.2, delay: 0.6, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white">94%</span>
            </div>
          </KPICard>
          <KPICard label="Dipendenti attivi" value="20" delay={300}>
            <div className="flex items-center gap-1 mt-2">
              <div className="flex -space-x-2">
                {employeeAvatars.map((src, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.06, type: 'spring', stiffness: 300 }}
                  >
                    <Avatar src={src} size="sm" className="border-2 border-[#06101E]" />
                  </motion.div>
                ))}
              </div>
              <span className="text-xs text-text-muted ml-2">15 confermati · 3 in colloquio · 2 in attesa</span>
            </div>
          </KPICard>
        </div>
      )}

      {/* Active Shifts */}
      <GlassCard delay={0.3}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Turni attivi ora</h2>
          <GlassBadge variant="success" pulse>
            4 turni in corso
          </GlassBadge>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Struttura</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Dipendente</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Ruolo</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Orario</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {activeShifts.map((shift, i) => (
                    <motion.tr
                      key={shift.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.06, duration: 0.4 }}
                      className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(91,184,245,0.05)] hover:translate-x-1 transition-all duration-200"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={structurePhotos[i % structurePhotos.length]} size="sm" className="rounded-lg" />
                          <span className="font-mono text-xs text-sky-primary bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] rounded px-2 py-0.5">
                            {shift.structureCode}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={employeeAvatars[i % employeeAvatars.length]} size="sm" />
                          <span className="font-mono text-xs text-sky-primary bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] rounded px-2 py-0.5">
                            {shift.employeeCode}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white">{shift.role}</td>
                      <td className="px-4 py-3 text-sm font-mono text-text-muted">{shift.time}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={shift.status === 'check-in' ? 'check-in' : 'in-attesa'} pulse={shift.status === 'in-attesa'} />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <button className="text-sm text-sky-primary hover:underline flex items-center gap-1 group">
                Vedi tutti i turni <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </>
        )}
      </GlassCard>

      {/* Two Column: Calendar + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Calendar */}
        <GlassCard delay={0.5} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Calendario settimanale</h2>
            <button className="text-sm text-sky-primary hover:underline flex items-center gap-1 group">
              Vedi completo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-7 gap-3">
              {[0, 1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-3">
              {weeklyDays.map((day, di) => (
                <motion.div
                  key={day.day}
                  initial={{ scale: 0.93, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 + di * 0.06, duration: 0.3 }}
                  className={`rounded-xl border p-3 min-h-[140px] ${di === 0 ? 'border-sky-primary bg-[rgba(91,184,245,0.05)] shadow-[inset_0_0_20px_rgba(91,184,245,0.05)]' : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]'}`}
                >
                  <p className="text-[10px] font-medium text-text-muted text-center mb-1">{day.day}</p>
                  <p className="text-lg font-bold text-white text-center mb-2">{day.date}</p>
                  <div className="space-y-1.5">
                    {shifts
                      .filter(s => s.day === di)
                      .slice(0, 3)
                      .map(s => (
                        <div
                          key={s.id}
                          className={`text-[10px] px-2 py-1 rounded-md ${
                            s.status === 'No-show' ? 'bg-[rgba(240,69,69,0.15)] text-error' :
                            s.status === 'In corso' ? 'bg-[rgba(30,201,154,0.15)] text-success' :
                            s.status === 'Da assegnare' ? 'bg-[rgba(245,184,0,0.15)] text-warning' :
                            'bg-[rgba(91,184,245,0.15)] text-sky-primary'
                          }`}
                        >
                          {s.role} {s.employeeCode ? `(${s.employeeCode.split('-')[2]})` : '(?)'}
                        </div>
                      ))}
                    {shifts.filter(s => s.day === di).length === 0 && (
                      <p className="text-[10px] text-text-muted text-center py-1">Nessun turno</p>
                    )}
                  </div>
                  {shifts.filter(s => s.day === di).length > 3 && (
                    <p className="text-[10px] text-text-muted text-center mt-1">
                      +{shifts.filter(s => s.day === di).length - 3} altri
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Notifications */}
        <GlassCard delay={0.6}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Notifiche recenti</h2>
            <select className="bg-[rgba(6,16,30,0.6)] text-xs text-text-muted border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1 outline-none backdrop-blur-sm">
              <option>Tutte</option>
              <option>Alert</option>
              <option>Turni</option>
              <option>Pagamenti</option>
            </select>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-3 py-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-48 h-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-0 max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifs.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.07, duration: 0.4 }}
                    className={`flex gap-3 py-3 border-b border-[rgba(255,255,255,0.04)] hover:bg-white/[0.02] hover:translate-x-1 transition-all cursor-pointer ${!n.read ? 'border-l-[3px] border-l-sky-primary pl-3 shadow-[0_0_12px_rgba(91,184,245,0.05)]' : 'pl-3.5'}`}
                  >
                    {iconMap[n.icon]}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs text-text-muted mt-0.5 truncate">{n.description}</p>
                      <p className="text-[10px] text-text-muted mt-1">{n.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={markAllRead}
                className="mt-4 text-xs text-text-muted hover:text-white transition-colors flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3" /> Segna tutte come lette
              </button>
            </>
          )}
        </GlassCard>
      </div>

      {/* Monthly Summary Charts */}
      <GlassCard delay={0.7}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Riepilogo mensile</h2>
          <select className="bg-[rgba(6,16,30,0.6)] text-sm text-text-muted border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 outline-none backdrop-blur-sm">
            <option>Maggio 2026</option>
            <option>Aprile 2026</option>
            <option>Marzo 2026</option>
          </select>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-60" />
            <Skeleton className="h-60" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-text-muted mb-3">Fatturato vs Ore</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" tick={{ fill: '#5E7A95', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <YAxis tick={{ fill: '#5E7A95', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <Tooltip
                    contentStyle={{ background: '#0D1E34', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                    itemStyle={{ color: '#fff', fontSize: 12 }}
                    labelStyle={{ color: '#5E7A95' }}
                  />
                  <Bar dataKey="revenue" fill="rgba(91,184,245,0.3)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-3">Distribuzione per ruolo</p>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={roleDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {roleDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0D1E34', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {roleDist.map(r => (
                  <span key={r.name} className="flex items-center gap-1 text-xs text-text-muted">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="grid grid-cols-3 sm:grid-cols-6 gap-4 pb-6"
      >
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 + i * 0.06, duration: 0.4 }}
            whileHover={{ y: -6, borderColor: 'rgba(91,184,245,0.2)', backgroundColor: 'rgba(91,184,245,0.08)' }}
            whileTap={{ scale: 0.93 }}
            onClick={() => handleQuickAction(action.label)}
            className="flex flex-col items-center justify-center backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 hover:shadow-[0_8px_32px_rgba(91,184,245,0.08)] transition-all duration-200"
          >
            <action.icon className="w-6 h-6 text-sky-primary mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] text-text-muted text-center">{action.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  )
}
