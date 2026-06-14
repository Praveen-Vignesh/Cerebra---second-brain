'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { JSONContent } from '@tiptap/react';
import {
	Pin,
	Archive,
	Trash2,
	History,
	ChevronDown,
	Tag as TagIcon,
	X,
	Plus,
	Folder,
	Check,
	MoreHorizontal,
	Layers,
	Sparkles,
} from 'lucide-react';
import TipTapEditor from '@/components/editor/TipTapEditor';
import {
	saveNote,
	togglePin,
	archiveNote,
	deleteNote,
	setNoteFolder,
	getNoteVersions,
	restoreNoteVersion,
	type NoteVersion,
} from '@/actions/notes';
import { tagNoteByName, removeTagFromNote, setTagColor } from '@/actions/tags';
import { analyzeNote } from '@/actions/ai';
import type { NoteAnalysis } from '@/utils/ai';
import ConfirmDelete from './ConfirmDelete';
import { TAG_PALETTE, tagChipStyle, DEFAULT_TAG_CLASS } from './tagStyle';
import { useToast } from '@/components/ui/Toast';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type Tag = { id: string; name: string; color: string | null };
type FolderLite = { id: string; name: string };
type FolderOption = { id: string; name: string; parent_id: string | null };

type Props = {
	noteId: string;
	initialTitle: string;
	initialContent: JSONContent;
	createdAt: string;
	initialPinned: boolean;
	initialTags: Tag[];
	initialFolder: FolderLite | null;
	allFolders: FolderOption[];
	allTags: Tag[];
};

export default function NoteEditor({
	noteId,
	initialTitle,
	initialContent,
	createdAt,
	initialPinned,
	initialTags,
	initialFolder,
	allFolders,
	allTags,
}: Props) {
	const router = useRouter();
	const toast = useToast();

	const [title, setTitle] = useState(initialTitle);
	const [content, setContent] = useState<JSONContent>(initialContent);
	const [status, setStatus] = useState<SaveStatus>('idle');

	const [pinned, setPinned] = useState(initialPinned);
	const [tags, setTags] = useState<Tag[]>(initialTags);
	const [folder, setFolder] = useState<FolderLite | null>(initialFolder);

	const [folderMenuOpen, setFolderMenuOpen] = useState(false);
	const [tagInputOpen, setTagInputOpen] = useState(false);
	const [tagInputValue, setTagInputValue] = useState('');
	const [colorPickerFor, setColorPickerFor] = useState<string | null>(null);

	const [confirmingDelete, setConfirmingDelete] = useState(false);

	// AI Analyze: results shown in a slide-over panel (ephemeral, not saved).
	const [analysis, setAnalysis] = useState<NoteAnalysis | null>(null);
	const [analyzing, setAnalyzing] = useState(false);
	const [analysisError, setAnalysisError] = useState<string | null>(null);
	const [analysisOpen, setAnalysisOpen] = useState(false);

	// Version history: slide-over panel listing saved snapshots, with Restore.
	const [versionsOpen, setVersionsOpen] = useState(false);
	const [versions, setVersions] = useState<NoteVersion[]>([]);
	const [versionsLoading, setVersionsLoading] = useState(false);
	const [versionsError, setVersionsError] = useState<string | null>(null);
	const [restoringId, setRestoringId] = useState<string | null>(null);

	// Bumped to force the editor to remount with fresh content after a restore
	// (the editor only seeds its content on mount).
	const [editorKey, setEditorKey] = useState(0);

	async function save(contentToSave: JSONContent, createVersion: boolean) {
		setStatus('saving');

		const cleanedContent: JSONContent = JSON.parse(JSON.stringify(content));
		const result = await saveNote(noteId, title, cleanedContent, { createVersion });
		if (result.ok) {
			setStatus('saved');
			setTimeout(() => setStatus('idle'), 2000);
		} else {
			setStatus('error');
			console.error('saveNote failed:', result.error);
			toast.error("Couldn't save your note. Your changes are still here — try again.");
		}
	}

	useEffect(() => {
		if (title === initialTitle && content === initialContent) return;
		const timer = setTimeout(() => save(content, false), 3000);
		return () => clearTimeout(timer);
		// Intentionally only re-run on title/content; adding save/initial* would loop.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [title, content]);

	useEffect(() => {
		const onHide = () => {
			if (document.visibilityState !== 'hidden') return;
			if (title === initialTitle && content === initialContent) return;
			save(content, false);
		};
		document.addEventListener('visibilitychange', onHide);
		return () => document.removeEventListener('visibilitychange', onHide);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [title, content]);

	const latestRef = useRef({ title, content });

	// Keep the ref fresh after each commit (the unmount effect below reads it).
	useEffect(() => {
		latestRef.current = { title, content };
	});

	useEffect(() => {
		return () => {
			const { title, content } = latestRef.current;
			if (title === initialTitle && content === initialContent) return;
			const cleaned: JSONContent = JSON.parse(JSON.stringify(content));
			void saveNote(noteId, title, cleaned, { createVersion: false });
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function handlePin() {
		const next = !pinned;
		setPinned(next);
		const res = await togglePin(noteId);
		if (!res.ok) {
			console.error('togglePin failed:', res.error);
			setPinned(!next);
		}
	}

	async function handleArchive() {
		const res = await archiveNote(noteId);
		if (!res.ok) {
			console.error('archiveNote failed:', res.error);
			return;
		}

		router.push('/notes');
	}

	async function handleConfirmDelete() {
		const res = await deleteNote(noteId);
		if (!res.ok) {
			console.error('deleteNote failed:', res.error);
			return;
		}
		setConfirmingDelete(false);
		router.push('/notes');
	}

	async function handlePickFolder(next: FolderLite | null) {
		setFolder(next);
		setFolderMenuOpen(false);
		const res = await setNoteFolder(noteId, next?.id ?? null);
		if (!res.ok) {
			console.error('setNoteFolder failed:', res.error);
			setFolder(folder);
		}
	}

	async function handleAddTag(rawName: string) {
		const trimmed = rawName.trim();
		setTagInputValue('');
		setTagInputOpen(false);
		if (!trimmed) return;

		const normalized = trimmed.toLowerCase().replace(/\s+/g, '-');
		if (tags.some((t) => t.name === normalized)) return;

		const res = await tagNoteByName(noteId, trimmed);
		if (!res.ok) {
			console.error('tagNoteByName failed:', res.error);
			return;
		}

		// Dedupe by id: a quick Enter can fire this twice (keydown + the blur that
		// follows closing the input), and tagNoteByName returns the same tag both
		// times. Without this guard the tag gets appended twice → duplicate React key.
		setTags((current) =>
			current.some((t) => t.id === res.data.id) ? current : [...current, res.data]
		);
	}

	async function handleRemoveTag(tag: Tag) {
		const snapshot = tags;
		setTags((current) => current.filter((t) => t.id !== tag.id));
		const res = await removeTagFromNote(noteId, tag.id);
		if (!res.ok) {
			console.error('removeTagFromNote failed:', res.error);
			setTags(snapshot);
		}
	}

	async function handleSetColor(tag: Tag, color: string | null) {
		setColorPickerFor(null);
		setTags((current) =>
			current.map((t) => (t.id === tag.id ? { ...t, color } : t))
		);
		const res = await setTagColor(tag.id, color);
		if (!res.ok) console.error('setTagColor failed:', res.error);
	}

	// Called by the editor's "AI Analyze" button with the note's plain text.
	async function handleAiAnalysis(content: string) {
		setAnalysisOpen(true);
		setAnalyzing(true);
		setAnalysisError(null);
		setAnalysis(null);
		const res = await analyzeNote(content);
		if (res.ok) setAnalysis(res.data);
		else setAnalysisError(res.error);
		setAnalyzing(false);
	}

	async function openVersionHistory() {
		setVersionsOpen(true);
		setVersionsLoading(true);
		setVersionsError(null);
		const res = await getNoteVersions(noteId);
		if (res.ok) setVersions(res.data);
		else setVersionsError(res.error);
		setVersionsLoading(false);
	}

	async function handleRestore(versionId: string) {
		setRestoringId(versionId);
		const res = await restoreNoteVersion(noteId, versionId);
		setRestoringId(null);
		if (!res.ok) {
			toast.error(res.error || "Couldn't restore that version.");
			return;
		}
		// Re-seed the editor with the restored content and close the panel.
		setContent(res.data.content);
		setEditorKey((k) => k + 1);
		setVersionsOpen(false);
		toast.success('Restored an earlier version.');
	}

	const tagQuery = tagInputValue.trim().toLowerCase().replace(/\s+/g, '-');
	const tagSuggestions = allTags.filter(
		(at) =>
			!tags.some((t) => t.id === at.id) &&
			(tagQuery === '' || at.name.includes(tagQuery))
	);

	const folderTree = orderedFolders(allFolders);

	const prettyCreatedAt = new Date(createdAt).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});

	return (
		<div className="cerebra-note-page max-w-6xl mx-auto px-6 py-6">

			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3 text-xs text-muted-foreground">
					<SaveStatusPill status={status} />
					<span>Created {prettyCreatedAt}</span>
				</div>

				<NoteActionsMenu
					pinned={pinned}
					onPin={handlePin}
					onArchive={handleArchive}
					onGenerateFlashcards={() => router.push(`/study/new?note=${noteId}`)}
					onVersionHistory={openVersionHistory}
					onDelete={() => setConfirmingDelete(true)}
				/>
			</div>

			<input
				type="text"
				className="cerebra-note-title w-full bg-transparent border-0 outline-none text-3xl font-semibold text-foreground mb-3 placeholder:text-muted-foreground"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Untitled"
			/>

			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 mb-6">

				<div className="flex items-center gap-1.5 flex-wrap">
					<TagIcon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />

					{tags.map((t) => (
						<span
							key={t.id}
							style={tagChipStyle(t.color)}
							className={`group relative flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${
								t.color ? '' : DEFAULT_TAG_CLASS
							}`}
						>
							<button
								type="button"
								onClick={() =>
									setColorPickerFor(colorPickerFor === t.id ? null : t.id)
								}
								className="cursor-pointer"
								title="Change colour"
							>
								{t.name}
							</button>
							<button
								type="button"
								onClick={() => handleRemoveTag(t)}
								aria-label={`Remove ${t.name}`}
								className="opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<X className="h-3 w-3" strokeWidth={2} />
							</button>

							{colorPickerFor === t.id && (
								<ColorPopover
									current={t.color}
									onPick={(color) => handleSetColor(t, color)}
									onClose={() => setColorPickerFor(null)}
								/>
							)}
						</span>
					))}

					{tagInputOpen ? (
						<div className="relative">
							<input
								type="text"
								autoFocus
								value={tagInputValue}
								onChange={(e) => setTagInputValue(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') handleAddTag(tagInputValue);
									if (e.key === 'Escape') {
										setTagInputValue('');
										setTagInputOpen(false);
									}
								}}
								onBlur={() => {

									if (tagInputValue.trim()) handleAddTag(tagInputValue);
									else setTagInputOpen(false);
								}}
								placeholder="tag name"
								className="text-[11px] bg-card border border-border rounded px-1.5 py-0.5 outline-none focus:border-accent/30 w-28"
							/>
							{tagSuggestions.length > 0 && (
								<div className="absolute left-0 top-full z-20 mt-1 min-w-40 bg-card border border-border rounded-lg shadow-lg p-1 max-h-48 overflow-y-auto">
									{tagSuggestions.map((s) => (
										<button
											key={s.id}
											type="button"
											onMouseDown={(e) => e.preventDefault()}
											onClick={() => handleAddTag(s.name)}
											className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md hover:bg-sidebar-accent transition-colors text-left"
										>
											<span
												className={`h-2 w-2 rounded-full shrink-0 ${
													s.color ? '' : 'bg-muted-foreground/40'
												}`}
												style={s.color ? { backgroundColor: s.color } : undefined}
											/>
											<span className="truncate">{s.name}</span>
										</button>
									))}
								</div>
							)}
						</div>
					) : (
						<button
							type="button"
							onClick={() => setTagInputOpen(true)}
							className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-1.5 py-0.5"
						>
							<Plus className="h-3 w-3" strokeWidth={2} />
							Add tag
						</button>
					)}
				</div>

				<div className="relative">
					<button
						type="button"
						onClick={() => setFolderMenuOpen(!folderMenuOpen)}
						className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-border bg-card text-foreground hover:border-accent/30 transition-colors"
					>
						<Folder className="h-3.5 w-3.5" strokeWidth={1.75} />
						{folder?.name ?? 'No folder'}
						<ChevronDown className="h-3 w-3 opacity-60" />
					</button>
					{folderMenuOpen && (
						<>

							<div
								className="fixed inset-0 z-10"
								onClick={() => setFolderMenuOpen(false)}
							/>
							<div className="absolute right-0 z-20 mt-1.5 min-w-45 bg-card border border-border rounded-lg shadow-lg p-1 max-h-72 overflow-y-auto">
								<MenuItem
									label="No folder"
									selected={folder === null}
									onClick={() => handlePickFolder(null)}
								/>
								{folderTree.length === 0 && (
									<div className="px-3 py-2 text-xs text-muted-foreground">
										You haven&apos;t created any folders yet.
									</div>
								)}
								{folderTree.map((f) => (
									<MenuItem
										key={f.id}
										label={f.name}
										depth={f.depth}
										folderIcon
										selected={folder?.id === f.id}
										onClick={() => handlePickFolder({ id: f.id, name: f.name })}
									/>
								))}
							</div>
						</>
					)}
				</div>
			</div>

			<div className="min-w-0">
				<TipTapEditor
					key={editorKey}
					initialContent={content}
					noteId={noteId}
					onChange={setContent}
					onSave={(json) => save(json, true)}
					saveStatus={status}
					onAiAnalysis={handleAiAnalysis}
				/>
			</div>

			<ConfirmDelete
				open={confirmingDelete}
				pending={false}
				onCancel={() => setConfirmingDelete(false)}
				onConfirm={handleConfirmDelete}
			/>

			<AnalysisPanel
				open={analysisOpen}
				loading={analyzing}
				error={analysisError}
				analysis={analysis}
				onClose={() => setAnalysisOpen(false)}
			/>

			<VersionHistoryPanel
				open={versionsOpen}
				loading={versionsLoading}
				error={versionsError}
				versions={versions}
				restoringId={restoringId}
				onRestore={handleRestore}
				onClose={() => setVersionsOpen(false)}
			/>
		</div>
	);
}

function NoteActionsMenu({
	pinned,
	onPin,
	onArchive,
	onGenerateFlashcards,
	onVersionHistory,
	onDelete,
}: {
	pinned: boolean;
	onPin: () => void;
	onArchive: () => void;
	onGenerateFlashcards: () => void;
	onVersionHistory: () => void;
	onDelete: () => void;
}) {
	const [open, setOpen] = useState(false);

	const run = (fn: () => void) => () => {
		setOpen(false);
		fn();
	};

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				aria-label="Note actions"
				className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
			>
				<MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
			</button>
			{open && (
				<>
					<div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
					<div className="absolute right-0 z-20 mt-1.5 min-w-44 bg-card border border-border rounded-lg shadow-lg p-1">
						<ActionMenuItem
							icon={
								<Pin
									className="h-3.5 w-3.5"
									strokeWidth={1.75}
									fill={pinned ? 'currentColor' : 'none'}
								/>
							}
							label={pinned ? 'Unpin' : 'Pin'}
							onClick={run(onPin)}
						/>
						<ActionMenuItem
							icon={<Archive className="h-3.5 w-3.5" strokeWidth={1.75} />}
							label="Archive"
							onClick={run(onArchive)}
						/>
						<ActionMenuItem
							icon={<Layers className="h-3.5 w-3.5" strokeWidth={1.75} />}
							label="Generate study materials"
							onClick={run(onGenerateFlashcards)}
						/>
						<ActionMenuItem
							icon={<History className="h-3.5 w-3.5" strokeWidth={1.75} />}
							label="Version history"
							onClick={run(onVersionHistory)}
						/>
						<ActionMenuItem
							icon={<Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />}
							label="Delete"
							danger
							onClick={run(onDelete)}
						/>
					</div>
				</>
			)}
		</div>
	);
}

function ActionMenuItem({
	icon,
	label,
	onClick,
	danger,
}: {
	icon: React.ReactNode;
	label: string;
	onClick: () => void;
	danger?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md transition-colors text-left ${
				danger
					? 'text-red-500 hover:bg-red-500/10'
					: 'text-foreground hover:bg-sidebar-accent'
			}`}
		>
			{icon}
			{label}
		</button>
	);
}

function ColorPopover({
	current,
	onPick,
	onClose,
}: {
	current: string | null;
	onPick: (color: string | null) => void;
	onClose: () => void;
}) {
	return (
		<>
			<div className="fixed inset-0 z-10" onClick={onClose} />
			<div className="absolute left-0 top-full z-20 mt-1 bg-card border border-border rounded-lg shadow-lg p-2">
				<div className="grid grid-cols-4 gap-1.5">
					{TAG_PALETTE.map((hex) => (
						<button
							key={hex}
							type="button"
							onClick={() => onPick(hex)}
							style={{ backgroundColor: hex }}
							className={`h-5 w-5 rounded-full transition-transform hover:scale-110 ${
								current === hex ? 'ring-2 ring-offset-1 ring-offset-card ring-foreground/40' : ''
							}`}
						/>
					))}
				</div>
				<button
					type="button"
					onClick={() => onPick(null)}
					className="mt-2 w-full text-[11px] text-muted-foreground hover:text-foreground text-center"
				>
					Clear colour
				</button>
			</div>
		</>
	);
}

function SaveStatusPill({ status }: { status: SaveStatus }) {
	if (status === 'idle') return null;
	const label =
		status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Save failed';
	const colour =
		status === 'error'
			? 'text-red-500'
			: status === 'saving'
			? 'text-muted-foreground'
			: 'text-accent';
	return <span className={`text-xs ${colour}`}>{label}</span>;
}

// Slide-over panel showing the four-lens AI analysis of the note.
function AnalysisPanel({
	open,
	loading,
	error,
	analysis,
	onClose,
}: {
	open: boolean;
	loading: boolean;
	error: string | null;
	analysis: NoteAnalysis | null;
	onClose: () => void;
}) {
	if (!open) return null;
	return (
		<>
			<div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
			<div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-card border-l border-border shadow-2xl">
				<div className="flex items-center justify-between border-b border-border px-5 py-4">
					<div className="flex items-center gap-2">
						<Sparkles className="h-4 w-4 text-accent" strokeWidth={1.75} />
						<h2 className="text-sm font-semibold text-foreground">AI analysis</h2>
					</div>
					<button
						onClick={onClose}
						aria-label="Close"
						className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
					>
						<X className="h-4 w-4" strokeWidth={1.75} />
					</button>
				</div>

				<div className="space-y-6 px-5 py-5">
					{loading && <p className="text-sm text-muted-foreground">Analysing your note…</p>}
					{error && <p className="text-sm text-red-500">{error}</p>}
					{analysis && (
						<>
							<AnalysisSection title="Knowledge gaps" items={analysis.knowledgeGaps} />
							<AnalysisSection title="Suggested improvements" items={analysis.improvements} />
							<AnalysisSection title="Test yourself" items={analysis.selfTestQuestions} />
							<AnalysisSection title="Related concepts" items={analysis.relatedConcepts} />
						</>
					)}
				</div>
			</div>
		</>
	);
}

function AnalysisSection({ title, items }: { title: string; items: string[] }) {
	if (!items || items.length === 0) return null;
	return (
		<section>
			<h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				{title}
			</h3>
			<ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
				{items.map((it, i) => (
					<li key={i}>{it}</li>
				))}
			</ul>
		</section>
	);
}

// Slide-over panel listing the note's saved snapshots, each with a Restore button.
function VersionHistoryPanel({
	open,
	loading,
	error,
	versions,
	restoringId,
	onRestore,
	onClose,
}: {
	open: boolean;
	loading: boolean;
	error: string | null;
	versions: NoteVersion[];
	restoringId: string | null;
	onRestore: (versionId: string) => void;
	onClose: () => void;
}) {
	if (!open) return null;
	return (
		<>
			<div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
			<div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-card border-l border-border shadow-2xl">
				<div className="flex items-center justify-between border-b border-border px-5 py-4">
					<div className="flex items-center gap-2">
						<History className="h-4 w-4 text-accent" strokeWidth={1.75} />
						<h2 className="text-sm font-semibold text-foreground">Version history</h2>
					</div>
					<button
						onClick={onClose}
						aria-label="Close"
						className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
					>
						<X className="h-4 w-4" strokeWidth={1.75} />
					</button>
				</div>

				<div className="px-5 py-5">
					{loading && <p className="text-sm text-muted-foreground">Loading versions…</p>}
					{error && <p className="text-sm text-red-500">{error}</p>}
					{!loading && !error && versions.length === 0 && (
						<p className="text-sm text-muted-foreground">
							No saved versions yet. A snapshot is kept each time you hit Save in the editor.
						</p>
					)}
					{!loading && !error && versions.length > 0 && (
						<ul className="space-y-2">
							{versions.map((v) => (
								<li
									key={v.id}
									className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
								>
									<span className="min-w-0 text-sm text-foreground">
										{prettyTimestamp(v.created_at)}
									</span>
									<button
										type="button"
										onClick={() => onRestore(v.id)}
										disabled={restoringId !== null}
										className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-sidebar-accent disabled:opacity-50"
									>
										{restoringId === v.id ? 'Restoring…' : 'Restore'}
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</>
	);
}

function prettyTimestamp(iso: string): string {
	return new Date(iso).toLocaleString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	});
}

function MenuItem({
	label,
	selected,
	onClick,
	depth = 0,
	folderIcon = false,
}: {
	label: string;
	selected: boolean;
	onClick: () => void;
	depth?: number;
	folderIcon?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			style={depth ? { paddingLeft: `${10 + depth * 14}px` } : undefined}
			className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs rounded-md hover:bg-sidebar-accent transition-colors text-left"
		>
			<span className="flex items-center gap-1.5 min-w-0">
				{folderIcon && (
					<Folder
						className="h-3 w-3 shrink-0 text-muted-foreground"
						strokeWidth={1.75}
					/>
				)}
				<span className="truncate">{label}</span>
			</span>
			{selected && <Check className="h-3.5 w-3.5 text-accent shrink-0" strokeWidth={2.5} />}
		</button>
	);
}

// Flatten the folder list into directory order (each folder directly under its
// parent), tagging each with a depth so the picker can indent it. Folders whose
// parent isn't in the list are treated as roots.
function orderedFolders(
	folders: FolderOption[]
): { id: string; name: string; depth: number }[] {
	const ids = new Set(folders.map((f) => f.id));
	const byParent = new Map<string | null, FolderOption[]>();
	for (const f of folders) {
		const key = f.parent_id && ids.has(f.parent_id) ? f.parent_id : null;
		const list = byParent.get(key) ?? [];
		list.push(f);
		byParent.set(key, list);
	}
	for (const list of byParent.values()) {
		list.sort((a, b) => a.name.localeCompare(b.name));
	}

	const result: { id: string; name: string; depth: number }[] = [];
	const walk = (parentId: string | null, depth: number) => {
		for (const f of byParent.get(parentId) ?? []) {
			result.push({ id: f.id, name: f.name, depth });
			walk(f.id, depth + 1);
		}
	};
	walk(null, 0);
	return result;
}
