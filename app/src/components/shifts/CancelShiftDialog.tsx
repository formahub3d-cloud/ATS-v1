// CancelShiftDialog — modale di conferma + raccolta motivo cancellazione.
// Riusabile sia da StructureMatching ('Annulla turno') sia da
// EmployeeCheckin ('Non posso presentarmi'). Chiama RPC cancel_shift
// che gestisce auth + crea notifica per la controparte.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/ToastSystem'
import { supabase } from '@/lib/supabase'

interface CancelShiftDialogProps {
  open: boolean
  shiftId: string
  // Etichette personalizzabili in base al ruolo che cancella.
  title?: string
  description?: string
  reasonPlaceholder?: string
  confirmLabel?: string
  onClose: () => void
  onCancelled: () => void
}

export default function CancelShiftDialog({
  open,
  shiftId,
  title = 'Cancella turno',
  description = 'Il turno verrà annullato e la controparte riceverà una notifica.',
  reasonPlaceholder = 'Motivo (opzionale, visibile alla controparte)…',
  confirmLabel = 'Cancella turno',
  onClose,
  onCancelled,
}: CancelShiftDialogProps) {
  const { addToast } = useToast()
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const { error } = await supabase.rpc('cancel_shift', {
        p_shift_id: shiftId,
        p_reason: reason.trim() || null,
      })
      if (error) throw error
      addToast({ type: 'success', title: 'Turno cancellato', message: 'Notifica inviata alla controparte.' })
      setReason('')
      onCancelled()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore'
      addToast({ type: 'error', title: 'Cancellazione fallita', message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (submitting) return
    setReason('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[210]"
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-[20%] sm:top-[25%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:max-w-[440px] z-[220]"
          >
            <div className="rounded-2xl border border-[rgba(240,69,69,0.30)] bg-[#0D1E34] backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="flex items-start gap-3 p-5 border-b border-[rgba(255,255,255,0.06)]">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[rgba(240,69,69,0.12)] border border-[rgba(240,69,69,0.30)]">
                  <AlertTriangle className="w-5 h-5 text-[#F04545]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white">{title}</h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">{description}</p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="p-1 text-text-muted hover:text-white transition-colors flex-shrink-0 disabled:opacity-50"
                  aria-label="Chiudi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={reasonPlaceholder}
                  rows={3}
                  maxLength={500}
                  className="w-full bg-[rgba(13,30,52,0.5)] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-sm text-white placeholder-text-muted focus:border-[#F04545] outline-none resize-none transition-colors"
                />

                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={submitting}
                    className="px-4 py-2 text-sm text-text-secondary hover:text-white transition-colors disabled:opacity-50"
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-[#F04545] hover:brightness-110 transition-all disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Cancellazione…
                      </>
                    ) : (
                      confirmLabel
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
