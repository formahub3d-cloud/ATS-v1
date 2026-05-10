// ChatPanel — pannello chat riusabile (lista messaggi + input + Realtime).
// Funziona per qualunque conversazione: passi conversationId, internamente
// fa subscribe su `messages` filtrato per conversation_id e mostra in
// real-time i nuovi messaggi.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/ToastSystem'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Database } from '@/lib/database.types'

type MessageRow = Database['public']['Tables']['messages']['Row']

interface ChatPanelProps {
  conversationId: string
  /** Etichetta sopra (es. "Conversazione con Admin ATS"). Opzionale. */
  title?: string
  /** Sottotitolo (es. nome controparte, status). */
  subtitle?: string
  className?: string
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

function formatDay(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Oggi'
  if (d.toDateString() === yesterday.toDateString()) return 'Ieri'
  return d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function ChatPanel({ conversationId, title, subtitle, className }: ChatPanelProps) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow textarea fino a max-height (lascia in CSS il vincolo).
  // Misuriamo scrollHeight ad ogni cambio input.
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [input])

  // Auto-scroll al fondo quando arrivano messaggi.
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }, [])

  // Initial fetch + Realtime subscribe.
  useEffect(() => {
    if (!conversationId) return
    let cancelled = false

    const init = async () => {
      setLoading(true)
      setFetchError(null)
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })
        if (cancelled) return
        if (error) throw error
        setMessages(data ?? [])
        // Marca come letti i messaggi non miei (best-effort, non blocca il render).
        try {
          await supabase.rpc('mark_conversation_read', { p_conversation_id: conversationId })
        } catch {
          /* ignora */
        }
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Errore caricamento chat'
        console.error('[ChatPanel] fetch error', err)
        setFetchError(message)
      } finally {
        if (!cancelled) {
          setLoading(false)
          scrollToBottom()
        }
      }
    }

    void init()

    // Realtime subscription: nuovi messaggi nella stessa conversazione.
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageRow
          setMessages((prev) => {
            // Evita duplicati nel caso il messaggio fosse già stato aggiunto via insert ottimistico.
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
          scrollToBottom()
          // Se non è mio, marca subito come letto.
          if (user && newMsg.sender_id !== user.id) {
            void supabase.rpc('mark_conversation_read', { p_conversation_id: conversationId })
          }
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [conversationId, user, scrollToBottom])

  const handleSend = async () => {
    const body = input.trim()
    if (!body || !user || sending) return
    setSending(true)
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        body,
      })
      if (error) throw error
      setInput('')
      // Realtime aggiungerà automaticamente il messaggio in arrivo, quindi
      // non lo aggiungo qui (evita duplicato).
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invio fallito'
      addToast({ type: 'error', title: 'Errore', message })
    } finally {
      setSending(false)
    }
  }

  // Raggruppa messaggi per giorno (per i divisori di sezione).
  const grouped = useMemo(() => {
    const groups: { day: string; items: MessageRow[] }[] = []
    let lastDay = ''
    for (const m of messages) {
      const day = formatDay(m.created_at)
      if (day !== lastDay) {
        groups.push({ day, items: [m] })
        lastDay = day
      } else {
        groups[groups.length - 1].items.push(m)
      }
    }
    return groups
  }, [messages])

  return (
    <div className={cn('flex flex-col h-full bg-[rgba(13,30,52,0.4)]', className)}>
      {/* Header opzionale */}
      {(title || subtitle) && (
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(6,16,30,0.6)] backdrop-blur-md flex-shrink-0">
          {title && <h2 className="text-base font-semibold text-white">{title}</h2>}
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
      )}

      {/* Lista messaggi */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-3/4 rounded-2xl" />
            <Skeleton className="h-10 w-1/2 rounded-2xl ml-auto" />
            <Skeleton className="h-16 w-2/3 rounded-2xl" />
          </div>
        ) : fetchError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-text-muted">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[#F04545]" />
              <p className="text-sm">{fetchError}</p>
            </div>
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-text-muted">
            <p className="text-sm">Nessun messaggio ancora.</p>
            <p className="text-xs mt-1 opacity-70">Scrivi qualcosa per iniziare la conversazione.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {grouped.map((g) => (
              <div key={g.day} className="space-y-2">
                <div className="text-center text-[10px] uppercase tracking-wider text-text-muted py-2">
                  {g.day}
                </div>
                {g.items.map((m) => {
                  const mine = user && m.sender_id === user.id
                  return (
                    <motion.div
                      key={m.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
                          mine
                            ? 'bg-sky-primary text-text-inverse rounded-br-sm'
                            : 'bg-[rgba(255,255,255,0.06)] text-white rounded-bl-sm border border-[rgba(255,255,255,0.06)]',
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className={cn('text-[10px] mt-1 font-mono', mine ? 'text-text-inverse/70' : 'text-text-muted')}>
                          {formatTime(m.created_at)}
                          {mine && m.read_at && <span className="ml-1.5">✓✓</span>}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(6,16,30,0.7)] backdrop-blur-md flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSend()
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSend()
              }
            }}
            placeholder="Scrivi un messaggio…"
            rows={1}
            maxLength={4000}
            className={cn(
              'flex-1 resize-none rounded-xl px-3 py-2 text-sm text-white outline-none transition-all',
              'bg-[rgba(13,30,52,0.6)] border border-[rgba(255,255,255,0.08)]',
              'focus:border-sky-primary placeholder:text-text-muted',
              'min-h-[40px] max-h-[120px]',
            )}
            disabled={sending}
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            disabled={sending || !input.trim()}
            className={cn(
              'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              'gradient-sky text-text-inverse hover:brightness-110',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
            aria-label="Invia"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </motion.button>
        </form>
      </div>
    </div>
  )
}
