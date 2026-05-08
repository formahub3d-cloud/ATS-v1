import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CoverPhotoProps {
  src?: string
  alt?: string
  className?: string
  overlay?: boolean
  children?: React.ReactNode
}

export default function CoverPhoto({ src, alt = '', className, overlay = false, children }: CoverPhotoProps) {
  const [error, setError] = useState(false)

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#0D1E34] to-[#142B4A] flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        </div>
      )}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,16,30,0.9)] via-transparent to-transparent" />
      )}
      {children && <div className="absolute inset-0">{children}</div>}
    </div>
  )
}
