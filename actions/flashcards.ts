'use server';

import { createClient } from '@/utils/server';
import { revalidatePath } from 'next/cache';
import { nextSchedule, type Rating } from '@/utils/srs';
import type { StudyGuide, KeyConcept } from '@/utils/ai';

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export type StudySetSummary = {
	id: string;
	title: string;
	summary: string | null;
	created_at: string;
	cardCount: number;
	dueCount: number;
};

export type ReviewCard = { id: string; front: string; back: string };

export type QuizCard = { id: string; question: string; options: string[]; answerIndex: number };

export type StudySetDetail = {
	id: string;
	title: string;
	summary: string | null;
	created_at: string;
	study_guide: StudyGuide | null;
	key_concepts: KeyConcept[] | null;
	cards: ReviewCard[];
	quiz: QuizCard[];
};

async function requireUser() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error('Not authenticated');
	return { supabase, user };
}

// Hub data: every study set with how many cards it has and how many are due now,
// plus the grand total of due cards across all sets (the "Due today" number).
export async function listStudySets(): Promise<
	Result<{ sets: StudySetSummary[]; totalDue: number }>
> {
	const { supabase } = await requireUser();

	const { data: sets, error: setsError } = await supabase
		.from('study_sets')
		.select('id, title, summary, created_at')
		.order('created_at', { ascending: false });
	if (setsError) return { ok: false, error: setsError.message };

	// Pull just the columns we need to count by set. At student scale (hundreds of
	// cards) it's cheaper to aggregate in JS than to run a grouped SQL query.
	const { data: cards, error: cardsError } = await supabase
		.from('flashcards')
		.select('study_set_id, due_at');
	if (cardsError) return { ok: false, error: cardsError.message };

	const now = Date.now();
	const counts = new Map<string, { total: number; due: number }>();
	for (const c of cards ?? []) {
		const entry = counts.get(c.study_set_id) ?? { total: 0, due: 0 };
		entry.total += 1;
		if (new Date(c.due_at).getTime() <= now) entry.due += 1;
		counts.set(c.study_set_id, entry);
	}

	let totalDue = 0;
	const withCounts: StudySetSummary[] = (sets ?? []).map((s) => {
		const entry = counts.get(s.id) ?? { total: 0, due: 0 };
		totalDue += entry.due;
		return {
			id: s.id,
			title: s.title,
			summary: s.summary,
			created_at: s.created_at,
			cardCount: entry.total,
			dueCount: entry.due,
		};
	});

	return { ok: true, data: { sets: withCounts, totalDue } };
}

// One set plus all of its cards (for the set-detail page).
export async function getStudySet(setId: string): Promise<Result<StudySetDetail>> {
	const { supabase } = await requireUser();

	const { data: set, error: setError } = await supabase
		.from('study_sets')
		.select('id, title, summary, created_at, study_guide, key_concepts')
		.eq('id', setId)
		.maybeSingle();
	if (setError) return { ok: false, error: setError.message };
	if (!set) return { ok: false, error: 'Study set not found' };

	const { data: cards, error: cardsError } = await supabase
		.from('flashcards')
		.select('id, front, back')
		.eq('study_set_id', setId)
		.order('created_at', { ascending: true });
	if (cardsError) return { ok: false, error: cardsError.message };

	const { data: quizRows, error: quizError } = await supabase
		.from('quiz_questions')
		.select('id, question, options, answer_index')
		.eq('study_set_id', setId)
		.order('created_at', { ascending: true });
	if (quizError) return { ok: false, error: quizError.message };

	const quiz: QuizCard[] = (quizRows ?? []).map((q) => ({
		id: q.id,
		question: q.question,
		options: (q.options ?? []) as string[],
		answerIndex: q.answer_index,
	}));

	return {
		ok: true,
		data: {
			id: set.id,
			title: set.title,
			summary: set.summary,
			created_at: set.created_at,
			study_guide: (set.study_guide ?? null) as StudyGuide | null,
			key_concepts: (set.key_concepts ?? null) as KeyConcept[] | null,
			cards: cards ?? [],
			quiz,
		},
	};
}

// --- Card editing (trust): let the user fix, remove, or add cards by hand, so a
// weak AI-generated card is never a dead end. ---

export async function updateCard(
	cardId: string,
	front: string,
	back: string
): Promise<Result<null>> {
	const f = front.trim();
	const b = back.trim();
	if (!f || !b) return { ok: false, error: 'Both sides of the card are required.' };

	const { supabase } = await requireUser();

	const { error } = await supabase
		.from('flashcards')
		.update({ front: f, back: b })
		.eq('id', cardId);
	if (error) return { ok: false, error: error.message };

	revalidatePath('/study');
	return { ok: true, data: null };
}

export async function deleteCard(cardId: string): Promise<Result<null>> {
	const { supabase } = await requireUser();

	const { error } = await supabase.from('flashcards').delete().eq('id', cardId);
	if (error) return { ok: false, error: error.message };

	revalidatePath('/study');
	return { ok: true, data: null };
}

// Add a card the user wrote themselves. SRS fields fall back to their DB defaults
// (due now, state 'new'), so it joins the review queue like any generated card.
export async function addCard(
	setId: string,
	front: string,
	back: string
): Promise<Result<ReviewCard>> {
	const f = front.trim();
	const b = back.trim();
	if (!f || !b) return { ok: false, error: 'Both sides of the card are required.' };

	const { supabase, user } = await requireUser();

	const { data, error } = await supabase
		.from('flashcards')
		.insert({ study_set_id: setId, user_id: user.id, front: f, back: b })
		.select('id, front, back')
		.single();
	if (error) return { ok: false, error: error.message };

	revalidatePath('/study');
	return { ok: true, data };
}

// The review queue: cards whose due_at has arrived. Pass a setId to drill one set,
// or omit it for a mixed review of everything due (the daily driver).
export async function getDueCards(setId?: string): Promise<Result<ReviewCard[]>> {
	const { supabase } = await requireUser();

	let query = supabase
		.from('flashcards')
		.select('id, front, back')
		.lte('due_at', new Date().toISOString())
		.order('due_at', { ascending: true });

	if (setId) query = query.eq('study_set_id', setId);

	const { data, error } = await query;
	if (error) return { ok: false, error: error.message };

	return { ok: true, data: data ?? [] };
}

// Record a review: read the card's current schedule, ask the scheduler where it
// goes next, write that back, and log the review in card_reviews.
export async function rateCard(cardId: string, rating: Rating): Promise<Result<null>> {
	const { supabase, user } = await requireUser();

	const { data: card, error: cardError } = await supabase
		.from('flashcards')
		.select('interval_days, ease, repetitions, lapses')
		.eq('id', cardId)
		.maybeSingle();
	if (cardError) return { ok: false, error: cardError.message };
	if (!card) return { ok: false, error: 'Card not found' };

	const next = nextSchedule(card, rating);

	const { error: updateError } = await supabase
		.from('flashcards')
		.update({
			interval_days: next.interval_days,
			ease: next.ease,
			repetitions: next.repetitions,
			lapses: next.lapses,
			due_at: next.due_at,
			last_reviewed_at: next.last_reviewed_at,
			state: next.state,
		})
		.eq('id', cardId);
	if (updateError) return { ok: false, error: updateError.message };

	// Log it (prev_interval_days = the interval the card had *before* this review).
	await supabase.from('card_reviews').insert({
		card_id: cardId,
		user_id: user.id,
		rating,
		prev_interval_days: card.interval_days,
	});

	revalidatePath('/study');
	return { ok: true, data: null };
}
