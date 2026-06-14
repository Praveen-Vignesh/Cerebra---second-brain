// Turn a TipTap document (JSONContent) into plain text we can feed to Gemini.
//
// A TipTap doc is a tree of nodes: some hold text ({ type: 'text', text: '...' }),
// most just hold other nodes in a `content` array. We walk the tree, collect the
// text, and add line breaks after block-level nodes so paragraphs/headings/list
// items don't run together into one wall of text.

import type { JSONContent } from '@tiptap/react'

// Nodes that should end with a newline so the extracted text keeps its structure.
const BLOCK_NODES = new Set([
  'paragraph',
  'heading',
  'listItem',
  'blockquote',
  'codeBlock',
  'tableRow',
])

export function extractText(node: JSONContent | null | undefined): string {
  if (!node) return ''

  // Leaf text node — this is where the actual words live.
  if (node.type === 'text') return node.text ?? ''

  // An explicit line break inside a paragraph.
  if (node.type === 'hardBreak') return '\n'

  // Otherwise recurse into the children and join their text.
  const inner = (node.content ?? []).map(extractText).join('')

  // Add a trailing newline after block-level containers.
  if (node.type && BLOCK_NODES.has(node.type)) return inner + '\n'
  return inner
}

// Convenience wrapper: extract, then collapse runs of blank lines and trim.
export function noteToPlainText(content: JSONContent | null | undefined): string {
  return extractText(content)
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
