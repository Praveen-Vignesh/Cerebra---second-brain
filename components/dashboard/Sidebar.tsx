'use client'

import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Share2, 
  Zap, 
  Layers, 
  FolderKanban, 
  BarChart2, 
  Bookmark, 
  Mail, 
  Search,
  LogOut
} from 'lucide-react'
import { logout } from '@/actions/auth'

interface SidebarProps {
  user: any
  isOpen: boolean
  onClose: () => void
  onSearchClick: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'Graph', href: '/graph', icon: Share2 },
  { name: 'Insta Dump', href: '/dump', icon: Zap },
  { name: 'Flashcards', href: '/flashcards', icon: Layers },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Knowledge Gaps', href: '/gaps', icon: BarChart2 },
  { name: 'Resources', href: '/resources', icon: Bookmark },
  { name: 'Email', href: '/email', icon: Mail },
]

export default function Sidebar({ user, isOpen, onClose, onSearchClick }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    onClose()
  }

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
            <h1 className="text-xl font-bold text-sidebar-foreground">Cerebra</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-accent text-accent-foreground border-l-4 border-accent' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }
                  `}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              )
            })}
            
            {/* Search button */}
            <button
              onClick={() => {
                onSearchClick()
                onClose()
              }}
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Search className="mr-3 h-5 w-5" />
              Search
            </button>
          </nav>

          {/* User section */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-medium">
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:flex lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar border-r border-sidebar-border px-6">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-sidebar-foreground">Cerebra</h1>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <button
                          onClick={() => handleNavigation(item.href)}
                          className={`
                            w-full flex gap-x-3 rounded-lg px-3 py-2 text-sm font-semibold leading-6 transition-colors
                            ${isActive 
                              ? 'bg-accent text-accent-foreground border-l-4 border-accent' 
                              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            }
                          `}
                        >
                          <item.icon className="h-6 w-6 shrink-0" />
                          {item.name}
                        </button>
                      </li>
                    )
                  })}
                  
                  {/* Search button */}
                  <li>
                    <button
                      onClick={onSearchClick}
                      className="w-full flex gap-x-3 rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    >
                      <Search className="h-6 w-6 shrink-0" />
                      Search
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>

          {/* User section */}
          <div className="border-t border-sidebar-border py-4">
            <div className="flex items-center gap-x-4 px-3">
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-medium">
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex gap-x-3 rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>

            <button className='mt-3 w-full flex gap-x-3 rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors'>
                Change theme
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
