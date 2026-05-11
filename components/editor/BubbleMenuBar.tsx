
'use client'

import { useEffect, useState, useCallback } from 'react'
import { type Editor } from '@tiptap/core'
import { Bold, Italic, Strikethrough, Code, Link, Highlighter } from 'lucide-react'


const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px']

const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Sans',    value: 'Inter, sans-serif' },
  { label: 'Serif',   value: 'Georgia, serif' },
  { label: 'Mono',    value: 'JetBrains Mono, monospace' },
]

const COLORS = [
  '#ffffff', '#a78bfa', '#60a5fa', '#34d399',
  '#fbbf24', '#f87171', '#f472b6', '#94a3b8',
]


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
      display:   'flex',
      position:  'fixed',
      top:       rect.top - 88,              
      left:      rect.left + rect.width / 2,
      transform: 'translateX(-50%)',
      zIndex:    50,
    })
  }, [editor])

  useEffect(() => {
    if (!editor) return
    editor.on('selectionUpdate', update)
    editor.on('focus', update)
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


type Props = { editor: Editor }

export default function BubbleMenuBar({ editor }: Props) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl]             = useState('')
  const menuStyle                         = useBubblePosition(editor)

  const applyLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setShowLinkInput(false)
    setLinkUrl('')
  }

  return (
    <div className="bubble-menu-wrapper" style={menuStyle}>


      <div className="bubble-menu">
        {showLinkInput ? (
          <div className="bubble-link-input">
            <input
              autoFocus
              placeholder="https://..."
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter')  applyLink()
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

      <div className="bubble-menu bubble-menu-row2">

        
        <select
          className="bubble-select"
          value={editor.getAttributes('textStyle').fontFamily ?? ''}
          onChange={e => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            e.target.value
              ? editor.chain().focus().setFontFamily(e.target.value).run()
              : editor.chain().focus().unsetFontFamily().run()
          }}
        >
          {FONT_FAMILIES.map(f => (
            <option key={f.label} value={f.value}>{f.label}</option>
          ))}
        </select>

        <div className="bubble-divider" />


        <select
          className="bubble-select"
          value={editor.getAttributes('textStyle').fontSize ?? '16px'}
          onChange={e => editor.chain().focus().setFontSize(e.target.value).run()}
        >
          {FONT_SIZES.map(s => (
            <option key={s} value={s}>{s.replace('px', '')}</option>
          ))}
        </select>

        <div className="bubble-divider" />


        <div className="bubble-colors">
          {COLORS.map(color => (
            <button
              key={color}
              className="color-swatch"
              style={{ background: color }}
              onMouseDown={e => {
                e.preventDefault()
                editor.chain().focus().setColor(color).run()
              }}
              title={color}
            />
          ))}
  
          <button
            className="color-swatch color-reset"
            onMouseDown={e => {
              e.preventDefault()
              editor.chain().focus().unsetColor().run()
            }}
            title="Reset color"
          >
            ✕
          </button>
        </div>

      </div>
    </div>
  )
}
