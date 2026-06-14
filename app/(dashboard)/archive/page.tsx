import { createClient } from '@/utils/server';
import ArchivePageClient, { type ArchivedNote } from '@/components/notes/ArchivePageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Archive' };

export default async function ArchivePage() {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('notes')
		.select('id, title, updated_at, archived_at, pinned')
		.not('archived_at', 'is', null)
		.is('deleted_at', null)
		.order('archived_at', { ascending: false });

	if (error) throw error;

	const notes = (data ?? []) as ArchivedNote[];

	return <ArchivePageClient notes={notes} />;
}
