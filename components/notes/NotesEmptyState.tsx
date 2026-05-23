'use client'

import { BookOpen, GraduationCap, Lightbulb, Plus, Sparkles } from 'lucide-react'

export default function NotesEmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-4">
      <div className="h-14 w-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
        <Sparkles className="h-7 w-7" strokeWidth={1.5} />
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-1.5">
        Your knowledge starts here
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mb-8">
        Start blank, or pick a template to jump in.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl mb-6">
        <TemplateCard
          icon={<BookOpen className="h-6 w-6" strokeWidth={1.5} />}
          title="Daily Journal"
          description="Reflect on your day, ideas, and progress."
          onClick={onCreate}
        />
        <TemplateCard
          icon={<GraduationCap className="h-6 w-6" strokeWidth={1.5} />}
          title="Class Notes"
          description="Capture lectures with structure and highlights."
          onClick={onCreate}
        />
        <TemplateCard
          icon={<Lightbulb className="h-6 w-6" strokeWidth={1.5} />}
          title="Project Idea"
          description="Sketch a new build — problem, plan, next steps."
          onClick={onCreate}
        />
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:border-accent/30 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        Start from blank
      </button>
    </div>
  )
}

function TemplateCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-card border border-border rounded-xl overflow-hidden hover:border-accent/30 hover:shadow-sm transition-all"
    >
      <div className="h-16 bg-accent/10 text-accent flex items-center justify-center">
        {icon}
      </div>
      <div className="p-3.5">
        <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </button>
  )
}
