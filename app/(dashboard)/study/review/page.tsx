import { getDueCards } from '@/actions/flashcards'
import ReviewSession from '@/components/study/ReviewSession'

// Mixed review: every card that's due across all of the user's sets. This is the
// "Start review" the hub points at — the daily habit loop.
export default async function ReviewPage() {
  const res = await getDueCards()
  const cards = res.ok ? res.data : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Review</h1>
      <ReviewSession cards={cards} />
    </div>
  )
}
