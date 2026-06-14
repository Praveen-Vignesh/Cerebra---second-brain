'use client'

import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'

// Read the theme the layout's inline script already applied to <html>. Guarded
// for SSR (no `document` on the server) so we can use it as a lazy initial value
// — no effect needed, which keeps state out of effects.
function readTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light'
}

// The light/dark toggle. The theme itself is applied before paint by the inline
// script in app/layout.tsx; this button just flips that attribute and persists it.
const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(readTheme)

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
    setTheme(next)
  }

  return (
    // suppressHydrationWarning: the server renders the default ('light') while the
    // client reads the real theme — the brief mismatch on the icon/label is expected.
    <button
      type="button"
      onClick={toggle}
      suppressHydrationWarning
      className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-sidebar-accent transition-colors"
    >
      {theme === 'dark' ? <Moon className="h-4 w-4" strokeWidth={1.75} /> : <Sun className="h-4 w-4" strokeWidth={1.75} />}
      <span suppressHydrationWarning>{theme === 'dark' ? 'Dark' : 'Light'} mode</span>
    </button>
  )
}

export default ThemeToggle
