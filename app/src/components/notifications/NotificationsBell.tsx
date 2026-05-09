// NotificationsBell — campanella notifiche con badge unread + dropdown lista.
// Realtime: subscribe a `notifications where user_id=eq.<uid>` per badge live.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, BellRing, Check, CheckCircle, X, Building2, Star,
  MessageCircle, Calendar, ShieldCheck, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Database, NotificationKind } from '@/lib/database.types'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

const KIND_ICON: Record<NotificationKind, typeof Bell> = {
  shift_assigned: Calendar,
  shift_cancelled: X,
  shift_completed: CheckCircle,
  review_received: Star,
  structure_approved: ShieldCheck,
  structure_rejected: AlertCircle,
  new_message: MessageCircle,
}

const KIND_COLOR: Record<NotificationKind, string> = {
  shift_assigned: '#5BB8F5',
  shift_cancelled: '#F04545',
  shift_completed: '#1EC99A',
  review_received: '#F5B800',
  structure_approved: '#1EC99A',
  structure_rejected: '#F04545',
  new_message: '#3AA3E8',
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return 'ora'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m fa`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h fa`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}g fa`
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
}

interface NotificationsBellProps {
  /** Variante visiva del button: 'glass' (sfondo trasparente con bordo) o
   *  'minimal' (solo icona, per header sticky mobile). */
  variant?: 'glass' | 'minimal'
  className?: string
}

export default function NotificationsBell({ variant = 'glass', className }: NotificationsBellProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [items, setItems] = useState<NotificationRow[]>([])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Click-outside per chiudere il dropdown.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const load = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
    if (error) {
      console.error('[NotificationsBell] fetch error', error)
      return
    }
    setItems(data ?? [])
  }, [user])

  useEffect(() => {
    if (!user) return
    void load()
    // Realtime subscribe.
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as NotificationRow
          setItems((prev) => [n, ...prev].slice(0, 30))
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [user, load])

  const unreadCount = useMemo(() => items.filter((n) => !n.read_at).length, [items])

  const handleMarkAllRead = async () => {
    try {
      await supabase.rpc('notifications_mark_read', { p_id: null })
    } catch { /* best-effort */ }
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
  }

  const handleClick = async (n: NotificationRow) => {
    if (!n.read_at) {
      try {
        await supabase.rpc('notifications_mark_read', { p_id: n.id })
      } catch { /* best-effort */ }
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)))
    }
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  const Bellicon = unreadCount > 0 ? BellRing : Bell

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative inline-flex items-center justify-center rounded-lg transition-colors',
          variant === 'glass'
            ? 'p-2 hover:bg-white/5 text-text-secondary'
            : 'p-2 hover:bg-white/5 text-[#94A3B8]',
        )}
        aria-label="Notifiche"
      >
        <Bellicon className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-error rounded-full text-[10px] font-bold text-white flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-32px)] rounded-2xl border border-[rgba(91,184,245,0.15)] bg-[rgba(13,30,52,0.96)] backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.4)] z-[200]"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-sm font-semibold text-white">Notifiche</h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => void handleMarkAllRead()}
                  className="text-xs text-sky-primary hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Segna tutte come lette
                </button>
              )}
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="py-10 text-center text-sm text-text-muted">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Nessuna notifica.
                </div>
              ) : (
                <ul className="divide-y divide-[rgba(255,255,255,0.04)]">
                  {items.map((n) => {
                    const Icon = KIND_ICON[n.kind] ?? Bell
                    const color = KIND_COLOR[n.kind] ?? '#5BB8F5'
                    const isUnread = !n.read_at
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => void handleClick(n)}
                          className={cn(
                            'w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[rgba(91,184,245,0.04)] transition-colors',
                            isUnread && 'bg-[rgba(91,184,245,0.03)]',
                          )}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
                          >
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm leading-tight', isUnread ? 'text-white font-semibold' : 'text-text-secondary')}>
                              {n.title}
                            </p>
                            {n.body && (
                              <p className="text-xs text-text-muted leading-relaxed mt-0.5 line-clamp-2">{n.body}</p>
                            )}
                            <p className="text-[10px] text-text-muted mt-1 font-mono">{timeAgo(n.created_at)}</p>
                          </div>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-sky-primary flex-shrink-0 mt-2" />
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
