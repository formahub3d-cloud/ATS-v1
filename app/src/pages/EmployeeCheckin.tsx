// EmployeeCheckin — pagina check-in / check-out turni per dipendente.
// Versione collegata a Supabase: chiama le RPC `shift_check_in` (con qr_token
// + GPS opzionale) e `shift_check_out` (con shift_id). Mostra:
//  - turni assigned (pronti per check-in) con il loro QR (display)
//  - turni in_progress (check-in fatto) con pulsante "Termina turno"
//  - scanner camera per leggere il QR di un turno (alternativo al display)

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScanLine, MapPin, Clock, Calendar, Building2, ShieldCheck,
  AlertCircle, RefreshCw, LogOut, QrCode, Star, Ban,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import GlassBottomNav from '@/components/employee/GlassBottomNav'
import QrScanner from '@/components/employee/QrScanner'
import ShiftQRDisplay from '@/components/employee/ShiftQRDisplay'
import StatusScreen from '@/components/structure/StatusScreen'
import ReviewDialog from '@/components/reviews/ReviewDialog'
import CancelShiftDialog from '@/components/shifts/CancelShiftDialog'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/ToastSystem'
import { supabase } from '@/lib/supabase'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuth } from '@/context/AuthContext'
import type { Database } from '@/lib/database.types'

type ShiftRow = Database['public']['Tables']['shifts']['Row']
type StructureRow = Database['public']['Tables']['structures']['Row']

interface ShiftWithStructure extends ShiftRow {
  structure?: Pick<StructureRow, 'ragione_sociale' | 'tipo_struttura' | 'zona'>
}

const MONTHS_IT = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

/** Best-effort recupero della posizione GPS, non blocca se l'utente nega. */
function getGeoLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 6000, maximumAge: 60_000 },
    )
  })
}

export default function EmployeeCheckin() {
  usePageTitle('Check-in')
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { user, status: authStatus } = useAuth()
  const [shifts, setShifts] = useState<ShiftWithStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  // Recensioni: turni completati senza una mia recensione, e dialog state.
  const [toReview, setToReview] = useState<ShiftWithStructure[]>([])
  const [reviewTarget, setReviewTarget] = useState<ShiftWithStructure | null>(null)
  // Cancellazione turno (caso "non posso presentarmi") — dialog id-based.
  const [cancelShiftId, setCancelShiftId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setFetchError(null)
    try {
      // Turni dell'employee in stati attivi o appena completati (per
      // mostrare la sezione "Da recensire").
      const { data: rawShifts, error: sErr } = await supabase
        .from('shifts')
        .select('*')
        .eq('employee_id', user.id)
        .in('status', ['assigned', 'in_progress', 'completed'])
        .order('shift_date', { ascending: false })
      if (sErr) throw sErr

      const structIds = Array.from(new Set((rawShifts ?? []).map((s) => s.structure_id)))
      let structById = new Map<string, Pick<StructureRow, 'ragione_sociale' | 'tipo_struttura' | 'zona'>>()
      if (structIds.length > 0) {
        const { data: structs } = await supabase
          .from('structures')
          .select('id, ragione_sociale, tipo_struttura, zona')
          .in('id', structIds)
        structById = new Map((structs ?? []).map((s) => [s.id, s]))
      }

      const enriched = (rawShifts ?? []).map((s) => ({ ...s, structure: structById.get(s.structure_id) }))

      // Calcola "da recensire": completati di cui non ho ancora una review.
      const completedIds = enriched.filter((s) => s.status === 'completed').map((s) => s.id)
      let myReviewedShiftIds = new Set<string>()
      if (completedIds.length > 0) {
        const { data: myReviews } = await supabase
          .from('reviews')
          .select('shift_id')
          .eq('reviewer_id', user.id)
          .in('shift_id', completedIds)
        myReviewedShiftIds = new Set((myReviews ?? []).map((r) => r.shift_id))
      }

      setShifts(enriched.filter((s) => s.status !== 'completed'))
      setToReview(enriched.filter((s) => s.status === 'completed' && !myReviewedShiftIds.has(s.id)))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore caricamento turni'
      console.error('[EmployeeCheckin] fetch error', err)
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authStatus === 'loading') return
    if (authStatus === 'anonymous' || !user) {
      navigate('/auth')
      return
    }
    void load()
  }, [authStatus, user, load, navigate])

  /** Eseguito sia dal display QR (l'utente clicca "Conferma check-in" sotto il
   *  proprio QR) sia dallo scanner. Sempre e solo via RPC. */
  const performCheckIn = async (qrToken: string) => {
    setPendingAction('checkin:' + qrToken)
    try {
      const geo = await getGeoLocation()
      const { error } = await supabase.rpc('shift_check_in', {
        p_qr_token: qrToken,
        p_lat: geo?.lat ?? null,
        p_lng: geo?.lng ?? null,
      })
      if (error) throw error
      addToast({
        type: 'success',
        title: 'Check-in registrato!',
        message: geo ? 'Posizione confermata. Buon turno!' : 'Buon turno!',
      })
      await load()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore check-in'
      addToast({ type: 'error', title: 'Check-in fallito', message })
    } finally {
      setPendingAction(null)
    }
  }

  const handleCheckOut = async (shift: ShiftRow) => {
    // Conferma esplicita: chiudere un turno è azione finale, non si torna
    // indietro. Un tocco accidentale qui ha conseguenze gravi (calcolo ore
    // sbagliato per il commercialista).
    const ok = window.confirm(
      'Confermi la fine del turno?\n\nIl check-out registra l\'orario di uscita e calcola le ore lavorate. Non potrai modificarlo dopo.',
    )
    if (!ok) return

    setPendingAction('checkout:' + shift.id)
    try {
      const { data, error } = await supabase.rpc('shift_check_out', { p_shift_id: shift.id })
      if (error) throw error
      const hours = data as unknown as number
      addToast({
        type: 'success',
        title: 'Turno completato!',
        message: `Hai lavorato ${Number(hours).toFixed(2)} ore. ✨`,
      })
      await load()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore check-out'
      addToast({ type: 'error', title: 'Check-out fallito', message })
    } finally {
      setPendingAction(null)
    }
  }

  /** Callback dello scanner camera. */
  const handleScanned = (token: string) => {
    setScannerOpen(false)
    void performCheckIn(token)
  }

  const assignedShifts = shifts.filter((s) => s.status === 'assigned')
  const inProgressShifts = shifts.filter((s) => s.status === 'in_progress')

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#06101E] pb-24">
        <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(6,16,30,0.9)] backdrop-blur-xl">
          <div className="max-w-[640px] mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Check-in</h1>
          </div>
        </header>
        <div className="max-w-[640px] mx-auto px-4 py-6 space-y-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <GlassBottomNav />
      </div>
    )
  }

  if (fetchError) {
    return (
      <>
        <StatusScreen
          icon={AlertCircle}
          iconColor="#F04545"
          title="Impossibile caricare i turni"
          description={fetchError}
          primaryAction={{ label: 'Riprova', onClick: () => void load() }}
        />
        <GlassBottomNav />
      </>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#06101E] pb-24">
      <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(6,16,30,0.9)] backdrop-blur-xl">
        <div className="max-w-[640px] mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Check-in</h1>
            <p className="text-xs text-text-muted">
              {inProgressShifts.length > 0
                ? `${inProgressShifts.length} in corso`
                : assignedShifts.length > 0
                ? `${assignedShifts.length} pront${assignedShifts.length === 1 ? 'o' : 'i'}`
                : 'Nessun turno attivo'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => void load()}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Aggiorna"
            >
              <RefreshCw className="w-5 h-5 text-text-muted" />
            </button>
            <button
              onClick={() => setScannerOpen((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                scannerOpen
                  ? 'bg-[rgba(91,184,245,0.15)] text-sky-primary border border-[rgba(91,184,245,0.35)]'
                  : 'gradient-sky text-text-inverse hover:brightness-110',
              )}
            >
              <ScanLine className="w-4 h-4" />
              {scannerOpen ? 'Chiudi' : 'Scanner'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-4 py-6 space-y-6">
        {/* Scanner camera (toggle dall'header) */}
        <AnimatePresence>
          {scannerOpen && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-[rgba(91,184,245,0.2)] bg-[rgba(13,30,52,0.7)] backdrop-blur-md p-4">
                <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <ScanLine className="w-4 h-4 text-sky-primary" />
                  Scansiona il QR del turno
                </p>
                <QrScanner
                  onResult={handleScanned}
                  onError={(msg) => addToast({ type: 'error', title: 'Camera', message: msg })}
                />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Turni in corso (check-out) */}
        {inProgressShifts.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-[#1EC99A] font-semibold mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              In corso
            </h2>
            <div className="space-y-3">
              {inProgressShifts.map((s) => (
                <ShiftCard
                  key={s.id}
                  shift={s}
                  variant="in-progress"
                  pending={pendingAction === 'checkout:' + s.id}
                  onAction={() => void handleCheckOut(s)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Turni assegnati pronti per check-in */}
        {assignedShifts.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-sky-primary font-semibold mb-3 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5" />
              Da iniziare
            </h2>
            <div className="space-y-3">
              {assignedShifts.map((s) => (
                <ShiftCard
                  key={s.id}
                  shift={s}
                  variant="assigned"
                  pending={pendingAction === 'checkin:' + (s.qr_token ?? '')}
                  onAction={() => s.qr_token && void performCheckIn(s.qr_token)}
                  onCancel={() => setCancelShiftId(s.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Sezione: Turni da recensire */}
        {toReview.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-[#F5B800] font-semibold mb-3 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" />
              Da recensire
            </h2>
            <div className="space-y-3">
              {toReview.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-[rgba(245,184,0,0.25)] bg-[rgba(245,184,0,0.04)] backdrop-blur-md p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-sky-primary flex-shrink-0" />
                        <p className="text-sm font-semibold text-white truncate">
                          {s.structure?.ragione_sociale ?? 'Struttura'}
                        </p>
                      </div>
                      <p className="text-xs text-text-muted">
                        {s.role} · {new Date(s.shift_date).getDate()} {MONTHS_IT[new Date(s.shift_date).getMonth()]}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReviewTarget(s)}
                    className="w-full py-2.5 text-sm font-semibold text-text-inverse rounded-xl gradient-sky hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    Lascia recensione
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {assignedShifts.length === 0 && inProgressShifts.length === 0 && toReview.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] mt-12">
            <EmptyState
              icon={Calendar}
              title="Nessun turno attivo"
              description="Quando una struttura ti assegna un turno, il QR per il check-in apparirà qui."
            />
          </div>
        )}
      </div>

      <ReviewDialog
        open={reviewTarget !== null}
        shiftId={reviewTarget?.id ?? ''}
        reviewerRole="employee"
        recipientName={reviewTarget?.structure?.ragione_sociale ?? 'Struttura'}
        onClose={() => setReviewTarget(null)}
        onSubmitted={() => void load()}
      />

      <CancelShiftDialog
        open={cancelShiftId !== null}
        shiftId={cancelShiftId ?? ''}
        title="Non posso presentarmi"
        description="La struttura riceverà subito una notifica. Cancellazioni ripetute possono ridurre i tuoi punti rank."
        reasonPlaceholder="Motivo (es. malattia, emergenza familiare)…"
        confirmLabel="Conferma cancellazione"
        onClose={() => setCancelShiftId(null)}
        onCancelled={() => void load()}
      />

      <GlassBottomNav />
    </div>
  )
}

/** Timer live "Stai lavorando da Xh Ym" — aggiorna ogni 60 secondi.
 *  Usato sui turni in_progress per dare al dipendente un riferimento
 *  immediato di quanto ha lavorato finora. */
function LiveDuration({ since }: { since: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])
  const ms = Math.max(0, now - new Date(since).getTime())
  const totalMin = Math.floor(ms / 60_000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return <>⏱ {h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`}</>
}

/** Card singola turno con QR + pulsante check-in/check-out. */
function ShiftCard({
  shift,
  variant,
  pending,
  onAction,
  onCancel,
}: {
  shift: ShiftWithStructure
  variant: 'assigned' | 'in-progress'
  pending: boolean
  onAction: () => void
  // onCancel passato solo per i turni assigned: il dipendente non può
  // più cancellare quando è in_progress (ha già fatto check-in).
  onCancel?: () => void
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border backdrop-blur-md overflow-hidden',
        variant === 'in-progress'
          ? 'border-[rgba(30,201,154,0.3)] bg-[rgba(30,201,154,0.06)]'
          : 'border-[rgba(91,184,245,0.2)] bg-[rgba(13,30,52,0.7)]',
      )}
    >
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-sky-primary flex-shrink-0" />
              <p className="text-sm font-semibold text-white truncate">
                {shift.structure?.ragione_sociale ?? 'Struttura'}
              </p>
            </div>
            <p className="text-xs text-text-muted">{shift.role}</p>
          </div>
          <div className="text-right text-xs text-text-muted font-mono">
            {new Date(shift.shift_date).getDate()} {MONTHS_IT[new Date(shift.shift_date).getMonth()]}
          </div>
        </div>

        {/* Orari */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white">
          <span className="flex items-center gap-1.5 font-mono">
            <Clock className="w-4 h-4 text-text-muted" />
            {shift.time_start.slice(0, 5)} – {shift.time_end.slice(0, 5)}
          </span>
          {shift.structure?.zona && (
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <MapPin className="w-3 h-3" /> {shift.structure.zona}
            </span>
          )}
        </div>

        {/* QR (solo per assigned) */}
        {variant === 'assigned' && shift.qr_token && (
          <div className="flex flex-col items-center pt-2">
            <ShiftQRDisplay token={shift.qr_token} caption="Mostra alla struttura" size={200} />
            <p className="text-xs text-text-muted text-center mt-3 max-w-[280px]">
              Mostra il QR al referente della struttura, oppure premi il pulsante per fare check-in tu.
            </p>
          </div>
        )}

        {/* Check-in info (solo per in-progress) — orario inizio + timer live */}
        {variant === 'in-progress' && shift.check_in_at && (
          <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-[rgba(30,201,154,0.08)] border border-[rgba(30,201,154,0.2)]">
            <div className="text-xs text-[#1EC99A] flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              Check-in: {new Date(shift.check_in_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-white font-mono font-semibold tabular-nums">
              <LiveDuration since={shift.check_in_at} />
            </div>
          </div>
        )}

        {/* Action button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          onClick={onAction}
          disabled={pending || (variant === 'assigned' && !shift.qr_token)}
          className={cn(
            'w-full py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
            variant === 'in-progress'
              ? 'bg-[#F04545] text-white hover:brightness-110'
              : 'gradient-sky text-text-inverse hover:brightness-110',
          )}
        >
          {variant === 'in-progress' ? (
            <>
              <LogOut className="w-4 h-4" />
              {pending ? 'Check-out in corso…' : 'Termina turno'}
            </>
          ) : (
            <>
              <ScanLine className="w-4 h-4" />
              {pending ? 'Check-in…' : 'Check-in adesso'}
            </>
          )}
        </motion.button>

        {/* Cancellazione: solo per turni assigned (non in_progress).
            Link discreto secondario, perché non è un'azione da incoraggiare
            ma deve esistere per casi reali (malattia, emergenza). */}
        {variant === 'assigned' && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="w-full text-center text-xs text-text-muted hover:text-[#F04545] transition-colors py-1 inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Ban className="w-3 h-3" />
            Non posso presentarmi
          </button>
        )}
      </div>
    </div>
  )
}
