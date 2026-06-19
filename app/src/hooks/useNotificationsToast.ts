// useNotificationsToast — listener realtime globale che mostra un toast
// per ogni nuova notifica ricevuta dall'utente autenticato.
//
// Indipendente da NotificationsBell (che subscribe sul suo canale per il
// dropdown locale): qui apriamo un canale separato 'notifications-toast:{uid}'
// così il toast appare anche su pagine dove la Bell non è montata.
//
// Mount-once: va invocato a livello App dentro AuthProvider + ToastProvider.

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast, type ToastType } from '@/components/ui/ToastSystem'
import { supabase } from '@/lib/supabase'
import type { Database, NotificationKind } from '@/lib/database.types'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

// Mappa kind → tipo di toast (icon/colore via ToastSystem).
const kindToToastType: Record<NotificationKind, ToastType> = {
  shift_assigned:    'info',
  shift_cancelled:   'warning',
  shift_completed:   'success',
  review_received:   'success',
  structure_approved: 'success',
  structure_rejected: 'error',
  new_message:       'info',
}

export function useNotificationsToast() {
  const { user, status } = useAuth()
  const { addToast } = useToast()

  useEffect(() => {
    if (status !== 'authenticated' || !user) return

    const channel = supabase
      .channel(`notifications-toast:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new as NotificationRow
          // Nascondiamo le notifiche già lette (caso edge: stale insert
          // riprocessato). Se read_at è valorizzato saltiamo.
          if (n.read_at) return
          addToast({
            type: kindToToastType[n.kind] ?? 'info',
            title: n.title,
            message: n.body ?? undefined,
            duration: 6000,
          })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [user, status, addToast])
}
