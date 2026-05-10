import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// BrowserRouter (history API) → URL pulite tipo /strutture invece di /#/strutture.
// Richiede SPA fallback lato host (Vercel/Netlify/Nginx) — vedi:
//   vercel.json, public/_redirects (Netlify), README sezione deploy.
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
