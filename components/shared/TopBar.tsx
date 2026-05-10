'use client'

import { Menu, Search } from 'lucide-react'

interface TopBarProps {
  user: any
  onMenuClick: () => void
  onSearchClick: () => void
}

export default function TopBar({ user, onMenuClick, onSearchClick }: TopBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border lg:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Logo */}
        <h1 className="text-lg font-semibold text-foreground">Cerebra</h1>

        {/* Search button */}
        <button
          onClick={onSearchClick}
          className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          <Search className="h-6 w-6" />
        </button>
      </div>
    </header>
  )
}
