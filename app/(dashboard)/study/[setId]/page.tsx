import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Play } from 'lucide-react'
import { getStudySet } from '@/actions/flashcards'
import SetCards from '@/components/study/SetCards'
import QuizSession from '@/components/study/QuizSession'

// Set detail: every material that was generated for this set — summary, key
// concepts, study guide, a playable quiz, and the editable/reviewable flashcards.
export default async function StudySetPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params
  const res = await getStudySet(setId)
  if (!res.ok) notFound()

  const set = res.data
  const guide = set.study_guide

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/study"
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Back to study
        </Link>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-foreground">{set.title}</h1>
          {set.cards.length > 0 && (
            <Link
              href={`/study/${set.id}/review`}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shrink-0"
            >
              <Play className="h-4 w-4" strokeWidth={2} />
              Review this set
            </Link>
          )}
        </div>
      </div>

      {set.summary && (
        <section>
          <h2 className="mb-1 text-sm font-semibold text-foreground">Summary</h2>
          <p className="text-sm text-muted-foreground">{set.summary}</p>
        </section>
      )}

      {set.key_concepts && set.key_concepts.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Key concepts</h2>
          <ul className="space-y-1.5">
            {set.key_concepts.map((c, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{c.term}</span> — {c.description}
              </li>
            ))}
          </ul>
        </section>
      )}

      {guide && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Study guide</h2>

          {guide.keyPoints.length > 0 && (
            <div>
              <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">Key points</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {guide.keyPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {guide.definitions.length > 0 && (
            <div>
              <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">Definitions</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {guide.definitions.map((d, i) => (
                  <li key={i}>
                    <span className="font-medium text-foreground">{d.term}</span>: {d.definition}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {guide.shortAnswers.length > 0 && (
            <div>
              <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">Short-answer questions</h3>
              <ul className="space-y-2 text-sm">
                {guide.shortAnswers.map((qa, i) => (
                  <li key={i}>
                    <p className="font-medium text-foreground">{qa.question}</p>
                    <p className="text-muted-foreground">{qa.answer}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {set.quiz.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Quiz</h2>
          <QuizSession quiz={set.quiz} />
        </section>
      )}

      {set.cards.length > 0 && <SetCards setId={set.id} initialCards={set.cards} />}
    </div>
  )
}
