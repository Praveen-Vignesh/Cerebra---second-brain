'use client'

import { AlertTriangle } from 'lucide-react'

type Props = {
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  pending?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function ConfirmDelete({
  open,
  title = 'Delete this note?',
  message = 'This action is permanent and cannot be undone.',
  confirmLabel = 'Delete',
  pending = false,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={pending ? undefined : onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-sm bg-card border border-border rounded-xl shadow-xl p-5"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="h-9 w-9 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1">{title}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-card text-foreground hover:border-accent/30 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="text-xs font-medium px-3 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
          >
            {pending ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
