'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import { updateCard, deleteCard, addCard, type ReviewCard } from '@/actions/flashcards'

// The editable list of cards on the set-detail page. Lets the user fix a weak
// AI-generated card, delete one, or add their own — so the deck is trustworthy.
//
// We keep the cards in local state and update it optimistically, then call the
// matching server action. (Kept simple: if a save fails we just log it.)
export default function SetCards({ setId, initialCards }: { setId: string; initialCards: ReviewCard[] }) {
  const [cards, setCards] = useState<ReviewCard[]>(initialCards)
  // editingId = the card currently open for editing (null = none).
  const [editingId, setEditingId] = useState<string | null>(null)
  // adding = whether the "new card" editor at the bottom is open.
  const [adding, setAdding] = useState(false)

  async function handleSaveEdit(id: string, front: string, back: string) {
    // Optimistically update the on-screen card, then persist.
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, front, back } : c)))
    setEditingId(null)
    const res = await updateCard(id, front, back)
    if (!res.ok) console.error('updateCard failed:', res.error)
  }

  async function handleDelete(id: string) {
    const snapshot = cards
    setCards((cs) => cs.filter((c) => c.id !== id))
    const res = await deleteCard(id)
    if (!res.ok) {
      console.error('deleteCard failed:', res.error)
      setCards(snapshot) // put it back if the server rejected it
    }
  }

  async function handleAdd(front: string, back: string) {
    setAdding(false)
    const res = await addCard(setId, front, back)
    if (!res.ok) {
      console.error('addCard failed:', res.error)
      return
    }
    setCards((cs) => [...cs, res.data])
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Cards ({cards.length})</h2>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Add card
          </button>
        )}
      </div>

      {cards.map((card) =>
        editingId === card.id ? (
          <CardEditor
            key={card.id}
            initialFront={card.front}
            initialBack={card.back}
            onSave={(f, b) => handleSaveEdit(card.id, f, b)}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div key={card.id} className="group relative rounded-lg border border-border bg-card p-3">
            <p className="text-sm font-medium text-foreground">{card.front}</p>
            <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{card.back}</p>
            {/* Edit/delete appear on hover so the list stays clean. */}
            <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => setEditingId(card.id)}
                aria-label="Edit card"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => handleDelete(card.id)}
                aria-label="Delete card"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        )
      )}

      {/* Bottom editor for adding a brand-new card. */}
      {adding && (
        <CardEditor
          initialFront=""
          initialBack=""
          onSave={handleAdd}
          onCancel={() => setAdding(false)}
        />
      )}
    </section>
  )
}

// A small front/back editor shared by both "edit existing" and "add new".
function CardEditor({
  initialFront,
  initialBack,
  onSave,
  onCancel,
}: {
  initialFront: string
  initialBack: string
  onSave: (front: string, back: string) => void
  onCancel: () => void
}) {
  const [front, setFront] = useState(initialFront)
  const [back, setBack] = useState(initialBack)

  const canSave = front.trim().length > 0 && back.trim().length > 0

  return (
    <div className="space-y-2 rounded-lg border border-accent/40 bg-card p-3">
      <textarea
        value={front}
        onChange={(e) => setFront(e.target.value)}
        placeholder="Front (the question)"
        className="w-full resize-none rounded-md border border-border bg-background p-2 text-sm font-medium text-foreground"
        rows={2}
        autoFocus
      />
      <textarea
        value={back}
        onChange={(e) => setBack(e.target.value)}
        placeholder="Back (the answer)"
        className="w-full resize-none rounded-md border border-border bg-background p-2 text-sm text-muted-foreground"
        rows={3}
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
          Cancel
        </button>
        <button
          onClick={() => onSave(front.trim(), back.trim())}
          disabled={!canSave}
          className="flex items-center gap-1 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2} />
          Save
        </button>
      </div>
    </div>
  )
}
