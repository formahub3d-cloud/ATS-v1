export function QrFrame({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M20 40V20H60" stroke="#5BB8F5" strokeWidth="3" strokeLinecap="round" />
      <path d="M180 40V20H140" stroke="#5BB8F5" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 160V180H60" stroke="#5BB8F5" strokeWidth="3" strokeLinecap="round" />
      <path d="M180 160V180H140" stroke="#5BB8F5" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
