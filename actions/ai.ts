'use server';

import {
	generateStudyMaterials,
	analyzeNoteText,
	type MaterialType,
	type StudyMaterials,
	type NoteAnalysis,
} from '@/utils/ai';
import { createClient } from '@/utils/server';
import { noteToPlainText } from '@/utils/tiptapText';
import { resolveAiConfig } from '@/utils/aiConfig';
import { revalidatePath } from 'next/cache';

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export type GeneratedSet = { id: string; title: string };

// When the user is on their own key, AI failures are usually a bad/expired key or
// exhausted quota — append a nudge to check it (we skip pre-save validation).
function withKeyHint(message: string, isUserKey: boolean): string {
	if (!isUserKey) return message;
	return `${message} — your API key may be invalid or out of quota, so double-check the key and your usage limits in the provider's dashboard.`;
}

// Save the generated materials as a study set: one study_sets row carrying the
// summary / study guide / key concepts, plus child rows for flashcards and quiz
// questions. Returns the new set's id + title.
async function saveStudyMaterials(
	userId: string,
	materials: StudyMaterials,
	source: { type: 'paste' | 'note'; noteId?: string; title?: string }
): Promise<Result<GeneratedSet>> {
	const supabase = await createClient();

	const title =
		(source.title ?? materials.summary?.slice(0, 60))?.trim() || 'Untitled set';

	const { data: set, error: setError } = await supabase
		.from('study_sets')
		.insert({
			user_id: userId,
			title,
			summary: materials.summary ?? null,
			study_guide: materials.study_guide ?? null,
			key_concepts: materials.key_concepts ?? null,
			source_type: source.type,
			source_note_id: source.noteId ?? null,
		})
		.select('id')
		.single();
	if (setError) return { ok: false, error: setError.message };

	// Flashcards (their own table; SRS fields fall back to DB defaults).
	if (materials.flashcards && materials.flashcards.length > 0) {
		const rows = materials.flashcards.map((c) => ({
			study_set_id: set.id,
			user_id: userId,
			front: c.front,
			back: c.back,
		}));
		const { error } = await supabase.from('flashcards').insert(rows);
		if (error) return { ok: false, error: error.message };
	}

	// Quiz questions.
	if (materials.quiz && materials.quiz.length > 0) {
		const rows = materials.quiz.map((q) => ({
			study_set_id: set.id,
			user_id: userId,
			question: q.question,
			options: q.options,
			answer_index: q.answerIndex,
		}));
		const { error } = await supabase.from('quiz_questions').insert(rows);
		if (error) return { ok: false, error: error.message };
	}

	revalidatePath('/study');
	return { ok: true, data: { id: set.id, title } };
}

// One entry point for both sources: paste text or an existing note. `types` is
// which materials to generate (summary, flashcards, study_guide, quiz, key_concepts).
export async function generateStudySet(
	source: { sourceText?: string; noteId?: string },
	types: MaterialType[],
	instruction?: string
): Promise<Result<GeneratedSet>> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { ok: false, error: 'Not authenticated' };

	if (types.length === 0) {
		return { ok: false, error: 'Pick at least one type of material to generate.' };
	}

	// Resolve the source text (and a title hint for the note case).
	let text: string;
	let noteTitle: string | undefined;
	if (source.noteId) {
		const { data: note, error } = await supabase
			.from('notes')
			.select('title, content')
			.eq('id', source.noteId)
			.maybeSingle();
		if (error) return { ok: false, error: error.message };
		if (!note) return { ok: false, error: 'Note not found' };
		text = noteToPlainText(note.content);
		noteTitle = note.title?.trim() || undefined;
		if (text.length < 50) {
			return { ok: false, error: 'This note is too short to generate study material from.' };
		}
	} else {
		text = (source.sourceText ?? '').trim();
		if (text.length < 50) {
			return { ok: false, error: 'Please paste at least a few sentences of material.' };
		}
	}

	const config = await resolveAiConfig(user.id);
	let materials;
	try {
		materials = await generateStudyMaterials(text, types, config, instruction);
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Generation failed';
		return { ok: false, error: withKeyHint(msg, config.isUserKey) };
	}

	return saveStudyMaterials(user.id, materials, {
		type: source.noteId ? 'note' : 'paste',
		noteId: source.noteId,
		title: noteTitle,
	});
}

// The "AI Analyze" button: run the four-lens analysis on a note's text.
// Ephemeral — the result is shown in the editor, not saved.
export async function analyzeNote(noteText: string): Promise<Result<NoteAnalysis>> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { ok: false, error: 'Not authenticated' };

	const text = noteText.trim();
	if (text.length < 50) {
		return { ok: false, error: 'Write a bit more before analysing — at least a few sentences.' };
	}

	const config = await resolveAiConfig(user.id);
	try {
		const analysis = await analyzeNoteText(text, config);
		return { ok: true, data: analysis };
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Analysis failed';
		return { ok: false, error: withKeyHint(msg, config.isUserKey) };
	}
}
