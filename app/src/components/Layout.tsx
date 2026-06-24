import { useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Building2, Users, Calendar, Settings, Heart, History,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import AccountSwitcher from './AccountSwitcher'

const navIcons: Record<string, LucideIcon> = {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  Settings,
  Heart,
  History,
}

const adminNavItems = [
  { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
  { label: 'Strutture', path: '/admin/structures', icon: 'Building2' },
  { label: 'Dipendenti', path: '/admin/employees', icon: 'Users' },
  { label: 'Turni', path: '/admin/shifts', icon: 'Calendar' },
  { label: 'Impostazioni', path: '/admin/settings', icon: 'Settings' },
]

const structureNavItems = [
  { label: 'Dashboard', path: '/structure', icon: 'LayoutDashboard' },
  { label: 'Matching', path: '/structure/matching', icon: 'Heart' },
  { label: 'Storico', path: '/structure/history', icon: 'History' },
]

function DesktopSidebar({ items, title }: { items: typeof adminNavItems; title: string }) {
  const location = useLocation()
  return (
    <aside
      className="hidden lg:flex flex-col w-[280px] min-h-screen fixed left-0 top-0 z-30"
      style={{
        background: 'rgba(6,16,30,0.98)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="h-[72px] flex items-center px-6 border-b border-[rgba(255,255,255,0.06)]">
        <Link to="/" className="text-xl font-playfair font-bold text-white tracking-tight">
          ATS
        </Link>
      </div>
      <div className="px-4 py-4 flex-1">
        <p className="text-[10px] uppercase tracking-[0.1em] text-text-muted px-3 mb-2">{title}</p>
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = navIcons[item.icon]
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center h-[48px] px-4 rounded-[10px] text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[rgba(91,184,245,0.1)] text-sky-primary shadow-[inset_4px_0_0_#5BB8F5]'
                    : 'text-text-secondary hover:bg-[rgba(255,255,255,0.05)] hover:text-white hover:translate-x-[2px]'
                )}
              >
                <span className="w-5 h-5 mr-3 flex items-center justify-center">
                  {Icon && <Icon className="w-5 h-5" aria-hidden="true" />}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-[rgba(255,255,255,0.06)] space-y-3">
        <AccountSwitcher />
        <Link
          to="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-text-muted hover:text-white hover:bg-[rgba(255,255,255,0.04)] rounded-xl transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </Link>
      </div>
    </aside>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const path = location.pathname

  // Landing/auth routes - no sidebar, use Navbar/Footer from pages
  if (path === '/' || path === '/auth') {
    return (
      <div className="min-h-[100dvh] bg-navy">
        <AnimatePresence mode="wait">
          <motion.main
            key={path}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    )
  }

  // Admin routes - desktop sidebar
  if (path.startsWith('/admin')) {
    return (
      <div className="min-h-[100dvh] bg-navy">
        <DesktopSidebar items={adminNavItems} title="Admin" />
        <AnimatePresence mode="wait">
          <motion.main
            key={path}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="lg:ml-[280px] min-h-screen p-6"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    )
  }

  // Structure routes - desktop sidebar
  if (path.startsWith('/structure')) {
    return (
      <div className="min-h-[100dvh] bg-navy">
        <DesktopSidebar items={structureNavItems} title="Struttura" />
        <AnimatePresence mode="wait">
          <motion.main
            key={path}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="lg:ml-[280px] min-h-screen p-6"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    )
  }

  // Employee routes - mobile bottom nav handled per-page
  if (path.startsWith('/employee')) {
    return (
      <div className="min-h-[100dvh] bg-navy">
        <AnimatePresence mode="wait">
          <motion.main
            key={path}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="min-h-[100dvh]"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    )
  }

  return <div className="min-h-[100dvh] bg-navy">{children}</div>
}
