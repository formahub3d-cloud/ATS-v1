import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType>({
  addToast: () => {},
  removeToast: () => {},
})

const toastConfig: Record<ToastType, { icon: typeof CheckCircle; border: string; bg: string }> = {
  success: { icon: CheckCircle, border: '#1EC99A', bg: 'rgba(30,201,154,0.08)' },
  error: { icon: AlertCircle, border: '#F04545', bg: 'rgba(240,69,69,0.08)' },
  warning: { icon: AlertTriangle, border: '#F5B800', bg: 'rgba(245,184,0,0.08)' },
  info: { icon: Info, border: '#5BB8F5', bg: 'rgba(91,184,245,0.08)' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev.slice(-2), { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-6 right-6 z-[350] flex flex-col gap-3 w-[360px] max-w-[calc(100vw-48px)]">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const { icon: Icon, border } = toastConfig[toast.type]
  const duration = toast.duration || 5000

  useEffect(() => {
    const timer = setTimeout(onRemove, duration)
    return () => clearTimeout(timer)
  }, [onRemove, duration])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 120, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 120, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
      className={cn(
        'relative overflow-hidden rounded-xl p-4 pr-10',
        'bg-[rgba(13,30,52,0.95)] backdrop-blur-[16px]',
        'border border-[rgba(255,255,255,0.06)]',
        'shadow-toast'
      )}
      style={{ borderLeft: `4px solid ${border}` }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5" style={{ color: border }}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-text-secondary mt-1">{toast.message}</p>
          )}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 text-text-muted hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[rgba(255,255,255,0.06)]">
        <motion.div
          className="h-full"
          style={{ backgroundColor: border }}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      </div>
    </motion.div>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
