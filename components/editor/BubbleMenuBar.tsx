'use client';

import React from 'react';
import { type Editor } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/react/menus';
import {
	Bold,
	Italic,
	Strikethrough,
	Code,
	X,
	AlignLeft,
	AlignCenter,
	AlignRight,
	List,
	ListOrdered,
	Palette,
	Type,
	Underline,
	Quote,
	ChevronRight,
} from 'lucide-react';

type Props = {
	editor: Editor;
	isDark: boolean;
};

const HIGHLIGHT_COLORS = {
	light: [
		{ name: 'yellow', value: '#fef08a', label: 'Yellow' },
		{ name: 'green', value: '#bbf7d0', label: 'Green' },
		{ name: 'blue', value: '#bfdbfe', label: 'Blue' },
		{ name: 'red', value: '#fecaca', label: 'Red' },
		{ name: 'orange', value: '#fed7aa', label: 'Orange' },
	],
	dark: [
		{ name: 'yellow', value: '#b45309', label: 'Yellow' },
		{ name: 'green', value: '#15803d', label: 'Green' },
		{ name: 'blue', value: '#1d4ed8', label: 'Blue' },
		{ name: 'red', value: '#b91c1c', label: 'Red' },
		{ name: 'orange', value: '#c2410c', label: 'Orange' },
	],
};

const FONT_FAMILIES = ['Inter', 'Arial', 'Times New Roman', 'Courier New', 'Georgia'];
const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '30px'];

export default function CustomBubbleMenu({ editor, isDark }: Props) {
	if (!editor) return null;

	const colors = isDark ? HIGHLIGHT_COLORS.dark : HIGHLIGHT_COLORS.light;
	const hasHighlight = editor.isActive('highlight');

	const currentColor = editor.getAttributes('textStyle').color || '#000000';
	const currentFontFamily = editor.getAttributes('textStyle').fontFamily || '';
	const currentFontSize = editor.getAttributes('textStyle').fontSize || '';

	const btn = (active: boolean) => `cerebra-bubble-btn${active ? ' is-active' : ''}`;

	return (
		<BubbleMenu
			editor={editor}
			options={{
				placement: 'bottom',
				offset: 10,
				strategy: 'fixed',
				flip: {
					padding: 12,
					// Tell the menu not to flip outside the actual editor box
					boundary: editor.view.dom as HTMLElement,
					fallbackPlacements: ['top'],
				},
				shift: {
					padding: 12,
					// Tell the menu not to slide underneath your sidebar
					boundary: editor.view.dom as HTMLElement,
				},
			}}
		>
			<div className="cerebra-bubble-menu">
				{/* ── ROW 1: Formatting, Alignment, & Lists ── */}
				<div className="cerebra-bubble-row">
					<button
						onClick={() => editor.chain().focus().toggleBold().run()}
						className={btn(editor.isActive('bold'))}
						title="Bold"
						type="button"
					>
						<Bold size={16} />
					</button>
					<button
						onClick={() => editor.chain().focus().toggleItalic().run()}
						className={btn(editor.isActive('italic'))}
						title="Italic"
						type="button"
					>
						<Italic size={16} />
					</button>
					<button
						onClick={() => editor.chain().focus().toggleStrike().run()}
						className={btn(editor.isActive('strike'))}
						title="Strikethrough"
						type="button"
					>
						<Strikethrough size={16} />
					</button>

					<button
						onClick={() => editor.chain().focus().toggleUnderline().run()}
						className={btn(editor.isActive('underline'))}
						title="Underline"
						type="button"
					>
						<Underline size={16} />
					</button>

					<button
						onClick={() => editor.chain().focus().toggleCode().run()}
						className={btn(editor.isActive('code'))}
						title="Code"
						type="button"
					>
						<Code size={16} />
					</button>

					<button
						onClick={() => editor.chain().focus().setBlockquote().run()}
						className={btn(editor.isActive('blockquote'))}
						title="Blockquote"
						type="button"
					>
						<Quote size={16} />
					</button>

					<button
						onClick={() => editor.chain().focus().setDetails().run()}
						className={btn(editor.isActive('details'))}
						title="Set Detail"
						type="button"
					>
						<ChevronRight size={16} />
					</button>

					<button
						className={btn(editor.isActive('subscript'))}
						type="button"
						onClick={() => {
							editor.chain().focus().toggleSubscript().run();
						}}
						title="Subscript"
					>
						<span className="cerebra-bubble-script">
							X<sub>2</sub>
						</span>
					</button>

					<button
						className={btn(editor.isActive('superscript'))}
						type="button"
						onClick={() => {
							editor.chain().focus().toggleSuperscript().run();
						}}
						title="Superscript"
					>
						<span className="cerebra-bubble-script">
							X<sup>2</sup>
						</span>
					</button>

					<div className="cerebra-bubble-divider" />

					<button
						onClick={() => editor.chain().focus().setTextAlign('left').run()}
						className={btn(editor.isActive({ textAlign: 'left' }))}
						title="Align Left"
						type="button"
					>
						<AlignLeft size={16} />
					</button>
					<button
						onClick={() => editor.chain().focus().setTextAlign('center').run()}
						className={btn(editor.isActive({ textAlign: 'center' }))}
						title="Align Center"
						type="button"
					>
						<AlignCenter size={16} />
					</button>
					<button
						onClick={() => editor.chain().focus().setTextAlign('right').run()}
						className={btn(editor.isActive({ textAlign: 'right' }))}
						title="Align Right"
						type="button"
					>
						<AlignRight size={16} />
					</button>

					<div className="cerebra-bubble-divider" />

					{/* Corrected List Buttons */}
					<button
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
						className={btn(editor.isActive('orderedList'))}
						title="Numbered List"
						type="button"
					>
						<ListOrdered size={16} />
					</button>

					<button
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						className={btn(editor.isActive('bulletList'))}
						title="Bullet List"
						type="button"
					>
						<List size={16} />
					</button>
				</div>

				{/* ── ROW 2: Typography & Highlighting ── */}
				<div className="cerebra-bubble-row">
					{/* ── Font Family ── */}
					<div className="cerebra-bubble-group">
						<Type size={14} className="cerebra-bubble-group-icon" />
						<select
							onChange={(e) => {
								if (e.target.value) {
									editor.chain().focus().setFontFamily(e.target.value).run();
								} else {
									editor.chain().focus().unsetFontFamily().run();
								}
							}}
							value={currentFontFamily}
							className="cerebra-bubble-select"
						>
							<option value="">Default Font</option>
							{FONT_FAMILIES.map((font) => (
								<option key={font} value={font}>
									{font}
								</option>
							))}
						</select>
					</div>

					{/* ── Font Size ── */}
					<div className="cerebra-bubble-group">
						<select
							onChange={(e) => {
								if (e.target.value) {
									editor.chain().focus().setFontSize(e.target.value).run();
								} else {
									editor.chain().focus().unsetFontSize().run();
								}
							}}
							value={currentFontSize}
							className="cerebra-bubble-select"
						>
							<option value="">Size</option>
							{FONT_SIZES.map((size) => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</select>
					</div>

					{/* ── Text Color ── */}
					<div className="cerebra-bubble-group">
						<Palette size={14} className="cerebra-bubble-group-icon" />
						<input
							type="color"
							onInput={(e) =>
								editor.chain().focus().setColor(e.currentTarget.value).run()
							}
							value={currentColor}
							className="cerebra-bubble-color"
							title="Text Color"
						/>
					</div>

					<div className="cerebra-bubble-divider" />

					{/* ── Highlight Colors ── */}
					<div className="cerebra-bubble-swatches">
						{colors.map(({ name, value, label }) => {
							const isActive = editor.isActive('highlight', { color: value });
							return (
								<button
									key={name}
									className={`cerebra-bubble-swatch${isActive ? ' is-active' : ''}`}
									style={{ background: value }}
									onClick={() => {
										if (isActive) {
											editor.chain().focus().unsetHighlight().run();
										} else {
											editor
												.chain()
												.focus()
												.toggleHighlight({ color: value })
												.run();
										}
									}}
									title={`${label} highlight`}
									type="button"
								/>
							);
						})}

						{hasHighlight && (
							<button
								className="cerebra-bubble-swatch-clear"
								onClick={() => editor.chain().focus().unsetHighlight().run()}
								title="Remove all highlight"
								type="button"
							>
								<X size={10} strokeWidth={2.5} />
							</button>
						)}
					</div>
				</div>
			</div>
		</BubbleMenu>
	);
}
