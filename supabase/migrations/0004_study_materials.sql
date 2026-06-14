-- Extra study-material types beyond flashcards.
-- A study set can now also carry a study guide, a key-concepts list, and a quiz.
-- (summary already exists on study_sets; flashcards already have their own table.)
--
-- Run this in Supabase Dashboard → SQL Editor. Safe to re-run (idempotent).

-- 1. Structured materials stored directly on the set.
--    study_guide  : { keyPoints[], definitions[{term,definition}], shortAnswers[{question,answer}] }
--    key_concepts : [{ term, description }]
alter table public.study_sets
	add column if not exists study_guide jsonb,
	add column if not exists key_concepts jsonb;

-- 2. Quiz questions (multiple-choice). One row per question.
--    options    : array of choice strings.
--    answer_index: 0-based index into options of the correct choice.
create table if not exists public.quiz_questions (
	id uuid primary key default gen_random_uuid(),
	study_set_id uuid not null references public.study_sets (id) on delete cascade,
	user_id uuid not null references auth.users (id) on delete cascade,
	question text not null,
	options jsonb not null default '[]'::jsonb,
	answer_index integer not null default 0,
	created_at timestamptz not null default now()
);

create index if not exists quiz_questions_study_set_id_idx on public.quiz_questions (study_set_id);

-- 3. Row Level Security: a user only ever sees/touches their own quiz rows.
alter table public.quiz_questions enable row level security;

drop policy if exists "Users manage their own quiz questions" on public.quiz_questions;
create policy "Users manage their own quiz questions"
	on public.quiz_questions
	for all
	using (auth.uid() = user_id)
	with check (auth.uid() = user_id);
