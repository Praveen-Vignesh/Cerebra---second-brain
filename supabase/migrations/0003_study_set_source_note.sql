-- Link a study set back to the note it was generated from.
-- Lets us show "generated from <note>" and jump back to the source. `on delete
-- set null` so deleting the note doesn't delete the study set.
--
-- Run this in Supabase Dashboard → SQL Editor. Safe to re-run (idempotent).

alter table public.study_sets
	add column if not exists source_note_id uuid references public.notes (id) on delete set null;
