"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/client"
import { usePathname, useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import Sidebar from "@/components/dashboard/Sidebar"
import TopBar from "@/components/dashboard/TopBar"
import SearchModal from "@/components/dashboard/SearchModal"
import NotesSidebar from "@/components/notes/NotesSidebar"
import { ToastProvider } from "@/components/ui/Toast"

const NOTES_ROUTES = ["/notes", "/archive", "/trash"]

function isNotesRoute(pathname: string): boolean {
	return NOTES_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {

	const [user, setUser] = useState<User | null>(null)

	const [loading, setLoading] = useState(true)

	const [sidebarOpen, setSidebarOpen] = useState(false)

	const [searchModalOpen, setSearchModalOpen] = useState(false)

	const router = useRouter()
	const pathname = usePathname()
	const inNotesContext = isNotesRoute(pathname)
	const [mainCollapsed, setMainCollapsed] = useState(inNotesContext)

	const [isDesktop, setIsDesktop] = useState(false)

	const supabase = createClient()

	// Reset the main sidebar's collapsed state when you cross into/out of the
	// notes context. Adjusting state during render (not in an effect) per
	// https://react.dev/learn/you-might-not-need-an-effect.
	const [prevNotesContext, setPrevNotesContext] = useState(inNotesContext)
	if (prevNotesContext !== inNotesContext) {
		setPrevNotesContext(inNotesContext)
		setMainCollapsed(inNotesContext)
	}

	useEffect(() => {
		const mq = window.matchMedia("(min-width: 1024px)")
		const update = () => setIsDesktop(mq.matches)
		update()
		mq.addEventListener("change", update)

		return () => mq.removeEventListener("change", update)
	}, [])

	useEffect(() => {
		const getUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser()
			if (!user) {
				router.push("/login")
				return
			}
			setUser(user)
			setLoading(false)
		}
		getUser()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (!session?.user) {
				router.push("/login")
			} else {
				setUser(session.user)
			}
		})

		return () => subscription.unsubscribe()
	}, [router, supabase])

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault()
				setSearchModalOpen(true)
			}
			if (e.key === "Escape") {
				setSearchModalOpen(false)
			}
		}
		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [])

	if (loading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="h-7 w-7 rounded-full border-2 border-border border-t-accent animate-spin" />
			</div>
		)
	}

	const mainWidth = mainCollapsed ? 56 : 240
	const notesWidth = inNotesContext ? 240 : 0
	const leftPad = mainWidth + notesWidth

	const toggleMain = () => setMainCollapsed((v) => !v)

	return (
		<ToastProvider>
		<div className="min-h-screen bg-background">

			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			<Sidebar
				user={user}
				isOpen={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				onSearchClick={() => setSearchModalOpen(true)}
				collapsed={mainCollapsed}
				onToggleCollapsed={inNotesContext ? toggleMain : undefined}
			/>

			{inNotesContext && (
				<div
					className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:w-60 lg:flex lg:flex-col bg-sidebar border-r border-sidebar-border transition-[left] duration-200 ease-in-out"
					style={{ left: `${mainWidth}px` }}
				>
					<NotesSidebar />
				</div>
			)}

			<TopBar
				onMenuClick={() => setSidebarOpen(true)}
				onSearchClick={() => setSearchModalOpen(true)}
			/>

			<main
				className="pt-16 lg:pt-0 transition-[padding] duration-200 ease-in-out"
				style={{ paddingLeft: isDesktop ? `${leftPad}px` : undefined }}
			>
				<div className="p-4 lg:p-6">{children}</div>
			</main>

			<SearchModal
				isOpen={searchModalOpen}
				onClose={() => setSearchModalOpen(false)}
			/>
		</div>
		</ToastProvider>
	)
}
