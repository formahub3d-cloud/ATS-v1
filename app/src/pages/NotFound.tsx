import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { useRole } from '@/context/RoleContext'

const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  structure: '/structure',
  employee: '/employee',
}

export default function NotFound() {
  const { activeRole } = useRole()
  const home = ROLE_HOME[activeRole] ?? '/'

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <p className="text-7xl font-bold text-sky-primary">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-white">Pagina non trovata</h1>
      <p className="mt-2 max-w-md text-sm text-text-muted">
        La pagina che cerchi non esiste o è stata spostata. Controlla l'indirizzo oppure torna alla
        tua area.
      </p>
      <Link
        to={home}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-primary/90"
      >
        <Home className="h-4 w-4" />
        Torna alla home
      </Link>
    </div>
  )
}
