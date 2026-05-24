'use server';

import { createClient } from '@/utils/server';
import { revalidatePath } from 'next/cache';

type Result<T = undefined> =
	| (T extends undefined ? { ok: true } : { ok: true; data: T })
	| { ok: false; error: string };

async function requireUser() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error('Not authenticated');
	return { supabase, user };
}

function normalizeTag(name: string): string {

	return name
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9\-_/]/g, '');
}

export async function createTag(name: string): Promise<Result<{ id: string; name: string }>> {
	const normalized = normalizeTag(name);
	if (!normalized) return { ok: false, error: 'Tag name is required' };

	const { supabase, user } = await requireUser();

	const { data, error } = await supabase
		.from('tags')
		.insert({ user_id: user.id, name: normalized })
		.select('id, name')
		.single<{ id: string; name: string }>();

	if (error) return { ok: false, error: error.message };

	revalidatePath('/notes');
	return { ok: true, data };
}

export async function renameTag(tagId: string, name: string): Promise<Result> {
	const normalized = normalizeTag(name);
	if (!normalized) return { ok: false, error: 'Tag name is required' };

	const { supabase, user } = await requireUser();

	const { error } = await supabase
		.from('tags')
		.update({ name: normalized })
		.eq('id', tagId)
		.eq('user_id', user.id);

	if (error) return { ok: false, error: error.message };

	revalidatePath('/notes');
	return { ok: true };
}

export async function deleteTag(tagId: string): Promise<Result> {
	const { supabase, user } = await requireUser();

	const { error } = await supabase
		.from('tags')
		.delete()
		.eq('id', tagId)
		.eq('user_id', user.id);

	if (error) return { ok: false, error: error.message };

	revalidatePath('/notes');
	return { ok: true };
}

export async function addTagToNote(noteId: string, tagId: string): Promise<Result> {
	const { supabase } = await requireUser();

	const { error } = await supabase
		.from('note_tags')
		.insert({ note_id: noteId, tag_id: tagId });

	if (error && error.code !== '23505') {
		return { ok: false, error: error.message };
	}

	revalidatePath(`/notes/${noteId}`);
	revalidatePath('/notes');
	return { ok: true };
}

export async function removeTagFromNote(noteId: string, tagId: string): Promise<Result> {
	const { supabase } = await requireUser();

	const { error } = await supabase
		.from('note_tags')
		.delete()
		.eq('note_id', noteId)
		.eq('tag_id', tagId);

	if (error) return { ok: false, error: error.message };

	revalidatePath(`/notes/${noteId}`);
	revalidatePath('/notes');
	return { ok: true };
}

export async function tagNoteByName(
	noteId: string,
	name: string
): Promise<Result<{ id: string; name: string }>> {
	const normalized = normalizeTag(name);
	if (!normalized) return { ok: false, error: 'Tag name is required' };

	const { supabase, user } = await requireUser();

	const { data: existing } = await supabase
		.from('tags')
		.select('id')
		.eq('user_id', user.id)
		.eq('name', normalized)
		.maybeSingle<{ id: string }>();

	let tagId: string;
	if (existing) {
		tagId = existing.id;
	} else {
		const { data, error } = await supabase
			.from('tags')
			.insert({ user_id: user.id, name: normalized })
			.select('id')
			.single<{ id: string }>();
		if (error) return { ok: false, error: error.message };
		tagId = data.id;
	}

	const { error: linkError } = await supabase
		.from('note_tags')
		.insert({ note_id: noteId, tag_id: tagId });

	if (linkError && linkError.code !== '23505') {
		return { ok: false, error: linkError.message };
	}

	revalidatePath(`/notes/${noteId}`);
	revalidatePath('/notes');
	return { ok: true, data: { id: tagId, name: normalized } };
}
