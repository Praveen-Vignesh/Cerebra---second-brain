// components/editor/SlashMenu/SlashMenuList.tsx
'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { CommandItem } from './commands'

type Props = {
  items: CommandItem[]
  command: (item: CommandItem) => void
}

// Exposed via ref so the suggestion plugin can drive keyboard nav
export type SlashMenuListRef = {
  onKeyDown: (opts: { event: KeyboardEvent }) => boolean
}

const SlashMenuList = forwardRef<SlashMenuListRef, Props>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Reset selection when items change (user is typing to filter)
  useEffect(() => setSelectedIndex(0), [items])

  useImperativeHandle(ref, () => ({
    onKeyDown({ event }) {
      if (event.key === 'ArrowUp') {
        setSelectedIndex(i => (i - 1 + items.length) % items.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex(i => (i + 1) % items.length)
        return true
      }
      if (event.key === 'Enter') {
        if (items[selectedIndex]) command(items[selectedIndex])
        return true
      }
      return false
    },
  }))

  if (!items.length) return null

  return (
    <div className="slash-menu">
      {items.map((item, i) => (
        <button
          key={item.title}
          className={`slash-menu-item ${i === selectedIndex ? 'active' : ''}`}
          onClick={() => command(item)}
          onMouseEnter={() => setSelectedIndex(i)}
        >
          <span className="slash-menu-icon">{item.icon}</span>
          <div className="slash-menu-text">
            <span className="slash-menu-title">{item.title}</span>
            <span className="slash-menu-desc">{item.description}</span>
          </div>
        </button>
      ))}
    </div>
  )
})

SlashMenuList.displayName = 'SlashMenuList'
export default SlashMenuList