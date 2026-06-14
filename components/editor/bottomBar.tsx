

import React, { useState } from 'react';
import { Editor, type JSONContent } from '@tiptap/react';
import { Image as ImageIcon, Paperclip, SendHorizonal, Sparkles, Table } from 'lucide-react';
import { uploadAttachment } from '@/utils/upload';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface BottomBarProps {
	editor: Editor;
	noteId?: string;
	onSave?: (json: JSONContent) => void | Promise<void>;
	saveStatus?: SaveStatus;
	onAiAnalysis?: (content: string) => Promise<void>;
}

const SAVE_LABEL: Record<SaveStatus, string> = {
	idle: 'Save',
	saving: 'Saving…',
	saved: 'Saved',
	error: 'Retry',
};

const Bottombar = ({
	editor,
	noteId,
	onSave,
	saveStatus = 'idle',
	onAiAnalysis,
}: BottomBarProps) => {
	const imageref = React.useRef<HTMLInputElement>(null);
	const fileref = React.useRef<HTMLInputElement>(null);

	const [aiLoading, setaiLoading] = useState(false);
	const [uploading, setUploading] = useState(false);

	async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file || !editor || !noteId) return;
		setUploading(true);
		try {
			const url = await uploadAttachment(file, noteId);
			editor
				.chain()
				.focus()
				.insertContent({
					type: 'paragraph',
					content: [
						{
							type: 'text',
							marks: [{ type: 'link', attrs: { href: url, target: '_blank' } }],
							text: `📎 ${file.name}`,
						},
					],
				})
				.run();
		} catch (err) {
			console.error('file upload failed:', err);
		} finally {
			setUploading(false);
		}
	}

	const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file || !editor || !noteId) return;
		setUploading(true);
		try {
			const url = await uploadAttachment(file, noteId);

			editor.chain().focus().setImage({ src: url }).run();


		} catch (err) {
			console.error('image upload failed:', err);
		} finally {
			setUploading(false);
		}
	};

	const handleAiAnalyze = async () => {
		setaiLoading(true);
		try {
			await onAiAnalysis?.(editor.getText());
		} finally {
			setaiLoading(false);
		}
	};

	const handleTable = () => {
		editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
	};

	return (
		<div className="cerebra-bottombar">


			<input
				ref={imageref}
				type="file"
				accept="image/*"
				className="cerebra-hidden-input"
				onChange={handleImage}
			/>
			<input
				ref={fileref}
				type="file"
				accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
				className="cerebra-hidden-input"
				onChange={handleFile}
			/>



			<div className="cerebra-bottombar-cluster">
				<button
					type="button"
					title={uploading ? 'Uploading…' : 'Insert image'}
					onClick={() => imageref.current?.click()}
					disabled={uploading}
					className="cerebra-bottombar-btn"
				>
					<ImageIcon width={16} />
				</button>
				<button
					type="button"
					title={uploading ? 'Uploading…' : 'Attach file'}
					onClick={() => fileref.current?.click()}
					disabled={uploading}
					className="cerebra-bottombar-btn"
				>
					<Paperclip size={16} />
				</button>
				<button
					type="button"
					title="Insert table"
					onClick={handleTable}
					disabled={uploading}
					className="cerebra-bottombar-btn"
				>
					<Table size={16} />
				</button>
			</div>



			<div className="cerebra-bottombar-divider" />



			<div className="cerebra-bottombar-cluster">
				<button
					type="button"
					title="AI Analysis & Suggestions"
					onClick={handleAiAnalyze}
					disabled={aiLoading}
					className="cerebra-bottombar-btn cerebra-bottombar-ai"
				>
					<Sparkles size={16} />
					<span>{aiLoading ? 'Analyzing…' : 'AI Analyze'}</span>
				</button>

				<button
					type="button"
					title="Save"
					onClick={() => onSave?.(editor.getJSON())}
					disabled={saveStatus === 'saving'}
					data-status={saveStatus}
					className="cerebra-bottombar-btn cerebra-bottombar-save"
				>
					<SendHorizonal size={16} />
					<span>{SAVE_LABEL[saveStatus]}</span>
				</button>
			</div>
		</div>
	);
};

export default Bottombar;
