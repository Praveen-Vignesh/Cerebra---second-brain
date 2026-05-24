import { createClient } from '@/utils/server';
import TrashPageClient, { type TrashedNote } from '@/components/notes/TrashPageClient';

export default async function TrashPage() {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('notes')
		.select('id, title, updated_at, deleted_at, pinned')
		.not('deleted_at', 'is', null)
		.order('deleted_at', { ascending: false });

	if (error) throw error;

	const notes = (data ?? []) as TrashedNote[];

	return <TrashPageClient notes={notes} />;
}
