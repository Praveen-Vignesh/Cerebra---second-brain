import { createClient } from './client';

export const ATTACHMENT_BUCKET = 'note-attachments';

export async function uploadAttachment(file: File, noteId: string): Promise<string> {
	const supabase = createClient();
	const {data: { user }} = await supabase.auth.getUser();
	if (!user) throw new Error('Not authenticated');

	const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
	const path = `${user.id}/${noteId}/${crypto.randomUUID()}-${safeName}`;

	const { error } = await supabase.storage.from('note-attachments').upload(path, file);
	if (error) throw error;

	const { data } = supabase.storage.from('note-attachments').getPublicUrl(path);

	return data.publicUrl;
}
