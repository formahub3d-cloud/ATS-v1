import { Navigate } from 'react-router-dom'
import { useRole, type UserRole } from '@/context/RoleContext'

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin',
  structure: '/structure',
  employee: '/employee',
}

interface RoleGuardProps {
  allow: UserRole | UserRole[]
  children: React.ReactNode
}

/**
 * Guardia di rotta lato client per ruolo.
 *
 * ⚠️ È solo UX: impedisce a un ruolo di vedere le pagine di un altro ruolo nel client.
 * NON è sicurezza reale — quella vivrà nel backend (auth/JWT + RBAC, Fase 0): ogni
 * endpoint dovrà verificare ruolo e proprietà del dato indipendentemente dal frontend.
 */
export default function RoleGuard({ allow, children }: RoleGuardProps) {
  const { activeRole } = useRole()
  const allowed = Array.isArray(allow) ? allow : [allow]

  if (!allowed.includes(activeRole)) {
    return <Navigate to={ROLE_HOME[activeRole]} replace />
  }

  return <>{children}</>
}
