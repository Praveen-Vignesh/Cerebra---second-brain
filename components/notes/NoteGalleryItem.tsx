import Link from 'next/link'
import { Clock, Star } from 'lucide-react'
import { timeAgo } from './timeAgo'

type Props = {
  id: string
  title: string
  topic: string
  updatedAt: string
  pinned?: boolean
}

export default function NoteGalleryItem({ id, title, topic, updatedAt, pinned }: Props) {
  return (
    <Link
      href={`/notes/${id}`}
      className="block bg-card border border-border rounded-xl overflow-hidden hover:border-accent/30 hover:shadow-sm transition-all"
    >
      <div className="relative h-28 bg-linear-to-br from-accent/20 to-accent/5">
        {pinned && (
          <div className="absolute top-2 right-2 bg-card/80 rounded-full p-1">
            <Star className="h-3 w-3 text-accent" fill="currentColor" strokeWidth={1.75} />
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium px-1.5 py-0.5 bg-accent/10 text-accent rounded-md border border-accent/15">
            {topic}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-2.5 w-2.5" strokeWidth={1.75} />
            {timeAgo(updatedAt)}
          </div>
        </div>

        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
          {title || 'Untitled'}
        </h3>
      </div>
    </Link>
  )
}
