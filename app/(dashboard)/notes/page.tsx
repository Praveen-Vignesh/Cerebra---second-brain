import type { JSONContent } from '@tiptap/react';
import { createClient } from '@/utils/server';
import { createNote } from '@/actions/notes';
import { noteToPlainText } from '@/utils/tiptapText';
import NotesPageClient, { type NoteListItem } from '@/components/notes/NotesPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Notes' };

type SearchParams = Promise<{ folder?: string; tag?: string }>;

type NoteRow = {
	id: string;
	title: string;
	content: JSONContent;
	updated_at: string;
	created_at: string;
	pinned: boolean;
	folder_id: string | null;
	folders: { name: string } | null;
	note_tags: { tags: { id: string; name: string; color: string | null } | null }[];
};

export default async function NotesIndex({ searchParams }: { searchParams: SearchParams }) {
	const supabase = await createClient();
	const { folder, tag } = await searchParams;

	let query = supabase
		.from('notes')
		.select(
			`
			id,
			title,
			content,
			updated_at,
			created_at,
			pinned,
			folder_id,
			folders ( name ),
			note_tags ( tags ( id, name, color ) )
		`
		)
		.not('is_dump_chunk', 'is', true)
		.is('archived_at', null)
		.is('deleted_at', null)
		.order('updated_at', { ascending: false });

	if (folder === 'none') query = query.is('folder_id', null);
	else if (folder) query = query.eq('folder_id', folder);

	const { data, error } = await query;

	if (error) throw error;

	const rows = (data ?? []) as unknown as NoteRow[];

	const filtered = tag
		? rows.filter((n) => n.note_tags.some((nt) => nt.tags?.name === tag))
		: rows;

	const notes: NoteListItem[] = filtered.map((n) => ({
		id: n.id,
		title: n.title,
		// A real two-line preview of the note body (first ~160 chars of its text).
		excerpt: noteToPlainText(n.content).slice(0, 160),
		updated_at: n.updated_at,
		created_at: n.created_at,
		pinned: n.pinned,
		folder_id: n.folder_id,
		folder: n.folders?.name ?? null,
		tags: n.note_tags
			.map((nt) => nt.tags)
			.filter((t): t is { id: string; name: string; color: string | null } => Boolean(t))
			.map((t) => ({ name: t.name, color: t.color })),
	}));

	return <NotesPageClient notes={notes} createAction={createNote} />;
}
