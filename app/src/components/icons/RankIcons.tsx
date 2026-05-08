export function RankRookie({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M32 8L38 26H58L42 38L48 56L32 44L16 56L22 38L6 26H26L32 8Z" stroke="#94A3B8" strokeWidth="2" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function RankAffidabile({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M32 8L38 26H58L42 38L48 56L32 44L16 56L22 38L6 26H26L32 8Z" fill="#5BB8F5" />
      <circle cx="32" cy="32" r="28" stroke="#5BB8F5" strokeWidth="1" fill="none" opacity="0.3" />
    </svg>
  )
}

export function RankSenior({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M20 8L24 22H10L30 34L22 52L32 42L42 52L34 34L54 22H40L44 8L32 18L20 8Z" fill="#3AA3E8" />
      <circle cx="32" cy="32" r="28" stroke="#3AA3E8" strokeWidth="1.5" fill="none" opacity="0.4" />
    </svg>
  )
}

export function RankElite({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M32 4L38 24H60L42 36L48 56L32 44L16 56L22 36L4 24H26L32 4Z" fill="#1EC99A" />
      <path d="M32 12L36 22H46L38 28L40 38L32 32L24 38L26 28L18 22H28L32 12Z" fill="#12996F" />
      <circle cx="32" cy="32" r="28" stroke="#1EC99A" strokeWidth="2" fill="none" opacity="0.3" />
    </svg>
  )
}

export function RankAmbassador({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M32 4L36 14H48L38 22L42 34L32 26L22 34L26 22L16 14H28L32 4Z" fill="#F5B800" />
      <path d="M32 8L38 26H58L42 38L48 56L32 44L16 56L22 38L6 26H26L32 8Z" fill="#F5B800" opacity="0.6" />
      <circle cx="32" cy="32" r="30" stroke="#F5B800" strokeWidth="1.5" fill="none" opacity="0.4" />
      <circle cx="32" cy="32" r="26" stroke="#F5B800" strokeWidth="0.5" fill="none" opacity="0.2" />
    </svg>
  )
}
