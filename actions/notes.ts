'use server';

import { createClient } from '@/utils/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { JSONContent } from '@tiptap/react';

type SaveResult = { ok: true } | { ok: false; error: string };
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

export async function saveNote(
	id: string,
	title: string,
	content: JSONContent,
	options: SaveOptions = {}
): Promise<SaveResult> {
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

const EMPTY_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

export async function createNote() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error('Not authenticated');

	const { data, error } = await supabase
		.from('notes')
		.insert({ user_id: user.id, title: 'Untitled', content: EMPTY_DOC })
		.select('id')
		.single();

	if (error) throw error;

	revalidatePath('/notes');
	redirect(`/notes/${data.id}`);
}
