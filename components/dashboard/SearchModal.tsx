'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText } from 'lucide-react'
import { searchNotes, type SearchResult } from '@/actions/search'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

// Cmd+K search. Debounces the query, runs searchNotes on the server, and lets you
// move through results with ↑/↓ and open one with Enter.
export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(0)

  // Focus the input whenever the modal opens.
  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  // Reset everything when the modal closes. Done during render (not in an effect)
  // to avoid synchronous setState in an effect body.
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen)
    if (!isOpen) {
      setQuery('')
      setResults([])
      setLoading(false)
      setActive(0)
    }
  }

  // Debounced search. Everything runs inside the timeout callback (never
  // synchronously in the effect body). A stale guard keeps an earlier slow
  // response from overwriting the results of a later query.
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      const q = query.trim()
      if (q === '') {
        setResults([])
        setLoading(false)
        return
      }
      const res = await searchNotes(q)
      if (cancelled) return
      setResults(res.ok ? res.data : [])
      setActive(0)
      setLoading(false)
    }, 200)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  function select(result: SearchResult) {
    onClose()
    router.push(`/notes/${result.id}`)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const chosen = results[active]
      if (chosen) select(chosen)
    }
  }

  if (!isOpen) return null

  const q = query.trim()

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
              value={query}
              onChange={(e) => {
                const v = e.target.value
                setQuery(v)
                setLoading(v.trim() !== '')
              }}
              onKeyDown={onKeyDown}
              placeholder="Search your notes..."
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder-muted-foreground"
            />
            <kbd className="text-[10px] font-mono bg-background border border-border rounded px-1.5 py-0.5 text-muted-foreground">
              ESC
            </kbd>
          </div>

          {q === '' ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">Search your notes by title or content.</p>
            </div>
          ) : loading ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">Searching…</p>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">No notes match &ldquo;{q}&rdquo;.</p>
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto p-2">
              {results.map((r, i) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => select(r)}
                    onMouseEnter={() => setActive(i)}
                    className={`w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      i === active ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent/60'
                    }`}
                  >
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{r.title}</span>
                      {r.snippet && (
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{r.snippet}</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
