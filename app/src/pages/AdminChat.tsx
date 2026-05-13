// AdminChat — pagina chat per admin: lista conversazioni a sinistra,
// thread aperto a destra. Realtime via ChatPanel.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Building2, User as UserIcon, MessageCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'
import Avatar from '@/components/Avatar'
import ChatPanel from '@/components/chat/ChatPanel'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuth } from '@/context/AuthContext'
import type { Database, ConversationKind } from '@/lib/database.types'

type ConversationRow = Database['public']['Tables']['conversations']['Row']
type StructureRow = Database['public']['Tables']['structures']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']

interface ConversationDisplay {
  id: string
  kind: ConversationKind
  title: string
  subtitle: string
  avatar_url?: string | null
  last_message_at: string | null
  unread_count: number
}

export default function AdminChat() {
  usePageTitle('Chat admin')
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ConversationDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  // Tengo selectedId in ref per evitare re-bind del realtime listener al
  // cambio chat (che chiuderebbe e riaprirebbe il canale ad ogni click).
  const selectedIdRef = useRef<string | null>(null)
  useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const [
        { data: rawConvs, error: cErr },
        { data: structs, error: stErr },
        { data: profs, error: pErr },
        { data: unreadRows, error: uErr },
      ] = await Promise.all([
        supabase.from('conversations').select('*').order('last_message_at', { ascending: false, nullsFirst: false }),
        supabase.from('structures').select('id, ragione_sociale, tipo_struttura'),
        supabase.from('profiles').select('id, full_name, avatar_url').eq('role', 'employee'),
        // Tutti i messaggi non letti non miei. Volume basso (chat 1:1 admin↔X),
        // un singolo round-trip è sufficiente; aggreghiamo client-side.
        supabase.from('messages')
          .select('conversation_id, sender_id, read_at')
          .is('read_at', null),
      ])
      if (cErr) throw cErr
      if (stErr) throw stErr
      if (pErr) throw pErr
      if (uErr) throw uErr

      const structById = new Map((structs ?? []).map((s) => [s.id, s]))
      const profById = new Map((profs ?? []).map((p) => [p.id, p]))
      // Conta unread per conversation_id, escludendo quelli inviati dall'admin.
      const unreadByConv = new Map<string, number>()
      for (const r of unreadRows ?? []) {
        if (r.sender_id === user?.id) continue
        unreadByConv.set(r.conversation_id, (unreadByConv.get(r.conversation_id) ?? 0) + 1)
      }

      const display: ConversationDisplay[] = (rawConvs ?? []).map((c) => {
        const unread = unreadByConv.get(c.id) ?? 0
        if (c.kind === 'admin_structure' && c.structure_id) {
          const s = structById.get(c.structure_id) as Pick<StructureRow, 'ragione_sociale' | 'tipo_struttura'> | undefined
          return {
            id: c.id,
            kind: c.kind,
            title: s?.ragione_sociale ?? 'Struttura',
            subtitle: s?.tipo_struttura ?? '',
            last_message_at: c.last_message_at,
            unread_count: unread,
          }
        }
        const p = c.employee_id
          ? (profById.get(c.employee_id) as Pick<ProfileRow, 'full_name' | 'avatar_url'> | undefined)
          : undefined
        return {
          id: c.id,
          kind: c.kind,
          title: p?.full_name ?? 'Dipendente',
          subtitle: 'Dipendente',
          avatar_url: p?.avatar_url ?? null,
          last_message_at: c.last_message_at,
          unread_count: unread,
        }
      })

      setConversations(display)
      // Auto-seleziona la prima conversazione se nessuna selezionata.
      setSelectedId((prev) => prev ?? (display[0]?.id ?? null))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore'
      console.error('[AdminChat] fetch error', err)
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void load()
  }, [load])

  // Realtime sidebar: subscribe a TUTTI i messages INSERT (admin vede ogni
  // conversazione). Aggiorna last_message_at + unread_count + riordina la
  // lista mettendo in cima la chat che ha appena ricevuto un messaggio.
  // Skip se il msg è in selectedId (la chat aperta) o se è dell'admin stesso.
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('admin-chat-sidebar')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const m = payload.new as { id: string; conversation_id: string; sender_id: string; created_at: string }
          if (m.sender_id === user.id) return
          setConversations((prev) => {
            const next = prev.map((c) => {
              if (c.id !== m.conversation_id) return c
              return {
                ...c,
                last_message_at: m.created_at,
                // Se la chat è quella aperta, ChatPanel marca read subito → no badge.
                unread_count: m.conversation_id === selectedIdRef.current ? c.unread_count : c.unread_count + 1,
              }
            })
            // Riordina: la chat aggiornata sale in cima.
            next.sort((a, b) => {
              const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
              const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
              return tb - ta
            })
            return next
          })
        },
      )
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [user])

  // Quando l'admin apre una chat, azzera il badge unread localmente.
  // (ChatPanel invierà mark_conversation_read; questo è solo UI sync immediato).
  const openConversation = (id: string) => {
    setSelectedId(id)
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c)))
  }

  const filtered = useMemo(() => {
    if (!searchQuery) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter((c) => c.title.toLowerCase().includes(q))
  }, [conversations, searchQuery])

  const selected = conversations.find((c) => c.id === selectedId) ?? null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Chat"
        subtitle={`${conversations.length} conversazion${conversations.length === 1 ? 'e' : 'i'} aperte`}
      />

      {fetchError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(240,69,69,0.08)] border border-[rgba(240,69,69,0.2)] text-sm text-[#F04545]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {fetchError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Sidebar conversazioni */}
        <GlassCard className="flex flex-col p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-text-muted mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cerca conversazione..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-text-muted outline-none flex-1"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-3 space-y-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-text-muted">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                {conversations.length === 0
                  ? 'Nessuna conversazione ancora.'
                  : 'Nessuna conversazione corrisponde alla ricerca.'}
              </div>
            ) : (
              <ul className="divide-y divide-[rgba(255,255,255,0.04)]">
                {filtered.map((c) => {
                  const isActive = c.id === selectedId
                  const Icon = c.kind === 'admin_structure' ? Building2 : UserIcon
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => openConversation(c.id)}
                        className={cn(
                          'w-full text-left px-3 py-3 hover:bg-[rgba(91,184,245,0.05)] transition-colors flex items-center gap-3',
                          isActive && 'bg-[rgba(91,184,245,0.08)] border-l-2 border-l-sky-primary',
                          c.unread_count > 0 && !isActive && 'bg-[rgba(245,184,0,0.04)]',
                        )}
                      >
                        {c.avatar_url ? (
                          <Avatar src={c.avatar_url} alt={c.title} size="sm" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[rgba(91,184,245,0.12)] border border-[rgba(91,184,245,0.2)] flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-sky-primary" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={cn('text-sm truncate', c.unread_count > 0 ? 'font-semibold text-white' : 'font-medium text-white')}>{c.title}</p>
                          <p className="text-xs text-text-muted truncate">{c.subtitle}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {c.last_message_at && (
                            <span className="text-[10px] text-text-muted font-mono">
                              {new Date(c.last_message_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                            </span>
                          )}
                          {c.unread_count > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-sky-primary text-[10px] font-bold text-text-inverse">
                              {c.unread_count > 9 ? '9+' : c.unread_count}
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </GlassCard>

        {/* Thread */}
        <GlassCard className="p-0 overflow-hidden">
          {selected ? (
            <ChatPanel
              key={selected.id}
              conversationId={selected.id}
              title={selected.title}
              subtitle={selected.kind === 'admin_structure' ? 'Conversazione con struttura' : 'Conversazione con dipendente'}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-muted">
              <MessageCircle className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm">Seleziona una conversazione dalla lista</p>
            </div>
          )}
        </GlassCard>
      </div>
    </motion.div>
  )
}
