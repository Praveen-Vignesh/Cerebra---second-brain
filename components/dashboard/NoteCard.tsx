import { Clock } from 'lucide-react'

interface NoteCardProps {
  topic: string
  title: string
  excerpt: string
  timestamp: string
}

export default function NoteCard({ topic, title, excerpt, timestamp }: NoteCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-accent/30 hover:shadow-sm transition-all duration-150 cursor-pointer group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium px-2 py-1 bg-accent/8 text-accent rounded-md border border-accent/15">
          {topic}
        </span>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" strokeWidth={1.75} />
          {timestamp}
        </div>
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1.5 group-hover:text-accent transition-colors leading-snug">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{excerpt}</p>
    </div>
  )
}
