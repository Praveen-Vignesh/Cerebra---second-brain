// extensions/index.ts
import { Extension } from '@tiptap/core'
import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import Image from "@tiptap/extension-image"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Link from "@tiptap/extension-link"
import Highlight from "@tiptap/extension-highlight"
import Placeholder from "@tiptap/extension-placeholder"
import { common, createLowlight } from "lowlight"
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'
import Typography from '@tiptap/extension-typography'
import { TableKit } from '@tiptap/extension-table'
import { ListKeymap, ListKit } from "@tiptap/extension-list"
import { TextStyleKit } from '@tiptap/extension-text-style'
import FloatingMenu from '@tiptap/extension-floating-menu'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Text from '@tiptap/extension-text'
import TextAlign from '@tiptap/extension-text-align'

const lowlight = createLowlight(common)

const TableControls = Extension.create({
  name: 'tableControls',
  priority: 1001,

  addKeyboardShortcuts() {
    return {

      // ── Tab: exit table on last cell instead of adding new row ──
      Tab: () => {
        if (!this.editor.isActive('table')) return false

        const { state } = this.editor
        const { $anchor } = state.selection

        // walk up to find table and cell depths
        let tableDepth = -1
        let cellDepth  = -1

        for (let d = $anchor.depth; d > 0; d--) {
          const name = $anchor.node(d).type.name
          if (name === 'table') { tableDepth = d; break }
          if (name === 'tableCell' || name === 'tableHeader') cellDepth = d
        }

        if (tableDepth === -1 || cellDepth === -1) return false

        const afterCurrentCell = $anchor.after(cellDepth)
        const afterTable        = $anchor.after(tableDepth)

        // scan for any cell nodes between here and end of table
        let hasNextCell = false
        state.doc.nodesBetween(afterCurrentCell, afterTable, (node) => {
          if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
            hasNextCell = true
            return false // stop traversal
          }
        })

        if (!hasNextCell) {
          // last cell → move cursor to the paragraph after the table
          this.editor.commands.setTextSelection(afterTable)
          return true // swallow Tab so TableKit never runs
        }

        return false // not last cell → let TableKit move to next cell normally
      },

      // ── Backspace: delete table from outside it ──
      Backspace: () => {
        const { state } = this.editor
        const { $anchor, empty } = state.selection

        if (!empty || this.editor.isActive('table')) return false

        // ── Case 1: gap cursor sitting directly after a table ──
        const nodeBefore = $anchor.nodeBefore
        if (nodeBefore?.type.name === 'table') {
          this.editor.chain().focus().deleteRange({
            from: $anchor.pos - nodeBefore.nodeSize,
            to:   $anchor.pos,
          }).run()
          return true
        }

        // ── Case 2: cursor is inside an empty paragraph that follows a table ──
        // $anchor.before(1) gives the position just before the top-level
        // block node (the paragraph), letting us inspect what's before it
        const isEmptyParagraph =
          $anchor.parent.type.name === 'paragraph' &&
          $anchor.parent.content.size === 0

        if (isEmptyParagraph && $anchor.depth >= 1) {
          const posBeforeParagraph = $anchor.before(1)

          if (posBeforeParagraph > 0) {
            const $resolved       = state.doc.resolve(posBeforeParagraph)
            const nodeBeforePara  = $resolved.nodeBefore

            if (nodeBeforePara?.type.name === 'table') {
              this.editor.chain().focus().deleteRange({
                from: posBeforeParagraph - nodeBeforePara.nodeSize,
                to:   posBeforeParagraph,
              }).run()
              return true
            }
          }
        }

        return false
      },
    }
  },
})

export const getExtensions = () => [
  TableControls, // ← must be first so priority:1001 wins over TableKit
  StarterKit.configure({ codeBlock: false }),
  Heading.configure({
    HTMLAttributes: { class: "cerebra-heading" },
  }),
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: "plaintext",
    HTMLAttributes: { class: "cerebra-code-block" },
  }),
  Image.configure({
    allowBase64: true,
    HTMLAttributes: { class: "cerebra-image" },
  }),
  Link.configure({
    openOnClick: true,
    HTMLAttributes: { class: "cerebra-link" },
  }),
  Highlight.configure({ multicolor: true }),
  Placeholder.configure({ placeholder: "Write something, or press '/' for commands…" }),
  TableKit.configure({
    table: {
      resizable: true,
      HTMLAttributes: { class: "cerebra-table" },
    },
    tableHeader: { HTMLAttributes: { class: "cerebra-table-header" } },
    tableRow: { HTMLAttributes: { class: "cerebra-table-row" } },
    tableCell: { HTMLAttributes: { class: "cerebra-table-cell" } },
  }),

  Details.configure({
    persist: true,
    openClassName: "cerebra-details-isOpen",
    HTMLAttributes: { class: "cerebra-details" },
  }),
  DetailsContent,
  DetailsSummary,

  TextStyleKit.configure({
    fontSize: {
    },
  }),
  Text,
  TextStyleKit,
  Typography,
  ListKeymap,
  ListKit,
  FloatingMenu,
  TextAlign.configure({ types: ['paragraph', 'heading', 'listItem'] }),
  Superscript,
  Subscript,
]