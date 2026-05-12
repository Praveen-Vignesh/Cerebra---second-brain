'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'

import dynamic from 'next/dynamic'
import BubbleMenuBar from './BubbleMenuBar'
import { getExtensions } from './extensions'
import 'tippy.js/dist/tippy.css'
import './editor.css' 

const EmojiPicker = dynamic(
  () => import('@emoji-mart/react').then(m => m.default),
  { ssr: false }
)

type Props = {
  initialContent?: string
  onChange?: (html: string) => void
  placeholder?: string
}

export default function TipTapEditor({ initialContent, onChange, placeholder }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const editor = useEditor({
    extensions: getExtensions(),
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'cerebra-editor',
        spellcheck: 'true',
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML())
    },
    immediatelyRender: false,  
  })


  useEffect(() => {
    const handleInsertImage = () => imageInputRef.current?.click()
    const handleInsertEmoji = () => setShowEmojiPicker(true)

    window.addEventListener('editor:insert-image', handleInsertImage)
    window.addEventListener('editor:insert-emoji', handleInsertEmoji)
    return () => {
      window.removeEventListener('editor:insert-image', handleInsertImage)
      window.removeEventListener('editor:insert-emoji', handleInsertEmoji)
    }
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    const reader = new FileReader()
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result as string }).run()
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleEmojiSelect = (emoji: { native: string }) => {
    editor?.chain().focus().insertContent(emoji.native).run()
    setShowEmojiPicker(false)
  }

  if (!editor) return null

  return (
    <div className="cerebra-editor-wrapper">
      {editor && <BubbleMenuBar editor={editor} />}

      <EditorContent editor={editor} />


      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />


      {showEmojiPicker && (
        <div className="emoji-picker-overlay" onClick={() => setShowEmojiPicker(false)}>
          <div onClick={e => e.stopPropagation()}>
            <EmojiPicker onEmojiSelect={handleEmojiSelect} theme="dark" />
          </div>
        </div>
      )}
    </div>
  )
}