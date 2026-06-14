'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { generateStudySet, type GeneratedSet } from '@/actions/ai'
import type { MaterialType } from '@/utils/ai'
import { useToast } from '@/components/ui/Toast'

export type NoteOption = { id: string; title: string }

// The study materials we can ask Gemini to generate. Summary + Flashcards are on
// by default; the rest are opt-in.
const MATERIAL_OPTIONS: { value: MaterialType; label: string }[] = [
  { value: 'summary', label: 'Summary' },
  { value: 'flashcards', label: 'Flashcards' },
  { value: 'study_guide', label: 'Study guide' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'key_concepts', label: 'Key concepts' },
]

// One-tap instruction presets that prefill the "how should the AI approach this"
// box. They're just text appended to the generation prompt.
const INSTRUCTION_PRESETS: { label: string; text: string }[] = [
  { label: 'Bullet points', text: 'Prefer concise bullet points and short, easy-to-memorize phrasing.' },
  { label: 'Explain simply', text: 'Explain everything in simple, beginner-friendly language with plain analogies.' },
  { label: 'Exam-focused', text: 'Focus on what is likely to be tested — definitions, formulas, and common pitfalls.' },
  { label: 'Concise', text: 'Be brief; keep it to the essential points only.' },
]

// Two ways to make a study set: paste raw text, or pick one of your own notes.
// The note path is Cerebra's edge — generating from material you already wrote.
export default function GenerateForm({
  notes,
  initialNoteId,
}: {
  notes: NoteOption[]
  initialNoteId?: string
}) {
  const toast = useToast()
  // mode = which source tab is active. Default to the note tab if we arrived with
  // a note preselected (e.g. from the "Generate study materials" button in a note).
  const [mode, setMode] = useState<'paste' | 'note'>(initialNoteId ? 'note' : 'paste')
  const [text, setText] = useState('')
  const [noteId, setNoteId] = useState(initialNoteId ?? '')
  // Which materials to generate.
  const [types, setTypes] = useState<MaterialType[]>(['summary', 'flashcards'])
  // Optional free-text steer on how the AI should approach the material.
  const [instruction, setInstruction] = useState('')

  const [result, setResult] = useState<GeneratedSet | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function toggleType(value: MaterialType) {
    setTypes((current) =>
      current.includes(value) ? current.filter((t) => t !== value) : [...current, value]
    )
  }

  // Append a preset's text (avoid duplicating if it's already there).
  function addPreset(text: string) {
    setInstruction((cur) =>
      cur.includes(text) ? cur : (cur.trim() ? cur.trim() + ' ' : '') + text
    )
  }

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setResult(null)
    const source = mode === 'paste' ? { sourceText: text } : { noteId }
    const res = await generateStudySet(source, types, instruction)
    if (res.ok) {
      setResult(res.data)
      toast.success('Study set created.')
    } else {
      setError(res.error)
      toast.error(res.error || "Couldn't generate study materials.")
    }
    setLoading(false)
  }

  // Disable Generate until the active tab has valid input and at least one material.
  const inputReady = mode === 'paste' ? text.trim().length >= 50 : noteId !== ''
  const canGenerate = inputReady && types.length > 0

  return (
    <div className="space-y-4">
      {/* Source tabs. */}
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit">
        <TabButton active={mode === 'paste'} onClick={() => setMode('paste')}>
          Paste text
        </TabButton>
        <TabButton active={mode === 'note'} onClick={() => setMode('note')}>
          From a note
        </TabButton>
      </div>

      {mode === 'paste' ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your notes, a lecture transcript, or any text to study..."
          className="h-48 w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground"
        />
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You don&apos;t have any notes yet. Create one first, or paste text instead.
        </p>
      ) : (
        <select
          value={noteId}
          onChange={(e) => setNoteId(e.target.value)}
          className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground"
        >
          <option value="">Choose a note…</option>
          {notes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.title || 'Untitled'}
            </option>
          ))}
        </select>
      )}

      {/* Which materials to generate. */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Generate</p>
        <div className="flex flex-wrap gap-2">
          {MATERIAL_OPTIONS.map((opt) => {
            const on = types.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleType(opt.value)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  on
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {on && <Check className="h-3 w-3" strokeWidth={2.5} />}
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Optional: how should the AI approach this? Presets prefill the box. */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          How should the AI approach this? <span className="font-normal">(optional)</span>
        </p>
        <div className="mb-2 flex flex-wrap gap-2">
          {INSTRUCTION_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => addPreset(p.text)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {p.label}
            </button>
          ))}
        </div>
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. Turn this into easy-to-memorize bullet points and explain the hard parts simply."
          rows={2}
          className="w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !canGenerate}
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {loading ? 'Generating…' : 'Generate study materials'}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Study set created</p>
            <p className="text-xs text-muted-foreground">{result.title}</p>
          </div>
          <Link
            href={`/study/${result.id}`}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground shrink-0"
          >
            Open set
          </Link>
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}
