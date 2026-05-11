// components/editor/extensions/index.ts
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import {Table} from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { common, createLowlight } from 'lowlight'
import { DetailsNode, DetailsSummary, DetailsContent } from './DetailsNode'
import { SlashCommand } from '../SlashMenu'
import { EmojiSupport } from './EmojiExtension'


const lowlight = createLowlight(common)

export const getExtensions = () => [
  StarterKit.configure({
    codeBlock: false, // replaced by CodeBlockLowlight
  }),
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: 'plaintext',
    HTMLAttributes: {
      class: 'cerebra-code-block',
    },
  }),
  Image.configure({
    allowBase64: true,
    HTMLAttributes: { class: 'cerebra-image' },
  }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  Link.configure({
    openOnClick: true,
    HTMLAttributes: { class: 'cerebra-link' },
  }),
  Highlight.configure({ multicolor: false }),
  Placeholder.configure({
    placeholder: "Write something, or press '/' for commands…",
  }),
  DetailsNode,
  DetailsSummary,
  DetailsContent,
  SlashCommand,
  EmojiSupport,
]