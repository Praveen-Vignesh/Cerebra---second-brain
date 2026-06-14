# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Cerebra — Agent Instructions

This repo is **Cerebra** (working directory name: Braindump), a personal knowledge OS for students. The user is the sole developer and is actively learning TypeScript, React, and Supabase by building this app. Match that context in everything you do.

## What we're building

A Next.js 16 app where a student can:
- Capture notes in a rich-text editor (TipTap) with images, tables, code blocks, etc.
- Organize them with folders (nested) and tags (flat)
- Pin, archive, and trash notes (soft-delete with 7-day auto-purge)
- Generate AI study material: paste text → Gemini returns a summary + flashcards (saved as a "study set"). **This is actively being built.**
- (Later) knowledge-gap analysis, project linking, graph view — shown on the landing page but not yet built (parked)

Auth, DB, storage, and OAuth callbacks all run on Supabase; AI generation runs on Google Gemini. There are no API routes — every mutation is a Next.js server action.

## Stack

- **Framework:** Next.js 16.2.4 (App Router), React 19, TypeScript 5, Tailwind CSS v4
- **DB / Auth / Storage:** Supabase via `@supabase/ssr` (browser client in `utils/client.ts`, server client in `utils/server.ts`)
- **Editor:** TipTap v3 with a large extension set (tables, code blocks, images, drag handle, details, etc.)
- **Icons:** Lucide React + Phosphor; Emoji Mart for the emoji picker
- **AI:** Google Gemini (`gemini-2.5-flash`) called over plain `fetch` in `utils/ai.ts` (server-only; reads `GEMINI_API_KEY`)
- **No API routes.** All mutations live in `actions/` as `'use server'` functions.

## Commands

```bash
npm run dev      # start the dev server (http://localhost:3000)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

- **No test suite exists** — there is no `test` script and no test runner configured. Don't invent test commands; if a change needs verifying, run `npm run lint` and a type check (`npx tsc --noEmit`).
- **Stale `.next` cache gotcha:** `tsc --noEmit` reads `.next/types/validator.ts`, which can reference deleted routes and throw phantom "Cannot find module .../page.js" errors. If you see those, `rm -rf .next/types` and re-run — the source is fine.
- **Env vars** live in `.env.local` (untracked): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY` (app-default AI key), `SETTINGS_ENCRYPTION_KEY` (64 hex chars, `openssl rand -hex 32` — used by `utils/crypto.ts` to encrypt users' BYOK API keys).

## Directory layout

```
actions/        Server actions: notes.ts, folders.ts, tags.ts, auth.ts, getOrigin.ts, ai.ts (Gemini study-set generation)
app/            Next.js App Router
  (auth)/       login, verify-email, auth-error
  (dashboard)/  Authenticated routes — notes, archive, trash, dashboard, study (renamed from flashcards), KB
  auth/callback Supabase OAuth callback
components/
  auth/         Login + signup modal shells
  dashboard/    Sidebar, TopBar, SearchModal (Cmd+K), ThemeToggle
  editor/       TipTapEditor, BubbleMenuBar, bottomBar, extensions.ts, editor.css
  notes/        NotesPageClient, NotesToolbar, NoteCard, NoteListRow, NoteEditor, NotesSidebar, ArchivePageClient, TrashPageClient, ConfirmDelete, NotesEmptyState, timeAgo.ts
  study/        GenerateForm, ReviewSession, SetCards (Study hub: generate + spaced-review UI; route /study)
utils/          client.ts (browser supabase), server.ts (server supabase), upload.ts (storage uploads), ai.ts (Gemini, server-only)
supabase/migrations/   SQL migrations (run manually in Supabase Dashboard → SQL Editor)
.ai-docs/       Reference notes on specific TipTap extensions / patterns
```

## Database schema (Supabase Postgres)

- **notes** — id, user_id, title, content (JSONContent), folder_id, pinned, archived_at, deleted_at, is_dump_chunk, created_at, updated_at
- **folders** — id, user_id, parent_id (self-ref, nests), name, created_at
- **tags** — id, user_id, name (lowercased, hyphenated, unique per user), color, created_at
- **note_tags** — note_id + tag_id (composite PK, both cascade)
- **notes_version** — version snapshots of note content
- **study_sets** — one AI generation: user_id, title, summary, source_type ('paste'), created_at
- **flashcards** — study_set_id (cascade), user_id, front, back, created_at (the migration drops an earlier, unused parked-design `flashcards` table)
- RLS is enabled on every table. `note_tags` policy joins through `notes.user_id`.
- `purge_old_trash()` SQL function deletes notes with `deleted_at < now() - 7 days`. Wired to a daily Supabase cron.

## How to operate

1. **Confirm before destructive work.** Migrations, mass file edits, comment stripping, schema changes — ask first unless the user explicitly said "go".
2. **Match the user's style** (see `feedback-collab-style` in your memory):
   - Simple, flat code. No abstractions unless asked.
   - Tab indent + semicolons in `actions/` and top-level `app/`. Component files in `components/notes/` historically used 2-space indent and no semicolons — match the neighboring file.
   - Tailwind v4 canonical names: `bg-linear-to-*`, `shrink-0`, `min-w-45`. Linter flags the old forms.
3. **Learning mode is the default.** The user is studying the code — when they ask "how does this work," walk through it line-by-line. Don't just rewrite the file for them. If they hand off the task explicitly ("you write it"), then ship it.
4. **No new files unless asked.** Prefer editing existing files. No planning docs or markdown summaries unless requested.

## Logging

- `log.md` — running log of debugging sessions and doubt clarifications. Newest entry first. After any debugging round or conceptual clarification, append a structured entry (what came up, wrong hypotheses, actual cause, fix, lesson).
- `debugging-notes.md` — older entries, kept for reference.

## Pointers worth remembering

- **RSC Flight encoding bug:** TipTap JSON passed to a server action gets `"$T"` substitutions for shared attrs objects. Always deep-clone (`JSON.parse(JSON.stringify(content))`) on the **client** before crossing the server-action boundary. The clone in `actions/notes.ts` runs too late on its own.
- **`<form action={fn}>`** always passes a `FormData` object as arg 1. For no-fields buttons, use `<button onClick={() => fn()}>` instead.
- **Migrations are not auto-run.** When schema changes ship, remind the user to run the SQL in Supabase Dashboard before continuing. Tracked migrations live in `supabase/migrations/` (currently the study-sets + flashcards tables); the core notes/folders/tags schema predates this folder.
- **Gemini JSON pattern:** `utils/ai.ts` sends `responseMimeType: 'application/json'` + a `responseSchema`, so the model is forced to return valid JSON — `JSON.parse` is safe, no prose cleanup. `actions/ai.ts` wraps every call in a `Result<T>` (`{ ok, data } | { ok, error }`) rather than throwing across the server-action boundary.
- **Active roadmap, locked decisions, and milestone status** all live in the `project-notes-organization-roadmap` memory file — read it before picking up notes-organization work.

## Bottom line

You sit between what the user wants (often: "explain this so I understand it") and what the code does. Default to teaching mode. Ship code only when explicitly handed the keyboard.
