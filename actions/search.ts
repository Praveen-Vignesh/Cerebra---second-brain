'use server';

import { createClient } from '@/utils/server';
import { noteToPlainText } from '@/utils/tiptapText';
import type { JSONContent } from '@tiptap/react';

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export type SearchResult = { id: string; title: string; snippet: string };

type NoteRow = { id: string; title: string; content: JSONContent };

// Live note search. Fetches the user's non-deleted notes (RLS scopes them to the
// caller) and filters by title or extracted body text. Only the matched title +
// a short snippet cross back to the client — full content stays on the server.
// Fetch-and-filter is fine at student scale; a Postgres FTS column/RPC is the
// upgrade path if note counts ever get large.
export async function searchNotes(query: string): Promise<Result<SearchResult[]>> {
	const q = query.trim().toLowerCase();
	if (q.length === 0) return { ok: true, data: [] };

	const supabase = await createClient();
	const { data, error } = await supabase
		.from('notes')
		.select('id, title, content')
		.is('deleted_at', null)
		.order('updated_at', { ascending: false })
		.limit(500);

	if (error) return { ok: false, error: error.message };

	const rows = (data ?? []) as NoteRow[];
	const results: SearchResult[] = [];

	for (const row of rows) {
		const title = (row.title ?? '').trim();
		const body = noteToPlainText(row.content).replace(/\s+/g, ' ').trim();
		const inTitle = title.toLowerCase().includes(q);
		const idx = body.toLowerCase().indexOf(q);
		if (!inTitle && idx === -1) continue;

		results.push({
			id: row.id,
			title: title || 'Untitled',
			snippet: snippetAround(body, idx, q.length),
		});
		if (results.length >= 20) break;
	}

	return { ok: true, data: results };
}

// Build a short preview. If the match is in the body, center the window on it
// (with ellipses); if it only matched the title, just show the body's opening.
function snippetAround(body: string, matchIndex: number, queryLen: number): string {
	if (body.length === 0) return '';
	if (matchIndex === -1) {
		return body.slice(0, 120) + (body.length > 120 ? '…' : '');
	}
	const start = Math.max(0, matchIndex - 40);
	const end = Math.min(body.length, matchIndex + queryLen + 60);
	return (
		(start > 0 ? '…' : '') + body.slice(start, end) + (end < body.length ? '…' : '')
	);
}
