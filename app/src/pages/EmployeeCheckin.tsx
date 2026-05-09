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
  AlertCircle, RefreshCw, LogOut, QrCode,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import GlassBottomNav from '@/components/employee/GlassBottomNav'
import QrScanner from '@/components/employee/QrScanner'
import ShiftQRDisplay from '@/components/employee/ShiftQRDisplay'
import StatusScreen from '@/components/structure/StatusScreen'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/ToastSystem'
import { supabase } from '@/lib/supabase'
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
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { user, status: authStatus } = useAuth()
  const [shifts, setShifts] = useState<ShiftWithStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setFetchError(null)
    try {
      // Turni assigned o in_progress dell'employee corrente.
      const { data: rawShifts, error: sErr } = await supabase
        .from('shifts')
        .select('*')
        .eq('employee_id', user.id)
        .in('status', ['assigned', 'in_progress'])
        .order('shift_date', { ascending: true })
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

      setShifts((rawShifts ?? []).map((s) => ({ ...s, structure: structById.get(s.structure_id) })))
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
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {assignedShifts.length === 0 && inProgressShifts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center mt-12">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-sky-primary opacity-60" />
            <h2 className="text-lg font-semibold text-white mb-2">Nessun turno attivo</h2>
            <p className="text-sm text-text-muted">
              Quando una struttura ti assegna un turno, il QR per il check-in apparirà qui.
            </p>
          </div>
        )}
      </div>

      <GlassBottomNav />
    </div>
  )
}

/** Card singola turno con QR + pulsante check-in/check-out. */
function ShiftCard({
  shift,
  variant,
  pending,
  onAction,
}: {
  shift: ShiftWithStructure
  variant: 'assigned' | 'in-progress'
  pending: boolean
  onAction: () => void
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

        {/* Check-in info (solo per in-progress) */}
        {variant === 'in-progress' && shift.check_in_at && (
          <div className="text-xs text-[#1EC99A] flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            Check-in: {new Date(shift.check_in_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
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
      </div>
    </div>
  )
}
