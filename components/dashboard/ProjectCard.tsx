import { Clock } from 'lucide-react'

interface ProjectCardProps {
  name: string
  status: string
  techTags: string[]
  progress: number
  lastActive: string
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  active:    { bg: 'bg-emerald-500/10',   text: 'text-emerald-600 dark:text-emerald-400',   dot: 'bg-emerald-500' },
  planning:  { bg: 'bg-blue-500/10',      text: 'text-blue-600 dark:text-blue-400',         dot: 'bg-blue-500' },
  completed: { bg: 'bg-muted/60',         text: 'text-muted-foreground',                    dot: 'bg-muted-foreground' },
}

export default function ProjectCard({ name, status, techTags, progress, lastActive }: ProjectCardProps) {
  const key = status.toLowerCase()
  const cfg = statusConfig[key] ?? statusConfig.completed

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-accent/30 hover:shadow-sm transition-all duration-150 cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-snug pr-2">
          {name}
        </h3>
        <span className={`shrink-0 flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border border-transparent ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {status}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {techTags.map((tag, i) => (
          <span
            key={i}
            className="text-[11px] px-2 py-0.5 bg-background border border-border rounded text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
          <span>Progress</span>
          <span className="tabular-nums font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-accent h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Clock className="h-3 w-3" strokeWidth={1.75} />
        Last active {lastActive}
      </div>
    </div>
  )
}
