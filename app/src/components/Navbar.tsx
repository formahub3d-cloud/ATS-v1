import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { LogoAts } from './icons/LogoAts'
import { cn } from '@/lib/utils'
import AccountSwitcher from './AccountSwitcher'

const navLinks = [
  { label: 'Come funziona', href: '#how-it-works' },
  { label: 'I 3 Attori', href: '#actors' },
  { label: 'Sistema Rank', href: '#rank' },
  { label: 'Prezzi', href: '#pricing' },
  { label: 'Perch\u00E9 ATS', href: '#features' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToSection = useCallback((href: string) => {
    if (!isLanding) return
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileOpen(false)
  }, [isLanding])

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
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <motion.button
                key={link.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                onClick={() => scrollToSection(link.href)}
                className="relative text-[15px] font-medium text-text-secondary hover:text-sky-primary transition-colors duration-250 group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-sky-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </motion.button>
            ))}
          </div>

          {/* Desktop CTAs + Account switcher */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/auth"
              className="px-5 py-2.5 text-sm font-medium text-sky-primary border border-sky-primary rounded-lg hover:bg-sky-primary/10 transition-colors"
            >
              Registrati
            </Link>
            <Link
              to="/auth"
              className="px-5 py-2.5 text-sm font-medium text-text-inverse gradient-sky rounded-lg hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Accedi
            </Link>
            <div className="ml-2 pl-3 border-l border-[rgba(255,255,255,0.06)]">
              <AccountSwitcher />
            </div>
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
            <div className="flex flex-col items-center justify-center h-full gap-8 pt-[76px]">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => scrollToSection(link.href)}
                  className="text-[22px] font-medium text-text-secondary hover:text-sky-primary transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-3 mt-4 w-64"
              >
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-3 text-center text-sm font-medium text-sky-primary border border-sky-primary rounded-lg"
                >
                  Registrati
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-3 text-center text-sm font-medium text-text-inverse gradient-sky rounded-lg"
                >
                  Accedi
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
