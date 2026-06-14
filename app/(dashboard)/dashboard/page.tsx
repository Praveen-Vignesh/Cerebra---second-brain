import Link from 'next/link'
import { FileText, GraduationCap, ArrowRight, Layers, Flame } from 'lucide-react'
import { createClient } from '@/utils/server'
import { listStudySets } from '@/actions/flashcards'
import { timeAgo } from '@/components/notes/timeAgo'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

type RecentNote = { id: string; title: string | null; updated_at: string }

// Dashboard: a greeting, a few real stats, recent notes, and quick links.
export default async function DashboardPage() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()
	const name =
		user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'

	// Live notes only (not archived, not trashed).
	const liveNotes = supabase
		.from('notes')
		.select('id', { count: 'exact', head: true })
		.eq('user_id', user?.id ?? '')
		.is('deleted_at', null)
		.is('archived_at', null)

	const recentNotes = supabase
		.from('notes')
		.select('id, title, updated_at')
		.eq('user_id', user?.id ?? '')
		.is('deleted_at', null)
		.is('archived_at', null)
		.order('updated_at', { ascending: false })
		.limit(5)

	// Run the two note queries and the study-set summary in parallel.
	const [{ count: noteCount }, { data: recent }, studyResult] = await Promise.all([
		liveNotes,
		recentNotes,
		listStudySets(),
	])

	const setCount = studyResult.ok ? studyResult.data.sets.length : 0
	const totalDue = studyResult.ok ? studyResult.data.totalDue : 0

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-foreground">Welcome back, {name}</h1>
				<p className="mt-1 text-muted-foreground">Jump back into your second brain.</p>
			</div>

			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
				<Stat
					icon={<FileText className="h-4 w-4" strokeWidth={1.75} />}
					label="Notes"
					value={noteCount ?? 0}
					href="/notes"
				/>
				<Stat
					icon={<Layers className="h-4 w-4" strokeWidth={1.75} />}
					label="Study sets"
					value={setCount}
					href="/study"
				/>
				<Stat
					icon={<Flame className="h-4 w-4" strokeWidth={1.75} />}
					label="Due today"
					value={totalDue}
					href={totalDue > 0 ? '/study/review' : '/study'}
					highlight={totalDue > 0}
				/>
			</div>

			{recent && recent.length > 0 && (
				<div>
					<div className="mb-2 flex items-center justify-between">
						<h2 className="text-sm font-semibold text-foreground">Recent notes</h2>
						<Link
							href="/notes"
							className="text-xs text-muted-foreground transition-colors hover:text-foreground"
						>
							View all
						</Link>
					</div>
					<div className="divide-y divide-border rounded-xl border border-border bg-card">
						{(recent as RecentNote[]).map((note) => (
							<Link
								key={note.id}
								href={`/notes/${note.id}`}
								className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-accent/5"
							>
								<span className="min-w-0 flex-1 truncate text-sm text-foreground">
									{note.title || 'Untitled'}
								</span>
								<span className="shrink-0 text-xs text-muted-foreground">
									{timeAgo(note.updated_at)}
								</span>
							</Link>
						))}
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<QuickLink
					href="/notes"
					icon={<FileText className="h-5 w-5" strokeWidth={1.75} />}
					title="Notes"
					description="Capture and organize what you know."
				/>
				<QuickLink
					href="/study"
					icon={<GraduationCap className="h-5 w-5" strokeWidth={1.75} />}
					title="Study"
					description="Turn your notes into flashcards, quizzes, and spaced review."
				/>
			</div>
		</div>
	)
}

function Stat({
	icon,
	label,
	value,
	href,
	highlight,
}: {
	icon: React.ReactNode
	label: string
	value: number
	href: string
	highlight?: boolean
}) {
	return (
		<Link
			href={href}
			className={`rounded-xl border bg-card p-4 transition-colors hover:border-accent/30 ${
				highlight ? 'border-accent/40' : 'border-border'
			}`}
		>
			<div className="flex items-center gap-1.5 text-muted-foreground">
				<span className={highlight ? 'text-accent' : ''}>{icon}</span>
				<span className="text-xs">{label}</span>
			</div>
			<div className={`mt-1 text-2xl font-bold ${highlight ? 'text-accent' : 'text-foreground'}`}>
				{value}
			</div>
		</Link>
	)
}

function QuickLink({
	href,
	icon,
	title,
	description,
}: {
	href: string
	icon: React.ReactNode
	title: string
	description: string
}) {
	return (
		<Link
			href={href}
			className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/30"
		>
			<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
				{icon}
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<h2 className="text-sm font-semibold text-foreground">{title}</h2>
					<ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
				</div>
				<p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
			</div>
		</Link>
	)
}
