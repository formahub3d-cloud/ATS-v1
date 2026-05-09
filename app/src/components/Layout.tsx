import { useLocation, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import AccountSwitcher from './AccountSwitcher'
import { useAuth } from '@/context/AuthContext'

const adminNavItems = [
  { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
  { label: 'Strutture', path: '/admin/structures', icon: 'Building2' },
  { label: 'Dipendenti', path: '/admin/employees', icon: 'Users' },
  { label: 'Turni', path: '/admin/shifts', icon: 'Calendar' },
  { label: 'Calendario', path: '/admin/calendar', icon: 'CalendarDays' },
  { label: 'Chat', path: '/admin/chat', icon: 'MessageCircle' },
  { label: 'Payroll', path: '/admin/payroll', icon: 'Euro' },
  { label: 'Fatture', path: '/admin/invoices', icon: 'FileText' },
  { label: 'Audit', path: '/admin/audit', icon: 'ShieldCheck' },
  { label: 'Impostazioni', path: '/admin/settings', icon: 'Settings' },
]

const structureNavItems = [
  { label: 'Dashboard', path: '/structure', icon: 'LayoutDashboard' },
  { label: 'Matching', path: '/structure/matching', icon: 'Heart' },
  { label: 'Storico', path: '/structure/history', icon: 'History' },
  { label: 'Chat', path: '/structure/chat', icon: 'MessageCircle' },
]

const employeeNavItems = [
  { label: 'Home', path: '/employee', icon: 'Home' },
  { label: 'Calendario', path: '/employee/calendar', icon: 'Calendar' },
  { label: 'Matching', path: '/employee/matching', icon: 'Heart' },
  { label: 'Check-in', path: '/employee/checkin', icon: 'ScanLine' },
  { label: 'Chat', path: '/employee/chat', icon: 'MessageCircle' },
]

function DesktopSidebar({ items, title }: { items: typeof adminNavItems; title: string }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, status } = useAuth()

  const handleLogout = async () => {
    try {
      if (status === 'authenticated') await signOut()
      localStorage.removeItem('ats_active_role')
      localStorage.removeItem('ats_draft_structure')
      localStorage.removeItem('ats_draft_employee')
    } finally {
      navigate('/auth')
    }
  }
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
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center h-[48px] px-4 rounded-[10px] text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[rgba(91,184,245,0.1)] text-sky-primary shadow-[inset_4px_0_0_#5BB8F5]'
                    : 'text-text-secondary hover:bg-[rgba(255,255,255,0.05)] hover:text-white hover:translate-x-[2px]'
                )}
              >
                <span className="w-5 h-5 mr-3 flex items-center justify-center">
                  <IconPlaceholder name={item.icon} />
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-[rgba(255,255,255,0.06)] space-y-3">
        <AccountSwitcher />
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-text-muted hover:text-white hover:bg-[rgba(255,255,255,0.04)] rounded-xl transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  )
}

function MobileBottomNav({ items }: { items: typeof employeeNavItems }) {
  const location = useLocation()
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center"
      style={{
        height: '72px',
        background: 'rgba(13,30,52,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {items.map((item) => {
        const isActive = location.pathname === item.path
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200',
              isActive ? 'text-sky-primary' : 'text-text-muted'
            )}
          >
            {isActive && (
              <div className="w-12 h-1 bg-[rgba(91,184,245,0.15)] rounded-full mb-1" />
            )}
            <span className="w-6 h-6 flex items-center justify-center">
              <IconPlaceholder name={item.icon} className={cn('w-[22px] h-[22px]', isActive ? 'text-sky-primary' : 'text-text-muted')} />
            </span>
            <span className="text-[11px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function IconPlaceholder({ name, className }: { name: string; className?: string }) {
  return (
    <svg className={cn('w-5 h-5', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="0" y="0" width="24" height="24" rx="4" fill="currentColor" opacity="0.1" />
      <circle cx="12" cy="12" r="4" />
    </svg>
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
            className="lg:ml-[280px] min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-10"
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
            className="lg:ml-[280px] min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-10"
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
