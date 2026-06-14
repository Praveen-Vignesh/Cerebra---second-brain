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

// What to do with the notes inside a folder being deleted:
//   unorganise → keep them, just remove their folder (move to "Unorganised")
//   archive    → move them to the Archive
//   trash      → move them to Trash (soft-delete, recoverable for 7 days)
export type DeleteFolderMode = 'unorganise' | 'archive' | 'trash';

export async function deleteFolder(
	folderId: string,
	mode: DeleteFolderMode = 'unorganise'
): Promise<Result> {
	const { supabase, user } = await requireUser();

	// 1. Collect this folder + every nested subfolder, so behaviour is the same
	//    no matter how the DB's foreign keys are configured.
	const { data: all, error: foldersError } = await supabase
		.from('folders')
		.select('id, parent_id')
		.eq('user_id', user.id);
	if (foldersError) return { ok: false, error: foldersError.message };

	const ids: string[] = [];
	const stack = [folderId];
	while (stack.length > 0) {
		const id = stack.pop() as string;
		ids.push(id);
		for (const f of all ?? []) {
			if (f.parent_id === id) stack.push(f.id);
		}
	}

	// 2. Apply the chosen action to the LIVE notes in those folders. In every case
	//    we null folder_id (the folders are about to be gone); trash/archive add a
	//    timestamp on top.
	const now = new Date().toISOString();
	const liveUpdate: Record<string, unknown> = { folder_id: null };
	if (mode === 'trash') liveUpdate.deleted_at = now;
	if (mode === 'archive') liveUpdate.archived_at = now;

	const { error: liveError } = await supabase
		.from('notes')
		.update(liveUpdate)
		.in('folder_id', ids)
		.eq('user_id', user.id)
		.is('deleted_at', null);
	if (liveError) return { ok: false, error: liveError.message };

	// 3. Notes already in Trash may still point at these folders — null those too
	//    so deleting the folder can't be blocked by a foreign key.
	const { error: orphanError } = await supabase
		.from('notes')
		.update({ folder_id: null })
		.in('folder_id', ids)
		.eq('user_id', user.id);
	if (orphanError) return { ok: false, error: orphanError.message };

	// 4. Delete the folder(s).
	const { error: delError } = await supabase
		.from('folders')
		.delete()
		.in('id', ids)
		.eq('user_id', user.id);
	if (delError) return { ok: false, error: delError.message };

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
