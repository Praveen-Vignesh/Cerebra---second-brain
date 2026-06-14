import { getDueCards } from '@/actions/flashcards'
import ReviewSession from '@/components/study/ReviewSession'

// Focused review of a single set: only this set's due cards.
export default async function SetReviewPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params
  const res = await getDueCards(setId)
  const cards = res.ok ? res.data : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Review</h1>
      <ReviewSession cards={cards} />
    </div>
  )
}
