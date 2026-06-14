// Shared, secret-free data about the AI providers a user can bring a key for.
// Safe to import from BOTH client and server (no env vars, no node APIs) — it's
// just the dropdown options + the "where do I get a key" guide.

export type Provider = 'gemini' | 'openai' | 'anthropic';

export type ProviderInfo = {
	value: Provider;
	label: string;
	models: string[]; // first one is the sensible default
	keyUrl: string; // where to create a key
	keyHint: string; // short "how to get it" line for the guide
};

export const AI_PROVIDERS: ProviderInfo[] = [
	{
		value: 'gemini',
		label: 'Google Gemini',
		models: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro'],
		keyUrl: 'https://aistudio.google.com/app/apikey',
		keyHint: 'Sign in to Google AI Studio → “Get API key” → create a key in a project.',
	},
	{
		value: 'openai',
		label: 'OpenAI (ChatGPT)',
		models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1'],
		keyUrl: 'https://platform.openai.com/api-keys',
		keyHint: 'platform.openai.com → API keys → “Create new secret key”. Requires billing set up.',
	},
	{
		value: 'anthropic',
		label: 'Anthropic (Claude)',
		models: ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001', 'claude-opus-4-8'],
		keyUrl: 'https://console.anthropic.com/settings/keys',
		keyHint: 'console.anthropic.com → Settings → API keys → “Create Key”. Requires credits.',
	},
];

export function providerInfo(value: Provider): ProviderInfo | undefined {
	return AI_PROVIDERS.find((p) => p.value === value);
}
