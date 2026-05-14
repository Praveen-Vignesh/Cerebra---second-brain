import { Clock } from 'lucide-react'

interface NoteCardProps {
  topic: string
  title: string
  excerpt: string
  timestamp: string
}

export default function NoteCard({ topic, title, excerpt, timestamp }: NoteCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full font-medium">
          {topic}
        </span>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          {timestamp}
        </div>
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{excerpt}</p>
    </div>
  )
}
