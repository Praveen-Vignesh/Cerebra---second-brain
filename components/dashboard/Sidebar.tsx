'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
	LayoutDashboard,
	FileText,
	GraduationCap,
	Search,
	LogOut,
	Settings,
	ChevronsLeft,
	ChevronsRight,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { logout } from '@/actions/auth';

interface SidebarProps {
	user: User | null;
	isOpen: boolean;
	onClose: () => void;
	onSearchClick: () => void;
	collapsed?: boolean;
	onToggleCollapsed?: () => void;
}

const navigation = [
	{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{ name: 'Notes', href: '/notes', icon: FileText },
	{ name: 'Study', href: '/study', icon: GraduationCap },
];

function NavItem({
	item,
	isActive,
	collapsed,
	onClick,
}: {
	item: (typeof navigation)[number];
	isActive: boolean;
	collapsed: boolean;
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			title={collapsed ? item.name : undefined}
			className={`
        w-full group flex items-center gap-3 rounded-lg ${collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'} text-sm transition-all duration-150
        ${
			isActive
				? collapsed
					? 'bg-accent/10 text-accent'
					: 'bg-accent/10 text-accent font-medium border-l-[2.5px] border-accent pl-[calc(0.75rem-2.5px)]'
				: collapsed
					? 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
					: 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-normal border-l-[2.5px] border-transparent'
		}
      `}
		>
			<item.icon
				className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'}`}
				strokeWidth={isActive ? 2 : 1.75}
			/>

			{!collapsed && <span className="truncate">{item.name}</span>}
		</button>
	);
}

function SidebarContent({
	user,
	pathname,
	collapsed,
	onToggleCollapsed,
	onNavigate,
	onSearchClick,
	onLogout,
}: {
	user: User | null;
	pathname: string;
	collapsed: boolean;
	onToggleCollapsed?: () => void;
	onNavigate: (href: string) => void;
	onSearchClick: () => void;
	onLogout: () => void;
}) {

	const initial = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U';

	return (
		<div className="flex h-full flex-col">

			<div
				className={`flex h-14 shrink-0 items-center border-b border-sidebar-border ${collapsed ? 'justify-center px-0' : 'justify-between px-5'}`}
			>
				{!collapsed && (
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
				)}
				{onToggleCollapsed && (
					<button
						onClick={onToggleCollapsed}
						title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
						className="p-1.5 rounded-md text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
					>
						{collapsed ? (
							<ChevronsRight className="h-4 w-4" strokeWidth={1.75} />
						) : (
							<ChevronsLeft className="h-4 w-4" strokeWidth={1.75} />
						)}
					</button>
				)}

				{collapsed && !onToggleCollapsed && (
					<div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
						<span className="text-accent-foreground text-xs font-bold tracking-tight">
							C
						</span>
					</div>
				)}
			</div>

			<div className={`${collapsed ? 'px-2' : 'px-4'} pt-4 pb-2`}>
				<button
					onClick={onSearchClick}
					title={collapsed ? 'Search' : undefined}
					className={`w-full flex items-center ${collapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-3 py-2'} rounded-lg bg-sidebar-accent border border-sidebar-border text-muted-foreground hover:text-sidebar-foreground transition-colors text-sm`}
				>
					<Search className="h-3.5 w-3.5 shrink-0" />
					{!collapsed && (
						<>
							<span className="flex-1 text-left text-xs">Search...</span>
							<kbd className="text-[10px] font-mono bg-background/60 border border-sidebar-border rounded px-1.5 py-0.5 text-muted-foreground">
								⌘K
							</kbd>
						</>
					)}
				</button>
			</div>

			<nav className={`flex-1 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'} py-2 space-y-0.5`}>
				{navigation.map((item) => (
					<NavItem
						key={item.name}
						item={item}
						isActive={
							pathname === item.href ||
							(item.href !== '/' && pathname.startsWith(item.href + '/'))
						}
						collapsed={collapsed}
						onClick={() => onNavigate(item.href)}
					/>
				))}
			</nav>

			<div className={`border-t border-sidebar-border ${collapsed ? 'p-2' : 'p-3'}`}>
				<div
					className={`flex items-center ${collapsed ? 'justify-center px-0 py-1.5' : 'gap-3 px-2 py-1.5'} mb-1 rounded-lg`}
				>
					<div
						className="w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-semibold shrink-0"
						title={collapsed ? user?.email : undefined}
					>
						{initial}
					</div>
					{!collapsed && (
						<div className="flex-1 min-w-0">
							<p className="text-xs font-medium text-sidebar-foreground truncate leading-tight">
								{user?.user_metadata?.full_name || 'User'}
							</p>
							<p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
								{user?.email}
							</p>
						</div>
					)}
				</div>
				<button
					onClick={() => onNavigate('/settings')}
					title={collapsed ? 'Settings' : undefined}
					className={`w-full flex items-center ${collapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'} rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-xs ${collapsed ? '' : 'border-l-[2.5px] border-transparent'}`}
				>
					<Settings className="h-3.5 w-3.5 shrink-0" />
					{!collapsed && <span>Settings</span>}
				</button>
				<button
					onClick={onLogout}
					title={collapsed ? 'Sign out' : undefined}
					className={`w-full flex items-center ${collapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'} rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-xs ${collapsed ? '' : 'border-l-[2.5px] border-transparent'}`}
				>
					<LogOut className="h-3.5 w-3.5 shrink-0" />
					{!collapsed && <span>Sign out</span>}
				</button>
			</div>
		</div>
	);
}

export default function Sidebar({
	user,
	isOpen,
	onClose,
	onSearchClick,
	collapsed = false,
	onToggleCollapsed,
}: SidebarProps) {

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
		collapsed,
		onToggleCollapsed,
		onNavigate: handleNavigation,
		onSearchClick,
		onLogout: handleLogout,
	};

	const desktopWidth = collapsed ? 'lg:w-14' : 'lg:w-60';

	return (
		<>

			<div
				className={`
          fixed inset-y-0 left-0 z-50 w-60 bg-sidebar border-r border-sidebar-border
          transform transition-transform duration-200 ease-in-out lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
			>
				<SidebarContent {...sharedProps} collapsed={false} onToggleCollapsed={undefined} />
			</div>

			<div
				className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 ${desktopWidth} lg:flex lg:flex-col bg-sidebar border-r border-sidebar-border transition-[width] duration-200 ease-in-out`}
			>
				<SidebarContent {...sharedProps} />
			</div>
		</>
	);
}
