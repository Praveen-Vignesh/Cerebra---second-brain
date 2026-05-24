'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Trash2, RotateCcw, X } from 'lucide-react'
import { restoreNote, permanentlyDeleteNote, emptyTrash } from '@/actions/notes'
import ConfirmDelete from './ConfirmDelete'

const TRASH_RETENTION_DAYS = 7

export type TrashedNote = {
  id: string
  title: string
  updated_at: string
  deleted_at: string
  pinned: boolean
}

type Props = {
  notes: TrashedNote[]
}

export default function TrashPageClient({ notes }: Props) {

  const [confirming, setConfirming] = useState<
    { kind: 'one'; id: string } | { kind: 'all' } | null
  >(null)
  const [isPending, startAction] = useTransition()

  function handleRestore(id: string) {
    startAction(async () => {
      const res = await restoreNote(id)
      if (!res.ok) console.error('restore failed:', res.error)
    })
  }

  function handleConfirm() {
    if (!confirming) return
    startAction(async () => {
      const res =
        confirming.kind === 'one'
          ? await permanentlyDeleteNote(confirming.id)
          : await emptyTrash()
      if (!res.ok) {
        console.error('delete failed:', res.error)
        return
      }
      setConfirming(null)
    })
  }

  const confirmTitle =
    confirming?.kind === 'all'
      ? `Empty trash? (${notes.length} notes)`
      : 'Permanently delete this note?'
  const confirmMessage =
    confirming?.kind === 'all'
      ? 'Every note in the trash will be deleted forever. This cannot be undone.'
      : 'This note will be deleted forever. This cannot be undone.'

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <header className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Trash</h1>
        </div>
        {notes.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirming({ kind: 'all' })}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md border border-red-500/30 text-red-500 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
            Empty trash
          </button>
        )}
      </header>
      <p className="text-xs text-muted-foreground mb-6">
        Notes are kept here for {TRASH_RETENTION_DAYS} days before they&apos;re deleted forever.
      </p>

      {notes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-1">
          {notes.map((n) => (
            <TrashRow
              key={n.id}
              note={n}
              disabled={isPending}
              onRestore={() => handleRestore(n.id)}
              onDelete={() => setConfirming({ kind: 'one', id: n.id })}
            />
          ))}
        </div>
      )}

      <ConfirmDelete
        open={confirming !== null}
        pending={isPending}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirming?.kind === 'all' ? 'Empty trash' : 'Delete forever'}
        onCancel={() => setConfirming(null)}
        onConfirm={handleConfirm}
      />
    </div>
  )
}

function TrashRow({
  note,
  disabled,
  onRestore,
  onDelete,
}: {
  note: TrashedNote
  disabled: boolean
  onRestore: () => void
  onDelete: () => void
}) {
  const daysLeft = daysUntilPurge(note.deleted_at)

  return (
    <div className="group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:bg-card hover:border-border transition-all">
      <Link href={`/notes/${note.id}`} className="flex-1 min-w-0 flex items-center gap-3">
        <span className="text-sm font-medium text-foreground truncate">
          {note.title || 'Untitled'}
        </span>
      </Link>

      <span
        className={`text-[11px] font-medium ${
          daysLeft <= 1 ? 'text-red-500' : 'text-muted-foreground'
        }`}
      >
        {daysLeft <= 0
          ? 'deleting soon'
          : daysLeft === 1
            ? 'deletes in 1 day'
            : `deletes in ${daysLeft} days`}
      </span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onRestore}
          disabled={disabled}
          title="Restore"
          className="p-1.5 rounded text-muted-foreground hover:text-accent hover:bg-accent/10 disabled:opacity-50 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          title="Delete forever"
          className="p-1.5 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border rounded-xl py-16 px-6 text-center">
      <Trash2 className="h-8 w-8 mx-auto text-muted-foreground mb-3" strokeWidth={1.5} />
      <h2 className="text-sm font-semibold text-foreground mb-1">Trash is empty</h2>
      <p className="text-xs text-muted-foreground">
        Deleted notes show up here for {TRASH_RETENTION_DAYS} days before being purged.
      </p>
    </div>
  )
}

function daysUntilPurge(deletedAt: string): number {
  const deleted = new Date(deletedAt).getTime()
  const purgeAt = deleted + TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000
  const msLeft = purgeAt - Date.now()
  return Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)))
}
