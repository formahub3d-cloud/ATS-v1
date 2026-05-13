// usePageTitle — hook leggero per cambiare il <title> del browser nelle
// pagine post-auth. Niente meta SEO (le pagine private sono escluse da
// robots.txt) — solo UX per chi ha multipli tab aperti.
//
// Format: "{title} · ATS — Al TuO Servizio"
// Reset al precedente al unmount (evita "Dashboard" che resta su pagine
// che non lo settano).

import { useEffect } from 'react'

const SUFFIX = ' · ATS — Al TuO Servizio'

export function usePageTitle(title: string | null | undefined) {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = title + SUFFIX
    return () => { document.title = previous }
  }, [title])
}
