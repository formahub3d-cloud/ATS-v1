import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  /** Etichetta opzionale accanto all'icona (es. "Indietro", "Login"). */
  label?: string
  /** Route esplicita verso cui tornare. Se omessa: history.back(). */
  to?: string
  /** Handler custom; sovrascrive sia `to` che history.back(). */
  onClick?: () => void
  className?: string
  /** Variante visiva. `floating` = staccato; `inline` = dentro un header. */
  variant?: 'floating' | 'inline'
}

/**
 * Pulsante "indietro" uniforme per tutta l'app.
 * Pattern iOS-like (chevron + label opzionale), glass style coerente col tema.
 *
 * Default: torna indietro nello history del browser. Per pagine entry-point
 * (post-login) passa `to="/"` o `to="/admin"` ecc., così se l'utente arriva
 * direttamente non finisce in una pagina vuota.
 */
export default function BackButton({
  label,
  to,
  onClick,
  className,
  variant = 'floating',
}: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }
    if (to) {
      navigate(to)
      return
    }
    navigate(-1)
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xl text-sm font-medium transition-colors duration-200',
        variant === 'floating' && [
          'h-10 px-3',
          'bg-[rgba(13,30,52,0.7)] backdrop-blur-md',
          'border border-[rgba(255,255,255,0.08)]',
          'text-text-secondary hover:text-white hover:bg-[rgba(13,30,52,0.9)]',
          'hover:border-[rgba(91,184,245,0.25)]',
        ],
        variant === 'inline' && [
          'h-9 px-2 -ml-2',
          'text-text-secondary hover:text-white hover:bg-[rgba(255,255,255,0.04)]',
        ],
        className,
      )}
      aria-label={label ? `Torna a ${label}` : 'Indietro'}
    >
      <ChevronLeft className="w-4 h-4" />
      {label && <span>{label}</span>}
    </motion.button>
  )
}
