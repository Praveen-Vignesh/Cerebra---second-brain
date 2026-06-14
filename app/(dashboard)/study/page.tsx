import Link from 'next/link'
import { Plus, Layers, Brain } from 'lucide-react'
import { listStudySets } from '@/actions/flashcards'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Study' }

// The Study hub. Three jobs: surface what's due to review today, list the user's
// study sets, and offer a way to make a new one. It's a server component so the
// data is fetched on the server before the page is sent down.
export default async function StudyPage() {
  const res = await listStudySets()

  if (!res.ok) {
    return <p className="text-sm text-red-500">Couldn&apos;t load your study sets: {res.error}</p>
  }

  const { sets, totalDue } = res.data

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Study</h1>
          <p className="text-muted-foreground">Review on a schedule, or turn new material into a study set.</p>
        </div>
        <Link
          href="/study/new"
          className="flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background shrink-0"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          New set
        </Link>
      </div>

      {/* Due-today banner: the daily review driver. Active only when something's due. */}
      <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Brain className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {totalDue > 0 ? `${totalDue} card${totalDue === 1 ? '' : 's'} due for review` : 'Nothing due right now'}
            </p>
            <p className="text-xs text-muted-foreground">
              {totalDue > 0 ? 'Spaced practice is the part that actually builds memory.' : 'Come back later, or make a new set.'}
            </p>
          </div>
        </div>
        {totalDue > 0 && (
          <Link
            href="/study/review"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shrink-0"
          >
            Start review
          </Link>
        )}
      </div>

      {/* The set grid (or an empty state for first-time users). */}
      {sets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <Layers className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-medium text-foreground">No study sets yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Paste some notes or pick a note to generate your first set.</p>
          <Link
            href="/study/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            New set
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((set) => (
            <Link
              key={set.id}
              href={`/study/${set.id}`}
              className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/30"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-semibold text-foreground line-clamp-2">{set.title}</h2>
                {set.dueCount > 0 && (
                  <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                    {set.dueCount} due
                  </span>
                )}
              </div>
              {set.summary && (
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{set.summary}</p>
              )}
              <p className="mt-3 text-[11px] text-muted-foreground">
                {set.cardCount} card{set.cardCount === 1 ? '' : 's'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
