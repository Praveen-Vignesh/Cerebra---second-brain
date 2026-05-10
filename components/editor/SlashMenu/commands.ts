// components/editor/SlashMenu/commands.ts
import { Editor, Range } from '@tiptap/core'

export type CommandItem = {
  title: string
  description: string
  icon: string           // emoji icon for simplicity
  keywords: string[]    // for fuzzy filtering
  command: (opts: { editor: Editor; range: Range }) => void
}

export const SLASH_COMMANDS: CommandItem[] = [
  {
    title: 'Heading 1',
    description: 'Large section title',
    icon: '𝗛¹',
    keywords: ['h1', 'heading', 'title', 'large'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    description: 'Medium section title',
    icon: '𝗛²',
    keywords: ['h2', 'heading', 'subtitle'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    description: 'Small section title',
    icon: '𝗛³',
    keywords: ['h3', 'heading'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run(),
  },
  {
    title: 'Bullet List',
    description: 'Unordered list',
    icon: '•',
    keywords: ['ul', 'bullet', 'list', 'unordered'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: 'Numbered List',
    description: 'Ordered list',
    icon: '1.',
    keywords: ['ol', 'numbered', 'ordered', 'list'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: 'Code Block',
    description: 'Syntax-highlighted code',
    icon: '</>',
    keywords: ['code', 'codeblock', 'pre', 'syntax'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setCodeBlock().run(),
  },
  {
    title: 'Quote',
    description: 'Blockquote callout',
    icon: '❝',
    keywords: ['quote', 'blockquote', 'callout'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setBlockquote().run(),
  },
  {
    title: 'Table',
    description: 'Insert a 3×3 table',
    icon: '⊞',
    keywords: ['table', 'grid', 'row', 'column'],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    title: 'Image',
    description: 'Upload or embed an image',
    icon: '🖼',
    keywords: ['image', 'img', 'photo', 'picture', 'upload'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run()
      // Trigger a file input — wired up in TipTapEditor
      const event = new CustomEvent('editor:insert-image')
      window.dispatchEvent(event)
    },
  },
  {
    title: 'Details',
    description: 'Collapsible section',
    icon: '▶',
    keywords: ['details', 'summary', 'collapse', 'accordion', 'toggle'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: 'details',
          content: [
            {
              type: 'detailsSummary',
              content: [{ type: 'text', text: 'Summary' }],
            },
            {
              type: 'detailsContent',
              content: [{ type: 'paragraph' }],
            },
          ],
        })
        .run()
    },
  },
  {
    title: 'Divider',
    description: 'Horizontal rule',
    icon: '─',
    keywords: ['hr', 'divider', 'separator', 'line'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: 'Emoji',
    description: 'Pick an emoji',
    icon: '😀',
    keywords: ['emoji', 'emoticon', 'reaction'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run()
      const event = new CustomEvent('editor:insert-emoji')
      window.dispatchEvent(event)
    },
  },
]