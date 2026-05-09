import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Briefcase, Euro, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/ToastSystem'
import { supabase } from '@/lib/supabase'

interface NewShiftDialogProps {
  open: boolean
  structureId: string
  /** Ruoli suggeriti dalla struttura (pre-selezionabili dal dropdown). */
  suggestedRoles?: string[]
  onClose: () => void
  onCreated: () => void
}

const FALLBACK_ROLES = [
  'Cameriere', 'Chef', 'Sous Chef', 'Chef de Partie', 'Barista',
  'Barman', 'Receptionist', 'SPA Staff', 'Sommelier', 'Hostess', 'Lavapiatti',
]

/**
 * Dialog modale per creare un nuovo turno (richiesta di personale).
 * Usato dalla struttura dal proprio portale o dalla pagina matching.
 */
export default function NewShiftDialog({
  open,
  structureId,
  suggestedRoles,
  onClose,
  onCreated,
}: NewShiftDialogProps) {
  const { addToast } = useToast()
  const [shiftDate, setShiftDate] = useState('')
  const [timeStart, setTimeStart] = useState('19:00')
  const [timeEnd, setTimeEnd] = useState('23:00')
  const [role, setRole] = useState('')
  const [hourlyRate, setHourlyRate] = useState('12.00')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const roles = suggestedRoles && suggestedRoles.length > 0 ? suggestedRoles : FALLBACK_ROLES

  const reset = () => {
    setShiftDate('')
    setTimeStart('19:00')
    setTimeEnd('23:00')
    setRole('')
    setHourlyRate('12.00')
    setNotes('')
  }

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  // Calcolo ore stimate (semplice, non gestisce turni che attraversano la mezzanotte
  // in modo sofisticato — sufficiente per MVP).
  const computeHours = (): number | null => {
    if (!timeStart || !timeEnd) return null
    const [h1, m1] = timeStart.split(':').map(Number)
    const [h2, m2] = timeEnd.split(':').map(Number)
    let mins = (h2 * 60 + m2) - (h1 * 60 + m1)
    if (mins < 0) mins += 24 * 60 // turno notturno che attraversa mezzanotte
    return Math.round((mins / 60) * 100) / 100
  }

  const handleSubmit = async () => {
    if (!shiftDate || !timeStart || !timeEnd || !role || !hourlyRate) {
      addToast({ type: 'warning', title: 'Campi obbligatori', message: 'Compila data, orario, ruolo e paga.' })
      return
    }
    const rate = Number(hourlyRate)
    if (!Number.isFinite(rate) || rate <= 0) {
      addToast({ type: 'warning', title: 'Paga non valida', message: 'Inserisci una paga oraria > 0.' })
      return
    }

    setSubmitting(true)
    try {
      const estimated = computeHours()
      const { error } = await supabase.from('shifts').insert({
        structure_id: structureId,
        shift_date: shiftDate,
        time_start: timeStart,
        time_end: timeEnd,
        role,
        hourly_rate: rate,
        estimated_hours: estimated,
        notes: notes.trim() || null,
      })
      if (error) throw error

      addToast({
        type: 'success',
        title: 'Turno pubblicato',
        message: 'I dipendenti compatibili lo vedranno nel feed turni.',
      })
      reset()
      onCreated()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore creazione turno'
      console.error('[NewShiftDialog] insert error', err)
      addToast({ type: 'error', title: 'Errore', message })
    } finally {
      setSubmitting(false)
    }
  }

  const hours = computeHours()
  const totalEstimated = hours && Number(hourlyRate) > 0 ? (hours * Number(hourlyRate)) : null

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 pointer-events-none"
          >
            <div className="w-full max-w-[520px] max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-2xl border border-[rgba(91,184,245,0.15)] bg-[#0D1E34] shadow-[0_24px_80px_rgba(0,0,0,0.5)] pointer-events-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0D1E34]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)]">
                <h2 className="text-lg font-semibold text-white">Nuovo turno</h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5"
                  aria-label="Chiudi"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!submitting) void handleSubmit()
                }}
                className="p-6 space-y-4"
              >
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-primary" />
                    Data del turno
                  </Label>
                  <Input
                    type="date"
                    value={shiftDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setShiftDate(e.target.value)}
                    className="bg-[rgba(13,30,52,0.5)] border-[rgba(255,255,255,0.08)] focus:border-sky-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-primary" />
                      Inizio
                    </Label>
                    <Input
                      type="time"
                      value={timeStart}
                      onChange={(e) => setTimeStart(e.target.value)}
                      className="bg-[rgba(13,30,52,0.5)] border-[rgba(255,255,255,0.08)] focus:border-sky-primary font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Fine</Label>
                    <Input
                      type="time"
                      value={timeEnd}
                      onChange={(e) => setTimeEnd(e.target.value)}
                      className="bg-[rgba(13,30,52,0.5)] border-[rgba(255,255,255,0.08)] focus:border-sky-primary font-mono"
                    />
                  </div>
                </div>

                {hours !== null && (
                  <p className="text-xs text-text-muted">
                    Durata stimata: <span className="text-white font-mono">{hours}h</span>
                    {totalEstimated !== null && (
                      <> · Compenso: <span className="text-[#1EC99A] font-mono">€ {totalEstimated.toFixed(2)}</span></>
                    )}
                  </p>
                )}

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-sky-primary" />
                    Ruolo cercato
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="bg-[rgba(13,30,52,0.5)] border-[rgba(255,255,255,0.08)]">
                      <SelectValue placeholder="Seleziona ruolo" />
                    </SelectTrigger>
                    <SelectContent className="bg-[rgba(13,30,52,0.95)] border-[rgba(91,184,245,0.15)]">
                      {roles.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-sky-primary" />
                    Paga oraria (€)
                  </Label>
                  <Input
                    type="number"
                    step="0.50"
                    min="1"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="bg-[rgba(13,30,52,0.5)] border-[rgba(255,255,255,0.08)] focus:border-sky-primary font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-primary" />
                    Note (opzionale)
                  </Label>
                  <Textarea
                    placeholder="Es. servizio sala principale, 80 coperti, dress code elegante..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="bg-[rgba(13,30,52,0.5)] border-[rgba(255,255,255,0.08)] focus:border-sky-primary resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={submitting}
                    className="flex-1 py-2.5 text-sm font-medium text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    Annulla
                  </button>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={!submitting ? { scale: 1.02 } : {}}
                    whileTap={!submitting ? { scale: 0.98 } : {}}
                    className={cn(
                      'flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all',
                      'gradient-sky text-text-inverse hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                  >
                    {submitting ? 'Pubblicazione…' : 'Pubblica turno'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
