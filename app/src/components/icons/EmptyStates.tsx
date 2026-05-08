export function EmptyStateStructures({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="40" y="80" width="60" height="80" rx="4" fill="#0D1E34" stroke="rgba(255,255,255,0.06)" />
      <rect x="110" y="60" width="60" height="100" rx="4" fill="#0D1E34" stroke="rgba(255,255,255,0.06)" />
      <rect x="180" y="90" width="40" height="70" rx="4" fill="#0D1E34" stroke="rgba(255,255,255,0.06)" />
      <circle cx="70" cy="120" r="12" fill="#142B4A" />
      <circle cx="140" cy="110" r="12" fill="#142B4A" />
      <circle cx="200" cy="125" r="8" fill="#142B4A" />
      <path d="M40 80 L120 40 L200 90" stroke="rgba(91,184,245,0.1)" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  )
}

export function EmptyStateEmployees({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="60" y="40" width="120" height="120" rx="8" fill="#0D1E34" stroke="rgba(255,255,255,0.06)" />
      <circle cx="120" cy="80" r="20" fill="#142B4A" />
      <rect x="90" y="110" width="60" height="8" rx="4" fill="#142B4A" />
      <rect x="100" y="125" width="40" height="6" rx="3" fill="#142B4A" />
      <rect x="150" y="55" width="30" height="20" rx="4" fill="#142B4A" stroke="rgba(91,184,245,0.15)" />
    </svg>
  )
}

export function EmptyStateShifts({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="50" y="30" width="140" height="110" rx="8" fill="#0D1E34" stroke="rgba(255,255,255,0.06)" />
      <rect x="65" y="50" width="110" height="70" rx="4" fill="#142B4A" />
      <rect x="75" y="60" width="30" height="6" rx="3" fill="#0D1E34" />
      <rect x="75" y="72" width="50" height="6" rx="3" fill="#0D1E34" />
      <rect x="75" y="84" width="40" height="6" rx="3" fill="#0D1E34" />
      <path d="M170 50 L200 30 L200 60 Z" fill="#0D1E34" stroke="rgba(255,255,255,0.06)" />
    </svg>
  )
}
