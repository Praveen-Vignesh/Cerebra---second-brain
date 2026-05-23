import Link from 'next/link'
import { Clock, Star, FileText } from 'lucide-react'
import { timeAgo } from './timeAgo'

type Props = {
  id: string
  title: string
  topic: string
  updatedAt: string
  pinned?: boolean
}

export default function NoteListRow({ id, title, topic, updatedAt, pinned }: Props) {
  return (
    <Link
      href={`/notes/${id}`}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:bg-card hover:border-border transition-all"
    >
      <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />

      <span className="text-sm font-medium text-foreground truncate flex-1">
        {title || 'Untitled'}
      </span>

      <span className="text-[11px] font-medium px-2 py-0.5 bg-accent/10 text-accent rounded-md border border-accent/15">
        {topic}
      </span>

      {pinned && (
        <Star className="h-3.5 w-3.5 text-accent" fill="currentColor" strokeWidth={1.75} />
      )}

      <div className="flex items-center gap-1 text-[11px] text-muted-foreground w-20 justify-end">
        <Clock className="h-3 w-3" strokeWidth={1.75} />
        {timeAgo(updatedAt)}
      </div>
    </Link>
  )
}
