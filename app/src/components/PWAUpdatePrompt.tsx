// PWAUpdatePrompt — banner che appare quando il service worker rileva
// una nuova versione del bundle. L'utente clicca "Aggiorna" e viene
// ricaricata la pagina con il nuovo SW attivo.

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X, Download } from 'lucide-react'

// Import virtuale fornito da vite-plugin-pwa.
// @ts-expect-error - virtual module risolto in build, non in TypeScript.
import { registerSW } from 'virtual:pwa-register'

export default function PWAUpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [updateSW, setUpdateSW] = useState<((reload?: boolean) => Promise<void>) | null>(null)

  useEffect(() => {
    // Niente SW in dev / build con devOptions disabilitato.
    if (typeof window === 'undefined') return
    try {
      const update = registerSW({
        onNeedRefresh() {
          setNeedRefresh(true)
        },
        onOfflineReady() {
          setOfflineReady(true)
          // Auto-dismiss dopo 3s: è solo info "ora puoi usare l'app offline".
          setTimeout(() => setOfflineReady(false), 3000)
        },
      })
      setUpdateSW(() => update)
    } catch {
      // SW non disponibile (es. http no https in prod, browser non supportato): ignora.
    }
  }, [])

  if (!needRefresh && !offlineReady) return null

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed bottom-6 right-6 z-[200] max-w-[360px]"
        >
          <div className="flex items-start gap-3 p-4 rounded-2xl border border-[rgba(91,184,245,0.30)] bg-[rgba(13,30,52,0.96)] backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[rgba(91,184,245,0.15)] border border-[rgba(91,184,245,0.30)]">
              <Download className="w-5 h-5 text-sky-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Nuova versione disponibile</p>
              <p className="text-xs text-text-muted mt-0.5">Aggiorna ATS per ricevere le ultime migliorie.</p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => updateSW?.(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-inverse rounded-lg gradient-sky hover:brightness-110 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Aggiorna ora
                </button>
                <button
                  type="button"
                  onClick={() => setNeedRefresh(false)}
                  className="px-3 py-1.5 text-xs text-text-secondary hover:text-white transition-colors"
                >
                  Più tardi
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="p-1 text-text-muted hover:text-white transition-colors"
              aria-label="Chiudi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {offlineReady && !needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          className="fixed bottom-6 right-6 z-[200]"
        >
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(30,201,154,0.30)] bg-[rgba(30,201,154,0.10)] backdrop-blur-xl text-xs text-[#1EC99A] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            ✓ ATS è pronto per l'uso offline
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
