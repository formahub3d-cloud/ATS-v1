import { Loader2 } from 'lucide-react'

/**
 * Fallback mostrato mentre il chunk di una rotta lazy viene caricato (code splitting).
 */
export default function PageLoader() {
  return (
    <div
      className="flex min-h-[60vh] w-full items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Caricamento…</span>
      <Loader2 className="h-8 w-8 animate-spin text-sky-primary" aria-hidden="true" />
    </div>
  )
}
