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
import NotesEmptyState from './NotesEmptyState'
import ConfirmDelete from './ConfirmDelete'
import { deleteNote, togglePin } from '@/actions/notes'

export type TagLite = { name: string; color: string | null }

export type NoteListItem = {
  id: string
  title: string
  updated_at: string
  created_at: string
  pinned: boolean
  folder_id: string | null
  folder: string | null
  tags: TagLite[]
}

type Props = {
  notes: NoteListItem[]

  createAction: () => void | Promise<void>
}

export default function NotesPageClient({ notes, createAction }: Props) {

  const [view, setView] = useState<ViewMode>('grid')
  const [sort, setSort] = useState<SortKey>('updated')
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [dateFilter, setDateFilter] = useState<DateFilter>('All time')
  const [pinnedOnly, setPinnedOnly] = useState(false)

  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [isDeleting, startDelete] = useTransition()
  const [, startPin] = useTransition()

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

  const handlePinToggle = (id: string) => {
    startPin(async () => {
      const res = await togglePin(id)
      if (!res.ok) console.error('pin toggle failed:', res.error)
    })
  }

  const dateCutoff = getDateCutoff(dateFilter)
  const afterDate = dateCutoff
    ? notes.filter((n) => new Date(n.updated_at) >= dateCutoff)
    : notes

  const afterTags =
    activeTags.length === 0
      ? afterDate
      : afterDate.filter((n) => n.tags.some((t) => activeTags.includes(t.name)))

  const afterPinned = pinnedOnly ? afterTags.filter((n) => n.pinned) : afterTags

  const sorted = [...afterPinned].sort(compareBy(sort))

  const pinned = pinnedOnly ? [] : sorted.filter((n) => n.pinned)
  const rest = pinnedOnly ? sorted : sorted.filter((n) => !n.pinned)

  const tagColors: Record<string, string | null> = {}
  notes.forEach((n) => n.tags.forEach((t) => { tagColors[t.name] = t.color }))
  const allTags = Object.keys(tagColors).sort()

  const placeholderExcerpt =
    'Preview of the note body would appear here, truncated to roughly two lines so similar titles are distinguishable.'

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <header className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Notes</h1>
        <button
          type="button"
          onClick={() => createAction()}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          New note
        </button>
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
            tagColors={tagColors}
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
                excerpt={placeholderExcerpt}
                notes={pinned}
                onPinToggle={handlePinToggle}
                onDelete={setConfirmingId}
              />
            </section>
          )}

          <section className="mb-8">
            {pinned.length > 0 && (
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                All notes
              </div>
            )}
            <NoteGrid
              view={view}
              excerpt={placeholderExcerpt}
              notes={rest}
              onPinToggle={handlePinToggle}
              onDelete={setConfirmingId}
            />
          </section>
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

function getDateCutoff(filter: DateFilter): Date | null {
  if (filter === 'All time') return null

  const now = new Date()
  if (filter === 'Today') {

    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    return start
  }
  if (filter === 'This week') {

    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
  if (filter === 'This month') {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
  return null
}

function compareBy(sort: SortKey) {
  return (a: NoteListItem, b: NoteListItem) => {
    if (sort === 'title') {

      return (a.title || 'Untitled').localeCompare(b.title || 'Untitled')
    }
    if (sort === 'created') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }

    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  }
}

function NoteGrid({
  view,
  excerpt,
  notes,
  onPinToggle,
  onDelete,
}: {
  view: ViewMode
  excerpt: string
  notes: NoteListItem[]
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
            tags={n.tags}
            folder={n.folder}
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
          tags={n.tags}
          folder={n.folder}
          excerpt={excerpt}
          updatedAt={n.updated_at}
          pinned={n.pinned}
          onPinToggle={onPinToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
