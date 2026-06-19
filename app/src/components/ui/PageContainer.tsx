import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: ReactNode
  /** Larghezza max del contenuto. Default 'xl' (1280px ~). */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  /** Padding orizzontale: 'comfortable' (default) o 'tight' per pagine dense. */
  padding?: 'comfortable' | 'tight'
  /** Aggiunge spazio in fondo per evitare overlap col mobile bottom-nav (employee). */
  bottomNavSafe?: boolean
  className?: string
}

const widthMap: Record<NonNullable<PageContainerProps['maxWidth']>, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-none',
}

/**
 * Wrapper standard per il contenuto di pagina.
 * - Padding orizzontale e verticale uniforme su tutti i breakpoint.
 * - Larghezza max controllata per non avere "tipo Word a tutta pagina" su monitor 4K.
 * - `bottomNavSafe` aggiunge ~96px di pb (impedisce overlap con la bottom nav mobile).
 *
 * Pensato per essere il primo wrapper dentro una page component, sostituendo
 * i vari `min-h-[100dvh] px-N pb-24` ad-hoc che proliferavano nelle pages.
 */
export default function PageContainer({
  children,
  maxWidth = 'xl',
  padding = 'comfortable',
  bottomNavSafe = false,
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto',
        widthMap[maxWidth],
        padding === 'comfortable' && 'px-4 sm:px-6 lg:px-8 py-6 lg:py-8',
        padding === 'tight' && 'px-3 sm:px-4 py-4',
        bottomNavSafe && 'pb-24 lg:pb-8',
        className,
      )}
    >
      {children}
    </div>
  )
}
