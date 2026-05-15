import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import Text from '@tiptap/extension-text'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from "@tiptap/extension-highlight"
import Placeholder from "@tiptap/extension-placeholder"
import { TextStyleKit } from '@tiptap/extension-text-style'
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'
import { TableKit } from '@tiptap/extension-table'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import FloatingMenu from '@tiptap/extension-floating-menu'
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Underline from '@tiptap/extension-underline'
import Blockquote from '@tiptap/extension-blockquote'
import { Gapcursor } from '@tiptap/extensions'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { Extension } from "@tiptap/core"


const lowlight = createLowlight(common)

const DeleteTableOnBackspace = Extension.create({
  name: 'deleteTableOnBackspace',
  priority: 1001,

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { state } = this.editor
        const { selection } = state
        const { $anchor, empty } = selection

        // bail if there's a text selection or we're inside a table
        if (!empty || this.editor.isActive('table')) return false

        const nodeBefore = $anchor.nodeBefore
        if (nodeBefore?.type.name !== 'table') return false

        this.editor.chain().focus().deleteRange({
          from: $anchor.pos - nodeBefore.nodeSize,
          to:   $anchor.pos,
        }).run()

        return true
      },
    }
  },
})



export const getExtensions = () => [
  DeleteTableOnBackspace,
  StarterKit.configure({codeBlock: false}),
  Heading.configure({
    HTMLAttributes: { class: "cerebra-heading" },
  }),

  Document,
  Paragraph,
  Text,

  TextStyle,
  Color,
  TextAlign.configure({ types: ['paragraph', 'heading', 'listItem'] }),
  Subscript,
  Superscript,
  Underline,
  Blockquote,
  
  CodeBlockLowlight.configure({
    lowlight,defaultLanguage: "plaintext",
    HTMLAttributes: {
      class: "cerebra-code-block",
    },
  }),
  
  Image.configure({
    allowBase64: true,
    HTMLAttributes: { class: "cerebra-image" },
  }),
  
  Link.configure({
    openOnClick: true,
    HTMLAttributes: { class: "cerebra-link" },
  }),

  Highlight.configure({ multicolor: false }),

  Placeholder.configure({ placeholder: "What's on your mind ?", }),
  TableKit.configure({
    table: {
      resizable: true,
      HTMLAttributes: { class: 'cerebra-table' },
    },
    tableHeader: { HTMLAttributes: { class: 'cerebra-table-header' } },
    tableRow:    { HTMLAttributes: { class: 'cerebra-table-row' } },
    tableCell:   { HTMLAttributes: { class: 'cerebra-table-cell' } },
  }),
  Details.configure({
    openClassName: "cerebra-details-isOpen",
    HTMLAttributes: { class: "cerebra-details" }
  }),

  DetailsContent,
  DetailsSummary,

  TextStyleKit,

  BulletList,
  OrderedList,
  ListItem,

  FloatingMenu,

  Highlight.configure({ multicolor: true }),


]
