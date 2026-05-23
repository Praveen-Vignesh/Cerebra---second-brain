import { createClient } from '@/utils/server'
import { createNote } from '@/actions/notes'
import NotesPageClient, { type NoteListItem } from '@/components/notes/NotesPageClient'

export default async function NotesIndex() {
  const supabase = await createClient()

  const { data: notes, error } = await supabase
    .from('notes')
    .select('id, title, updated_at')
    .not('is_dump_chunk', 'is', true)
    .order('updated_at', { ascending: false })
    .returns<NoteListItem[]>()

  if (error) throw error

  return <NotesPageClient notes={notes ?? []} createAction={createNote} />
}