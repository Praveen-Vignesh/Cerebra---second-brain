// Server-only. Talks to the user's chosen AI provider (Gemini / OpenAI /
// Anthropic) over plain fetch (no SDK) so requests are fully visible. Never
// import this from a client component — calls run with a secret API key.
//
// Every provider gets the same job: "given this prompt and this JSON schema,
// return JSON matching it". They each force that differently (see the adapters).

import type { Provider } from '@/utils/aiProviders';

// What a call needs: who to call, which model, and the key. `fallbackModels` is a
// Gemini convenience (try another model if the chosen one is overloaded).
export type AiCallConfig = {
	provider: Provider;
	model: string;
	apiKey: string;
	fallbackModels?: string[];
};

const ATTEMPTS = 3;
// Transient HTTP statuses worth retrying (overloaded / rate-limited / server hiccup).
const TRANSIENT = [429, 500, 503];

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// POST with retry+backoff on transient statuses. Returns the final Response
// (which the caller inspects) — it does not throw on HTTP errors.
async function postWithRetry(url: string, init: RequestInit): Promise<Response> {
	let res = await fetch(url, init);
	for (let attempt = 1; attempt < ATTEMPTS && !res.ok && TRANSIENT.includes(res.status); attempt++) {
		await sleep(600 * 2 ** (attempt - 1)); // 0.6s, 1.2s …
		res = await fetch(url, init);
	}
	return res;
}

// The one function the rest of the file uses. Dispatches to the right provider
// adapter and returns the raw JSON string (caller does JSON.parse).
export async function generateJSON(
	prompt: string,
	schema: object,
	config: AiCallConfig
): Promise<string> {
	if (config.provider === 'gemini') {
		const models = [config.model, ...(config.fallbackModels ?? [])];
		return geminiGenerateJSON(prompt, schema, config.apiKey, models);
	}
	if (config.provider === 'openai') return openaiGenerateJSON(prompt, schema, config.apiKey, config.model);
	if (config.provider === 'anthropic') return anthropicGenerateJSON(prompt, schema, config.apiKey, config.model);
	throw new Error(`Unknown AI provider: ${config.provider}`);
}

// --- Gemini: forced JSON via responseSchema. Tries each model in turn. ---
async function geminiGenerateJSON(
	prompt: string,
	schema: object,
	apiKey: string,
	models: string[]
): Promise<string> {
	const body = JSON.stringify({
		contents: [{ parts: [{ text: prompt }] }],
		generationConfig: { responseMimeType: 'application/json', responseSchema: schema },
	});

	let lastError = '';
	for (const model of models) {
		const res = await postWithRetry(
			`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
			{ method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }, body }
		);
		if (res.ok) {
			const data = await res.json();
			const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
			if (!text) throw new Error('Gemini returned no content (it may have been blocked).');
			return text;
		}
		lastError = `Gemini error ${res.status}: ${await res.text()}`;
		// Non-transient (bad key/request) won't improve by trying another model.
		if (!TRANSIENT.includes(res.status)) break;
	}
	throw new Error(lastError || 'Gemini request failed');
}

// --- OpenAI: forced JSON via response_format json_schema (strict mode). ---
async function openaiGenerateJSON(
	prompt: string,
	schema: object,
	apiKey: string,
	model: string
): Promise<string> {
	const res = await postWithRetry('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
		body: JSON.stringify({
			model,
			messages: [{ role: 'user', content: prompt }],
			// Strict mode needs additionalProperties:false on every object — addStrict adds it.
			response_format: {
				type: 'json_schema',
				json_schema: { name: 'result', schema: addStrict(schema), strict: true },
			},
		}),
	});
	if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
	const data = await res.json();
	const text = data?.choices?.[0]?.message?.content;
	if (!text) throw new Error('OpenAI returned no content.');
	return text;
}

// --- Anthropic (Claude): forced JSON via tool-use. We define a single tool whose
// input_schema is our schema and require Claude to call it; the tool input IS the JSON. ---
async function anthropicGenerateJSON(
	prompt: string,
	schema: object,
	apiKey: string,
	model: string
): Promise<string> {
	const res = await postWithRetry('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
			'anthropic-version': '2023-06-01',
		},
		body: JSON.stringify({
			model,
			max_tokens: 4096,
			tools: [{ name: 'emit_result', description: 'Return the structured result.', input_schema: schema }],
			tool_choice: { type: 'tool', name: 'emit_result' },
			messages: [{ role: 'user', content: prompt }],
		}),
	});
	if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
	const data = await res.json();
	const block = (data?.content ?? []).find((b: { type: string }) => b.type === 'tool_use');
	if (!block) throw new Error('Claude returned no structured result.');
	return JSON.stringify(block.input);
}

// OpenAI strict json_schema requires every object to set additionalProperties:false.
// Walk the schema and add it to each object node (returns a deep copy).
function addStrict(schema: object): object {
	const node = JSON.parse(JSON.stringify(schema)) as Record<string, unknown>;
	const walk = (n: Record<string, unknown>) => {
		if (n.type === 'object') {
			n.additionalProperties = false;
			const props = n.properties as Record<string, Record<string, unknown>> | undefined;
			if (props) for (const k of Object.keys(props)) walk(props[k]);
		}
		if (n.type === 'array' && n.items) walk(n.items as Record<string, unknown>);
	};
	walk(node);
	return node;
}

// --- The material types we can generate from a piece of text. ---
export type MaterialType = 'summary' | 'flashcards' | 'study_guide' | 'quiz' | 'key_concepts';

export type Flashcard = { front: string; back: string };
export type QuizQuestion = { question: string; options: string[]; answerIndex: number };
export type StudyGuide = {
	keyPoints: string[];
	definitions: { term: string; definition: string }[];
	shortAnswers: { question: string; answer: string }[];
};
export type KeyConcept = { term: string; description: string };

// The model returns only the sections we asked for, so every field is optional.
export type StudyMaterials = {
	summary?: string;
	flashcards?: Flashcard[];
	study_guide?: StudyGuide;
	quiz?: QuizQuestion[];
	key_concepts?: KeyConcept[];
};

// The exact JSON shape we want back for each material type. We assemble a
// responseSchema from only the requested types so Gemini is forced to return
// valid JSON in that shape — JSON.parse stays safe, no prose to clean up.
const SCHEMA_FRAGMENTS: Record<MaterialType, object> = {
	summary: { type: 'string' },
	flashcards: {
		type: 'array',
		items: {
			type: 'object',
			properties: { front: { type: 'string' }, back: { type: 'string' } },
			required: ['front', 'back'],
		},
	},
	study_guide: {
		type: 'object',
		properties: {
			keyPoints: { type: 'array', items: { type: 'string' } },
			definitions: {
				type: 'array',
				items: {
					type: 'object',
					properties: { term: { type: 'string' }, definition: { type: 'string' } },
					required: ['term', 'definition'],
				},
			},
			shortAnswers: {
				type: 'array',
				items: {
					type: 'object',
					properties: { question: { type: 'string' }, answer: { type: 'string' } },
					required: ['question', 'answer'],
				},
			},
		},
		required: ['keyPoints', 'definitions', 'shortAnswers'],
	},
	quiz: {
		type: 'array',
		items: {
			type: 'object',
			properties: {
				question: { type: 'string' },
				options: { type: 'array', items: { type: 'string' } },
				answerIndex: { type: 'integer' },
			},
			required: ['question', 'options', 'answerIndex'],
		},
	},
	key_concepts: {
		type: 'array',
		items: {
			type: 'object',
			properties: { term: { type: 'string' }, description: { type: 'string' } },
			required: ['term', 'description'],
		},
	},
};

// Plain-English instruction for each section, dropped into the prompt.
const PROMPT_FRAGMENTS: Record<MaterialType, string> = {
	summary: '- "summary": a concise summary (3-6 sentences) capturing the key ideas.',
	flashcards:
		'- "flashcards": 5 to 10 cards, each with a "front" (question/prompt) and "back" (answer), testing active recall of the important ideas, not trivial details.',
	study_guide:
		'- "study_guide": an object with "keyPoints" (short bullet strings), "definitions" (each {term, definition}), and "shortAnswers" (each {question, answer}) — built for exam prep.',
	quiz:
		'- "quiz": 4 to 8 multiple-choice questions, each with "question", an "options" array of 3-4 choices, and "answerIndex" (0-based index of the correct option).',
	key_concepts:
		'- "key_concepts": the core concepts/terms to know, each with a short "description".',
};

export async function generateStudyMaterials(
	sourceText: string,
	types: MaterialType[],
	config: AiCallConfig,
	instruction?: string
): Promise<StudyMaterials> {
	if (types.length === 0) throw new Error('No study material types requested');

	// Build the response schema + prompt from only the requested types.
	const properties: Record<string, object> = {};
	for (const t of types) properties[t] = SCHEMA_FRAGMENTS[t];
	const responseSchema = { type: 'object', properties, required: types };

	// Optional free-text steer from the student on how to approach the material.
	const extra = instruction?.trim()
		? `\nFollow these extra instructions from the student on how to approach it:\n"""\n${instruction.trim()}\n"""\n`
		: '';

	const prompt = `You are a study assistant for a student.
Read the material below and produce ONLY these sections as JSON:
${types.map((t) => PROMPT_FRAGMENTS[t]).join('\n')}
${extra}
Material:
"""
${sourceText}
"""`;

	const text = await generateJSON(prompt, responseSchema, config);
	return JSON.parse(text) as StudyMaterials;
}

// --- Note analysis (the "AI Analyze" button). Surfaces four lenses on a note. ---
export type NoteAnalysis = {
	knowledgeGaps: string[];
	improvements: string[];
	selfTestQuestions: string[];
	relatedConcepts: string[];
};

const ANALYSIS_SCHEMA = {
	type: 'object',
	properties: {
		knowledgeGaps: { type: 'array', items: { type: 'string' } },
		improvements: { type: 'array', items: { type: 'string' } },
		selfTestQuestions: { type: 'array', items: { type: 'string' } },
		relatedConcepts: { type: 'array', items: { type: 'string' } },
	},
	required: ['knowledgeGaps', 'improvements', 'selfTestQuestions', 'relatedConcepts'],
};

export async function analyzeNoteText(noteText: string, config: AiCallConfig): Promise<NoteAnalysis> {
	const prompt = `You are a study coach reviewing a student's note. Analyse it and return JSON with:
- "knowledgeGaps": things missing or worth learning next to round out this topic.
- "improvements": where the note is unclear, incomplete, or could be structured better.
- "selfTestQuestions": questions that probe whether the student truly understands what they wrote.
- "relatedConcepts": adjacent topics worth exploring to broaden the note.
Keep each item short (one sentence). Return 3-6 items per list.

Note:
"""
${noteText}
"""`;

	const text = await generateJSON(prompt, ANALYSIS_SCHEMA, config);
	return JSON.parse(text) as NoteAnalysis;
}
