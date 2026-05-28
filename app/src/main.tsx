import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// BrowserRouter (URL puliti senza #). Per il deploy su Vercel/Netlify serve
// una regola di rewrite che mandi tutte le route sconosciute a index.html
// (configurata in vercel.json o _redirects). In dev Vite lo fa già di suo.
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
