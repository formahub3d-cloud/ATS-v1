import { useState } from 'react'
import { cn } from '@/lib/utils'

export type AvatarSize = number | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const SIZE_TOKENS: Record<Exclude<AvatarSize, number>, number> = {
  xs: 24,
  sm: 32,
  md: 44,
  lg: 64,
  xl: 96,
}

interface AvatarProps {
  src?: string
  alt?: string
  initials?: string
  size?: AvatarSize
  borderColor?: string
  className?: string
  style?: React.CSSProperties
  online?: boolean
}

export default function Avatar({
  src,
  alt = '',
  initials,
  size = 44,
  borderColor = '#1A56A0',
  className,
  style,
  online = false,
}: AvatarProps) {
  const [error, setError] = useState(false)
  const sizePx = typeof size === 'number' ? size : SIZE_TOKENS[size]

  const getInitials = () => {
    if (initials) return initials
    if (alt) return alt.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    return '?'
  }

  const gradientColors = [
    'from-[#5BB8F5] to-[#1A56A0]',
    'from-[#3AA3E8] to-[#1EC99A]',
    'from-[#F5B800] to-[#F04545]',
    'from-[#1EC99A] to-[#5BB8F5]',
  ]

  const gradientIndex = (getInitials().charCodeAt(0) || 0) % gradientColors.length

  return (
    <div
      className={cn('relative inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0', className)}
      style={{ width: sizePx, height: sizePx, border: `2px solid ${borderColor}`, ...style }}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className={cn('w-full h-full flex items-center justify-center bg-gradient-to-br text-white font-semibold', gradientColors[gradientIndex])}
          style={{ fontSize: Math.max(sizePx * 0.4, 10) }}
        >
          {getInitials()}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-[#06101E] animate-status-pulse" />
      )}
    </div>
  )
}
