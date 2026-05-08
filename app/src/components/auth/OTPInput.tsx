import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  length?: number
  onComplete: (code: string) => void
  onChange?: (code: string) => void
  disabled?: boolean
}

export default function OTPInput({
  length = 6,
  onComplete,
  onChange,
  disabled = false,
}: OTPInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''))
  const [focusedIndex, setFocusedIndex] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const updateDigits = useCallback(
    (newDigits: string[]) => {
      setDigits(newDigits)
      const code = newDigits.join('')
      onChange?.(code)
      if (code.length === length && newDigits.every((d) => d !== '')) {
        onComplete(code)
      }
    },
    [length, onComplete, onChange]
  )

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (disabled) return
      const sanitized = value.replace(/\D/g, '').slice(-1)
      if (!sanitized) return

      const newDigits = [...digits]
      newDigits[index] = sanitized
      updateDigits(newDigits)

      if (index < length - 1) {
        setFocusedIndex(index + 1)
        inputRefs.current[index + 1]?.focus()
      }
    },
    [digits, disabled, length, updateDigits]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return

      if (e.key === 'Backspace') {
        e.preventDefault()
        const newDigits = [...digits]

        if (newDigits[index]) {
          newDigits[index] = ''
          updateDigits(newDigits)
        } else if (index > 0) {
          newDigits[index - 1] = ''
          updateDigits(newDigits)
          setFocusedIndex(index - 1)
          inputRefs.current[index - 1]?.focus()
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus()
        setFocusedIndex(index - 1)
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
        setFocusedIndex(index + 1)
      }
    },
    [digits, disabled, length, updateDigits]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      if (disabled) return
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
      if (!pasted) return

      const newDigits = [...digits]
      for (let i = 0; i < pasted.length && i < length; i++) {
        newDigits[i] = pasted[i]
      }
      updateDigits(newDigits)

      const nextIndex = Math.min(pasted.length, length - 1)
      setFocusedIndex(nextIndex)
      inputRefs.current[nextIndex]?.focus()
    },
    [digits, disabled, length, updateDigits]
  )

  return (
    <div className="flex items-center justify-center gap-3">
      {digits.map((digit, index) => (
        <motion.div
          key={index}
          animate={
            digit
              ? { scale: [0.9, 1.05, 1] }
              : focusedIndex === index
                ? { scale: [1, 1.02, 1] }
                : {}
          }
          transition={{ duration: 0.2 }}
        >
          <input
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            className={cn(
              'w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-mono font-semibold rounded-xl border-2 bg-card-bg text-text-primary transition-all duration-200 outline-none',
              focusedIndex === index
                ? 'border-sky-primary shadow-[0_0_0_3px_rgba(91,184,245,0.15)]'
                : digit
                  ? 'border-success/50'
                  : 'border-[rgba(255,255,255,0.1)]',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
        </motion.div>
      ))}
    </div>
  )
}
