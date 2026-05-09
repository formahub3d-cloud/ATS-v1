// StructureMatching — pagina struttura per gestire candidature ai propri turni.
// Mostra i turni open con i dipendenti che hanno fatto like; la struttura può
// confermare uno → diventa 'assigned' con qr_token + employee_id.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, X, Calendar, Clock, MapPin, Briefcase, AlertCircle,
  Sparkles, RefreshCw, CheckCircle, UserPlus, Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastSystem'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/ui/PageHeader'
import StatusScreen from '@/components/structure/StatusScreen'
import NewShiftDialog from '@/components/structure/NewShiftDialog'
import ShiftQRDisplay from '@/components/employee/ShiftQRDisplay'
import ReviewDialog from '@/components/reviews/ReviewDialog'
import Avatar from '@/components/Avatar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Database } from '@/lib/database.types'

type ShiftRow = Database['public']['Tables']['shifts']['Row']
type StructureRow = Database['public']['Tables']['structures']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']
type EmployeeRow = Database['public']['Tables']['employees']['Row']

interface Candidate {
  employee_id: string
  full_name: string | null
  avatar_url: string | null
  preferred_zone: string | null
  skills: string[]
  min_hourly_rate: number | null
  liked_at: string
}

interface ShiftCard extends ShiftRow {
  candidates: Candidate[]
}

const MONTHS_IT = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

export default function StructureMatching() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { user, status: authStatus } = useAuth()
  const [structure, setStructure] = useState<StructureRow | null>(null)
  const [shifts, setShifts] = useState<ShiftCard[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [pendingAssign, setPendingAssign] = useState<string | null>(null)
  const [showNewShiftDialog, setShowNewShiftDialog] = useState(false)
  // Recensioni: turni completed dell'employee senza una mia recensione.
  const [toReview, setToReview] = useState<Array<ShiftRow & { employee_name?: string }>>([])
  const [reviewTarget, setReviewTarget] = useState<{ shiftId: string; recipient: string } | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setFetchError(null)
    try {
      // 1) Trova la struttura dell'utente.
      const { data: structRow, error: stErr } = await supabase
        .from('structures')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      if (stErr) throw stErr
      setStructure(structRow)
      if (!structRow) {
        setShifts([])
        return
      }

      // 2) Tutti i turni open + assigned + completed (per recensioni).
      const today = new Date().toISOString().slice(0, 10)
      const { data: allMyShifts, error: sErr } = await supabase
        .from('shifts')
        .select('*')
        .eq('structure_id', structRow.id)
        .order('shift_date', { ascending: false })
      if (sErr) throw sErr

      // Splitto: turni attivi (open/assigned) per la lista candidati,
      // turni completed (senza mia recensione) per la sezione "Da recensire".
      const activeShifts = (allMyShifts ?? []).filter(
        (s) => (s.status === 'open' || s.status === 'assigned') && s.shift_date >= today,
      )
      const completedShifts = (allMyShifts ?? []).filter((s) => s.status === 'completed')

      // Reviews mie sui completed.
      let myReviewedShiftIds = new Set<string>()
      if (completedShifts.length > 0) {
        const { data: myReviews } = await supabase
          .from('reviews')
          .select('shift_id')
          .eq('reviewer_id', user.id)
          .in('shift_id', completedShifts.map((s) => s.id))
        myReviewedShiftIds = new Set((myReviews ?? []).map((r) => r.shift_id))
      }
      // Per i nomi dipendenti dei turni completed.
      const completedEmpIds = Array.from(new Set(
        completedShifts.map((s) => s.employee_id).filter((x): x is string => !!x),
      ))
      let empNameById = new Map<string, string>()
      if (completedEmpIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', completedEmpIds)
        empNameById = new Map((profs ?? []).map((p) => [p.id, p.full_name ?? '—']))
      }
      setToReview(
        completedShifts
          .filter((s) => !myReviewedShiftIds.has(s.id))
          .map((s) => ({ ...s, employee_name: s.employee_id ? empNameById.get(s.employee_id) : undefined })),
      )

      const myShifts = activeShifts

      const shiftIds = (myShifts ?? []).map((s) => s.id)
      if (shiftIds.length === 0) {
        setShifts([])
        return
      }

      // 3) Per ogni turno, like ricevuti.
      const { data: likes, error: lErr } = await supabase
        .from('shift_likes')
        .select('shift_id, employee_id, created_at')
        .in('shift_id', shiftIds)
        .eq('action', 'like')
      if (lErr) throw lErr

      const likedEmpIds = Array.from(new Set((likes ?? []).map((l) => l.employee_id)))

      // 4) Profili + employee row per i candidati.
      const [{ data: profs, error: pErr }, { data: emps, error: eErr }] = await Promise.all([
        likedEmpIds.length === 0
          ? Promise.resolve({ data: [] as Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url'>[], error: null })
          : supabase.from('profiles').select('id, full_name, avatar_url').in('id', likedEmpIds),
        likedEmpIds.length === 0
          ? Promise.resolve({ data: [] as Pick<EmployeeRow, 'id' | 'preferred_zone' | 'skills' | 'min_hourly_rate'>[], error: null })
          : supabase.from('employees').select('id, preferred_zone, skills, min_hourly_rate').in('id', likedEmpIds),
      ])
      if (pErr) throw pErr
      if (eErr) throw eErr

      const profById = new Map((profs ?? []).map((p) => [p.id, p]))
      const empById = new Map((emps ?? []).map((e) => [e.id, e]))

      // 5) Compongo le shift card con i candidati.
      const cards: ShiftCard[] = (myShifts ?? []).map((s) => ({
        ...s,
        candidates: (likes ?? [])
          .filter((l) => l.shift_id === s.id)
          .map((l) => {
            const p = profById.get(l.employee_id)
            const e = empById.get(l.employee_id)
            return {
              employee_id: l.employee_id,
              full_name: p?.full_name ?? null,
              avatar_url: p?.avatar_url ?? null,
              preferred_zone: e?.preferred_zone ?? null,
              skills: ((e?.skills as string[] | undefined) ?? []),
              min_hourly_rate: e?.min_hourly_rate ?? null,
              liked_at: l.created_at,
            }
          }),
      }))

      setShifts(cards)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore caricamento'
      console.error('[StructureMatching] fetch error', err)
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

  const handleAssign = async (shift: ShiftRow, candidate: Candidate) => {
    setPendingAssign(shift.id + ':' + candidate.employee_id)
    try {
      // Genera qr_token via funzione DB security-definer.
      const { data: tokenData, error: tErr } = await supabase.rpc('generate_shift_qr_token')
      if (tErr) throw tErr
      const qrToken = tokenData as unknown as string

      const { error } = await supabase
        .from('shifts')
        .update({
          status: 'assigned',
          employee_id: candidate.employee_id,
          assigned_at: new Date().toISOString(),
          qr_token: qrToken,
        })
        .eq('id', shift.id)
      if (error) throw error

      addToast({
        type: 'success',
        title: 'Turno assegnato!',
        message: `${candidate.full_name ?? 'Il dipendente'} è stato confermato. Riceverà notifica e QR per il check-in.`,
      })
      await load()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore assegnazione'
      addToast({ type: 'error', title: 'Errore', message })
    } finally {
      setPendingAssign(null)
    }
  }

  const stats = useMemo(() => {
    const totalCandidates = shifts.reduce((acc, s) => acc + s.candidates.length, 0)
    const openShifts = shifts.filter((s) => s.status === 'open').length
    const assignedShifts = shifts.filter((s) => s.status === 'assigned').length
    return { totalCandidates, openShifts, assignedShifts }
  }, [shifts])

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#06101E] pt-[40px]">
        <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-6">
          <Skeleton className="h-10 w-60 rounded" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <StatusScreen
        icon={AlertCircle}
        iconColor="#F04545"
        title="Impossibile caricare i candidati"
        description={fetchError}
        primaryAction={{ label: 'Riprova', onClick: () => void load() }}
      />
    )
  }

  if (!structure) {
    return (
      <StatusScreen
        icon={AlertCircle}
        iconColor="#5BB8F5"
        title="Struttura non trovata"
        description="Non ci sono strutture associate al tuo account."
        primaryAction={{ label: 'Vai al portale', onClick: () => navigate('/structure') }}
      />
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#06101E] pt-[40px]">
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <PageHeader
          title="I tuoi candidati"
          subtitle={`${stats.totalCandidates} candidatur${stats.totalCandidates === 1 ? 'a' : 'e'} su ${stats.openShifts + stats.assignedShifts} turn${stats.openShifts + stats.assignedShifts === 1 ? 'o' : 'i'} attivi`}
          showBack
          backTo="/structure"
          backLabel="Dashboard"
          variant="display"
          actions={
            <>
              <button
                onClick={() => void load()}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Aggiorna"
              >
                <RefreshCw className="w-5 h-5 text-text-muted" />
              </button>
              <button
                onClick={() => setShowNewShiftDialog(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-inverse rounded-lg gradient-sky hover:brightness-110 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Nuovo turno
              </button>
            </>
          }
        />

        {/* Sezione "Da recensire" — appare sopra alla lista turni attivi */}
        {toReview.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs uppercase tracking-wider text-[#F5B800] font-semibold mb-3 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" />
              Turni da recensire
            </h2>
            <div className="space-y-3">
              {toReview.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-[rgba(245,184,0,0.25)] bg-[rgba(245,184,0,0.04)] backdrop-blur-md p-5 flex items-center gap-4 flex-wrap"
                >
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm font-semibold text-white">
                      {s.employee_name ?? 'Dipendente'} · {s.role}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(s.shift_date).getDate()} {MONTHS_IT[new Date(s.shift_date).getMonth()]}
                      </span>
                      <span className="font-mono">{s.time_start.slice(0, 5)}–{s.time_end.slice(0, 5)}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReviewTarget({ shiftId: s.id, recipient: s.employee_name ?? 'il dipendente' })}
                    className="px-4 py-2 text-sm font-semibold text-text-inverse rounded-lg gradient-sky hover:brightness-110 transition-all flex items-center gap-1.5"
                  >
                    <Star className="w-4 h-4" />
                    Recensisci
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {shifts.length === 0 && toReview.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center mt-8">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-sky-primary opacity-60" />
            <h2 className="text-lg font-semibold text-white mb-2">Nessun turno attivo</h2>
            <p className="text-sm text-text-muted mb-4">
              Pubblica un turno per cominciare a ricevere candidature dai dipendenti.
            </p>
            <button
              onClick={() => setShowNewShiftDialog(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-inverse rounded-lg gradient-sky hover:brightness-110 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Pubblica primo turno
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {shifts.map((shift) => (
              <motion.div
                key={shift.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-[rgba(91,184,245,0.15)] bg-[rgba(13,30,52,0.7)] backdrop-blur-md overflow-hidden"
              >
                {/* Shift header */}
                <div className="flex items-start justify-between gap-3 p-5 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <span className="text-lg font-semibold text-white">{shift.role}</span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-md text-xs font-medium border',
                          shift.status === 'open'
                            ? 'text-[#F5B800] bg-[rgba(245,184,0,0.12)] border-[rgba(245,184,0,0.3)]'
                            : 'text-[#5BB8F5] bg-[rgba(91,184,245,0.12)] border-[rgba(91,184,245,0.3)]',
                        )}
                      >
                        {shift.status === 'open' ? 'Da assegnare' : 'Assegnato'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-text-muted" />
                        {new Date(shift.shift_date).getDate()} {MONTHS_IT[new Date(shift.shift_date).getMonth()]}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-text-muted" />
                        {shift.time_start.slice(0, 5)}–{shift.time_end.slice(0, 5)}
                      </span>
                      <span className="text-[#1EC99A] font-mono">
                        € {Number(shift.hourly_rate).toFixed(2)}/h
                      </span>
                    </div>
                  </div>
                </div>

                {/* Candidati */}
                {shift.status === 'assigned' ? (
                  <div className="p-5 bg-[rgba(91,184,245,0.04)]">
                    <div className="flex items-center gap-2 text-sm text-sky-primary mb-4">
                      <CheckCircle className="w-4 h-4" />
                      <span>Turno assegnato. Mostra il QR al dipendente al suo arrivo.</span>
                    </div>
                    {shift.qr_token && (
                      <div className="flex justify-center">
                        <ShiftQRDisplay token={shift.qr_token} caption="QR Check-in" size={180} />
                      </div>
                    )}
                  </div>
                ) : shift.candidates.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-text-muted">Ancora nessuna candidatura. Il turno è visibile nel feed dei dipendenti compatibili.</p>
                  </div>
                ) : (
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-sky-primary mb-3 flex items-center gap-1.5">
                      <Heart className="w-3 h-3" />
                      {shift.candidates.length} candidat{shift.candidates.length === 1 ? 'o' : 'i'}
                    </p>
                    <div className="space-y-2">
                      {shift.candidates.map((c) => {
                        const isPending = pendingAssign === shift.id + ':' + c.employee_id
                        return (
                          <div
                            key={c.employee_id}
                            className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,30,52,0.5)] hover:bg-[rgba(91,184,245,0.05)] transition-colors"
                          >
                            <Avatar
                              src={c.avatar_url ?? undefined}
                              alt={c.full_name ?? 'Candidato'}
                              size="md"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{c.full_name ?? '—'}</p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                                {c.skills.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    {c.skills.slice(0, 2).join(', ')}
                                  </span>
                                )}
                                {c.preferred_zone && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {c.preferred_zone}
                                  </span>
                                )}
                                {c.min_hourly_rate && (
                                  <span className="text-[#1EC99A] font-mono">
                                    min €{Number(c.min_hourly_rate).toFixed(2)}/h
                                  </span>
                                )}
                              </div>
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              onClick={() => void handleAssign(shift, c)}
                              disabled={!!pendingAssign}
                              className="px-4 py-2 text-sm font-semibold text-text-inverse rounded-lg gradient-sky hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {isPending ? 'Conferma…' : 'Conferma'}
                            </motion.button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <NewShiftDialog
        open={showNewShiftDialog}
        structureId={structure.id}
        suggestedRoles={structure.ruoli_cercati}
        onClose={() => setShowNewShiftDialog(false)}
        onCreated={() => void load()}
      />

      <ReviewDialog
        open={reviewTarget !== null}
        shiftId={reviewTarget?.shiftId ?? ''}
        reviewerRole="structure"
        recipientName={reviewTarget?.recipient ?? '—'}
        onClose={() => setReviewTarget(null)}
        onSubmitted={() => void load()}
      />
    </div>
  )
}
