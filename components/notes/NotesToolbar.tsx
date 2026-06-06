'use client';

import { useState } from 'react';
import {
	ArrowUpDown,
	Tag,
	CalendarRange,
	Star,
	LayoutGrid,
	List,
	ChevronDown,
	Check,
} from 'lucide-react';

export type ViewMode = 'grid' | 'list';
export type SortKey = 'updated' | 'created' | 'title';
export type DateFilter = 'All time' | 'Today' | 'This week' | 'This month';

const SORT_LABELS: Record<SortKey, string> = {
	updated: 'Recently updated',
	created: 'Recently created',
	title: 'Title (A → Z)',
};

const DATE_OPTIONS: DateFilter[] = ['All time', 'Today', 'This week', 'This month'];

type Props = {
	view: ViewMode;
	onViewChange: (v: ViewMode) => void;
	sort: SortKey;
	onSortChange: (s: SortKey) => void;
	tags: string[];
	tagColors: Record<string, string | null>;
	activeTags: string[];
	onTagsChange: (t: string[]) => void;
	dateFilter: DateFilter;
	onDateChange: (d: DateFilter) => void;
	pinnedOnly: boolean;
	onPinnedToggle: () => void;
};

export default function NotesToolbar({
	view,
	onViewChange,
	sort,
	onSortChange,
	tags,
	tagColors,
	activeTags,
	onTagsChange,
	dateFilter,
	onDateChange,
	pinnedOnly,
	onPinnedToggle,
}: Props) {
	const [open, setOpen] = useState<'sort' | 'tags' | 'date' | null>(null);

	const toggleTag = (t: string) => {
		if (activeTags.includes(t)) onTagsChange(activeTags.filter((x) => x !== t));
		else onTagsChange([...activeTags, t]);
	};

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 mb-6">

			<div className="flex flex-wrap items-center gap-2">

				<div className="relative">
					<button
						type="button"
						onClick={() => setOpen(open === 'tags' ? null : 'tags')}
						className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors ${
							activeTags.length
								? 'bg-accent/10 text-accent border-accent/30'
								: 'bg-card text-foreground border-border hover:border-accent/30'
						}`}
					>
						<Tag className="h-3.5 w-3.5" strokeWidth={1.75} />
						{activeTags.length ? `Tags · ${activeTags.length}` : 'Tags'}
						<ChevronDown className="h-3 w-3 opacity-60" />
					</button>
					{open === 'tags' && (
						<Dropdown onClose={() => setOpen(null)}>
							<div className="px-2 py-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
								Filter by tag
							</div>
							{tags.length === 0 ? (
								<div className="px-3 py-2 text-xs text-muted-foreground">
									No tags yet
								</div>
							) : (
								tags.map((t) => (
									<MenuItem
										key={t}
										label={t}
										color={tagColors[t]}
										selected={activeTags.includes(t)}
										onClick={() => toggleTag(t)}
									/>
								))
							)}
						</Dropdown>
					)}
				</div>

				<div className="relative">
					<button
						type="button"
						onClick={() => setOpen(open === 'date' ? null : 'date')}
						className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors ${
							dateFilter !== 'All time'
								? 'bg-accent/10 text-accent border-accent/30'
								: 'bg-card text-foreground border-border hover:border-accent/30'
						}`}
					>
						<CalendarRange className="h-3.5 w-3.5" strokeWidth={1.75} />
						{dateFilter}
						<ChevronDown className="h-3 w-3 opacity-60" />
					</button>
					{open === 'date' && (
						<Dropdown onClose={() => setOpen(null)}>
							{DATE_OPTIONS.map((d) => (
								<MenuItem
									key={d}
									label={d}
									selected={dateFilter === d}
									onClick={() => {
										onDateChange(d);
										setOpen(null);
									}}
								/>
							))}
						</Dropdown>
					)}
				</div>

				<button
					type="button"
					onClick={onPinnedToggle}
					className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors ${
						pinnedOnly
							? 'bg-accent/10 text-accent border-accent/30'
							: 'bg-card text-muted-foreground border-border hover:border-accent/30 hover:text-foreground'
					}`}
				>
					<Star
						className="h-3.5 w-3.5"
						strokeWidth={1.75}
						fill={pinnedOnly ? 'currentColor' : 'none'}
					/>
					Pinned
				</button>
			</div>

			<div className="flex items-center gap-2">
				<div className="relative">
					<button
						type="button"
						onClick={() => setOpen(open === 'sort' ? null : 'sort')}
						className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-border bg-card text-foreground hover:border-accent/30 transition-colors"
					>
						<ArrowUpDown className="h-3.5 w-3.5" strokeWidth={1.75} />
						{SORT_LABELS[sort]}
						<ChevronDown className="h-3 w-3 opacity-60" />
					</button>
					{open === 'sort' && (
						<Dropdown onClose={() => setOpen(null)} align="right">
							{(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
								<MenuItem
									key={k}
									label={SORT_LABELS[k]}
									selected={sort === k}
									onClick={() => {
										onSortChange(k);
										setOpen(null);
									}}
								/>
							))}
						</Dropdown>
					)}
				</div>

				<div className="flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-card">
					<ViewBtn
						active={view === 'grid'}
						onClick={() => onViewChange('grid')}
						label="Grid"
					>
						<LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.75} />
					</ViewBtn>
					<ViewBtn
						active={view === 'list'}
						onClick={() => onViewChange('list')}
						label="List"
					>
						<List className="h-3.5 w-3.5" strokeWidth={1.75} />
					</ViewBtn>
				</div>
			</div>
		</div>
	);
}

function Dropdown({
	children,
	onClose,
	align = 'left',
}: {
	children: React.ReactNode;
	onClose: () => void;
	align?: 'left' | 'right';
}) {
	return (
		<>
			<div className="fixed inset-0 z-10" onClick={onClose} />
			<div
				className={`absolute z-20 mt-1.5 min-w-45 bg-card border border-border rounded-lg shadow-lg p-1 ${
					align === 'right' ? 'right-0' : 'left-0'
				}`}
			>
				{children}
			</div>
		</>
	);
}

function MenuItem({
	label,
	selected,
	onClick,
	color,
}: {
	label: string;
	selected: boolean;
	onClick: () => void;
	color?: string | null;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs rounded-md hover:bg-sidebar-accent transition-colors"
		>
			<span className="flex items-center gap-1.5 min-w-0">
				{color !== undefined && (
					<span
						className={`h-2 w-2 rounded-full shrink-0 ${color ? '' : 'bg-muted-foreground/40'}`}
						style={color ? { backgroundColor: color } : undefined}
					/>
				)}
				<span className="truncate">{label}</span>
			</span>
			{selected && <Check className="h-3.5 w-3.5 text-accent shrink-0" strokeWidth={2.5} />}
		</button>
	);
}

function ViewBtn({
	active,
	onClick,
	label,
	children,
}: {
	active: boolean;
	onClick: () => void;
	label: string;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			title={label}
			className={`px-2 py-1 rounded text-xs transition-colors ${
				active
					? 'bg-accent/10 text-accent'
					: 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
			}`}
		>
			{children}
		</button>
	);
}
