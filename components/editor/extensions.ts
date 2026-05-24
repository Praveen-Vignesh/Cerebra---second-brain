
import { Extension } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details';
import Typography from '@tiptap/extension-typography';
import { TableKit } from '@tiptap/extension-table';
import { TextStyleKit } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

const TableBackspace = Extension.create({
	name: 'tableBackspace',
	priority: 1000,
	addKeyboardShortcuts() {
		return {
			Backspace: ({ editor }) => {
				const { state, view } = editor;
				const { selection } = state;
				if (!selection.empty) return false;

				const { $from } = selection;
				if ($from.depth === 0 || $from.parentOffset !== 0) return false;

				const posBeforeBlock = $from.before($from.depth);
				const nodeBefore = state.doc.resolve(posBeforeBlock).nodeBefore;
				if (!nodeBefore || nodeBefore.type.name !== 'table') return false;

				const tablePos = posBeforeBlock - nodeBefore.nodeSize;
				view.dispatch(
					state.tr.setSelection(NodeSelection.create(state.doc, tablePos)),
				);
				return true;
			},
		};
	},
});

export const getExtensions = () => [

	TableBackspace,

	StarterKit.configure({
		codeBlock: false,
		heading: { HTMLAttributes: { class: 'cerebra-heading' } },
		link: { openOnClick: true, HTMLAttributes: { class: 'cerebra-link' } },
	}),

	Placeholder.configure({ placeholder: "Write something, or press '/' for commands…" }),

	CodeBlockLowlight.configure({
		lowlight,
		defaultLanguage: 'plaintext',
		HTMLAttributes: { class: 'cerebra-code-block' },
	}),

	TableKit.configure({
		table: { resizable: true, HTMLAttributes: { class: 'cerebra-table' }, cellMinWidth: 100},
		tableHeader: { HTMLAttributes: { class: 'cerebra-table-header' } },
		tableRow: { HTMLAttributes: { class: 'cerebra-table-row' } },
		tableCell: { HTMLAttributes: { class: 'cerebra-table-cell' } },
	}),

	Details.configure({
		persist: true,
		openClassName: 'cerebra-details-isOpen',
		HTMLAttributes: { class: 'cerebra-details' },

	}),
	DetailsContent,
	DetailsSummary,

	Image.configure({
		resize: {
			enabled: true,
			directions: ['top', 'bottom', 'left', 'right'],
			minWidth: 50,
			minHeight: 50,
			alwaysPreserveAspectRatio: true,
		},
		HTMLAttributes: { class: 'cerebra-image' },
		inline: true,
	}),

	Highlight.configure({ multicolor: true }),
	TextStyleKit,
	Typography,
	TextAlign.configure({ types: ['paragraph', 'heading', 'listItem'] }),
	Superscript,
	Subscript,
];
