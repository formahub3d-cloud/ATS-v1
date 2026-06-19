// useLastUpdated — traccia il timestamp dell'ultimo fetch completato e
// ritorna un'etichetta italiana "ora", "Nm fa", "Nh fa", "Ng fa" che si
// aggiorna ogni minuto. Utile per dare al utente il polso della freschezza
// dati nelle dashboard admin.
//
// Uso:
//   const { label, lastUpdatedAt } = useLastUpdated(loading)
//   // poi: {label && <span>Aggiornato {label}</span>}
//
// Il timestamp viene salvato quando loading passa da true a false.

import { useEffect, useRef, useState } from 'react'

function formatTimeAgo(date: Date | null, now: number): string {
  if (!date) return ''
  const diffSec = Math.max(0, Math.floor((now - date.getTime()) / 1000))
  if (diffSec < 60) return 'ora'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m fa`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h fa`
  return `${Math.floor(diffSec / 86400)}g fa`
}

export function useLastUpdated(loading: boolean) {
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const prevLoading = useRef(loading)

  // Quando loading transiziona da true → false, registriamo il timestamp.
  useEffect(() => {
    if (prevLoading.current && !loading) {
      setLastUpdatedAt(new Date())
    }
    prevLoading.current = loading
  }, [loading])

  // Re-render ogni 60s per aggiornare l'etichetta "Nm fa".
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])

  return {
    lastUpdatedAt,
    label: formatTimeAgo(lastUpdatedAt, now),
  }
}
