interface StatCardProps {
  title: string
  value: number
  icon?: React.ReactNode
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-accent/30 transition-colors group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {value}
          </p>
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-accent/8 text-accent group-hover:bg-accent/12 transition-colors">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
