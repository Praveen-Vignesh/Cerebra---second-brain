// Shared tag colour palette + chip styling.
// Tags store a hex string (or null for the default accent look). We build the
// chip background/border with color-mix so any stored hex works without needing
// Tailwind to have pre-generated the class (dynamic classes get purged).

export const TAG_PALETTE = [
	'#ef4444', // red
	'#f97316', // orange
	'#eab308', // yellow
	'#22c55e', // green
	'#14b8a6', // teal
	'#3b82f6', // blue
	'#8b5cf6', // violet
	'#ec4899', // pink
] as const;

// Classes used when a tag has no colour set yet.
export const DEFAULT_TAG_CLASS = 'bg-accent/10 text-accent border-accent/15';

// Inline style for a coloured chip. Returns undefined when there's no colour,
// so the caller can fall back to DEFAULT_TAG_CLASS instead.
export function tagChipStyle(color: string | null | undefined): React.CSSProperties | undefined {
	if (!color) return undefined;
	return {
		color,
		backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
		borderColor: `color-mix(in srgb, ${color} 25%, transparent)`,
	};
}
