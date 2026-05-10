import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Building2, User } from 'lucide-react'
import { LogoAts } from './icons/LogoAts'
import { cn } from '@/lib/utils'

// Link header dei landing pages: portano a pagine dedicate (route reali)
// invece dei vecchi anchor #section. Più scopribili e indicizzabili.
const navLinks: Array<{ label: string; to: string; icon?: typeof Building2 }> = [
  { label: 'Strutture', to: '/strutture', icon: Building2 },
  { label: 'Lavoratori', to: '/lavoratori', icon: User },
  { label: 'Chi siamo', to: '/chi-siamo' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contatti', to: '/contatti' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Chiudi il menu mobile quando cambia rotta.
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleNavClick = (to: string) => {
    setMobileOpen(false)
    if (to.includes('#')) {
      const [path, hash] = to.split('#')
      if ((path || '/') === location.pathname) {
        // Stessa pagina: scroll all'anchor.
        document.querySelector('#' + hash)?.scrollIntoView({ behavior: 'smooth' })
      } else {
        // Pagina diversa: naviga, poi al mount facciamo scroll.
        navigate(path || '/')
        setTimeout(() => document.querySelector('#' + hash)?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } else {
      navigate(to)
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -72 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-[100] h-[76px] flex items-center transition-all duration-350',
          scrolled
            ? 'bg-[rgba(6,16,30,0.85)] backdrop-blur-[20px] saturate-[1.2] border-b border-[rgba(255,255,255,0.06)]'
            : 'bg-transparent'
        )}
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <LogoAts className="w-[150px] h-[45px]" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link, i) => {
              const Icon = link.icon
              const isActive = link.to === location.pathname
              return (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  onClick={() => handleNavClick(link.to)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors duration-200',
                    isActive
                      ? 'text-sky-primary bg-[rgba(91,184,245,0.08)]'
                      : 'text-text-secondary hover:text-sky-primary hover:bg-white/[0.03]',
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {link.label}
                </motion.button>
              )
            })}
          </div>

          {/* Desktop CTA: solo Accedi (la registrazione è dentro Auth) */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/auth"
              className="px-5 py-2.5 text-sm font-medium text-text-inverse gradient-sky rounded-lg hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Accedi / Registrati
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-text-secondary"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] bg-[#06101E]/98 backdrop-blur-lg lg:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-6 pt-[76px]">
              {navLinks.map((link, i) => {
                const Icon = link.icon
                return (
                  <motion.button
                    key={link.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => handleNavClick(link.to)}
                    className="flex items-center gap-2 text-[22px] font-medium text-text-secondary hover:text-sky-primary transition-colors"
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {link.label}
                  </motion.button>
                )
              })}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-3 mt-4 w-64"
              >
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-3 text-center text-sm font-medium text-text-inverse gradient-sky rounded-lg"
                >
                  Accedi / Registrati
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
