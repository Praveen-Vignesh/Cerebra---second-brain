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
			<div className="">
				{/* ── ROW 1: Formatting, Alignment, & Lists ── */}
				<div className="">
					<button
						onClick={() => editor.chain().focus().toggleBold().run()}
						className=""
						title="Bold"
						type="button"
					>
						<Bold size={16} />
					</button>
					<button
						onClick={() => editor.chain().focus().toggleItalic().run()}
						className=""
						title="Italic"
						type="button"
					>
						<Italic size={16} />
					</button>
					<button
						onClick={() => editor.chain().focus().toggleStrike().run()}
						className=""
						title="Strikethrough"
						type="button"
					>
						<Strikethrough size={16} />
					</button>

					<button
						onClick={() => editor.chain().focus().toggleUnderline().run()}
						className=""
						title="Underline"
						type="button"
					>
						<Underline size={16} />
					</button>

					<button
						onClick={() => editor.chain().focus().toggleCode().run()}
						className=""
						title="Code"
						type="button"
					>
						<Code size={16} />
					</button>

					<button
						onClick={() => editor.chain().focus().setBlockquote().run()}
						className=""
						title="Blockquote"
						type="button"
					>
						<Quote size={16} />
					</button>

					<button
						className=""
						type="button"
						onClick={() => {
							editor.chain().focus().toggleSubscript().run();
						}}
						title="Subscript"
					>
						<span className="">
							X<sub>2</sub>
						</span>
					</button>

					<button
						className=""
						type="button"
						onClick={() => {
							editor.chain().focus().toggleSuperscript().run();
						}}
						title="Superscript"
					>
						<span className="">
							X<sup>2</sup>
						</span>
					</button>

					<div className="" />

					<button
						onClick={() => editor.chain().focus().setTextAlign('left').run()}
						className=""
						title="Align Left"
						type="button"
					>
						<AlignLeft size={16} />
					</button>
					<button
						onClick={() => editor.chain().focus().setTextAlign('center').run()}
						className=""
						title="Align Center"
						type="button"
					>
						<AlignCenter size={16} />
					</button>
					<button
						onClick={() => editor.chain().focus().setTextAlign('right').run()}
						className=""
						title="Align Right"
						type="button"
					>
						<AlignRight size={16} />
					</button>

					<div className="" />

					{/* Corrected List Buttons */}
					<button
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
						className=""
						title="Numbered List"
						type="button"
					>
						<ListOrdered size={16} />
					</button>

					<button
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						className=""
						title="Bullet List"
						type="button"
					>
						<List size={16} />
					</button>
				</div>

				{/* ── ROW 2: Typography & Highlighting ── */}
				<div className="">
					{/* ── Font Family ── */}
					<div className="">
						<Type size={14} className="" />
						<select
							onChange={(e) => {
								if (e.target.value) {
									editor.chain().focus().setFontFamily(e.target.value).run();
								} else {
									editor.chain().focus().unsetFontFamily().run();
								}
							}}
							value={currentFontFamily}
							className=""
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
					<div className="">
						<select
							onChange={(e) => {
								if (e.target.value) {
									editor.chain().focus().setFontSize(e.target.value).run();
								} else {
									editor.chain().focus().unsetFontSize().run();
								}
							}}
							value={currentFontSize}
							className=""
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
					<div className="">
						<Palette size={14} className="" />
						<input
							type="color"
							onInput={(e) =>
								editor.chain().focus().setColor(e.currentTarget.value).run()
							}
							value={currentColor}
							className=""
							title="Text Color"
						/>
					</div>

					<div className="" />

					{/* ── Highlight Colors ── */}
					<div className="">
						{colors.map(({ name, value, label }) => {
							const isActive = editor.isActive('highlight', { color: value });
							return (
								<button
									key={name}
									className=""
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
								className=""
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
