// Spaced-repetition scheduler (SM-2 variant).
//
// This is a *pure* module: given a card's current scheduling state and how the
// user just rated it, it returns the next scheduling state. No database, no
// network, no dates pulled from anywhere but `now`. That makes it trivial to
// reason about and to swap for a smarter algorithm (e.g. FSRS) later — anything
// that produces the same `NextSchedule` shape can drop in here unchanged.
//
// The classic SM-2 algorithm (SuperMemo, 1987) is the basis. We use four rating
// buttons instead of SM-2's 0–5 quality scale because that's what students
// actually understand: Again / Hard / Good / Easy.

export type Rating = 'again' | 'hard' | 'good' | 'easy';

// The scheduling fields we read off a card before reviewing it.
export type CardState = {
	interval_days: number;
	ease: number;
	repetitions: number;
	lapses: number;
};

// What the scheduler hands back after a review. The action layer writes these
// onto the card row (and `due_at` decides when it next surfaces).
export type NextSchedule = {
	interval_days: number;
	ease: number;
	repetitions: number;
	lapses: number;
	due_at: string; // ISO timestamp
	last_reviewed_at: string; // ISO timestamp
	state: 'learning' | 'review';
};

const MIN_EASE = 1.3; // SM-2 never lets a card's ease drop below this.

// Round to 2 decimals so the ease stored in the DB stays tidy (e.g. 2.36 not 2.3599…).
function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

export function nextSchedule(card: CardState, rating: Rating): NextSchedule {
	const now = new Date();

	let { interval_days, ease, repetitions, lapses } = card;
	let state: NextSchedule['state'] = 'review';

	if (rating === 'again') {
		// Forgotten. Reset the streak, count a lapse, nudge ease down, and show it
		// again tomorrow so the user relearns it.
		repetitions = 0;
		lapses = lapses + 1;
		ease = Math.max(MIN_EASE, ease - 0.2);
		interval_days = 1;
		state = 'learning';
	} else {
		// Answered correctly. Adjust ease based on how hard it felt…
		if (rating === 'hard') ease = Math.max(MIN_EASE, ease - 0.15);
		else if (rating === 'easy') ease = ease + 0.15;
		// (a 'good' answer leaves ease unchanged)

		// …then grow the interval. The first two correct reviews use fixed steps
		// (1 day, then 6 days), exactly like SM-2; after that we multiply.
		if (repetitions === 0) {
			interval_days = rating === 'easy' ? 4 : 1;
		} else if (repetitions === 1) {
			interval_days = rating === 'hard' ? 4 : 6;
		} else {
			const factor =
				rating === 'hard' ? 1.2 : rating === 'easy' ? ease * 1.3 : ease;
			interval_days = Math.round(interval_days * factor);
		}

		interval_days = Math.max(1, interval_days);
		repetitions = repetitions + 1;
	}

	const due = new Date(now);
	due.setDate(due.getDate() + interval_days);

	return {
		interval_days,
		ease: round2(ease),
		repetitions,
		lapses,
		due_at: due.toISOString(),
		last_reviewed_at: now.toISOString(),
		state,
	};
}
