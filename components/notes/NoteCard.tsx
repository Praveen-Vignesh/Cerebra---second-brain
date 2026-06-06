'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Clock, Star, MoreHorizontal, Pin, Trash2, Folder } from 'lucide-react'
import { timeAgo } from './timeAgo'
import { tagChipStyle, DEFAULT_TAG_CLASS } from './tagStyle'
import type { TagLite } from './NotesPageClient'

type Props = {
  id: string
  title: string
  tags: TagLite[]
  folder?: string | null
  excerpt?: string
  updatedAt: string
  pinned?: boolean
  onPinToggle?: (id: string) => void
  onDelete?: (id: string) => void
}

export default function NoteCard({
  id,
  title,
  tags,
  folder,
  excerpt,
  updatedAt,
  pinned,
  onPinToggle,
  onDelete,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  const stop = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Link
      href={`/notes/${id}`}
      className="relative block bg-card border border-border rounded-xl p-4 hover:border-accent/30 hover:shadow-sm transition-all"
    >

      <div className="flex items-center justify-between mb-2">
        {folder ? (
          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-sidebar-accent text-muted-foreground rounded-md">
            <Folder className="h-3 w-3" strokeWidth={1.75} />
            {folder}
          </span>
        ) : (

          <span />
        )}

        <div className="flex items-center gap-1.5">
          {pinned && (
            <Star className="h-3.5 w-3.5 text-accent" fill="currentColor" strokeWidth={1.75} />
          )}
          <button
            type="button"
            onClick={(e) => {
              stop(e)
              setMenuOpen(!menuOpen)
            }}
            className="text-muted-foreground hover:text-foreground p-0.5 rounded"
            aria-label="Note actions"
          >
            <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-2">
        {title || 'Untitled'}
      </h3>

      {excerpt && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{excerpt}</p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((t) => (
            <span
              key={t.name}
              style={tagChipStyle(t.color)}
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                t.color ? '' : DEFAULT_TAG_CLASS
              }`}
            >
              {t.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Clock className="h-3 w-3" strokeWidth={1.75} />
        {timeAgo(updatedAt)}
      </div>

      {menuOpen && (
        <>

          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              stop(e)
              setMenuOpen(false)
            }}
          />
          <div className="absolute z-20 top-12 right-3 min-w-40 bg-card border border-border rounded-lg shadow-lg p-1">
            <button
              type="button"
              onClick={(e) => {
                stop(e)
                setMenuOpen(false)
                onPinToggle?.(id)
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md hover:bg-sidebar-accent transition-colors"
            >
              <Pin className="h-3.5 w-3.5" strokeWidth={1.75} />
              {pinned ? 'Unpin' : 'Pin to top'}
            </button>
            <button
              type="button"
              onClick={(e) => {
                stop(e)
                setMenuOpen(false)
                onDelete?.(id)
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Delete
            </button>
          </div>
        </>
      )}
    </Link>
  )
}
