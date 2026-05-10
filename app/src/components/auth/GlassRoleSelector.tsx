import { motion } from 'framer-motion'
import { Building2, User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

// Volutamente NON includiamo 'admin' qui: l'accesso amministrativo è
// riservato e non va proposto a chiunque atterra sulla pagina di registrazione.
// Esiste un link discreto "Accedi come admin" in fondo alla pagina /auth per
// chi ha già un account amministrativo.
export type UserRole = 'admin' | 'structure' | 'employee'

interface RoleOption {
  id: 'structure' | 'employee'
  icon: React.ElementType
  title: string
  description: string
  bottomNote: string
  demoLabel: string
}

const roles: RoleOption[] = [
  {
    id: 'structure',
    icon: Building2,
    title: 'Sono una Struttura',
    description: 'Ristorante, hotel, bar, location eventi',
    bottomNote: 'Cerco personale qualificato',
    demoLabel: 'Prova come Struttura',
  },
  {
    id: 'employee',
    icon: User,
    title: 'Cerco Lavoro',
    description: 'Cameriere, chef, barista, receptionist',
    bottomNote: 'Mi candido come dipendente ATS',
    demoLabel: 'Prova come Dipendente',
  },
]

interface GlassRoleSelectorProps {
  selectedRole: UserRole | null
  onSelect: (role: UserRole) => void
  onDemo?: (role: UserRole) => void
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
  },
}

export default function GlassRoleSelector({ selectedRole, onSelect, onDemo }: GlassRoleSelectorProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col sm:flex-row items-stretch justify-center gap-5 w-full max-w-[640px] mx-auto"
    >
      {roles.map((role) => {
        const Icon = role.icon
        const isSelected = selectedRole === role.id
        return (
          <motion.div
            key={role.id}
            variants={cardVariants}
            className="flex flex-col flex-1 max-w-[260px] min-w-[200px]"
          >
            <motion.button
              whileHover={{ y: -6, transition: { duration: 0.35 } }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(role.id)}
              className={cn(
                'relative flex flex-col items-center text-center gap-4 p-8 sm:p-10 rounded-[20px] cursor-pointer transition-all duration-350 flex-1',
                'backdrop-blur-[16px]',
                isSelected
                  ? 'border-sky-primary bg-[rgba(13,30,52,0.7)] shadow-[0_12px_40px_rgba(91,184,245,0.1),0_0_30px_rgba(91,184,245,0.05)]'
                  : 'border-[rgba(255,255,255,0.06)] bg-[rgba(13,30,52,0.7)] hover:border-[rgba(91,184,245,0.3)] hover:shadow-[0_12px_40px_rgba(91,184,245,0.1),0_0_30px_rgba(91,184,245,0.05)]'
              )}
              style={{
                border: '1px solid',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Icon circle */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.35 }}
                className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300',
                  isSelected ? 'bg-[rgba(91,184,245,0.15)]' : 'bg-[rgba(91,184,245,0.1)]'
                )}
              >
                <Icon className="w-8 h-8 text-sky-primary" />
              </motion.div>

              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-1.5">{role.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{role.description}</p>
              </div>

              <div className="mt-auto pt-4">
                <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                  {role.bottomNote}
                </span>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full gradient-sky flex items-center justify-center shadow-glow"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7L6 10L11 4" stroke="#06101E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}

              {/* Glow border effect for selected */}
              {isSelected && (
                <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                  style={{
                    boxShadow: 'inset 0 0 0 1px rgba(91,184,245,0.3), 0 0 40px rgba(91,184,245,0.08)',
                  }}
                />
              )}
            </motion.button>

            {/* Demo link */}
            {onDemo && (
              <button
                onClick={() => onDemo(role.id)}
                className="mt-2 text-xs text-sky-primary/70 hover:text-sky-primary transition-colors text-center py-1 flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                {role.demoLabel}
              </button>
            )}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
