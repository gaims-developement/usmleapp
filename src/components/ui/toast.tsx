import { createContext, useCallback, useContext, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ToastTone = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: string
  tone: ToastTone
  title: string
  description?: string
}

interface ToastApi {
  toast: (tone: ToastTone, title: string, description?: string) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const toneStyles: Record<ToastTone, { icon: ReactNode; ring: string }> = {
  success: {
    icon: <CheckCircle2 className="size-5 text-brand-600" aria-hidden />,
    ring: 'border-brand-200',
  },
  error: {
    icon: <XCircle className="size-5 text-red-600" aria-hidden />,
    ring: 'border-red-200',
  },
  warning: {
    icon: <TriangleAlert className="size-5 text-amber-600" aria-hidden />,
    ring: 'border-amber-200',
  },
  info: {
    icon: <Info className="size-5 text-sky-600" aria-hidden />,
    ring: 'border-sky-200',
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const push = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts(prev => [...prev, { id, tone, title, description }])
      setTimeout(() => dismiss(id), 4500)
    },
    [dismiss],
  )

  const api: ToastApi = {
    toast: push,
    success: (t, d) => push('success', t, d),
    error: (t, d) => push('error', t, d),
    info: (t, d) => push('info', t, d),
    warning: (t, d) => push('warning', t, d),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:bottom-4 sm:right-4">
          <AnimatePresence>
            {toasts.map(t => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-lift',
                  toneStyles[t.tone].ring,
                )}
              >
                <span className="mt-0.5 shrink-0">{toneStyles[t.tone].icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-xs text-ink-500">{t.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
