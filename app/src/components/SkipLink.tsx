// SkipLink — link "Vai al contenuto" per chi naviga da tastiera o screen
// reader. Pattern WCAG 2.4.1 (Bypass Blocks).
//
// Visibile solo quando riceve focus (TAB iniziale dalla pagina). Salta
// la navigazione del Layout/Navbar e porta il focus al main content.
//
// Mount: deve essere il primo elemento focusable nel DOM. Si monta in
// App.tsx prima di Layout.

export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-3 focus:left-3 focus:z-[1000]
        focus:px-4 focus:py-2 focus:rounded-lg
        focus:bg-sky-primary focus:text-text-inverse
        focus:font-semibold focus:text-sm
        focus:shadow-lg focus:outline-none
      "
    >
      Vai al contenuto
    </a>
  )
}
