'use client'

import { useState } from 'react'
import { Image, Link, Code, Zap, Save, Sparkles } from 'lucide-react'

export default function InstaDump() {
  const [content, setContent] = useState('')

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Zap className="h-5 w-5 text-accent mr-2" />
        <h2 className="text-lg font-semibold text-foreground">Insta Dump</h2>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Dump anything here — a thought, a URL, a piece of code. AI will sort it."
        className="w-full h-32 p-4 bg-background border border-border rounded-lg font-mono text-sm text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
      />
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Attach image">
            <Image className="h-4 w-4" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Attach link">
            <Link className="h-4 w-4" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Code snippet">
            <Code className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save to inbox
          </button>
          <button className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Process with AI
          </button>
        </div>
      </div>
    </div>
  )
}
