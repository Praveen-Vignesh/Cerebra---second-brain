'use client'

import { useState } from 'react'
import { Check, X, RotateCcw } from 'lucide-react'
import type { QuizCard } from '@/actions/flashcards'

// A quick multiple-choice run-through. Unlike flashcards there's no spaced
// scheduling — it's just a self-check: pick an option, see if it was right, move
// on, and get a score at the end. Nothing is saved.
export default function QuizSession({ quiz }: { quiz: QuizCard[] }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  if (quiz.length === 0) return null

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-sm font-medium text-foreground">
          You scored {score} / {quiz.length}
        </p>
        <button
          onClick={() => {
            setIndex(0)
            setSelected(null)
            setScore(0)
            setDone(false)
          }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-sidebar-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
          Try again
        </button>
      </div>
    )
  }

  const q = quiz[index]
  const answered = selected !== null

  function choose(i: number) {
    if (answered) return
    setSelected(i)
    if (i === q.answerIndex) setScore((s) => s + 1)
  }

  function next() {
    if (index + 1 >= quiz.length) {
      setDone(true)
      return
    }
    setIndex((x) => x + 1)
    setSelected(null)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="mb-3 text-xs text-muted-foreground">
        Question {index + 1} / {quiz.length}
      </p>
      <p className="mb-4 text-sm font-medium text-foreground">{q.question}</p>

      <div className="space-y-2">
        {q.options.map((option, i) => {
          // After answering, colour the correct option green and a wrong pick red.
          const isCorrect = i === q.answerIndex
          const isPicked = i === selected
          let style = 'border-border text-foreground hover:bg-sidebar-accent'
          if (answered && isCorrect) style = 'border-green-500/50 bg-green-500/10 text-green-600'
          else if (answered && isPicked) style = 'border-red-500/50 bg-red-500/10 text-red-500'
          else if (answered) style = 'border-border text-muted-foreground'

          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={answered}
              className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${style}`}
            >
              <span>{option}</span>
              {answered && isCorrect && <Check className="h-4 w-4 shrink-0" strokeWidth={2} />}
              {answered && isPicked && !isCorrect && <X className="h-4 w-4 shrink-0" strokeWidth={2} />}
            </button>
          )
        })}
      </div>

      {answered && (
        <button
          onClick={next}
          className="mt-4 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          {index + 1 >= quiz.length ? 'Finish' : 'Next'}
        </button>
      )}
    </div>
  )
}
