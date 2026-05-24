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

export async function createFolder(
	name: string,
	parentId: string | null = null
): Promise<Result<{ id: string }>> {
	const trimmed = name.trim();
	if (!trimmed) return { ok: false, error: 'Folder name is required' };

	const { supabase, user } = await requireUser();

	const { data, error } = await supabase
		.from('folders')
		.insert({ user_id: user.id, name: trimmed, parent_id: parentId })
		.select('id')
		.single<{ id: string }>();

	if (error) return { ok: false, error: error.message };

	revalidatePath('/notes');
	return { ok: true, data };
}

export async function renameFolder(folderId: string, name: string): Promise<Result> {
	const trimmed = name.trim();
	if (!trimmed) return { ok: false, error: 'Folder name is required' };

	const { supabase, user } = await requireUser();

	const { error } = await supabase
		.from('folders')
		.update({ name: trimmed })
		.eq('id', folderId)
		.eq('user_id', user.id);

	if (error) return { ok: false, error: error.message };

	revalidatePath('/notes');
	return { ok: true };
}

export async function deleteFolder(folderId: string): Promise<Result> {
	const { supabase, user } = await requireUser();

	const { error } = await supabase
		.from('folders')
		.delete()
		.eq('id', folderId)
		.eq('user_id', user.id);

	if (error) return { ok: false, error: error.message };

	revalidatePath('/notes');
	return { ok: true };
}

export async function moveFolder(
	folderId: string,
	newParentId: string | null
): Promise<Result> {
	if (folderId === newParentId) {
		return { ok: false, error: 'A folder cannot be its own parent' };
	}

	const { supabase, user } = await requireUser();

	const { error } = await supabase
		.from('folders')
		.update({ parent_id: newParentId })
		.eq('id', folderId)
		.eq('user_id', user.id);

	if (error) return { ok: false, error: error.message };

	revalidatePath('/notes');
	return { ok: true };
}
