'use client'

import { useEffect, useRef } from 'react'
import { Search, FileText, FolderKanban, Bookmark, ArrowRight } from 'lucide-react'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const placeholderResults = [
  {
    id: 1,
    title: 'Machine Learning Fundamentals',
    type: 'Note',
    snippet: 'Supervised learning involves training a model on labeled data...',
    icon: FileText,
  },
  {
    id: 2,
    title: 'React Native Mobile App',
    type: 'Project',
    snippet: 'Building a cross-platform mobile application using React Native...',
    icon: FolderKanban,
  },
  {
    id: 3,
    title: 'Deep Learning Papers Collection',
    type: 'Resource',
    snippet: 'Curated list of important papers in deep learning research...',
    icon: Bookmark,
  },
]

const typeColors: Record<string, string> = {
  Note:     'text-accent bg-accent/8 border-accent/15',
  Project:  'text-blue-600 bg-blue-500/8 border-blue-500/15 dark:text-blue-400',
  Resource: 'text-emerald-600 bg-emerald-500/8 border-emerald-500/15 dark:text-emerald-400',
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">

      <div
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-start justify-center pt-[15vh] px-4">
        <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">

          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.75} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search notes, projects, resources..."
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder-muted-foreground"
              onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
            />
            <kbd className="text-[10px] font-mono bg-background border border-border rounded px-1.5 py-0.5 text-muted-foreground">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto py-1">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">
              Recent
            </p>
            {placeholderResults.map((result) => (
              <button
                key={result.id}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-sidebar-accent transition-colors group text-left"
              >
                <div className="p-1.5 rounded-md bg-background border border-border text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                  <result.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-foreground truncate">
                      {result.title}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${typeColors[result.type] ?? ''}`}>
                      {result.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {result.snippet}
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
              </button>
            ))}
          </div>

          <div className="border-t border-border px-4 py-2.5 flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-background border border-border rounded px-1 py-0.5">↵</kbd>
              open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-background border border-border rounded px-1 py-0.5">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <kbd className="font-mono bg-background border border-border rounded px-1 py-0.5">ESC</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
