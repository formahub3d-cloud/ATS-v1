import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, AlertCircle, RefreshCw } from 'lucide-react'

interface QrScannerProps {
  /** Callback con il testo decodificato. Chiamata UNA SOLA VOLTA, lo scanner
   *  si stoppa subito dopo il primo match. */
  onResult: (text: string) => void
  /** Callback se la camera non è disponibile o l'utente nega permessi. */
  onError?: (message: string) => void
  className?: string
}

const READER_ID = 'qr-scanner-reader'

/**
 * Scanner QR code basato su `html5-qrcode`. Usa la camera posteriore se
 * disponibile (facingMode: environment), altrimenti la prima libera.
 *
 * Lo scanner si auto-stoppa dopo il primo decode di successo, perché il
 * caso d'uso (check-in turno) non è "scansiona molti QR di fila" ma
 * "leggi un QR singolo e procedi".
 */
export default function QrScanner({ onResult, onError, className }: QrScannerProps) {
  const instanceRef = useRef<Html5Qrcode | null>(null)
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)
  const [status, setStatus] = useState<'idle' | 'starting' | 'scanning' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Mantengo i callback in ref per non riavviare lo scanner ad ogni render.
  useEffect(() => { onResultRef.current = onResult }, [onResult])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  useEffect(() => {
    let cancelled = false

    const start = async () => {
      try {
        setStatus('starting')
        setErrorMsg(null)
        const instance = new Html5Qrcode(READER_ID, { verbose: false })
        instanceRef.current = instance

        await instance.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0,
          },
          async (decoded) => {
            // Match trovato: stoppa lo scanner e propaga il risultato.
            if (cancelled) return
            try {
              await instance.stop()
            } catch {
              /* ignora: potrebbe essere già stoppato */
            }
            onResultRef.current(decoded)
          },
          () => {
            // qrCodeErrorCallback: chiamato per ogni frame senza QR. Silenzio.
          },
        )
        if (!cancelled) setStatus('scanning')
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Errore avvio camera'
        setStatus('error')
        setErrorMsg(message)
        onErrorRef.current?.(message)
      }
    }

    void start()

    return () => {
      cancelled = true
      const inst = instanceRef.current
      if (inst) {
        // Best-effort stop; ignora errori se già fermato.
        inst.stop().catch(() => {}).finally(() => {
          inst.clear()
        })
      }
    }
    // Voluto: parte UNA volta al mount. I callback vengono letti via ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={className}>
      <div
        id={READER_ID}
        className="w-full max-w-[360px] mx-auto aspect-square rounded-2xl overflow-hidden border border-[rgba(91,184,245,0.25)] bg-black"
      />

      {status === 'starting' && (
        <p className="text-sm text-text-muted text-center mt-3 flex items-center justify-center gap-2">
          <Camera className="w-4 h-4 animate-pulse" />
          Avvio camera…
        </p>
      )}

      {status === 'scanning' && (
        <p className="text-sm text-sky-primary text-center mt-3 flex items-center justify-center gap-2">
          <Camera className="w-4 h-4" />
          Inquadra il QR code del turno
        </p>
      )}

      {status === 'error' && (
        <div className="mt-3 p-3 rounded-xl bg-[rgba(240,69,69,0.08)] border border-[rgba(240,69,69,0.2)] text-sm text-[#F04545] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-1">Camera non disponibile</p>
            <p className="text-xs text-text-secondary">{errorMsg ?? 'Concedi i permessi camera al browser e riprova.'}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 inline-flex items-center gap-1 text-xs text-sky-primary hover:underline"
            >
              <RefreshCw className="w-3 h-3" /> Riprova
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
