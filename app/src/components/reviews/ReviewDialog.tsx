// ReviewDialog — modale per inviare una recensione su un turno completato.
// Usato sia lato struttura (recensisce dipendente) sia lato employee
// (recensisce struttura). I tag suggeriti sono diversi per ruolo.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastSystem'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { ReviewRole } from '@/lib/database.types'

interface ReviewDialogProps {
  open: boolean
  shiftId: string
  reviewerRole: ReviewRole
  /** Etichetta della controparte (es. "Marco R." se sei la struttura, oppure
   *  "Ristorante Bella Vita" se sei l'employee). */
  recipientName: string
  onClose: () => void
  onSubmitted: () => void
}

const STRUCTURE_TAGS = [
  'Puntualità', 'Professionalità', 'Pulizia', 'Velocità', 'Sorriso',
  'Lavoro sotto pressione', 'Attitudine cliente', 'Lingue straniere',
]
const EMPLOYEE_TAGS = [
  'Ambiente sereno', 'Paga puntuale', 'Organizzazione', 'Mensa inclusa',
  'Briefing chiaro', 'Cliente educato', 'Spazi confortevoli', 'Tornerei',
]

export default function ReviewDialog({
  open, shiftId, reviewerRole, recipientName, onClose, onSubmitted,
}: ReviewDialogProps) {
  const { addToast } = useToast()
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const suggestedTags = reviewerRole === 'structure' ? STRUCTURE_TAGS : EMPLOYEE_TAGS

  const reset = () => {
    setRating(0)
    setHoverRating(0)
    setTags([])
    setComment('')
  }

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const toggleTag = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  const handleSubmit = async () => {
    if (!user) return
    if (rating < 1) {
      addToast({ type: 'warning', title: 'Valutazione richiesta', message: 'Assegna almeno 1 stella.' })
      return
    }
    setSubmitting(true)
    try {
      const { error } = await supabase.from('reviews').insert({
        shift_id: shiftId,
        reviewer_id: user.id,
        reviewer_role: reviewerRole,
        rating,
        tags,
        comment: comment.trim() || null,
      })
      if (error) throw error
      addToast({
        type: 'success',
        title: 'Recensione inviata!',
        message: `Grazie per il tuo feedback su ${recipientName}.`,
      })
      reset()
      onSubmitted()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore invio'
      // Vincolo unique → "duplicate key": già recensito.
      const friendly = /duplicate|unique/i.test(message)
        ? 'Hai già recensito questo turno.'
        : message
      addToast({ type: 'error', title: 'Errore', message: friendly })
    } finally {
      setSubmitting(false)
    }
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 pointer-events-none"
          >
            <div className="w-full max-w-[480px] max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-2xl border border-[rgba(91,184,245,0.15)] bg-[#0D1E34] shadow-[0_24px_80px_rgba(0,0,0,0.5)] pointer-events-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0D1E34]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)]">
                <h2 className="text-lg font-semibold text-white">Recensione turno</h2>
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
                onSubmit={(e) => { e.preventDefault(); if (!submitting) void handleSubmit() }}
                className="p-6 space-y-6"
              >
                <div className="text-center">
                  <p className="text-sm text-text-muted mb-1">Stai recensendo</p>
                  <p className="text-base font-semibold text-white">{recipientName}</p>
                </div>

                {/* Stars */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const filled = (hoverRating || rating) >= n
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          onMouseEnter={() => setHoverRating(n)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-110"
                          aria-label={`${n} stell${n === 1 ? 'a' : 'e'}`}
                        >
                          <Star
                            className={cn(
                              'w-9 h-9 transition-colors',
                              filled ? 'fill-[#F5B800] text-[#F5B800]' : 'fill-transparent text-text-muted',
                            )}
                          />
                        </button>
                      )
                    })}
                  </div>
                  {rating > 0 && (
                    <p className="text-xs text-text-muted">
                      {['Pessimo', 'Insufficiente', 'Sufficiente', 'Buono', 'Eccellente'][rating - 1]}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <p className="text-xs font-medium text-sky-primary uppercase tracking-wider mb-2">
                    Cosa ti è piaciuto / non piaciuto
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => {
                      const selected = tags.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                            selected
                              ? 'bg-[rgba(91,184,245,0.15)] border-sky-primary text-sky-primary'
                              : 'bg-white/[0.03] border-white/10 text-text-secondary hover:border-[rgba(91,184,245,0.3)]',
                          )}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <p className="text-xs font-medium text-sky-primary uppercase tracking-wider mb-2">
                    Commento (opzionale)
                  </p>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Es. Sempre puntuale, ottima gestione del cliente sotto pressione..."
                    rows={3}
                    maxLength={1000}
                    className="w-full px-3 py-2 text-sm bg-[rgba(13,30,52,0.6)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder-text-muted resize-none focus:border-sky-primary outline-none"
                  />
                  <p className="text-[10px] text-text-muted text-right mt-1">{comment.length}/1000</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
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
                    disabled={submitting || rating < 1}
                    whileHover={!submitting ? { scale: 1.02 } : {}}
                    whileTap={!submitting ? { scale: 0.98 } : {}}
                    className="flex-1 py-2.5 text-sm font-semibold text-text-inverse rounded-xl gradient-sky hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Invio…' : 'Invia recensione'}
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
