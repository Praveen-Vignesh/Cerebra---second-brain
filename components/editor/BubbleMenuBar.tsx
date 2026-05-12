'use client'

import React from 'react'
import { type Editor } from '@tiptap/core'
import { BubbleMenu } from '@tiptap/react/menus'
import { 
  Bold, Italic, Strikethrough, Code, X, 
  AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Palette, Type
} from 'lucide-react'

type Props = {
  editor: Editor
  isDark: boolean
}

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

const FONT_FAMILIES = ['Inter', 'Arial', 'Times New Roman', 'Courier New', 'Georgia']
const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '30px']

export default function CustomBubbleMenu({ editor, isDark }: Props) {
  if (!editor) return null

  const colors = isDark ? HIGHLIGHT_COLORS.dark : HIGHLIGHT_COLORS.light
  const hasHighlight = editor.isActive('highlight')
  
  const currentColor = editor.getAttributes('textStyle').color || '#000000'
  const currentFontFamily = editor.getAttributes('textStyle').fontFamily || ''
  const currentFontSize = editor.getAttributes('textStyle').fontSize || ''

  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: 'bottom', 
        offset: 10,          
        strategy: 'fixed',   
        flip: {
          padding: 12,
          // Tell the menu not to flip outside the actual editor box
          boundary: editor.view.dom as HTMLElement, 
          fallbackPlacements: ['top'],
        },
        shift: {
          padding: 12,
          // Tell the menu not to slide underneath your sidebar
          boundary: editor.view.dom as HTMLElement, 
        },
      }}
    >
      <div className="bubble-menu-container flex flex-col gap-2 p-2 rounded-lg shadow-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
        
        {/* ── ROW 1: Formatting, Alignment, & Lists ── */}
        <div className="bubble-row flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            title="Bold"
            type="button"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            title="Italic"
            type="button"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            title="Strikethrough"
            type="button"
          >
            <Strikethrough size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            title="Code"
            type="button"
          >
            <Code size={16} />
          </button>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            title="Align Left"
            type="button"
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            title="Align Center"
            type="button"
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            title="Align Right"
            type="button"
          >
            <AlignRight size={16} />
          </button>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Corrected List Buttons */}
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            title="Numbered List"
            type="button"
          >
            <ListOrdered size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            title="Bullet List"
            type="button"
          >
            <List size={16} />
          </button>
        </div>

        {/* ── ROW 2: Typography & Highlighting ── */}
        <div className="bubble-row flex items-center gap-2">
          
          {/* ── Font Family ── */}
          <div className="bubble-select-group">
            <Type size={14} className="text-gray-500" />
            <select
              onChange={(e) => {
                if (e.target.value) {
                  editor.chain().focus().setFontFamily(e.target.value).run()
                } else {
                  editor.chain().focus().unsetFontFamily().run()
                }
              }}
              value={currentFontFamily}
              className="bubble-select"
            >
              <option value="">Default Font</option>
              {FONT_FAMILIES.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          {/* ── Font Size ── */}
          <div className="bubble-select-group">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  editor.chain().focus().setFontSize(e.target.value).run()
                } else {
                  editor.chain().focus().unsetFontSize().run()
                }
              }}
              value={currentFontSize}
              className="bubble-select"
            >
              <option value="">Size</option>
              {FONT_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          {/* ── Text Color ── */}
          <div className="bubble-select-group">
            <Palette size={14} className="text-gray-500" />
            <input
              type="color"
              onInput={(e) => editor.chain().focus().setColor(e.currentTarget.value).run()}
              value={currentColor}
              className="bubble-color-picker"
              title="Text Color"
            />
          </div>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* ── Highlight Colors ── */}
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

            {hasHighlight && (
              <button
                className="color-swatch color-clear"
                onClick={() => editor.chain().focus().unsetHighlight().run()}
                title="Remove all highlight"
                type="button"
              >
                <X size={10} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </BubbleMenu>
  )
}