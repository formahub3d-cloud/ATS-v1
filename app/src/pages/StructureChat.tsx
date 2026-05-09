// StructureChat — pagina chat per la struttura. Conversazione unica con
// l'admin (modello business: niente contatto diretto con dipendenti).

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, MessageCircle } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'
import ChatPanel from '@/components/chat/ChatPanel'
import StatusScreen from '@/components/structure/StatusScreen'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function StructureChat() {
  const navigate = useNavigate()
  const { user, status: authStatus } = useAuth()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (authStatus === 'loading') return
    if (authStatus === 'anonymous' || !user) {
      navigate('/auth')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        // Helper RPC: crea la conversazione se non esiste, ritorna l'id.
        const { data, error } = await supabase.rpc('ensure_my_conversation')
        if (cancelled) return
        if (error) throw error
        setConversationId(data as unknown as string)
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Errore'
        console.error('[StructureChat] ensure error', err)
        setFetchError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [authStatus, user, navigate])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-60 rounded" />
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <StatusScreen
        icon={AlertCircle}
        iconColor="#F04545"
        title="Impossibile aprire la chat"
        description={fetchError}
        primaryAction={{ label: 'Riprova', onClick: () => window.location.reload() }}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Chat con Admin"
        subtitle="Conversazione tracciata. Tutti i messaggi sono archiviati per audit."
        showBack
        backTo="/structure"
        backLabel="Dashboard"
      />

      <GlassCard className="p-0 overflow-hidden h-[calc(100vh-220px)] min-h-[480px]">
        {conversationId ? (
          <ChatPanel conversationId={conversationId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <MessageCircle className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">Nessuna conversazione disponibile.</p>
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}
