import { createContext, useContext, useState, useCallback, useEffect } from 'react'

export type UserRole = 'admin' | 'structure' | 'employee'

export interface RoleAccount {
  role: UserRole
  name: string
  avatar: string
  label: string
}

export const ACCOUNTS: RoleAccount[] = [
  { role: 'admin', name: 'ATS Admin', avatar: '/avatar-employee-1.jpg', label: 'Super Admin' },
  { role: 'structure', name: 'Ristorante da Mario', avatar: '/structure-1.jpg', label: 'Struttura' },
  { role: 'employee', name: 'Luca Rossi', avatar: '/avatar-employee-2.jpg', label: 'Dipendente' },
]

interface RoleContextType {
  activeRole: UserRole
  setActiveRole: (role: UserRole) => void
  activeAccount: RoleAccount
}

const RoleContext = createContext<RoleContextType>({
  activeRole: 'admin',
  setActiveRole: () => {},
  activeAccount: ACCOUNTS[0],
})

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('ats_active_role') as UserRole
    return ACCOUNTS.find(a => a.role === saved) ? saved : 'admin'
  })

  const setActiveRole = useCallback((role: UserRole) => {
    localStorage.setItem('ats_active_role', role)
    setActiveRoleState(role)
  }, [])

  const activeAccount = ACCOUNTS.find(a => a.role === activeRole) || ACCOUNTS[0]

  useEffect(() => {
    const saved = localStorage.getItem('ats_active_role') as UserRole
    if (saved && ACCOUNTS.find(a => a.role === saved)) {
      setActiveRoleState(saved)
    }
  }, [])

  return (
    <RoleContext.Provider value={{ activeRole, setActiveRole, activeAccount }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
