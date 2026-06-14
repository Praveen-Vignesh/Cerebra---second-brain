import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/server'
import GenerateForm, { type NoteOption } from '@/components/study/GenerateForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New study set' }

// The generator. Paste material or pick one of your notes; Gemini turns it into a
// summary + flashcards saved as a new study set. A `?note=<id>` param (used by the
// "Generate flashcards" button inside a note) preselects that note.
export default async function NewStudySetPage({
  searchParams,
}: {
  searchParams: Promise<{ note?: string }>
}) {
  const { note } = await searchParams

  // Fetch the user's live notes (not archived, not trashed) for the picker.
  const supabase = await createClient()
  const { data: notesRaw } = await supabase
    .from('notes')
    .select('id, title')
    .is('archived_at', null)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
  const notes = (notesRaw ?? []) as NoteOption[]

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/study"
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Back to study
        </Link>
        <h1 className="text-3xl font-bold text-foreground">New study set</h1>
        <p className="text-muted-foreground">Paste material or pick a note, and Cerebra turns it into the study materials you choose.</p>
      </div>
      <GenerateForm notes={notes} initialNoteId={note} />
    </div>
  )
}
