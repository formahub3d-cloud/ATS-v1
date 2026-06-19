// PageMeta — gestione minimalista di title/meta/canonical/OG senza react-helmet.
// Scrive direttamente su document.head via useEffect. Cleanup automatico al
// cambio rotta tramite ref ai nodi creati.
//
// Uso:
//   <PageMeta
//     title="Contatti"
//     description="Scrivici per info su ATS."
//     path="/contatti"
//   />
//
// Title finale: "{title} · ATS — Al TuO Servizio" (omettendo il suffisso se
// title è vuoto, per la homepage usa solo "ATS — Al TuO Servizio").

import { useEffect } from 'react'

const SITE_NAME = 'ATS — Al TuO Servizio'
// Quando avremo un dominio reale (es. ats-servizio.it) basta cambiare qui.
// Se la pagina viene servita su un altro origin, fallback a window.location.origin.
const DEFAULT_ORIGIN = 'https://ats-servizio.it'
const DEFAULT_OG_IMAGE = '/og-image.svg'

interface PageMetaProps {
  title?: string
  description: string
  path?: string
  image?: string
  // 'website' default. Per pagine "articolo-like" (legal, faq) si può usare
  // 'article'; per ora teniamo tutto a 'website'.
  type?: 'website' | 'article'
  noindex?: boolean
}

export default function PageMeta({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
}: PageMetaProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME
    const origin = typeof window !== 'undefined' ? window.location.origin : DEFAULT_ORIGIN
    const url = path ? `${origin}${path}` : (typeof window !== 'undefined' ? window.location.href : DEFAULT_ORIGIN)
    const fullImage = image.startsWith('http') ? image : `${origin}${image}`

    document.title = fullTitle

    const tags: Array<[string, string, string]> = [
      // [selector, attr, value]
      ['meta[name="description"]',           'content', description],
      ['link[rel="canonical"]',              'href',    url],

      ['meta[property="og:title"]',          'content', fullTitle],
      ['meta[property="og:description"]',    'content', description],
      ['meta[property="og:url"]',            'content', url],
      ['meta[property="og:type"]',           'content', type],
      ['meta[property="og:image"]',          'content', fullImage],
      ['meta[property="og:site_name"]',      'content', SITE_NAME],
      ['meta[property="og:locale"]',         'content', 'it_IT'],

      ['meta[name="twitter:card"]',          'content', 'summary_large_image'],
      ['meta[name="twitter:title"]',         'content', fullTitle],
      ['meta[name="twitter:description"]',   'content', description],
      ['meta[name="twitter:image"]',         'content', fullImage],

      ['meta[name="robots"]',                'content', noindex ? 'noindex,nofollow' : 'index,follow'],
    ]

    for (const [selector, attr, value] of tags) {
      let el = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null
      if (!el) {
        el = createTagFromSelector(selector)
        document.head.appendChild(el)
      }
      el.setAttribute(attr, value)
    }
  }, [title, description, path, image, type, noindex])

  return null
}

// Crea un nuovo <meta> o <link> deducendo gli attributi dal selector CSS.
// Es: 'meta[property="og:title"]' → <meta property="og:title">.
function createTagFromSelector(selector: string): HTMLMetaElement | HTMLLinkElement {
  const tagName = selector.startsWith('link') ? 'link' : 'meta'
  const el = document.createElement(tagName) as HTMLMetaElement | HTMLLinkElement
  // Estrai gli attributi tipo [attr="value"]
  const attrMatches = selector.matchAll(/\[(\w+)="([^"]+)"\]/g)
  for (const m of attrMatches) el.setAttribute(m[1], m[2])
  return el
}
