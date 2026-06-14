'use server';

import { createClient } from '@/utils/server';
import { encryptSecret } from '@/utils/crypto';
import type { Provider } from '@/utils/aiProviders';
import { revalidatePath } from 'next/cache';

type Result = { ok: true } | { ok: false; error: string };

// Safe-to-show settings (never the raw/encrypted key — just a "key is set" flag
// and the last 4 chars for a "••••1234" hint).
export type AiSettings = {
	provider: Provider | null;
	model: string | null;
	hasKey: boolean;
	keyLast4: string | null;
};

export async function getAiSettings(): Promise<AiSettings> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { provider: null, model: null, hasKey: false, keyLast4: null };

	const { data } = await supabase
		.from('user_settings')
		.select('ai_provider, ai_model, ai_api_key_encrypted, ai_key_last4')
		.eq('user_id', user.id)
		.maybeSingle();

	return {
		provider: (data?.ai_provider ?? null) as Provider | null,
		model: data?.ai_model ?? null,
		hasKey: Boolean(data?.ai_api_key_encrypted),
		keyLast4: data?.ai_key_last4 ?? null,
	};
}

// Save provider + model, and (if a new key is given) the encrypted key. If the
// key field is left blank AND a key already exists for the same provider, we keep
// the existing key and just update the model — so changing model doesn't force
// re-entering the key.
export async function saveAiSettings(
	provider: Provider,
	model: string,
	apiKey: string
): Promise<Result> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { ok: false, error: 'Not authenticated' };

	const { data: existing } = await supabase
		.from('user_settings')
		.select('ai_provider, ai_api_key_encrypted, ai_key_last4')
		.eq('user_id', user.id)
		.maybeSingle();

	const key = apiKey.trim();
	let encrypted: string | null;
	let last4: string | null;

	if (key) {
		try {
			encrypted = encryptSecret(key);
		} catch (err) {
			return { ok: false, error: err instanceof Error ? err.message : 'Could not encrypt the key' };
		}
		last4 = key.slice(-4);
	} else if (existing?.ai_api_key_encrypted && existing.ai_provider === provider) {
		// No new key, but one already exists for this provider — keep it.
		encrypted = existing.ai_api_key_encrypted;
		last4 = existing.ai_key_last4 ?? null;
	} else {
		return { ok: false, error: 'Enter your API key for this provider.' };
	}

	const { error } = await supabase.from('user_settings').upsert({
		user_id: user.id,
		ai_provider: provider,
		ai_model: model,
		ai_api_key_encrypted: encrypted,
		ai_key_last4: last4,
		updated_at: new Date().toISOString(),
	});
	if (error) return { ok: false, error: error.message };

	revalidatePath('/settings');
	return { ok: true };
}

// Remove the stored key (keeps provider/model). After this, AI falls back to the
// app's default Gemini key.
export async function clearAiKey(): Promise<Result> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { ok: false, error: 'Not authenticated' };

	const { error } = await supabase
		.from('user_settings')
		.update({ ai_api_key_encrypted: null, ai_key_last4: null })
		.eq('user_id', user.id);
	if (error) return { ok: false, error: error.message };

	revalidatePath('/settings');
	return { ok: true };
}
