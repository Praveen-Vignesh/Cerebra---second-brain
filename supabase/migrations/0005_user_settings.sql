-- Per-user settings, including a "bring your own API key" AI config.
-- The API key is stored ENCRYPTED (AES-256-GCM, done in app code via
-- utils/crypto.ts) — the column holds ciphertext, never the raw key. `ai_key_last4`
-- is a non-secret hint (last 4 chars) just so the UI can show "••••1234".
--
-- Run this in Supabase Dashboard → SQL Editor. Safe to re-run (idempotent).

create table if not exists public.user_settings (
	user_id uuid primary key references auth.users (id) on delete cascade,
	ai_provider text,
	ai_model text,
	ai_api_key_encrypted text,
	ai_key_last4 text,
	updated_at timestamptz not null default now()
);

-- Row Level Security: a user can only ever read/write their own settings row.
alter table public.user_settings enable row level security;

drop policy if exists "Users manage their own settings" on public.user_settings;
create policy "Users manage their own settings"
	on public.user_settings
	for all
	using (auth.uid() = user_id)
	with check (auth.uid() = user_id);
