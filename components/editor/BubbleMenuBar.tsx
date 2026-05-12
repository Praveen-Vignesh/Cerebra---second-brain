'use client'

import React from 'react'
import { type Editor } from '@tiptap/core'
import { BubbleMenu } from '@tiptap/react/menus'
import { Bold, Italic, Strikethrough, Code, Highlighter, X } from 'lucide-react'

type Props = {
  editor: Editor
  isDark: boolean
}

/**
 * Highlight colors chosen for readability in each theme:
 *
 * Light mode → pastel tints (high contrast with dark #1a1a1a text)
 * Dark mode  → mid-tone saturated shades (high contrast with light rgba(255,255,255,0.85) text)
 *
 * WCAG contrast ratios (approx):
 *   Light yellow #fef08a + dark text  ≈ 14:1  ✓
 *   Dark  yellow #b45309 + white text ≈  4.6:1 ✓
 *   (all others similarly in range)
 */
const HIGHLIGHT_COLORS = {
  light: [
    { name: 'yellow', value: '#fef08a', label: 'Yellow' },
    { name: 'green',  value: '#bbf7d0', label: 'Green'  },
    { name: 'blue',   value: '#bfdbfe', label: 'Blue'   },
    { name: 'red',    value: '#fecaca', label: 'Red'    },
    { name: 'orange', value: '#fed7aa', label: 'Orange' },
  ],
  dark: [
    { name: 'yellow', value: '#b45309', label: 'Yellow' },
    { name: 'green',  value: '#15803d', label: 'Green'  },
    { name: 'blue',   value: '#1d4ed8', label: 'Blue'   },
    { name: 'red',    value: '#b91c1c', label: 'Red'    },
    { name: 'orange', value: '#c2410c', label: 'Orange' },
  ],
}

export default function CustomBubbleMenu({ editor, isDark }: Props) {
  if (!editor) return null

  const colors = isDark ? HIGHLIGHT_COLORS.dark : HIGHLIGHT_COLORS.light
  const hasHighlight = editor.isActive('highlight')

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: 'top', offset: 10, flip: true }}
    >
      <div className="bubble-menu">

        {/* ── Text formatting buttons ── */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'active' : ''}
          type="button"
          title="Bold (Ctrl+B)"
        >
          <Bold size={14} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'active' : ''}
          type="button"
          title="Italic (Ctrl+I)"
        >
          <Italic size={14} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'active' : ''}
          type="button"
          title="Strikethrough"
        >
          <Strikethrough size={14} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'active' : ''}
          type="button"
          title="Inline code"
        >
          <Code size={14} />
        </button>

        <div className="bubble-divider" />


        <div className="bubble-divider" />

        {/* ── Color swatches ── */}
        <div className="bubble-colors">
          {colors.map(({ name, value, label }) => {
            const isActive = editor.isActive('highlight', { color: value })
            return (
              <button
                key={name}
                className={`color-swatch${isActive ? ' color-swatch--active' : ''}`}
                style={{ backgroundColor: value }}
                onClick={() => {
                  if (isActive) {
                    editor.chain().focus().unsetHighlight().run()
                  } else {
                    editor.chain().focus().toggleHighlight({ color: value }).run()
                  }
                }}
                title={`${label} highlight`}
                type="button"
              />
            )
          })}

          {/* Clear button – only visible when a highlight is active */}
          {hasHighlight && (
            <button
              className="color-swatch color-clear"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
              title="Remove all highlight"
              type="button"
            >
              <X size={9} strokeWidth={2.5} />
            </button>
          )}
        </div>

      </div>
    </BubbleMenu>
  )
}