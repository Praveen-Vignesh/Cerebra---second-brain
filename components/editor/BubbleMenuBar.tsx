// components/editor/BubbleMenuBar.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { type Editor } from '@tiptap/core'
import { Bold, Italic, Strikethrough, Code, Link, Highlighter } from 'lucide-react'

// ─── Hook: tracks selection position ───────────────────────────────────────
function useBubblePosition(editor: Editor | null) {
  const [style, setStyle] = useState<React.CSSProperties>({ display: 'none' })

  const update = useCallback(() => {
    if (!editor) return

    const { from, to } = editor.state.selection
    const hasSelection = from !== to
    const inCodeBlock = editor.isActive('codeBlock')

    if (!hasSelection || inCodeBlock) {
      setStyle({ display: 'none' })
      return
    }

    // Get the bounding rect of the current selection from the DOM
    const domSel = window.getSelection()
    if (!domSel || domSel.rangeCount === 0) {
      setStyle({ display: 'none' })
      return
    }

    const rect = domSel.getRangeAt(0).getBoundingClientRect()
    if (!rect.width) {
      setStyle({ display: 'none' })
      return
    }

    setStyle({
      display: 'flex',
      position: 'fixed',
      top: rect.top - 48,                        // 48px above selection
      left: rect.left + rect.width / 2,           // horizontally centred
      transform: 'translateX(-50%)',
      zIndex: 50,
    })
  }, [editor])

  useEffect(() => {
    if (!editor) return
    editor.on('selectionUpdate', update)
    editor.on('focus', update)
    // Hide on blur but delay slightly so clicks on the menu itself register first
    const onBlur = () => setTimeout(() => setStyle({ display: 'none' }), 150)
    editor.on('blur', onBlur)
    return () => {
      editor.off('selectionUpdate', update)
      editor.off('focus', update)
      editor.off('blur', onBlur)
    }
  }, [editor, update])

  return style
}

// ─── Component ─────────────────────────────────────────────────────────────
type Props = { editor: Editor }

export default function BubbleMenuBar({ editor }: Props) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const menuStyle = useBubblePosition(editor)

  const applyLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setShowLinkInput(false)
    setLinkUrl('')
  }

  // Keep the menu mounted always, visibility driven by style.display
  return (
    <div className="bubble-menu" style={menuStyle}>
      {showLinkInput ? (
        <div className="bubble-link-input">
          <input
            autoFocus
            placeholder="https://..."
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') applyLink()
              if (e.key === 'Escape') setShowLinkInput(false)
            }}
          />
          <button onClick={applyLink}>Apply</button>
        </div>
      ) : (
        <>
          <button
            onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
            className={editor.isActive('bold') ? 'active' : ''}
            title="Bold"
          >
            <Bold size={14} />
          </button>
          <button
            onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
            className={editor.isActive('italic') ? 'active' : ''}
            title="Italic"
          >
            <Italic size={14} />
          </button>
          <button
            onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleStrike().run() }}
            className={editor.isActive('strike') ? 'active' : ''}
            title="Strikethrough"
          >
            <Strikethrough size={14} />
          </button>
          <button
            onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleCode().run() }}
            className={editor.isActive('code') ? 'active' : ''}
            title="Inline code"
          >
            <Code size={14} />
          </button>
          <button
            onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHighlight().run() }}
            className={editor.isActive('highlight') ? 'active' : ''}
            title="Highlight"
          >
            <Highlighter size={14} />
          </button>
          <div className="bubble-divider" />
          <button
            onMouseDown={e => {
              e.preventDefault()
              setLinkUrl(editor.getAttributes('link').href ?? '')
              setShowLinkInput(true)
            }}
            className={editor.isActive('link') ? 'active' : ''}
            title="Link"
          >
            <Link size={14} />
          </button>
        </>
      )}
    </div>
  )
}