'use client'

import { Menu, Search } from 'lucide-react'

interface TopBarProps {
  onMenuClick: () => void
  onSearchClick: () => void
}

export default function TopBar({ onMenuClick, onSearchClick }: TopBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
            <span className="text-accent-foreground text-[10px] font-bold">C</span>
          </div>
          <h1 className="text-[15px] font-semibold text-foreground tracking-tight">Cerebra</h1>
        </div>

        <button
          onClick={onSearchClick}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          aria-label="Search"
        >
          <Search className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  )
}
