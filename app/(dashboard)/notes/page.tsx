import Link from 'next/link';
import { createClient } from '@/utils/server';
import { createNote } from '@/actions/notes';

type NoteListItem = {
	id: string;
	title: string;
	updated_at: string;
};

export default async function NotesIndex() {
	const supabase = await createClient();

	const { data: notes, error } = await supabase
		.from('notes')
		.select('id, title, updated_at')
		.not('is_dump_chunk', 'is', true)
		.order('updated_at', { ascending: false })
		.returns<NoteListItem[]>();

	if (error) throw error;

	return (
		<div className="cerebra-notes-index">
			<header className="cerebra-notes-index-header">
				<h1>Notes</h1>
				<form action={createNote}>
					<button type="submit" className="cerebra-new-note-btn">
						New note
					</button>
				</form>
			</header>

			{notes.length === 0 ? (
				<p className="cerebra-notes-empty">No notes yet. Click “New note” to start.</p>
			) : (
				<ul className="cerebra-notes-list">
					{notes.map((note) => (
						<li key={note.id} className="cerebra-notes-list-item">
							<Link href={`/notes/${note.id}`}>
								<span className="cerebra-notes-list-title">
									{note.title || 'Untitled'}
								</span>
								<time className="cerebra-notes-list-date">
									{new Date(note.updated_at).toLocaleDateString()}
								</time>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
