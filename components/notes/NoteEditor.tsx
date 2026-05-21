'use client';

import { useEffect, useRef, useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { saveNote } from '@/actions/notes';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type Props = {
	noteId: string;
	initialTitle: string;
	initialContent: JSONContent;
};

export default function NoteEditor({ noteId, initialTitle, initialContent }: Props) {
	const [title, setTitle] = useState(initialTitle);
	const [content, setContent] = useState<JSONContent>(initialContent);
	const [status, setStatus] = useState<SaveStatus>('idle');

	async function save(contentToSave: JSONContent, createVersion: boolean) {
		setStatus('saving');
		const result = await saveNote(noteId, title, contentToSave, { createVersion });
		if (result.ok) {
			setStatus('saved');
			setTimeout(() => setStatus('idle'), 2000);
		} else {
			setStatus('error');
			console.error('saveNote failed:', result.error);
		}
	}

	// Autosave: 3s after the last edit, save without creating a version row.
	useEffect(() => {
		if (title === initialTitle && content === initialContent) return;
		const timer = setTimeout(() => save(content, false), 3000);
		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [title, content]);

	// Flush on tab hide. Listener rebinds on every change so it always sees fresh state.
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

	// Flush on unmount (e.g. navigating to another route).
	// Uses a ref because the cleanup runs once, after state has changed many times.
	const latestRef = useRef({ title, content });
	latestRef.current = { title, content };
	useEffect(() => {
		return () => {
			const { title, content } = latestRef.current;
			if (title === initialTitle && content === initialContent) return;
			void saveNote(noteId, title, content, { createVersion: false });
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="cerebra-note-page">
			<input
				type="text"
				className="cerebra-note-title"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Untitled"
			/>
			<TipTapEditor
				initialContent={initialContent}
				noteId={noteId}
				onChange={setContent}
				onSave={(json) => save(json, true)}
				saveStatus={status}
			/>
		</div>
	);
}
