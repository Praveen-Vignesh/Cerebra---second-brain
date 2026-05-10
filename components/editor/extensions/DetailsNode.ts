// components/editor/extensions/DetailsNode.ts
import { Node, mergeAttributes } from '@tiptap/core'

// A collapsible <details>/<summary> block — free replacement for TipTap Pro Details
export const DetailsNode = Node.create({
  name: 'details',
  group: 'block',
  content: 'detailsSummary detailsContent',
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: 'details' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(HTMLAttributes, { open: true }), 0]
  },
  addAttributes() {
    return {
      open: { default: true },
    }
  },
})

export const DetailsSummary = Node.create({
  name: 'detailsSummary',
  content: 'inline*',
  defining: true,
  parseHTML() {
    return [{ tag: 'summary' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['summary', mergeAttributes(HTMLAttributes), 0]
  },
})

export const DetailsContent = Node.create({
  name: 'detailsContent',
  content: 'block+',
  defining: true,
  parseHTML() {
    return [{ tag: 'div[data-type="details-content"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'details-content' }), 0]
  },
})