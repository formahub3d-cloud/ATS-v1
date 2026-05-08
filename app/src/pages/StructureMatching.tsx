import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Heart, RotateCcw, Star, Filter, X,
  ChevronLeft, ChevronRight, Award, MapPin, SlidersHorizontal,
  Sparkles, UserCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastSystem'
import GlassTooltip from '@/components/ui/GlassTooltip'
import { SkeletonCard } from '@/components/ui/skeleton'
import Avatar from '@/components/Avatar'
import GlassSwipeCard, { type GlassEmployeeProfile } from '@/components/structure/GlassSwipeCard'
import MatchStatus, { type MatchState, type MatchPhase } from '@/components/structure/MatchStatus'
import confetti from 'canvas-confetti'

/* ─────────────── helpers ─────────────── */

const avatarMap: Record<string, string> = {
  'p1': '/avatar-employee-1.jpg',
  'p2': '/avatar-employee-2.jpg',
  'p3': '/avatar-employee-3.jpg',
  'p4': '/avatar-employee-4.jpg',
  'p5': '/avatar-employee-5.jpg',
  'p6': '/avatar-employee-6.jpg',
  'p7': '/avatar-employee-7.jpg',
  'p8': '/avatar-employee-8.jpg',
}

/* ─────────────── mock data ─────────────── */

const allProfiles: GlassEmployeeProfile[] = [
  { id: 'p1', code: 'ATS-D-0047', firstName: 'Giulia', role: 'Cameriere', matchScore: 94, tags: ['Veloce', 'Sorriso', 'Team-player', 'Flex'], distance: 3.2, rank: 'Senior', experience: '4', venues: ['Hotel', 'Ristorante'], rating: 4.7, payRate: 15.00, avatar: avatarMap['p1'] },
  { id: 'p2', code: 'ATS-D-0012', firstName: 'Luca', role: 'Chef de Partie', matchScore: 88, tags: ['Creativo', 'Pulito', 'Organizzato', 'Leader'], distance: 5.1, rank: 'Elite', experience: '6', venues: ['Ristorante', 'Banqueting'], rating: 4.9, payRate: 18.50, avatar: avatarMap['p2'] },
  { id: 'p3', code: 'ATS-D-0089', firstName: 'Sofia', role: 'Barman', matchScore: 91, tags: ['Cocktail', 'Veloce', 'Customer-care'], distance: 1.8, rank: 'Affidabile', experience: '3', venues: ['Bar', 'Lounge'], rating: 4.5, payRate: 16.00, avatar: avatarMap['p3'] },
  { id: 'p4', code: 'ATS-D-0156', firstName: 'Marco', role: 'Cameriere', matchScore: 87, tags: ['Esperto', 'Puntuale', 'Gentile'], distance: 7.4, rank: 'Senior', experience: '5', venues: ['Ristorante', 'Hotel', 'Eventi'], rating: 4.6, payRate: 15.50, avatar: avatarMap['p4'] },
  { id: 'p5', code: 'ATS-D-0023', firstName: 'Elena', role: 'Barista', matchScore: 82, tags: ['Caffe-specialty', 'Mattiniera', 'Precisa'], distance: 4.5, rank: 'Affidabile', experience: '3', venues: ['Caffe', 'Hotel'], rating: 4.4, payRate: 14.00, avatar: avatarMap['p5'] },
  { id: 'p6', code: 'ATS-D-0078', firstName: 'Andrea', role: 'Receptionist', matchScore: 79, tags: ['Multilingue', 'Organizzato', 'Calmo'], distance: 2.3, rank: 'Rookie', experience: '1', venues: ['Hotel'], rating: 4.1, payRate: 13.50, avatar: avatarMap['p6'] },
  { id: 'p7', code: 'ATS-D-0091', firstName: 'Chiara', role: 'Cameriere', matchScore: 96, tags: ['Esperta', 'Veloce', 'Team-leader', 'Adattabile'], distance: 3.8, rank: 'Elite', experience: '7', venues: ['Ristorante', 'Hotel', 'Banqueting'], rating: 4.9, payRate: 17.00, avatar: avatarMap['p7'] },
  { id: 'p8', code: 'ATS-D-0034', firstName: 'Matteo', role: 'Barman', matchScore: 85, tags: ['Mixology', 'Creativo', 'Sociabile'], distance: 6.2, rank: 'Senior', experience: '4', venues: ['Lounge', 'Ristorante'], rating: 4.6, payRate: 16.50, avatar: avatarMap['p8'] },
]

const mutualMatches: MatchState[] = [
  { id: 'mm1', employeeCode: 'ATS-D-0047', employeeName: 'Giulia', role: 'Cameriere', matchScore: 94, phase: 'mutual' },
  { id: 'mm2', employeeCode: 'ATS-D-0012', employeeName: 'Luca', role: 'Chef de Partie', matchScore: 88, phase: 'assigned', shiftDate: '14/05' },
  { id: 'mm3', employeeCode: 'ATS-D-0089', employeeName: 'Sofia', role: 'Barman', matchScore: 91, phase: 'mutual' },
  { id: 'mm4', employeeCode: 'ATS-D-0156', employeeName: 'Marco', role: 'Cameriere', matchScore: 87, phase: 'assigned', shiftDate: '15/05' },
]

const likedEmployees: MatchState[] = [
  { id: 'le1', employeeCode: 'ATS-D-0091', employeeName: 'Chiara', role: 'Cameriere', matchScore: 96, phase: 'liked' },
  { id: 'le2', employeeCode: 'ATS-D-0034', employeeName: 'Matteo', role: 'Barman', matchScore: 85, phase: 'liked' },
]

const passedEmployees: MatchState[] = [
  { id: 'pe1', employeeCode: 'ATS-D-0078', employeeName: 'Andrea', role: 'Receptionist', matchScore: 79, phase: 'completed' },
]

const roleFilters = ['Tutti', 'Cameriere', 'Chef de Partie', 'Barista', 'Barman', 'Receptionist']

/* ─────────────── component ─────────────── */

export default function StructureMatching() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [profiles, setProfiles] = useState<GlassEmployeeProfile[]>(allProfiles)
  const [activeRole, setActiveRole] = useState('Tutti')
  const [activeTab, setActiveTab] = useState<'mutual' | 'liked' | 'passed'>('mutual')
  const [matchCelebration, setMatchCelebration] = useState<GlassEmployeeProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [rewindStack, setRewindStack] = useState<GlassEmployeeProfile[]>([])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(t)
  }, [])

  /* filtering */
  const filteredProfiles = useMemo(() => {
    if (activeRole === 'Tutti') return profiles
    return profiles.filter((p) => p.role === activeRole)
  }, [profiles, activeRole])

  const currentProfile = filteredProfiles[0] || null
  const nextProfile = filteredProfiles[1] || null
  const thirdProfile = filteredProfiles[2] || null

  /* actions */
  const handleLike = useCallback((emp: GlassEmployeeProfile) => {
    setRewindStack(prev => [emp, ...prev])
    if (emp.matchScore > 90) {
      setMatchCelebration(emp)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5BB8F5', '#3AA3E8', '#1EC99A', '#F5B800'],
      })
      addToast({ type: 'success', title: 'Match!', message: `Hai fatto match con ${emp.code} — ${emp.role}` })
      setTimeout(() => setMatchCelebration(null), 2500)
    } else {
      addToast({ type: 'info', title: 'Ti interessa', message: `Hai salvato ${emp.code} tra i preferiti` })
    }
    setProfiles((prev) => prev.filter((p) => p.id !== emp.id))
  }, [addToast])

  const handleDislike = useCallback((emp: GlassEmployeeProfile) => {
    setRewindStack(prev => [emp, ...prev])
    addToast({ type: 'info', title: 'Scartato', message: `Profilo ${emp.code} scartato` })
    setProfiles((prev) => prev.filter((p) => p.id !== emp.id))
  }, [addToast])

  const handleRewind = useCallback(() => {
    if (rewindStack.length === 0) return
    const last = rewindStack[0]
    setProfiles(prev => [last, ...prev])
    setRewindStack(prev => prev.slice(1))
    addToast({ type: 'info', title: 'Annullato', message: `Profilo ${last.code} ripristinato` })
  }, [rewindStack, addToast])

  const resetFilters = useCallback(() => {
    setActiveRole('Tutti')
    setProfiles(allProfiles)
    addToast({ type: 'info', title: 'Filtri resettati', message: 'Tutti i profili sono di nuovo visibili' })
  }, [addToast])

  /* tab content */
  const tabMatches = activeTab === 'mutual' ? mutualMatches : activeTab === 'liked' ? likedEmployees : passedEmployees
  const tabPhases: Record<string, MatchPhase> = {
    mutual: 'mutual',
    liked: 'liked',
    passed: 'completed',
  }

  /* keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!currentProfile) return
      if (e.key === 'ArrowRight') handleLike(currentProfile)
      if (e.key === 'ArrowLeft') handleDislike(currentProfile)
      if (e.key === 'ArrowUp') handleRewind()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentProfile, handleLike, handleDislike, handleRewind])

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#06101E] pt-[72px]">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SkeletonCard className="h-[500px]" />
            </div>
            <div>
              <SkeletonCard />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#06101E] pt-[72px]">
      <div className="max-w-[1200px] mx-auto px-6 py-8">

        {/* ── Filter Bar ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="font-playfair text-[28px] font-bold text-white mb-1">Cerca Personale</h1>
              <p className="text-sm text-[#94A3B8]">
                Profili compatibili: <span className="text-[#5BB8F5] font-semibold">{filteredProfiles.length}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgba(91,184,245,0.12)] text-[#5BB8F5] border border-[rgba(91,184,245,0.25)]">
                Annunci attivi: 1
              </span>
              <GlassTooltip content="Filtra i profili">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'p-2.5 rounded-xl border transition-all',
                    showFilters
                      ? 'bg-[rgba(91,184,245,0.15)] border-[rgba(91,184,245,0.3)] text-[#5BB8F5]'
                      : 'border-[rgba(255,255,255,0.1)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)]'
                  )}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </GlassTooltip>
            </div>
          </div>

          {/* Role filter pills */}
          <div className="flex flex-wrap gap-2">
            {roleFilters.map((role) => (
              <motion.button
                key={role}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveRole(role)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  activeRole === role
                    ? 'gradient-sky text-white shadow-[0_0_20px_rgba(91,184,245,0.2)] -translate-y-[2px]'
                    : 'backdrop-blur-md bg-white/5 border border-white/10 text-[#94A3B8] hover:border-[rgba(91,184,245,0.25)] hover:text-white'
                )}
              >
                {role}
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* ── Main Content: Swipe Cards + Match Sidebar ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Swipe card area */}
          <div className="lg:col-span-2">
            {currentProfile ? (
              <div className="relative">
                {/* Stack depth visualization */}
                {thirdProfile && (
                  <div className="absolute inset-x-0 top-0 mx-auto w-full max-w-[420px] pointer-events-none">
                    <div className="h-[600px] rounded-[24px] bg-[#0D1E34] border border-[rgba(255,255,255,0.06)] opacity-40" style={{ transform: 'translateY(32px) scale(0.84)' }} />
                  </div>
                )}
                {nextProfile && (
                  <div className="absolute inset-x-0 top-0 mx-auto w-full max-w-[420px] pointer-events-none">
                    <div className="h-[600px] rounded-[24px] bg-[#0D1E34] border border-[rgba(255,255,255,0.06)] opacity-70" style={{ transform: 'translateY(16px) scale(0.92)' }} />
                  </div>
                )}

                <GlassSwipeCard
                  employee={currentProfile}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  onRewind={handleRewind}
                  isTop={true}
                  stackIndex={0}
                />

                {/* Keyboard hint */}
                <p className="text-center text-xs text-[#5E7A95] mt-4">
                  Usa <kbd className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[#94A3B8] font-mono text-[10px]">←</kbd>{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[#94A3B8] font-mono text-[10px]">→</kbd> per scorrere,{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[#94A3B8] font-mono text-[10px]">↑</kbd> per annullare
                </p>
              </div>
            ) : (
              /* Empty state */
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  'max-w-[420px] mx-auto p-8 rounded-[24px] text-center',
                  'backdrop-blur-md bg-white/5 border border-white/10'
                )}
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] flex items-center justify-center">
                  <Search className="w-8 h-8 text-[#5BB8F5]" />
                </div>
                <h3 className="font-playfair text-xl font-bold text-white mb-2">
                  Hai visto tutti i profili compatibili
                </h3>
                <p className="text-sm text-[#94A3B8] mb-6">
                  Torna piu tardi per nuovi candidati, o modifica i filtri per vedere piu opzioni.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={resetFilters}
                    className="w-full py-3 text-sm font-medium text-[#06101E] gradient-sky rounded-xl hover:brightness-110 transition-all"
                  >
                    Modifica filtri
                  </button>
                  <button
                    onClick={() => navigate('/structure')}
                    className="w-full py-3 text-sm font-medium text-[#94A3B8] border border-[rgba(255,255,255,0.1)] rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                  >
                    Torna alla dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Match Status Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className={cn(
              'rounded-2xl p-6 backdrop-blur-md bg-white/5 border border-white/10',
              'h-fit'
            )}
          >
            <h2 className="font-playfair text-xl font-bold text-white mb-4">I tuoi match</h2>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 p-1 rounded-xl bg-[rgba(255,255,255,0.04)]">
              {[
                { key: 'mutual', label: 'Reciproci', count: mutualMatches.length },
                { key: 'liked', label: 'Preferiti', count: likedEmployees.length },
                { key: 'passed', label: 'Scartati', count: passedEmployees.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={cn(
                    'flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all',
                    activeTab === tab.key
                      ? 'bg-[rgba(91,184,245,0.15)] text-[#5BB8F5]'
                      : 'text-[#5E7A95] hover:text-white'
                  )}
                >
                  {tab.label}
                  <span className="ml-1 opacity-60">({tab.count})</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="wait">
                {tabMatches.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className="flex items-center gap-3"
                  >
                    <Avatar
                      src={avatarMap[m.employeeCode.replace('ATS-D-', 'p')]}
                      alt={m.employeeName}
                      size={40}
                      borderColor="#1A56A0"
                    />
                    <div className="flex-1">
                      <MatchStatus match={{ ...m, phase: tabPhases[activeTab] }} index={i} compact />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {tabMatches.length === 0 && (
                <div className="text-center py-8">
                  <UserCheck className="w-8 h-8 text-[#5E7A95] mx-auto mb-2" />
                  <p className="text-sm text-[#5E7A95]">Nessun match ancora. Inizia a fare swipe!</p>
                </div>
              )}
            </div>
          </motion.div>
        </section>
      </div>

      {/* ── Match Celebration Modal ── */}
      <AnimatePresence>
        {matchCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-[rgba(6,16,30,0.9)] backdrop-blur-[12px] p-6"
            onClick={() => setMatchCelebration(null)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
              className={cn(
                'w-full max-w-[480px] rounded-[20px] p-8 text-center',
                'backdrop-blur-md bg-white/5 border border-white/10',
                'shadow-[0_32px_80px_rgba(0,0,0,0.6)]'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-8 h-8 text-[#5BB8F5]" />
                <h2 className="font-playfair text-[28px] font-bold text-white">Match confermato!</h2>
              </div>

              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                className="mx-auto mb-4"
              >
                <Avatar
                  src={matchCelebration.avatar}
                  alt={matchCelebration.firstName}
                  size={80}
                  borderColor="#5BB8F5"
                  className="mx-auto"
                />
                <div className="mt-2 w-3 h-3 rounded-full bg-[#5BB8F5] mx-auto shadow-[0_0_20px_rgba(91,184,245,0.5)] animate-pulse" />
              </motion.div>

              <p className="text-lg font-semibold text-white mb-1">
                Hai fatto match con {matchCelebration.code}
              </p>
              <p className="text-sm text-[#94A3B8] mb-4">
                Ruolo: {matchCelebration.role} · Zona: Centro
              </p>

              <div className="p-3 rounded-xl bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] mb-6">
                <p className="text-xs text-[#94A3B8]">
                  ATS assegnera il turno. Non puoi contattare direttamente il dipendente.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMatchCelebration(null)}
                  className="flex-1 py-3 text-sm font-medium text-[#06101E] gradient-sky rounded-xl hover:brightness-110 transition-all"
                >
                  Continua a cercare
                </button>
                <button
                  onClick={() => {
                    setMatchCelebration(null)
                    navigate('/structure')
                  }}
                  className="px-6 py-3 text-sm font-medium text-[#5BB8F5] border border-[#5BB8F5] rounded-xl hover:bg-[rgba(91,184,245,0.1)] transition-colors"
                >
                  Vedi i miei match
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
