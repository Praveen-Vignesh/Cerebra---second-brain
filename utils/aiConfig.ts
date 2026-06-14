// Server-only helper that decides which AI credentials a given request uses.
//
// IMPORTANT: this is a plain server module, NOT a 'use server' actions file. A
// 'use server' export is callable from the browser — we must never expose the
// decrypted key that way. Only other server code (actions/ai.ts) imports this.

import { createClient } from '@/utils/server';
import { decryptSecret } from '@/utils/crypto';
import type { Provider } from '@/utils/aiProviders';

export type AiConfig = {
	provider: Provider;
	model: string;
	apiKey: string;
	// true = the user's own key (BYOK); false = the app's shared default key.
	isUserKey: boolean;
	// Gemini-only: extra models to try if the chosen one is overloaded.
	fallbackModels?: string[];
};

// Resolve the AI config for the current user: their saved key if they have one,
// otherwise the app's default Gemini key from the environment.
export async function resolveAiConfig(userId: string): Promise<AiConfig> {
	const supabase = await createClient();
	const { data } = await supabase
		.from('user_settings')
		.select('ai_provider, ai_model, ai_api_key_encrypted')
		.eq('user_id', userId)
		.maybeSingle();

	if (data?.ai_api_key_encrypted && data.ai_provider && data.ai_model) {
		return {
			provider: data.ai_provider as Provider,
			model: data.ai_model,
			apiKey: decryptSecret(data.ai_api_key_encrypted),
			isUserKey: true,
		};
	}

	// Fallback: the app's shared Gemini key (what everyone used before BYOK).
	const envKey = process.env.GEMINI_API_KEY;
	if (!envKey) {
		throw new Error('No AI key available. Add your own key in Settings, or set GEMINI_API_KEY.');
	}
	return {
		provider: 'gemini',
		model: 'gemini-2.5-flash',
		apiKey: envKey,
		isUserKey: false,
		fallbackModels: ['gemini-2.0-flash'],
	};
}
