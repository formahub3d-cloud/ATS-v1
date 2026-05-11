// PWAInstallPrompt — invito "Aggiungi all'home screen" per device mobili.
//
// Due strade diverse a seconda del browser:
//
//  • Chrome/Edge Android (e Chrome desktop): cattura `beforeinstallprompt`,
//    lo memorizza, e mostra un banner custom con bottone "Installa". Al
//    click chiama promptEvent.prompt() — il browser apre la dialog nativa.
//
//  • iOS Safari: nessuna API di install, dobbiamo educare l'utente con
//    istruzioni manuali (Condividi → Aggiungi alla schermata Home).
//    Rilevamento via UA: iPhone/iPad + Safari, NON in standalone.
//
// Anti-spam: se l'utente dismissa il banner, salviamo il timestamp in
// localStorage e non lo riproponiamo per 14 giorni.
//
// Ulteriori condizioni:
//  • non mostrare se già in standalone (l'app è già installata)
//  • non mostrare prima di X secondi dal load (non spammare al primo paint)

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Share, Plus } from 'lucide-react'
import { LogoAts } from './icons/LogoAts'

const DISMISS_KEY = 'ats_pwa_install_dismissed_at'
const DISMISS_DAYS = 14
const SHOW_AFTER_MS = 8000  // aspetta 8s dal mount per mostrare

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  // iOS Safari: navigator.standalone (prop non standard)
  // Android/desktop Chrome: matchMedia display-mode standalone
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  const mqStandalone = window.matchMedia?.('(display-mode: standalone)').matches ?? false
  return iosStandalone || mqStandalone
}

function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  // iPad recenti si presentano come Mac, controllo anche maxTouchPoints
  const isIos = /iPhone|iPad|iPod/.test(ua) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua))
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
  return isIos && isSafari
}

function recentlyDismissed(): boolean {
  try {
    const ts = localStorage.getItem(DISMISS_KEY)
    if (!ts) return false
    const days = (Date.now() - Number(ts)) / 86400_000
    return days < DISMISS_DAYS
  } catch { return false }
}

export default function PWAInstallPrompt() {
  const [visible, setVisible] = useState(false)
  // Variant: 'native' = abbiamo un BeforeInstallPromptEvent reale
  //          'ios'    = istruzioni manuali Safari iOS
  const [variant, setVariant] = useState<'native' | 'ios' | null>(null)
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isStandalone()) return         // app già installata
    if (recentlyDismissed()) return    // utente ha detto no di recente

    let timer: number | undefined

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      const ev = e as BeforeInstallPromptEvent
      setInstallEvent(ev)
      setVariant('native')
      timer = window.setTimeout(() => setVisible(true), SHOW_AFTER_MS)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall as EventListener)

    // Fallback iOS: nessun beforeinstallprompt arriverà mai. Mostriamo
    // istruzioni manuali se siamo Safari iOS non-standalone.
    if (isIosSafari()) {
      setVariant('ios')
      timer = window.setTimeout(() => setVisible(true), SHOW_AFTER_MS)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall as EventListener)
      if (timer) clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch { /* ignore */ }
    setVisible(false)
  }

  const handleInstall = async () => {
    if (!installEvent) return
    try {
      await installEvent.prompt()
      const { outcome } = await installEvent.userChoice
      if (outcome === 'accepted') {
        setVisible(false)
        // Non salviamo dismiss: l'app sarà già installata, isStandalone()
        // bloccherà il prompt al prossimo load.
      } else {
        dismiss()
      }
    } catch {
      dismiss()
    }
  }

  if (!visible || !variant) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 80 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:max-w-[400px] z-[200]"
      >
        <div className="rounded-2xl border border-[rgba(91,184,245,0.30)] bg-[rgba(13,30,52,0.96)] backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.4)] p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[rgba(91,184,245,0.12)] border border-[rgba(91,184,245,0.25)]">
              <LogoAts className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Installa ATS sul tuo telefono</p>
              <p className="text-xs text-text-muted mt-0.5">
                {variant === 'native'
                  ? 'Apri l\'app più velocemente, ricevi notifiche turni e usala anche offline.'
                  : 'Aggiungi ATS alla schermata Home: notifiche turni e accesso rapido.'}
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="p-1 text-text-muted hover:text-white transition-colors flex-shrink-0"
              aria-label="Chiudi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {variant === 'native' ? (
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleInstall}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-text-inverse rounded-lg gradient-sky hover:brightness-110 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Installa ora
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="px-3 py-2 text-xs text-text-secondary hover:text-white transition-colors"
              >
                Più tardi
              </button>
            </div>
          ) : (
            // iOS: istruzioni illustrate "Condividi → Aggiungi alla Home"
            <div className="mt-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-3 space-y-2 text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[rgba(91,184,245,0.15)] text-sky-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">1</span>
                <span className="flex items-center gap-1">
                  Tocca <Share className="w-3.5 h-3.5 inline text-sky-primary" /> in basso (Safari)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[rgba(91,184,245,0.15)] text-sky-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">2</span>
                <span className="flex items-center gap-1">
                  Scegli <Plus className="w-3.5 h-3.5 inline text-sky-primary" /> "Aggiungi alla Home"
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
