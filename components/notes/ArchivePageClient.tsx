'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { Archive as ArchiveIcon, RotateCcw, Trash2, Clock } from 'lucide-react'
import { unarchiveNote, deleteNote } from '@/actions/notes'
import { timeAgo } from './timeAgo'

export type ArchivedNote = {
  id: string
  title: string
  updated_at: string
  archived_at: string
  pinned: boolean
}

type Props = {
  notes: ArchivedNote[]
}

export default function ArchivePageClient({ notes }: Props) {

  const [isPending, startAction] = useTransition()

  function handleRestore(id: string) {
    startAction(async () => {
      const res = await unarchiveNote(id)
      if (!res.ok) console.error('restore failed:', res.error)
    })
  }

  function handleDelete(id: string) {
    startAction(async () => {
      const res = await deleteNote(id)
      if (!res.ok) console.error('delete failed:', res.error)
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <header className="flex items-center gap-2 mb-2">
        <ArchiveIcon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Archive</h1>
      </header>
      <p className="text-xs text-muted-foreground mb-6">
        Notes you&apos;ve set aside. Restore them to bring them back into Notes, or delete to send to trash.
      </p>

      {notes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-1">
          {notes.map((n) => (
            <ArchiveRow
              key={n.id}
              note={n}
              disabled={isPending}
              onRestore={() => handleRestore(n.id)}
              onDelete={() => handleDelete(n.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ArchiveRow({
  note,
  disabled,
  onRestore,
  onDelete,
}: {
  note: ArchivedNote
  disabled: boolean
  onRestore: () => void
  onDelete: () => void
}) {
  return (
    <div className="group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:bg-card hover:border-border transition-all">

      <Link
        href={`/notes/${note.id}`}
        className="flex-1 min-w-0 flex items-center gap-3"
      >
        <span className="text-sm font-medium text-foreground truncate">
          {note.title || 'Untitled'}
        </span>
      </Link>

      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Clock className="h-3 w-3" strokeWidth={1.75} />
        archived {timeAgo(note.archived_at)}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onRestore}
          disabled={disabled}
          title="Restore to Notes"
          className="p-1.5 rounded text-muted-foreground hover:text-accent hover:bg-accent/10 disabled:opacity-50 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          title="Move to trash"
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
      <ArchiveIcon className="h-8 w-8 mx-auto text-muted-foreground mb-3" strokeWidth={1.5} />
      <h2 className="text-sm font-semibold text-foreground mb-1">Nothing archived</h2>
      <p className="text-xs text-muted-foreground">
        When you archive a note from /notes, it lands here.
      </p>
    </div>
  )
}
