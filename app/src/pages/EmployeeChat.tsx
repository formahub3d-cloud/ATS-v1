// EmployeeChat — pagina chat per il dipendente. Conversazione unica con l'admin.
// Mobile-first: bottom-nav style come le altre employee pages.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import GlassBottomNav from '@/components/employee/GlassBottomNav'
import ChatPanel from '@/components/chat/ChatPanel'
import StatusScreen from '@/components/structure/StatusScreen'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function EmployeeChat() {
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
        const { data, error } = await supabase.rpc('ensure_my_conversation')
        if (cancelled) return
        if (error) throw error
        setConversationId(data as unknown as string)
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Errore'
        console.error('[EmployeeChat] ensure error', err)
        setFetchError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [authStatus, user, navigate])

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#06101E] pb-24">
        <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(6,16,30,0.9)] backdrop-blur-xl">
          <div className="max-w-[640px] mx-auto px-4 h-16 flex items-center">
            <h1 className="text-xl font-bold text-white">Chat con Admin</h1>
          </div>
        </header>
        <div className="max-w-[640px] mx-auto px-4 py-6 space-y-3">
          <Skeleton className="h-12 w-3/4 rounded-2xl" />
          <Skeleton className="h-12 w-1/2 rounded-2xl ml-auto" />
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
          title="Impossibile aprire la chat"
          description={fetchError}
          primaryAction={{ label: 'Riprova', onClick: () => window.location.reload() }}
        />
        <GlassBottomNav />
      </>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-[100dvh] bg-[#06101E] flex flex-col"
    >
      <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(6,16,30,0.9)] backdrop-blur-xl flex-shrink-0">
        <div className="max-w-[640px] mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Chat con Admin</h1>
            <p className="text-xs text-text-muted">Tutti i messaggi sono archiviati</p>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[640px] mx-auto w-full pb-24 flex flex-col">
        {conversationId && (
          <ChatPanel conversationId={conversationId} className="flex-1" />
        )}
      </div>

      <GlassBottomNav />
    </motion.div>
  )
}
