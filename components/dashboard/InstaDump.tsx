'use client'

import { useState } from 'react'
import { Image, Link, Code, Zap, Save, Sparkles } from 'lucide-react'

export default function InstaDump() {
  const [content, setContent] = useState('')

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-accent" strokeWidth={2} />
        <h2 className="text-sm font-semibold text-foreground">Insta Dump</h2>
        <span className="text-[11px] text-muted-foreground ml-auto">
          AI will sort it
        </span>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Dump anything here — a thought, a URL, a piece of code..."
        className="w-full h-28 p-3.5 bg-background border border-border rounded-lg font-mono text-xs text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-colors leading-relaxed"
      />

      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-1">
          {[
            { icon: Image, title: 'Attach image' },
            { icon: Link,  title: 'Attach link' },
            { icon: Code,  title: 'Code snippet' },
          ].map(({ icon: Icon, title }) => (
            <button
              key={title}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-md transition-colors"
              title={title}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-sidebar-accent transition-colors">
            <Save className="h-3 w-3" strokeWidth={1.75} />
            Save
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium">
            <Sparkles className="h-3 w-3" strokeWidth={2} />
            Process
          </button>
        </div>
      </div>
    </div>
  )
}
