export function OnboardingStep1({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="15" y="25" width="50" height="40" rx="4" fill="#0D1E34" stroke="#5BB8F5" strokeWidth="1.5" />
      <rect x="25" y="15" width="30" height="20" rx="2" fill="#142B4A" stroke="#5BB8F5" strokeWidth="1" />
      <circle cx="40" cy="45" r="8" fill="#142B4A" stroke="#5BB8F5" strokeWidth="1" />
      <path d="M36 45H44M40 41V49" stroke="#5BB8F5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function OnboardingStep2({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="20" y="20" width="40" height="30" rx="4" fill="#0D1E34" stroke="#5BB8F5" strokeWidth="1.5" />
      <circle cx="40" cy="35" r="8" fill="#142B4A" stroke="#5BB8F5" strokeWidth="1" />
      <circle cx="40" cy="35" r="3" fill="#5BB8F5" />
      <path d="M55 25L65 20V50L55 45" stroke="#5BB8F5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function OnboardingStep3({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="15" y="30" width="50" height="30" rx="4" fill="#0D1E34" stroke="#5BB8F5" strokeWidth="1.5" />
      <rect x="20" y="35" width="15" height="10" rx="2" fill="#142B4A" stroke="#5BB8F5" strokeWidth="1" />
      <path d="M42 40H55" stroke="#5BB8F5" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M42 45H50" stroke="#5BB8F5" strokeWidth="1" strokeLinecap="round" />
      <circle cx="55" cy="22" r="10" fill="#0D1E34" stroke="#5BB8F5" strokeWidth="1.5" />
      <path d="M52 22L54 24L58 20" stroke="#5BB8F5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
