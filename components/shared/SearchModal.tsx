'use client'

import { useEffect, useRef } from 'react'
import { Search, FileText, FolderKanban, Bookmark } from 'lucide-react'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const placeholderResults = [
    {
      id: 1,
      title: 'Machine Learning Fundamentals',
      type: 'Note',
      snippet: 'Supervised learning involves training a model on labeled data...',
      icon: FileText
    },
    {
      id: 2,
      title: 'React Native Mobile App',
      type: 'Project',
      snippet: 'Building a cross-platform mobile application using React Native...',
      icon: FolderKanban
    },
    {
      id: 3,
      title: 'Deep Learning Papers Collection',
      type: 'Resource',
      snippet: 'Curated list of important papers in deep learning research...',
      icon: Bookmark
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-start justify-center pt-20 px-4">
        <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-xl">
          {/* Search input */}
          <div className="flex items-center px-4 py-3 border-b border-border">
            <Search className="h-5 w-5 text-muted-foreground mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search notes, projects, resources..."
              className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onClose()
                }
              }}
            />
          </div>
          
          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {placeholderResults.map((result) => (
              <div
                key={result.id}
                className="flex items-start px-4 py-3 hover:bg-muted cursor-pointer transition-colors"
              >
                <result.icon className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {result.title}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                      {result.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {result.snippet}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
