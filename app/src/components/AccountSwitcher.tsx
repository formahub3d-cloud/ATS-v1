import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, LogOut, Shield, Building2, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRole, ACCOUNTS, type UserRole } from '@/context/RoleContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/ToastSystem'

const roleIcons: Record<UserRole, typeof Shield> = {
  admin: Shield,
  structure: Building2,
  employee: User,
}

export default function AccountSwitcher() {
  const { activeRole, setActiveRole, activeAccount } = useRole()
  const { signOut, status } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { addToast } = useToast()
  const ref = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    setOpen(false)
    setIsSigningOut(true)
    try {
      // 1) Chiudi la sessione Supabase reale (se c'è).
      if (status === 'authenticated') {
        await signOut()
      }
      // 2) Pulisci il "demo role" residuo della UI (RoleContext fallback).
      localStorage.removeItem('ats_active_role')
      // 3) Pulisci eventuali bozze del wizard (evita "loggato" fantasma).
      localStorage.removeItem('ats_draft_structure')
      localStorage.removeItem('ats_draft_employee')
      addToast({
        type: 'success',
        title: 'Logout effettuato',
        message: 'A presto!',
      })
      navigate('/auth')
    } catch (err) {
      console.error('[logout] error', err)
      addToast({
        type: 'error',
        title: 'Errore',
        message: err instanceof Error ? err.message : 'Logout fallito',
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const switchRole = (role: UserRole) => {
    if (role === activeRole) {
      setOpen(false)
      return
    }
    setActiveRole(role)
    setOpen(false)
    const account = ACCOUNTS.find(a => a.role === role)
    addToast({
      type: 'info',
      title: 'Vista cambiata',
      message: `Ora stai navigando come: ${account?.name}`,
    })
  }

  const Icon = roleIcons[activeRole]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-250',
          'hover:bg-[rgba(255,255,255,0.04)]'
        )}
      >
        <div className="relative">
          <img
            src={activeAccount.avatar}
            alt={activeAccount.name}
            loading="lazy"
            decoding="async"
            className="w-9 h-9 rounded-full object-cover border-2 border-[rgba(91,184,245,0.3)]"
          />
        </div>
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-semibold text-white leading-tight">{activeAccount.name}</span>
          <span className="text-[11px] font-medium text-text-muted leading-tight">{activeAccount.label}</span>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-text-muted transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
            className={cn(
              'absolute right-0 top-full mt-2 w-[280px]',
              'bg-[rgba(13,30,52,0.95)] backdrop-blur-[24px]',
              'border border-[rgba(91,184,245,0.15)] rounded-2xl',
              'shadow-[0_16px_48px_rgba(0,0,0,0.4)] p-3 z-[300]'
            )}
          >
            <p className="text-[11px] uppercase tracking-[0.08em] text-text-muted px-3 py-2">
              Cambia vista
            </p>

            <div className="space-y-1">
              {ACCOUNTS.map((account) => {
                const isActive = account.role === activeRole
                const RIcon = roleIcons[account.role]
                return (
                  <button
                    key={account.role}
                    onClick={() => switchRole(account.role)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                      'hover:bg-[rgba(91,184,245,0.08)]',
                      isActive && 'bg-[rgba(91,184,245,0.08)]'
                    )}
                  >
                    <img
                      src={account.avatar}
                      alt={account.name}
                      loading="lazy"
                      decoding="async"
                      className="w-9 h-9 rounded-full object-cover border border-[rgba(255,255,255,0.1)]"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-white">{account.name}</p>
                      <p className="text-[11px] text-text-muted">{account.label}</p>
                    </div>
                    {isActive && (
                      <Check className="w-4 h-4 text-success" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
              <button
                onClick={handleLogout}
                disabled={isSigningOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm text-error hover:bg-[rgba(240,69,69,0.08)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4" />
                {isSigningOut ? 'Disconnessione…' : 'Logout'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
