'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { rateCard, type ReviewCard } from '@/actions/flashcards'
import type { Rating } from '@/utils/srs'

// The drill itself. Walk through the due cards one at a time: see the question,
// try to recall the answer, flip it, then rate how it went. The rating decides
// when the card comes back (handled by the scheduler on the server).

// The four buttons, in difficulty order. Each maps straight to a Rating.
const RATINGS: { value: Rating; label: string; className: string }[] = [
  { value: 'again', label: 'Again', className: 'border-red-500/40 text-red-500 hover:bg-red-500/10' },
  { value: 'hard', label: 'Hard', className: 'border-orange-500/40 text-orange-500 hover:bg-orange-500/10' },
  { value: 'good', label: 'Good', className: 'border-border text-foreground hover:bg-sidebar-accent' },
  { value: 'easy', label: 'Easy', className: 'border-green-500/40 text-green-600 hover:bg-green-500/10' },
]

export default function ReviewSession({ cards }: { cards: ReviewCard[] }) {
  // Snapshot the queue once. Rating a card revalidates /study, which can refresh
  // this route and hand us a smaller `cards` prop mid-session — if we read that
  // shrinking prop we'd skip cards and finish early. We drill the original queue.
  const [queue] = useState(cards)
  // index = which card we're on; showBack = whether the answer is revealed yet;
  // saving guards against double-clicks while the rating is being written.
  const [index, setIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [saving, setSaving] = useState(false)

  // Nothing was due (or the session is being opened with an empty queue).
  if (queue.length === 0) {
    return (
      <Done message="Nothing due right now." />
    )
  }

  // We've rated every card in the queue.
  if (index >= queue.length) {
    return <Done message="All done — see you next review." />
  }

  const card = queue[index]

  async function handleRate(rating: Rating) {
    if (saving) return
    setSaving(true)
    // Record the review on the server (updates the schedule + logs history).
    await rateCard(card.id, rating)
    setSaving(false)
    // Move to the next card and hide its answer.
    setShowBack(false)
    setIndex((i) => i + 1)
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress: card X of N. */}
      <p className="mb-4 text-center text-xs text-muted-foreground">
        {index + 1} / {queue.length}
      </p>

      <div className="rounded-2xl border border-border bg-card p-8 min-h-60 flex flex-col">
        {/* Front (always shown). */}
        <p className="text-lg font-medium text-foreground">{card.front}</p>

        {/* Back (only after flipping), separated by a divider. */}
        {showBack && (
          <>
            <hr className="my-5 border-border" />
            <p className="text-base text-muted-foreground whitespace-pre-wrap">{card.back}</p>
          </>
        )}
      </div>

      {/* Controls: either reveal the answer, or rate it once revealed. */}
      <div className="mt-5">
        {!showBack ? (
          <button
            onClick={() => setShowBack(true)}
            className="w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background"
          >
            Show answer
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                onClick={() => handleRate(r.value)}
                disabled={saving}
                className={`rounded-lg border py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${r.className}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Shared end-of-session / empty-queue screen.
function Done({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-600">
        <Check className="h-6 w-6" strokeWidth={2} />
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">{message}</p>
      <Link
        href="/study"
        className="mt-5 inline-block rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
      >
        Back to study
      </Link>
    </div>
  )
}
