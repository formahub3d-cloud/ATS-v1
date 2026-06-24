import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Stati UI riusabili per pagine basate su dati asincroni (service layer / API).
 * Standardizzano caricamento, vuoto ed errore così ogni pagina li gestisce allo stesso modo
 * (Definition of Done, CLAUDE.md §9).
 */

export function LoadingState({ rows = 4, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Caricamento in corso…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  )
}

export function EmptyState({
  title = 'Nessun dato',
  description,
  icon,
  action,
  className = '',
}: {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="mb-4 text-text-muted">{icon ?? <Inbox className="h-10 w-10" />}</div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({
  title = 'Si è verificato un errore',
  description = 'Non è stato possibile caricare i dati. Riprova.',
  onRetry,
  className = '',
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`} role="alert">
      <AlertTriangle className="mb-4 h-10 w-10 text-[#F04545]" />
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-text-muted">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.12)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.06)]"
        >
          <RefreshCw className="h-4 w-4" />
          Riprova
        </button>
      )}
    </div>
  )
}
