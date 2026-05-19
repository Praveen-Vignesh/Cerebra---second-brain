'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';

import dynamic from 'next/dynamic';
import BubbleMenuBar from './BubbleMenuBar';
import { getExtensions } from './extensions';
import 'tippy.js/dist/tippy.css';
import './editor.css';
import Bottombar from './bottomBar';

const EmojiPicker = dynamic(() => import('@emoji-mart/react').then((m) => m.default), {
	ssr: false,
});

type Props = {
	initialContent?: string;
	onChange?: (html: string) => void;
	placeholder?: string;
};

export default function TipTapEditor({ initialContent, onChange, placeholder }: Props) {
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);

	const editor = useEditor({
		extensions: getExtensions(),
		content: initialContent || '',
		editorProps: {
			attributes: {
				spellcheck: 'true',
			},
		},
		onUpdate({ editor }) {
			onChange?.(editor.getHTML());
		},
		immediatelyRender: false,
	});

	useEffect(() => {
		const handleInsertEmoji = () => setShowEmojiPicker(true);

		window.addEventListener('editor:insert-emoji', handleInsertEmoji);
		return () => {
			window.removeEventListener('editor:insert-emoji', handleInsertEmoji);
		};
	}, []);

	const handleEmojiSelect = (emoji: { native: string }) => {
		editor?.chain().focus().insertContent(emoji.native).run();
		setShowEmojiPicker(false);
	};

	if (!editor) return null;

	return (
		<div className="cerebra-editor">
			{editor && <BubbleMenuBar editor={editor} isDark={false} />}

			<EditorContent editor={editor} className="cerebra-editor-content" />

			<Bottombar editor={editor} />

			{showEmojiPicker && (
				<div className="cerebra-emoji-overlay" onClick={() => setShowEmojiPicker(false)}>
					<div
						className="cerebra-emoji-popover"
						onClick={(e) => e.stopPropagation()}
					>
						<EmojiPicker onEmojiSelect={handleEmojiSelect} theme="dark" />
					</div>
				</div>
			)}
		</div>
	);
}
