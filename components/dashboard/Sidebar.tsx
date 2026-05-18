'use client';

import { usePathname, useRouter } from 'next/navigation';
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
	LogOut,
} from 'lucide-react';
import { logout } from '@/actions/auth';
import ThemeToggle from './themeToggle';

interface SidebarProps {
	user: any;
	isOpen: boolean;
	onClose: () => void;
	onSearchClick: () => void;
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
];

function NavItem({
	item,
	isActive,
	onClick,
}: {
	item: (typeof navigation)[number];
	isActive: boolean;
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			className={`
        w-full group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150
        ${
			isActive
				? 'bg-accent/10 text-accent font-medium border-l-[2.5px] border-accent pl-[calc(0.75rem-2.5px)]'
				: 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-normal border-l-[2.5px] border-transparent'
		}
      `}
		>
			<item.icon
				className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'}`}
				strokeWidth={isActive ? 2 : 1.75}
			/>
			<span className="truncate">{item.name}</span>
		</button>
	);
}

function SidebarContent({
	user,
	pathname,
	onNavigate,
	onSearchClick,
	onLogout,
}: {
	user: any;
	pathname: string;
	onNavigate: (href: string) => void;
	onSearchClick: () => void;
	onLogout: () => void;
}) {
	const initial = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U';

	return (
		<div className="flex h-full flex-col">
			{/* Logo */}
			<div className="flex h-14 shrink-0 items-center px-5 border-b border-sidebar-border">
				<div className="flex items-center gap-2.5">
					<div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
						<span className="text-accent-foreground text-xs font-bold tracking-tight">
							C
						</span>
					</div>
					<span className="text-[15px] font-semibold text-sidebar-foreground tracking-tight">
						Cerebra
					</span>
				</div>
			</div>

			{/* Search shortcut */}
			<div className="px-4 pt-4 pb-2">
				<button
					onClick={onSearchClick}
					className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-sidebar-accent border border-sidebar-border text-muted-foreground hover:text-sidebar-foreground transition-colors text-sm"
				>
					<Search className="h-3.5 w-3.5 shrink-0" />
					<span className="flex-1 text-left text-xs">Search...</span>
					<kbd className="text-[10px] font-mono bg-background/60 border border-sidebar-border rounded px-1.5 py-0.5 text-muted-foreground">
						⌘K
					</kbd>
				</button>
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
				{navigation.map((item) => (
					<NavItem
						key={item.name}
						item={item}
						isActive={pathname === item.href}
						onClick={() => onNavigate(item.href)}
					/>
				))}
			</nav>

			{/* User section */}
			<div className="border-t border-sidebar-border p-3">
				<div className="flex items-center gap-3 px-2 py-1.5 mb-1 rounded-lg">
					<div className="w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-semibold shrink-0">
						{initial}
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-xs font-medium text-sidebar-foreground truncate leading-tight">
							{user?.user_metadata?.full_name || 'User'}
						</p>
						<p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
							{user?.email}
						</p>
					</div>
				</div>
				<button
					onClick={onLogout}
					className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-xs border-l-[2.5px] border-transparent"
				>
					<LogOut className="h-3.5 w-3.5 shrink-0" />
					<span>Sign out</span>
				</button>

				<ThemeToggle />
			</div>
		</div>
	);
}

export default function Sidebar({ user, isOpen, onClose, onSearchClick }: SidebarProps) {
	const pathname = usePathname();
	const router = useRouter();

	const handleLogout = async () => {
		await logout();
		router.push('/login');
	};

	const handleNavigation = (href: string) => {
		router.push(href);
		onClose();
	};

	const sharedProps = {
		user,
		pathname,
		onNavigate: handleNavigation,
		onSearchClick,
		onLogout: handleLogout,
	};

	return (
		<>
			{/* Mobile sidebar */}
			<div
				className={`
          fixed inset-y-0 left-0 z-50 w-60 bg-sidebar border-r border-sidebar-border
          transform transition-transform duration-200 ease-in-out lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
			>
				<SidebarContent {...sharedProps} />
			</div>

			{/* Desktop sidebar */}
			<div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-60 lg:flex lg:flex-col bg-sidebar border-r border-sidebar-border">
				<SidebarContent {...sharedProps} />
			</div>
		</>
	);
}
