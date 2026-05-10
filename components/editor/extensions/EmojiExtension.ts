// components/editor/extensions/EmojiExtension.ts
// Since TipTap Pro emoji extension is off the table, this extension does two things:
// 1. Ensures unicode emoji characters render correctly (they do natively — no node needed)
// 2. Exposes a helper the slash command and toolbar can call

import { Extension } from '@tiptap/core'

// Emoji is unicode text — no custom ProseMirror node is needed.
// This extension exists as a hook point for future shortcode support (:smile: → 😄)
// and to document that emoji support is intentional and handled via emoji-mart picker.
export const EmojiSupport = Extension.create({
  name: 'emojiSupport',

  addKeyboardShortcuts() {
    return {
      // Future: open emoji picker on a keyboard shortcut
      // 'Mod-e': () => { window.dispatchEvent(new CustomEvent('editor:insert-emoji')); return true }
    }
  },
})