'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'cerebra:pinned-notes'

export function usePins() {
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set())

  // Load from localStorage after mount (it doesn't exist on the server)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setPinnedIds(new Set(JSON.parse(raw)))
    } catch {
      // ignore parse errors — treat as empty
    }
  }, [])

  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      } catch {
        // ignore quota errors
      }
      return next
    })
  }

  const isPinned = (id: string) => pinnedIds.has(id)

  return { pinnedIds, togglePin, isPinned }
}
