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
} from 'lucide-react';
import TipTapEditor from '@/components/editor/TipTapEditor';
import {
	saveNote,
	togglePin,
	archiveNote,
	deleteNote,
	setNoteFolder,
} from '@/actions/notes';
import { tagNoteByName, removeTagFromNote, setTagColor } from '@/actions/tags';
import ConfirmDelete from './ConfirmDelete';
import { TAG_PALETTE, tagChipStyle, DEFAULT_TAG_CLASS } from './tagStyle';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type Tag = { id: string; name: string; color: string | null };
type FolderLite = { id: string; name: string };

type Props = {
	noteId: string;
	initialTitle: string;
	initialContent: JSONContent;
	createdAt: string;
	initialPinned: boolean;
	initialTags: Tag[];
	initialFolder: FolderLite | null;
	allFolders: FolderLite[];
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
		}
	}

	useEffect(() => {
		if (title === initialTitle && content === initialContent) return;
		const timer = setTimeout(() => save(content, false), 3000);
		return () => clearTimeout(timer);

	}, [title, content]);

	useEffect(() => {
		const onHide = () => {
			if (document.visibilityState !== 'hidden') return;
			if (title === initialTitle && content === initialContent) return;
			save(content, false);
		};
		document.addEventListener('visibilitychange', onHide);
		return () => document.removeEventListener('visibilitychange', onHide);

	}, [title, content]);

	const latestRef = useRef({ title, content });

	latestRef.current = { title, content };
	useEffect(() => {
		return () => {
			const { title, content } = latestRef.current;
			if (title === initialTitle && content === initialContent) return;
			const cleaned: JSONContent = JSON.parse(JSON.stringify(content));
			void saveNote(noteId, title, cleaned, { createVersion: false });
		};

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

		setTags((current) => [...current, res.data]);
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

	const tagQuery = tagInputValue.trim().toLowerCase().replace(/\s+/g, '-');
	const tagSuggestions = allTags.filter(
		(at) =>
			!tags.some((t) => t.id === at.id) &&
			(tagQuery === '' || at.name.includes(tagQuery))
	);

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
					onVersionHistory={() => console.log('TODO: open version history')}
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
								{allFolders.length === 0 && (
									<div className="px-3 py-2 text-xs text-muted-foreground">
										You haven&apos;t created any folders yet.
									</div>
								)}
								{allFolders.map((f) => (
									<MenuItem
										key={f.id}
										label={f.name}
										selected={folder?.id === f.id}
										onClick={() => handlePickFolder(f)}
									/>
								))}
							</div>
						</>
					)}
				</div>
			</div>

			<div className="min-w-0">
				<TipTapEditor
					initialContent={initialContent}
					noteId={noteId}
					onChange={setContent}
					onSave={(json) => save(json, true)}
					saveStatus={status}
				/>
			</div>

			<ConfirmDelete
				open={confirmingDelete}
				pending={false}
				onCancel={() => setConfirmingDelete(false)}
				onConfirm={handleConfirmDelete}
			/>
		</div>
	);
}

function NoteActionsMenu({
	pinned,
	onPin,
	onArchive,
	onVersionHistory,
	onDelete,
}: {
	pinned: boolean;
	onPin: () => void;
	onArchive: () => void;
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

function MenuItem({
	label,
	selected,
	onClick,
}: {
	label: string;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs rounded-md hover:bg-sidebar-accent transition-colors text-left"
		>
			{label}
			{selected && <Check className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} />}
		</button>
	);
}
