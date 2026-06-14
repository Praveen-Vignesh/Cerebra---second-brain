'use server';

import { createClient } from '@/utils/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { JSONContent } from '@tiptap/react';

type Result<T = undefined> =
	| (T extends undefined ? { ok: true } : { ok: true; data: T })
	| { ok: false; error: string };

type SaveOptions = { createVersion?: boolean };

const ATTACHMENT_BUCKET = 'note-attachments';
const STORAGE_URL_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${ATTACHMENT_BUCKET}/`;

function extractAttachmentPaths(content: JSONContent): string[] {
	const paths: string[] = [];
	function walk(node: JSONContent) {
		const src = node.attrs?.src;
		if (typeof src === 'string' && src.startsWith(STORAGE_URL_PREFIX)) {
			paths.push(src.slice(STORAGE_URL_PREFIX.length));
		}
		if (node.marks) {
			for (const mark of node.marks) {
				const href = mark.attrs?.href;
				if (typeof href === 'string' && href.startsWith(STORAGE_URL_PREFIX)) {
					paths.push(href.slice(STORAGE_URL_PREFIX.length));
				}
			}
		}
		if (node.content) {
			for (const child of node.content) walk(child);
		}
	}
	walk(content);
	return paths;
}

async function requireUser() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error('Not authenticated');
	return { supabase, user };
}

const EMPTY_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

export async function createNote(folderId?: string) {
	const { supabase, user } = await requireUser();

	const { data, error } = await supabase
		.from('notes')
		.insert({
			user_id: user.id,
			title: 'Untitled',
			content: EMPTY_DOC,
			folder_id: folderId ?? null,
		})
		.select('id')
		.single();

	if (error) throw error;

	revalidatePath('/notes');
	redirect(`/notes/${data.id}`);
}

export async function saveNote(
	id: string,
	title: string,
	content: JSONContent,
	options: SaveOptions = {}
): Promise<Result> {
	const safeContent: JSONContent = JSON.parse(JSON.stringify(content));

	const supabase = await createClient();
	const now = new Date().toISOString();

	const { data: existing } = await supabase
		.from('notes')
		.select('content')
		.eq('id', id)
		.maybeSingle<{ content: JSONContent }>();

	const { error: updateError } = await supabase
		.from('notes')
		.update({ title, content: safeContent, updated_at: now })
		.eq('id', id);

	if (updateError) return { ok: false, error: updateError.message };

	if (existing) {
		const oldPaths = new Set(extractAttachmentPaths(existing.content));
		const newPaths = new Set(extractAttachmentPaths(safeContent));
		const toDelete = [...oldPaths].filter((p) => !newPaths.has(p));
		if (toDelete.length > 0) {
			const { error: removeError } = await supabase.storage
				.from(ATTACHMENT_BUCKET)
				.remove(toDelete);
			if (removeError) console.error('storage cleanup failed:', removeError.message);
		}
	}

	if (options.createVersion) {
		const { error: versionError } = await supabase
			.from('notes_version')
			.insert({ note_id: id, content: safeContent });

		if (versionError) return { ok: false, error: versionError.message };
	}

	revalidatePath(`/notes/${id}`);
	return { ok: true };
}

export async function togglePin(noteId: string): Promise<Result> {
	const { supabase, user } = await requireUser();

	const { data: note, error: fetchError } = await supabase
		.from('notes')
		.select('pinned')
		.eq('id', noteId)
		.eq('user_id', user.id)
		.maybeSingle<{ pinned: boolean }>();

	if (fetchError) return { ok: false, error: fetchError.message };
	if (!note) return { ok: false, error: 'Note not found' };

	const { error } = await supabase
		.from('notes')
		.update({ pinned: !note.pinned })
		.eq('id', noteId)
		.eq('user_id', user.id);

	if (error) return { ok: false, error: error.message };

	revalidatePath('/notes');
	return { ok: true };
}

export async function setNoteFolder(noteId: string, folderId: string | null): Promise<Result> {
	const { supabase, user } = await requireUser();

	const { error } = await supabase
		.from('notes')
		.update({ folder_id: folderId })
		.eq('id', noteId)
		.eq('user_id', user.id);

	if (error) return { ok: false, error: error.message };

	revalidatePath('/notes');
	return { ok: true };
}

export async function archiveNote(noteId: string): Promise<Result> {
	const { supabase, user } = await requireUser();

	const { error } = await supabase
		.from('notes')
		.update({ archived_at: new Date().toISOString() })
		.eq('id', noteId)
		.eq('user_id', user.id);

	if (error) return { ok: false, error: error.message };

	revalidatePath('/notes');
	revalidatePath('/archive');
	return { ok: true };
}

export async function unarchiveNote(noteId: string): Promise<Result> {
	const { supabase, user } = await requireUser();

	const { error } = await supabase
		.from('notes')
		.update({ archived_at: null })
		.eq('id', noteId)
		.eq('user_id', user.id);

	if (error) return { ok: false, error: error.message };

	revalidatePath('/notes');
	revalidatePath('/archive');
	return { ok: true };
}

export async function deleteNote(noteId: string): Promise<Result> {
	const { supabase, user } = await requireUser();

	const { error } = await supabase
		.from('notes')
		.update({ deleted_at: new Date().toISOString() })
		.eq('id', noteId)
		.eq('user_id', user.id);

	if (error) return { ok: false, error: error.message };

	revalidatePath('/notes');
	revalidatePath('/trash');
	return { ok: true };
}

export async function restoreNote(noteId: string): Promise<Result> {
	const { supabase, user } = await requireUser();

	const { error } = await supabase
		.from('notes')
		.update({ deleted_at: null })
		.eq('id', noteId)
		.eq('user_id', user.id);

	if (error) return { ok: false, error: error.message };

	revalidatePath('/notes');
	revalidatePath('/trash');
	return { ok: true };
}

export type NoteVersion = { id: string; created_at: string };

// List a note's saved version snapshots, newest first. Snapshots are created by
// the editor's Save button (saveNote(..., { createVersion: true })).
export async function getNoteVersions(noteId: string): Promise<Result<NoteVersion[]>> {
	const { supabase, user } = await requireUser();

	// Confirm the note belongs to the caller (RLS also enforces this).
	const { data: note } = await supabase
		.from('notes')
		.select('id')
		.eq('id', noteId)
		.eq('user_id', user.id)
		.maybeSingle();
	if (!note) return { ok: false, error: 'Note not found' };

	const { data, error } = await supabase
		.from('notes_version')
		.select('id, created_at')
		.eq('note_id', noteId)
		.order('created_at', { ascending: false });

	if (error) return { ok: false, error: error.message };
	return { ok: true, data: (data ?? []) as NoteVersion[] };
}

// Roll a note back to an earlier snapshot. The note's current content is itself
// snapshotted first, so a restore is reversible. Returns the restored content so
// the editor can refresh in place.
export async function restoreNoteVersion(
	noteId: string,
	versionId: string
): Promise<Result<{ content: JSONContent }>> {
	const { supabase, user } = await requireUser();

	const { data: version, error: versionErr } = await supabase
		.from('notes_version')
		.select('content')
		.eq('id', versionId)
		.eq('note_id', noteId)
		.maybeSingle<{ content: JSONContent }>();
	if (versionErr) return { ok: false, error: versionErr.message };
	if (!version) return { ok: false, error: 'Version not found' };

	const { data: current } = await supabase
		.from('notes')
		.select('content')
		.eq('id', noteId)
		.eq('user_id', user.id)
		.maybeSingle<{ content: JSONContent }>();
	if (!current) return { ok: false, error: 'Note not found' };

	// Snapshot the current content before overwriting it.
	const { error: snapErr } = await supabase
		.from('notes_version')
		.insert({ note_id: noteId, content: current.content });
	if (snapErr) return { ok: false, error: snapErr.message };

	const { error: updateErr } = await supabase
		.from('notes')
		.update({ content: version.content, updated_at: new Date().toISOString() })
		.eq('id', noteId)
		.eq('user_id', user.id);
	if (updateErr) return { ok: false, error: updateErr.message };

	revalidatePath(`/notes/${noteId}`);
	return { ok: true, data: { content: version.content } };
}

export async function permanentlyDeleteNote(noteId: string): Promise<Result> {
	const { supabase, user } = await requireUser();

	const { data: note } = await supabase
		.from('notes')
		.select('content')
		.eq('id', noteId)
		.eq('user_id', user.id)
		.maybeSingle<{ content: JSONContent }>();

	const { error } = await supabase
		.from('notes')
		.delete()
		.eq('id', noteId)
		.eq('user_id', user.id);

	if (error) return { ok: false, error: error.message };

	if (note?.content) {
		const paths = extractAttachmentPaths(note.content);
		if (paths.length > 0) {
			const { error: removeError } = await supabase.storage
				.from(ATTACHMENT_BUCKET)
				.remove(paths);
			if (removeError) console.error('storage cleanup failed:', removeError.message);
		}
	}

	revalidatePath('/trash');
	return { ok: true };
}

export async function emptyTrash(): Promise<Result> {
	const { supabase, user } = await requireUser();

	const { data: rawNotes } = await supabase
		.from('notes')
		.select('content')
		.eq('user_id', user.id)
		.not('deleted_at', 'is', null);
	const notes = (rawNotes ?? []) as { content: JSONContent }[];

	const { error } = await supabase
		.from('notes')
		.delete()
		.eq('user_id', user.id)
		.not('deleted_at', 'is', null);

	if (error) return { ok: false, error: error.message };

	if (notes.length > 0) {
		const allPaths = notes.flatMap((n) => extractAttachmentPaths(n.content));
		if (allPaths.length > 0) {
			const { error: removeError } = await supabase.storage
				.from(ATTACHMENT_BUCKET)
				.remove(allPaths);
			if (removeError) console.error('storage cleanup failed:', removeError.message);
		}
	}

	revalidatePath('/trash');
	return { ok: true };
}
