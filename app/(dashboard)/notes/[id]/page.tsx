import { notFound } from 'next/navigation';
import { createClient } from '@/utils/server';
import NoteEditor from '@/components/notes/NoteEditor';
import type { JSONContent } from '@tiptap/react';

type Note = {
	id: string;
	title: string;
	content: JSONContent;
};

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('notes')
		.select('id, title, content')
		.eq('id', id)
		.maybeSingle<Note>();

	if (error) throw error;
	if (!data) notFound();

	return <NoteEditor noteId={data.id} initialTitle={data.title} initialContent={data.content} />;
}
