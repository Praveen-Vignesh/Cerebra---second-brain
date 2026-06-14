'use client';

import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
import { DragHandle } from '@tiptap/extension-drag-handle-react';
import BubbleMenuBar from './BubbleMenuBar';
import { getExtensions } from './extensions';
import 'tippy.js/dist/tippy.css';
import './editor.css';
import Bottombar from './bottomBar';

const EmojiPicker = dynamic(() => import('@emoji-mart/react').then((m) => m.default), {
	ssr: false,
});

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type Props = {
	initialContent?: JSONContent;
	noteId?: string;
	onChange?: (json: JSONContent) => void;
	onSave?: (json: JSONContent) => void | Promise<void>;
	saveStatus?: SaveStatus;
	onAiAnalysis?: (content: string) => Promise<void>;
};

export default function TipTapEditor({
	initialContent,
	noteId,
	onChange,
	onSave,
	saveStatus,
	onAiAnalysis,
}: Props) {
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);

	const editor = useEditor({
		extensions: getExtensions(),
		content: initialContent ?? null,
		editorProps: {
			attributes: {
				spellcheck: 'true',
			},
		},
		onUpdate({ editor }) {
			onChange?.(editor.getJSON());
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

			<DragHandle editor={editor} nested>
				<div className="cerebra-drag-handle" aria-label="Drag to move" />
			</DragHandle>

			<EditorContent editor={editor} className="cerebra-editor-content" />

			<Bottombar
				editor={editor}
				noteId={noteId}
				onSave={onSave}
				saveStatus={saveStatus}
				onAiAnalysis={onAiAnalysis}
			/>

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
