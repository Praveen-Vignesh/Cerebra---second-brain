import Link from 'next/link'
import { Clock, FileText, Folder, Pin, Trash2 } from 'lucide-react'
import { timeAgo } from './timeAgo'

type Props = {
  id: string
  title: string
  tags: string[]
  folder?: string | null
  updatedAt: string
  pinned?: boolean
}

export default function NoteListRow({
  id,
  title,
  tags,
  folder,
  updatedAt,
  pinned,
}: Props) {

  const stop = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Link
      href={`/notes/${id}`}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:bg-card hover:border-border transition-all"
    >
      <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />

      <span className="text-sm font-medium text-foreground truncate flex-1">
        {title || 'Untitled'}
      </span>

      {folder && (
        <span className="hidden md:flex items-center gap-1 text-[11px] text-muted-foreground">
          <Folder className="h-3 w-3" strokeWidth={1.75} />
          {folder}
        </span>
      )}

      {tags.length > 0 && (
        <div className="hidden sm:flex items-center gap-1">
          {tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] font-medium px-1.5 py-0.5 bg-accent/10 text-accent rounded border border-accent/15"
            >
              {t}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 text-[11px] text-muted-foreground w-20 justify-end">
        <Clock className="h-3 w-3" strokeWidth={1.75} />
        {timeAgo(updatedAt)}
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={stop}
          aria-label={pinned ? 'Unpin' : 'Pin to top'}
          className={`p-1.5 rounded transition-colors ${
            pinned
              ? 'text-accent hover:bg-accent/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
          }`}
        >
          <Pin
            className="h-3.5 w-3.5"
            strokeWidth={1.75}
            fill={pinned ? 'currentColor' : 'none'}
          />
        </button>
        <button
          type="button"
          onClick={stop}
          aria-label="Delete"
          className="p-1.5 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </Link>
  )
}
