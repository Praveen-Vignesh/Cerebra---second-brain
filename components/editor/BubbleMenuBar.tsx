'use client'

import React from 'react'
import { type Editor } from '@tiptap/core'
import { findParentNode, posToDOMRect } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { Bold, Italic, Strikethrough, List, ListOrdered,Highlighter, Circle } from 'lucide-react'
type Props = {
  editor: Editor
}

export default function CustomBubbleMenu({ editor }: Props) {
  if (!editor) return null

  return (
    <>
      {/* 1. Text Formatting Menu */}
      <BubbleMenu editor={editor} options={{ placement: 'bottom', offset: 8, flip: true }}>
        <div className="bubble-menu">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            // Updated to 'active' to match your CSS
            className={editor.isActive('bold') ? 'active' : ''}
            type="button"
          >
            <Bold size={14} />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'active' : ''}
            type="button"
          >
            <Italic size={14} />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'active' : ''}
            type="button"
          >
            <Strikethrough size={14} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={editor.isActive('highlight') ? 'is-active' : ''}
          >
            <Highlighter size={14} />
          </button>

          /* Need to add buttons that change the highlight color and the colors should dynamically be adjusted according to the theme the user has selected*/
        </div>
      </BubbleMenu>

      {/* 2. List Formatting Menu */}
      <BubbleMenu
        editor={editor}
        shouldShow={() => editor.isActive('bulletList') || editor.isActive('orderedList')}
        getReferencedVirtualElement={() => {
          const parentNode = findParentNode(
            node => node.type.name === 'bulletList' || node.type.name === 'orderedList',
          )(editor.state.selection)
          
          if (parentNode) {
            const domRect = posToDOMRect(
              editor.view, 
              parentNode.start, 
              parentNode.start + parentNode.node.nodeSize
            )
            return {
              getBoundingClientRect: () => domRect,
              getClientRects: () => [domRect],
            }
          }
          return null
        }}
        options={{ placement: 'top-start', offset: 8 }}
      >
        <div className="bubble-menu">
          <button
            onClick={() => {
              const chain = editor.chain().focus()
              if (editor.isActive('bulletList')) {
                chain.toggleOrderedList()
              } else {
                chain.toggleBulletList()
              }
              chain.run()
            }}
            type="button"
          >
            <List size={14} />
          </button>
        </div>
      </BubbleMenu>
    </>
  )
}