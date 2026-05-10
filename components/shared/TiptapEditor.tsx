'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const TiptapEditor = () => {
    const editor = useEditor({
        extensions: [StarterKit],
        immediatelyRender: false,
        
    })
  return (
    <div>
          
    </div>
  )
}

export default TiptapEditor