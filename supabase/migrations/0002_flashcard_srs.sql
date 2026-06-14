	-- Spaced-repetition state for flashcards.
	-- Adds the scheduling fields each card needs so we can drill it on a spaced
	-- schedule (SM-2), plus a review-history table so we can see how a card has
	-- been answered over time (needed later for adaptive rephrasing).
	--
	-- Run this in Supabase Dashboard → SQL Editor. Safe to re-run (idempotent).

	-- 1. Scheduling fields on each card.
	--    due_at      : when this card should next be shown. Defaults to now() so a
	--                  freshly generated card is immediately "due" for its first review.
	--    interval_days: gap (in days) until the next review, as decided last time.
	--    ease        : SM-2 "easiness factor". Higher = card grows its interval faster.
	--                  Starts at 2.5; never allowed below 1.3.
	--    repetitions : how many times in a row it's been answered correctly.
	--    lapses      : how many times it's been forgotten (answered "again").
	--    last_reviewed_at: timestamp of the most recent review.
	--    state       : 'new' (never reviewed) | 'learning' (just lapsed/relearning) | 'review'.
	alter table public.flashcards
		add column if not exists due_at timestamptz not null default now(),
		add column if not exists interval_days integer not null default 0,
		add column if not exists ease numeric not null default 2.5,
		add column if not exists repetitions integer not null default 0,
		add column if not exists lapses integer not null default 0,
		add column if not exists last_reviewed_at timestamptz,
		add column if not exists state text not null default 'new';

	-- Index the columns we filter/sort the "due" queue by.
	create index if not exists flashcards_user_due_idx on public.flashcards (user_id, due_at);

	-- 2. Review history: one row per time a card is rated.
	--    prev_interval_days records what the interval was *before* this review, so we
	--    can reconstruct how the schedule evolved.
	create table if not exists public.card_reviews (
		id uuid primary key default gen_random_uuid(),
		card_id uuid not null references public.flashcards (id) on delete cascade,
		user_id uuid not null references auth.users (id) on delete cascade,
		rating text not null,
		prev_interval_days integer not null default 0,
		reviewed_at timestamptz not null default now()
	);

	create index if not exists card_reviews_card_id_idx on public.card_reviews (card_id);

	-- 3. Row Level Security: a user only ever sees/touches their own review rows.
	alter table public.card_reviews enable row level security;

	drop policy if exists "Users manage their own card reviews" on public.card_reviews;
	create policy "Users manage their own card reviews"
		on public.card_reviews
		for all
		using (auth.uid() = user_id)
		with check (auth.uid() = user_id);
