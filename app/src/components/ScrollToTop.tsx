import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Riporta lo scroll in cima ad ogni cambio di rotta.
 * Risolve il classico difetto UX delle SPA in cui, navigando, si resta
 * a metà pagina rispetto al contenuto precedente.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
