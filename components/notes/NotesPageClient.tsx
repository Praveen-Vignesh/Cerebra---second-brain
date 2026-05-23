'use client'

import { useState, useTransition } from 'react'
import { Plus, Pin } from 'lucide-react'
import NotesToolbar, {
  type SortKey,
  type ViewMode,
  type DateFilter,
} from './NotesToolbar'
import NoteCard from './NoteCard'
import NoteListRow from './NoteListRow'
import NoteGalleryItem from './NoteGalleryItem'
import NotesEmptyState from './NotesEmptyState'
import ConfirmDelete from './ConfirmDelete'
import { usePins } from './usePins'
import { deleteNote } from '@/actions/notes'

export type NoteListItem = {
  id: string
  title: string
  updated_at: string
  topic?: string
}

type Props = {
  notes: NoteListItem[]
  createAction: () => void | Promise<void>
}

const TOPIC_POOL = ['General', 'Study', 'Idea', 'Journal', 'Research']

export default function NotesPageClient({ notes, createAction }: Props) {
  const [view, setView] = useState<ViewMode>('grid')
  const [sort, setSort] = useState<SortKey>('updated')
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [dateFilter, setDateFilter] = useState<DateFilter>('All time')
  const [pinnedOnly, setPinnedOnly] = useState(false)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [isDeleting, startDelete] = useTransition()

  const { isPinned, togglePin } = usePins()

  const handleConfirmDelete = () => {
    if (!confirmingId) return
    const id = confirmingId
    startDelete(async () => {
      const res = await deleteNote(id)
      if (!res.ok) {
        console.error('delete failed:', res.error)
        return
      }
      setConfirmingId(null)
    })
  }

  // Enrich notes with placeholder topic + pin state from localStorage hook
  const enriched = notes.map((n, i) => ({
    ...n,
    topic: n.topic ?? TOPIC_POOL[i % TOPIC_POOL.length],
    pinned: isPinned(n.id),
  }))

  const visible = pinnedOnly ? enriched.filter((n) => n.pinned) : enriched
  const allTags = [...new Set(enriched.map((n) => n.topic))].sort()
  const pinned = visible.filter((n) => n.pinned)
  const rest = visible.filter((n) => !n.pinned)

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <header className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Notes</h1>
        <form action={createAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            New note
          </button>
        </form>
      </header>

      {notes.length === 0 ? (
        <NotesEmptyState />
      ) : (
        <>
          <NotesToolbar
            view={view}
            onViewChange={setView}
            sort={sort}
            onSortChange={setSort}
            tags={allTags}
            activeTags={activeTags}
            onTagsChange={setActiveTags}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            pinnedOnly={pinnedOnly}
            onPinnedToggle={() => setPinnedOnly(!pinnedOnly)}
          />

          {pinned.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-1.5 mb-3 text-[11px] font-semibold uppercase tracking-wide text-foreground">
                <Pin className="h-3.5 w-3.5" strokeWidth={1.75} />
                Pinned
              </div>
              <NoteGrid
                view={view}
                notes={pinned}
                onPinToggle={togglePin}
                onDelete={setConfirmingId}
              />
            </section>
          )}

          {!pinnedOnly && (
            <section className="mb-8">
              {pinned.length > 0 && (
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  All notes
                </div>
              )}
              <NoteGrid
                view={view}
                notes={rest}
                onPinToggle={togglePin}
                onDelete={setConfirmingId}
              />
            </section>
          )}
        </>
      )}

      <ConfirmDelete
        open={confirmingId !== null}
        pending={isDeleting}
        onCancel={() => setConfirmingId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

type EnrichedNote = NoteListItem & { topic: string; pinned: boolean }

function NoteGrid({
  view,
  notes,
  onPinToggle,
  onDelete,
}: {
  view: ViewMode
  notes: EnrichedNote[]
  onPinToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  if (notes.length === 0) {
    return <p className="text-xs text-muted-foreground px-1 py-3">Nothing here yet.</p>
  }

  if (view === 'list') {
    return (
      <div className="flex flex-col gap-1">
        {notes.map((n) => (
          <NoteListRow
            key={n.id}
            id={n.id}
            title={n.title}
            topic={n.topic}
            updatedAt={n.updated_at}
            pinned={n.pinned}
          />
        ))}
      </div>
    )
  }

  if (view === 'gallery') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {notes.map((n) => (
          <NoteGalleryItem
            key={n.id}
            id={n.id}
            title={n.title}
            topic={n.topic}
            updatedAt={n.updated_at}
            pinned={n.pinned}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {notes.map((n) => (
        <NoteCard
          key={n.id}
          id={n.id}
          title={n.title}
          topic={n.topic}
          updatedAt={n.updated_at}
          pinned={n.pinned}
          onPinToggle={onPinToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
