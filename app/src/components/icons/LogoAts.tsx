export function LogoAts({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <text x="0" y="34" fill="white" fontFamily="'Playfair Display', Georgia, serif" fontSize="32" fontWeight="700" letterSpacing="-0.02em">
        ATS
      </text>
      <text x="0" y="44" fill="#94A3B8" fontFamily="'DM Sans', system-ui, sans-serif" fontSize="9" fontWeight="500" letterSpacing="0.08em">
        Al TuO Servizio
      </text>
    </svg>
  )
}

export function LogoAtsIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="16" cy="16" r="15" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M10 22L16 10L22 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M12 18H20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
