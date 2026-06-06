import { notFound } from 'next/navigation';
import { createClient } from '@/utils/server';
import NoteEditor from '@/components/notes/NoteEditor';
import type { JSONContent } from '@tiptap/react';

type NoteRow = {
	id: string;
	title: string;
	content: JSONContent;
	created_at: string;
	pinned: boolean;
	folder_id: string | null;
	folders: { id: string; name: string } | null;
	note_tags: { tags: { id: string; name: string; color: string | null } | null }[];
};

type FolderRow = { id: string; name: string };
type TagRow = { id: string; name: string; color: string | null };

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const supabase = await createClient();

	const { data: rawNote, error: noteErr } = await supabase
		.from('notes')
		.select(
			`
			id,
			title,
			content,
			created_at,
			pinned,
			folder_id,
			folders ( id, name ),
			note_tags ( tags ( id, name, color ) )
		`
		)
		.eq('id', id)
		.maybeSingle();

	if (noteErr) throw noteErr;
	if (!rawNote) notFound();

	const note = rawNote as unknown as NoteRow;

	const { data: foldersRaw } = await supabase
		.from('folders')
		.select('id, name')
		.order('name');
	const folders = (foldersRaw ?? []) as FolderRow[];

	const { data: allTagsRaw } = await supabase
		.from('tags')
		.select('id, name, color')
		.order('name');
	const allTags = (allTagsRaw ?? []) as TagRow[];

	const tags = note.note_tags
		.map((nt) => nt.tags)
		.filter((t): t is TagRow => t !== null);

	return (
		<NoteEditor
			noteId={note.id}
			initialTitle={note.title}
			initialContent={note.content}
			createdAt={note.created_at}
			initialPinned={note.pinned}
			initialTags={tags}
			initialFolder={note.folders}
			allFolders={folders}
			allTags={allTags}
		/>
	);
}
