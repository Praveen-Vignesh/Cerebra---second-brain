'use server';

import { createClient } from '@/utils/server';
import { revalidatePath } from 'next/cache';
import type { JSONContent } from '@tiptap/react';

type SaveResult = { ok: true } | { ok: false; error: string };
type SaveOptions = { createVersion?: boolean };

export async function saveNote(
	id: string,
	title: string,
	content: JSONContent,
	options: SaveOptions = {}
): Promise<SaveResult> {
	const supabase = await createClient();
	const now = new Date().toISOString();

	const { error: updateError } = await supabase
		.from('notes')
		.update({ title, content, updated_at: now })
		.eq('id', id);

	if (updateError) return { ok: false, error: updateError.message };

	if (options.createVersion) {
		const { error: versionError } = await supabase
			.from('notes_version')
			.insert({ note_id: id, content });

		if (versionError) return { ok: false, error: versionError.message };
	}

	revalidatePath(`/notes/${id}`);
	return { ok: true };
}
