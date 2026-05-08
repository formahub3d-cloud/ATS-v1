export function HeroPattern({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(91,184,245,0.03)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <line x1="0" y1="540" x2="1920" y2="540" stroke="rgba(91,184,245,0.02)" strokeWidth="1" />
      <line x1="960" y1="0" x2="960" y2="1080" stroke="rgba(91,184,245,0.02)" strokeWidth="1" />
    </svg>
  )
}
