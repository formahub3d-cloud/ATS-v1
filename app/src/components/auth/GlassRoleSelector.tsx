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
  // Differenziazione cromatica + tempo stimato per dare un'idea concreta
  // di cosa succederà dopo aver scelto.
  accent: { rgba: (a: number) => string; hex: string }
  estTime: string
}

const SKY = { rgba: (a: number) => `rgba(91,184,245,${a})`, hex: '#5BB8F5' }
const GRN = { rgba: (a: number) => `rgba(30,201,154,${a})`, hex: '#1EC99A' }

const roles: RoleOption[] = [
  {
    id: 'structure',
    icon: Building2,
    title: 'Sono una Struttura',
    description: 'Ristorante, hotel, bar, location eventi',
    bottomNote: 'Cerco personale qualificato',
    demoLabel: 'Prova come Struttura',
    accent: SKY,
    estTime: '8 step · ~15 min',
  },
  {
    id: 'employee',
    icon: User,
    title: 'Cerco Lavoro',
    description: 'Cameriere, chef, barista, receptionist',
    bottomNote: 'Mi candido come dipendente ATS',
    demoLabel: 'Prova come Dipendente',
    accent: GRN,
    estTime: '2 step · ~3 min',
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
        const a = role.accent
        return (
          <motion.div
            key={role.id}
            variants={cardVariants}
            className="flex flex-col flex-1 max-w-[280px] min-w-[200px]"
          >
            <motion.button
              whileHover={{ y: -6, transition: { duration: 0.35 } }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(role.id)}
              className="relative flex flex-col items-center text-center gap-4 p-8 sm:p-10 rounded-[20px] cursor-pointer transition-all duration-350 flex-1 backdrop-blur-[16px]"
              style={{
                border: '1px solid',
                borderColor: isSelected ? a.hex : 'rgba(255,255,255,0.06)',
                background: isSelected
                  ? `linear-gradient(135deg, ${a.rgba(0.06)}, rgba(13,30,52,0.7))`
                  : 'rgba(13,30,52,0.7)',
                boxShadow: isSelected
                  ? `0 12px 40px ${a.rgba(0.12)}, 0 0 30px ${a.rgba(0.06)}`
                  : undefined,
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Icon circle */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.35 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300"
                style={{ backgroundColor: a.rgba(isSelected ? 0.18 : 0.1) }}
              >
                <Icon className="w-8 h-8" style={{ color: a.hex }} />
              </motion.div>

              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-1.5">{role.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{role.description}</p>
              </div>

              {/* Pillola con tempo stimato — toglie l'ansia del "non so cosa mi aspetta". */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium tabular-nums"
                style={{ backgroundColor: a.rgba(0.1), color: a.hex, border: `1px solid ${a.rgba(0.25)}` }}
              >
                {role.estTime}
              </div>

              <div className="mt-auto pt-2">
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
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-glow"
                  style={{ background: a.hex }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7L6 10L11 4" stroke="#06101E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </motion.button>

            {/* Demo link */}
            {onDemo && (
              <button
                onClick={() => onDemo(role.id)}
                className="mt-2 text-xs transition-colors text-center py-1 flex items-center justify-center gap-1"
                style={{ color: a.rgba(0.7) }}
                onMouseEnter={(e) => (e.currentTarget.style.color = a.hex)}
                onMouseLeave={(e) => (e.currentTarget.style.color = a.rgba(0.7))}
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
