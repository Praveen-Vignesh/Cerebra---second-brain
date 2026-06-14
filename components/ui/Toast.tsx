'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
type Toast = { id: number; type: ToastType; message: string }

type ToastApi = {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

// In-house toasts — no extra dependency. Wrap the app once with <ToastProvider>
// and call useToast() anywhere to surface a transient success/error message.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = Date.now() + Math.random()
      setToasts((current) => [...current, { id, type, message }])
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  const api: ToastApi = {
    success: (message) => push('success', message),
    error: (message) => push('error', message),
    info: (message) => push('info', message),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

const ICONS = {
  success: <CheckCircle2 className="h-4 w-4 text-green-500" strokeWidth={2} />,
  error: <AlertCircle className="h-4 w-4 text-red-500" strokeWidth={2} />,
  info: <Info className="h-4 w-4 text-accent" strokeWidth={2} />,
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <div className="pointer-events-auto flex items-start gap-2.5 rounded-lg border border-border bg-card px-3.5 py-3 shadow-lg">
      <span className="mt-0.5 shrink-0">{ICONS[toast.type]}</span>
      <p className="flex-1 text-sm text-foreground">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  )
}
