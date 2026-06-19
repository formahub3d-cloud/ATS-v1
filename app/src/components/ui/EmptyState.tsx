// EmptyState — pattern uniforme per le pagine senza dati.
// Sostituisce i vari "Nessun X" inline con icona + titolo + descrizione +
// CTA opzionale. Coerenza visiva tra tutte le pagine admin/structure/employee.
//
// Esempi d'uso:
//   <EmptyState icon={MessageCircle} title="Nessuna conversazione ancora" />
//   <EmptyState
//     icon={Sparkles}
//     title="Nessuna candidatura"
//     description="I dipendenti compatibili vedranno il tuo turno nel feed."
//     action={{ label: 'Pubblica turno', onClick: () => setOpen(true) }}
//   />

import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  /** Variante 'compact' per drawer/sidebar; 'default' per main content. */
  variant?: 'default' | 'compact'
  className?: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const isCompact = variant === 'compact'
  return (
    <div
      className={[
        'text-center text-text-muted',
        isCompact ? 'py-8' : 'py-12',
        className ?? '',
      ].join(' ')}
    >
      <Icon
        className={[
          'mx-auto mb-3 opacity-40 text-sky-primary',
          isCompact ? 'w-8 h-8' : 'w-12 h-12',
        ].join(' ')}
      />
      <h3
        className={[
          'font-semibold text-white',
          isCompact ? 'text-sm' : 'text-base mb-2',
        ].join(' ')}
      >
        {title}
      </h3>
      {description && (
        <p className={isCompact ? 'text-xs mt-1 opacity-80' : 'text-sm max-w-md mx-auto'}>
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-text-inverse rounded-lg gradient-sky hover:brightness-110 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
