import { motion } from 'framer-motion'
import { Shield, Building2, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export type UserRole = 'admin' | 'structure' | 'employee'

interface RoleOption {
  id: UserRole
  icon: React.ElementType
  title: string
  description: string
}

const roles: RoleOption[] = [
  {
    id: 'admin',
    icon: Shield,
    title: 'Admin ATS',
    description: 'Gestione completa della piattaforma',
  },
  {
    id: 'structure',
    icon: Building2,
    title: 'Struttura',
    description: 'Ristoranti, hotel, bar, location',
  },
  {
    id: 'employee',
    icon: User,
    title: 'Dipendente',
    description: 'Camerieri, chef, baristi, receptionist',
  },
]

interface RoleSelectorProps {
  selectedRole: UserRole | null
  onSelect: (role: UserRole) => void
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
  },
}

export default function RoleSelector({ selectedRole, onSelect }: RoleSelectorProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col sm:flex-row items-stretch justify-center gap-5 w-full"
    >
      {roles.map((role) => {
        const Icon = role.icon
        const isSelected = selectedRole === role.id
        return (
          <motion.button
            key={role.id}
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(role.id)}
            className={cn(
              'relative flex flex-col items-center text-center gap-4 p-8 rounded-2xl cursor-pointer transition-all duration-300 min-w-[200px] flex-1 max-w-[260px]',
              'border',
              isSelected
                ? 'border-sky-primary bg-[rgba(91,184,245,0.08)] shadow-[0_0_24px_rgba(91,184,245,0.15)]'
                : 'border-[rgba(255,255,255,0.06)] bg-card-bg hover:border-[rgba(91,184,245,0.3)] hover:shadow-[0_0_24px_rgba(91,184,245,0.1)]'
            )}
          >
            <div
              className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300',
                isSelected ? 'bg-[rgba(91,184,245,0.15)]' : 'bg-[rgba(91,184,245,0.08)]'
              )}
            >
              <Icon className="w-7 h-7 text-sky-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">{role.title}</h3>
              <p className="text-sm text-text-secondary">{role.description}</p>
            </div>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-sky-primary flex items-center justify-center"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#06101E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        )
      })}
    </motion.div>
  )
}
