import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Error boundary globale: cattura gli errori di rendering e mostra un fallback
 * gestito invece della pagina bianca. Avvolge l'intera app in App.tsx.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In futuro: inviare a un servizio di logging (es. Sentry). Per ora solo console.
    console.error('ErrorBoundary ha catturato un errore:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-navy px-6 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-[#F04545]" aria-hidden="true" />
          <h1 className="text-2xl font-semibold text-white">Qualcosa è andato storto</h1>
          <p className="mt-2 max-w-md text-sm text-text-muted">
            Si è verificato un errore imprevisto. Ricarica la pagina per continuare.
          </p>
          <button
            onClick={this.handleReload}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-primary/90"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Ricarica
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
