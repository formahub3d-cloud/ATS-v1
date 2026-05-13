// AdminMessages — gestione richieste contatto arrivate dalla landing.
// Solo admin (RLS policy "contact_messages: admin all"). Filtri per stato +
// search + cambio stato/note con update diretto sulla tabella.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare, Search, AlertCircle, RefreshCw, Mail, Clock, CheckCircle,
  Ban, Inbox, ChevronDown, ChevronUp, Reply,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/ToastSystem'
import { supabase } from '@/lib/supabase'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuth } from '@/context/AuthContext'
import type { Database, ContactStatus } from '@/lib/database.types'

type ContactRow = Database['public']['Tables']['contact_messages']['Row']

const STATUS_META: Record<ContactStatus, { label: string; color: string; icon: typeof Clock }> = {
  new:         { label: 'Nuovo',       color: '#5BB8F5', icon: Inbox },
  in_progress: { label: 'In corso',    color: '#F5B800', icon: Clock },
  handled:     { label: 'Gestito',     color: '#1EC99A', icon: CheckCircle },
  spam:        { label: 'Spam',        color: '#94A3B8', icon: Ban },
}

const FILTERS: Array<{ value: ContactStatus | 'all'; label: string }> = [
  { value: 'all',         label: 'Tutti' },
  { value: 'new',         label: 'Nuovi' },
  { value: 'in_progress', label: 'In corso' },
  { value: 'handled',     label: 'Gestiti' },
  { value: 'spam',        label: 'Spam' },
]

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'ora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m fa`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h fa`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}g fa`
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminMessages() {
  usePageTitle('Messaggi')
  const { user } = useAuth()
  const { addToast } = useToast()

  const [messages, setMessages] = useState<ContactRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ContactStatus | 'all'>('new')
  const [searchQuery, setSearchQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const { data, error } = await supabase
        .from('contact_messages').select('*')
        .order('created_at', { ascending: false }).limit(200)
      if (error) throw error
      setMessages(data ?? [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore caricamento messaggi'
      setFetchError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const counts = useMemo(() => {
    const c: Record<ContactStatus, number> = { new: 0, in_progress: 0, handled: 0, spam: 0 }
    for (const m of messages) c[m.status]++
    return c
  }, [messages])

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (filter !== 'all' && m.status !== filter) return false
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q)
      )
    })
  }, [messages, filter, searchQuery])

  const updateStatus = async (id: string, status: ContactStatus) => {
    setSavingId(id)
    try {
      const patch: Database['public']['Tables']['contact_messages']['Update'] = {
        status,
        handled_by: status === 'handled' ? user?.id ?? null : null,
        handled_at: status === 'handled' ? new Date().toISOString() : null,
      }
      const { error } = await supabase.from('contact_messages').update(patch).eq('id', id)
      if (error) throw error
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } as ContactRow : m)),
      )
      addToast({ type: 'success', title: 'Stato aggiornato' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore'
      addToast({ type: 'error', title: 'Aggiornamento fallito', message: msg })
    } finally {
      setSavingId(null)
    }
  }

  const saveNotes = async (id: string) => {
    const notes = draftNotes[id]
    if (notes === undefined) return
    setSavingId(id)
    try {
      const { error } = await supabase
        .from('contact_messages').update({ notes }).eq('id', id)
      if (error) throw error
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, notes } : m)))
      addToast({ type: 'success', title: 'Note salvate' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore'
      addToast({ type: 'error', title: 'Salvataggio fallito', message: msg })
    } finally {
      setSavingId(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Messaggi contatto"
        subtitle={`${counts.new} nuov${counts.new === 1 ? 'o' : 'i'}, ${counts.in_progress} in corso, ${counts.handled} gestit${counts.handled === 1 ? 'o' : 'i'}`}
        actions={
          <button
            onClick={load}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Aggiorna"
          >
            <RefreshCw className={cn('w-5 h-5', loading && 'animate-spin')} />
          </button>
        }
      />

      {fetchError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(240,69,69,0.08)] border border-[rgba(240,69,69,0.2)] text-sm text-[#F04545]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Filtro pillole */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((opt) => {
          const count = opt.value === 'all' ? messages.length : counts[opt.value]
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2',
                filter === opt.value
                  ? 'bg-[rgba(91,184,245,0.15)] border-sky-primary text-sky-primary'
                  : 'bg-white/[0.03] border-white/10 text-text-secondary hover:bg-white/[0.06]',
              )}
            >
              {opt.label}
              <span className="text-[10px] opacity-70">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="flex items-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 max-w-[420px]">
        <Search className="w-4 h-4 text-text-muted mr-2 flex-shrink-0" />
        <input
          type="text"
          placeholder="Cerca per nome, email, oggetto, contenuto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-sm text-white placeholder-text-muted outline-none flex-1"
        />
      </div>

      {/* Lista */}
      <GlassCard>
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="h-4 w-60" />
                <Skeleton className="h-4 w-20 ml-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-text-muted">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              {messages.length === 0
                ? 'Nessun messaggio ricevuto.'
                : 'Nessun messaggio corrisponde ai filtri.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[rgba(255,255,255,0.04)]">
            {filtered.map((m) => {
              const meta = STATUS_META[m.status]
              const StatusIcon = meta.icon
              const isOpen = expanded === m.id
              return (
                <li key={m.id} className="py-3">
                  <button
                    onClick={() => setExpanded(isOpen ? null : m.id)}
                    className="w-full text-left flex items-start gap-3 hover:bg-white/[0.02] rounded-lg p-2 -m-2 transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
                    >
                      <StatusIcon className="w-4 h-4" style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{m.subject}</span>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider"
                          style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 truncate">
                        {m.name} &lt;{m.email}&gt;
                        {m.source && <span className="opacity-60"> · {m.source}</span>}
                      </p>
                    </div>
                    <span className="text-[10px] text-text-muted font-mono flex-shrink-0 mt-1">{timeAgo(m.created_at)}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-text-muted mt-1" /> : <ChevronDown className="w-4 h-4 text-text-muted mt-1" />}
                  </button>

                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 ml-12 space-y-4"
                    >
                      <div className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-4">
                        <p className="text-sm text-text-primary whitespace-pre-wrap">{m.body}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(91,184,245,0.1)] border border-[rgba(91,184,245,0.3)] text-sky-primary text-xs font-medium hover:brightness-110 transition-all"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          Rispondi via email
                        </a>
                        <a
                          href={`mailto:${m.email}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-text-secondary text-xs font-medium hover:bg-white/[0.08] transition-all"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {m.email}
                        </a>
                        <div className="ml-auto flex items-center gap-2">
                          {(['new', 'in_progress', 'handled', 'spam'] as ContactStatus[]).map((s) => {
                            const sm = STATUS_META[s]
                            const active = m.status === s
                            return (
                              <button
                                key={s}
                                disabled={savingId === m.id}
                                onClick={() => updateStatus(m.id, s)}
                                className={cn(
                                  'px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-all',
                                  active
                                    ? 'border-transparent text-white'
                                    : 'border-white/10 text-text-muted hover:text-white hover:bg-white/[0.05]',
                                  savingId === m.id && 'opacity-60',
                                )}
                                style={active ? { backgroundColor: `${sm.color}30`, borderColor: `${sm.color}60`, color: sm.color } : undefined}
                              >
                                {sm.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-text-muted mb-1.5">
                          Note interne
                        </label>
                        <textarea
                          value={draftNotes[m.id] ?? m.notes ?? ''}
                          onChange={(e) => setDraftNotes({ ...draftNotes, [m.id]: e.target.value })}
                          rows={2}
                          placeholder="Aggiungi un appunto per il team..."
                          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white placeholder-text-muted focus:border-sky-primary focus:outline-none resize-none"
                        />
                        <div className="mt-2 flex items-center justify-end">
                          <button
                            disabled={savingId === m.id || draftNotes[m.id] === undefined}
                            onClick={() => saveNotes(m.id)}
                            className="px-3 py-1.5 rounded-lg gradient-sky text-text-inverse text-xs font-medium disabled:opacity-40 hover:brightness-110 transition-all"
                          >
                            Salva note
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </GlassCard>
    </motion.div>
  )
}
