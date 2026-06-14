-- Study sets + flashcards
-- A "study set" is one generation: a summary plus its flashcards.
-- Run this in Supabase Dashboard → SQL Editor. Safe to re-run (idempotent).
--
-- Note: this drops an earlier, unused `flashcards` table from the parked
-- knowledge-graph design (note_id/concept_id/SR fields). It was empty.

drop table if exists public.flashcards cascade;

create table if not exists public.study_sets (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users (id) on delete cascade,
	title text not null default 'Untitled set',
	summary text,
	source_type text not null default 'paste',
	created_at timestamptz not null default now()
);

create table public.flashcards (
	id uuid primary key default gen_random_uuid(),
	study_set_id uuid not null references public.study_sets (id) on delete cascade,
	user_id uuid not null references auth.users (id) on delete cascade,
	front text not null,
	back text not null,
	created_at timestamptz not null default now()
);

create index if not exists study_sets_user_id_idx on public.study_sets (user_id);
create index if not exists flashcards_study_set_id_idx on public.flashcards (study_set_id);

-- Row Level Security: a user can only ever see/touch their own rows.
alter table public.study_sets enable row level security;
alter table public.flashcards enable row level security;

drop policy if exists "Users manage their own study sets" on public.study_sets;
create policy "Users manage their own study sets"
	on public.study_sets
	for all
	using (auth.uid() = user_id)
	with check (auth.uid() = user_id);

drop policy if exists "Users manage their own flashcards" on public.flashcards;
create policy "Users manage their own flashcards"
	on public.flashcards
	for all
	using (auth.uid() = user_id)
	with check (auth.uid() = user_id);
