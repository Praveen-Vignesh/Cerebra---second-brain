// components/editor/SlashMenu/index.ts
import { Extension } from '@tiptap/core'
import Suggestion, {
  type SuggestionOptions,
  type SuggestionProps,
  type SuggestionKeyDownProps,
} from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy, { type Instance } from 'tippy.js'
import SlashMenuList, { type SlashMenuListRef } from './SlashMenuList'
import { SLASH_COMMANDS, type CommandItem } from './commands'
import type { Editor, Range } from '@tiptap/core'

type SlashCommandOptions = {
  suggestion: Omit<SuggestionOptions<CommandItem>, 'editor'>
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        allowSpaces: false,
        startOfLine: false,

        items: ({ query }: { query: string }): CommandItem[] => {
          const q = query.toLowerCase()
          if (!q) return SLASH_COMMANDS
          return SLASH_COMMANDS.filter(
            item =>
              item.title.toLowerCase().includes(q) ||
              item.keywords.some(k => k.includes(q))
          ).slice(0, 10)
        },

        render: () => {
          let renderer: ReactRenderer<SlashMenuListRef>
          let popup: Instance[]

          return {
            onStart(props: SuggestionProps<CommandItem>) {
              renderer = new ReactRenderer(SlashMenuList, {
                props,
                editor: props.editor,
              })

              if (!props.clientRect) return

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: renderer.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                theme: 'cerebra-slash',
              })
            },

            onUpdate(props: SuggestionProps<CommandItem>) {
              renderer.updateProps(props)
              if (!props.clientRect) return
              popup[0]?.setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect,
              })
            },

            onKeyDown(props: SuggestionKeyDownProps): boolean {
              if (props.event.key === 'Escape') {
                popup[0]?.hide()
                return true
              }
              return renderer.ref?.onKeyDown(props) ?? false
            },

            onExit() {
              popup[0]?.destroy()
              renderer.destroy()
            },
          }
        },

        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor
          range: Range
          props: CommandItem
        }) => {
          props.command({ editor, range })
        },
      } satisfies Omit<SuggestionOptions<CommandItem>, 'editor'>,
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})