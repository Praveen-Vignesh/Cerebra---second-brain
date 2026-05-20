/* eslint-disable react-hooks/refs */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState } from 'react';
import { Editor, type JSONContent } from '@tiptap/react';
import { Image, Paperclip, SendHorizonal, Sparkles, Table } from 'lucide-react';

type ToolButton = {
	icon: React.ReactNode;
	label: string;
	action: () => void;
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface BottomBarProps {
	editor: Editor;
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

const Bottombar = ({ editor, onSave, saveStatus = 'idle', onAiAnalysis }: BottomBarProps) => {
	const imageref = React.useRef<HTMLInputElement>(null);
	const fileref = React.useRef<HTMLInputElement>(null);

	const [aiLoading, setaiLoading] = useState(false);
	
	function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file || !editor) return;
		const url = URL.createObjectURL(file);
		editor
			.chain()
			.focus()
			.insertContent(`<p><a href="${url}" target="_blank">📎 ${file.name}</a></p>`)
			.run();
		e.target.value = '';
	}

	const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !editor) return;
		const reader = new FileReader();
		reader.onload = () => {
			editor
				.chain()
				.focus()
				.setImage({ src: reader.result as string })
				.run();
		};
		reader.readAsDataURL(file);
		e.target.value = '';
	};

	const handleAiAnalyze = async () => {
		setaiLoading(true);
		try {
			await onAiAnalysis?.(editor.getHTML());
		} finally {
			setaiLoading(false);
		}
	};

	const handleTable = () => {
		editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
	};

	const leftTools: ToolButton[] = [
		{
			icon: <Image width={16} />,
			label: 'Insert image',
			action: () => imageref.current?.click(),
		},
		{
			icon: <Paperclip size={16} />,
			label: 'Attach file',
			action: () => fileref.current?.click(),
		},
		{
			icon: <Table size={16} />,
			label: 'Insert table',
			action: handleTable,
		},
	];

	return (
		<div className="cerebra-bottombar">
			{/* hidden file inputs */}

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

			{/* left cluster — insert tools */}

			<div className="cerebra-bottombar-cluster">
				{leftTools.map((tool) => (
					<button
						key={tool.label}
						type="button"
						title={tool.label}
						onClick={tool.action}
						className="cerebra-bottombar-btn"
					>
						{tool.icon}
					</button>
				))}
			</div>

			{/* divider */}

			<div className="cerebra-bottombar-divider" />

			{/* right cluster — actions */}

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
