# Cerebra

> A personal knowledge OS for students — capture notes, organize them, and turn your material into study sets with AI.

Cerebra (internal codename **Braindump**) is a [Next.js 16](https://nextjs.org) app where a student can write rich-text notes, organize them with nested folders and tags, and generate AI-powered summaries and flashcards from any material. Auth, database, and file storage all run on [Supabase](https://supabase.com); flashcard generation runs on [Google Gemini](https://ai.google.dev).

## Features

- **Rich-text notes** — a [TipTap v3](https://tiptap.dev) editor with tables, code blocks (syntax-highlighted), images, collapsible details, drag handles, text alignment, highlights, and more.
- **Organization** — nested folders and flat tags, with pin / archive / trash. Trashed notes soft-delete and auto-purge after 7 days.
- **Insta Dump** — a quick-capture box for getting thoughts down fast.
- **AI flashcards** — paste any text and Gemini returns a concise summary plus 5–10 active-recall flashcards, saved as a *study set*.
- **Cmd+K search** — fuzzy search across notes.
- **Auth** — email/password and OAuth via Supabase, with email verification.

> Graph view, project linking, and knowledge-gap analysis are shown on the landing page but are not yet built — they're on the roadmap.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16.2.4 (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Auth / DB / Storage | Supabase (`@supabase/ssr`) |
| Editor | TipTap v3 + ProseMirror |
| AI | Google Gemini (`gemini-2.5-flash`) over plain `fetch` |
| Icons | Lucide React + Phosphor |
| Emoji | Emoji Mart |

There are **no API routes** — every mutation is a Next.js server action in `actions/`.

## Getting started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com/app/apikey) API key (for flashcards)

### 1. Install

```bash
npm install
```

### 2. Environment variables

Create a `.env.local` in the project root:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
GEMINI_API_KEY=<your-gemini-api-key>
```

### 3. Set up the database

Migrations are **not run automatically**. Open the Supabase Dashboard → **SQL Editor** and run each file in [`supabase/migrations/`](supabase/migrations/) in order. These create the tables, indexes, and Row Level Security policies.

> The core `notes` / `folders` / `tags` / `note_tags` / `notes_version` schema is assumed to already exist in your Supabase project; the `supabase/migrations/` folder currently tracks the newer study-sets + flashcards tables.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
actions/      Server actions ('use server'): notes, folders, tags, auth, ai
app/          App Router
  (auth)/       login, verify-email, auth-error
  (dashboard)/  notes, archive, trash, dashboard, study
  auth/callback Supabase OAuth callback
components/
  auth/         Login + signup modals
  dashboard/    Sidebar, TopBar, SearchModal (Cmd+K), theme toggle
  editor/       TipTapEditor, BubbleMenuBar, bottomBar, extensions
  notes/        NotesPageClient, NoteEditor, NoteCard, sidebar, toolbar, archive/trash views
  study/        GenerateForm, ReviewSession, SetCards
utils/        client.ts (browser supabase), server.ts (server supabase), upload.ts, ai.ts (Gemini)
supabase/migrations/   SQL migrations — run manually in the Supabase SQL Editor
.ai-docs/     Reference notes on specific TipTap extensions / patterns
```

## Database

Postgres on Supabase, with Row Level Security enabled on every table so a user only ever sees their own rows.

- **notes** — `title`, `content` (TipTap JSON), `folder_id`, `pinned`, `archived_at`, `deleted_at`, `is_dump_chunk`, timestamps
- **folders** — self-referencing `parent_id` for nesting
- **tags** — lowercased, hyphenated, unique per user
- **note_tags** — note ↔ tag join (policy joins through `notes.user_id`)
- **notes_version** — content snapshots
- **study_sets** — one AI generation: a `summary` + its flashcards
- **flashcards** — `front` / `back`, linked to a study set

A `purge_old_trash()` SQL function (wired to a daily Supabase cron) deletes notes trashed more than 7 days ago.

## Notes on the codebase

- **TipTap JSON + server actions:** the RSC Flight encoder substitutes `"$T"` for shared attribute objects. Always deep-clone TipTap content (`JSON.parse(JSON.stringify(content))`) **on the client** before passing it to a server action.
- **Gemini calls** live in `utils/ai.ts` and use `responseSchema` + `responseMimeType: 'application/json'`, so the model is forced to return valid JSON — no prose cleanup needed. This file is server-only (it reads `GEMINI_API_KEY`).

---

Built as a learning project with Next.js, React, Supabase, and TipTap.
