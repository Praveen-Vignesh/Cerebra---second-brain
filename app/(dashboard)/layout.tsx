"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/client"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import Sidebar from "@/components/dashboard/Sidebar"
import TopBar from "@/components/dashboard/TopBar"
import SearchModal from "@/components/dashboard/SearchModal"

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
	const supabase = createClient()

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
				<div className="text-foreground">Loading...</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Mobile sidebar overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<Sidebar
				user={user}
				isOpen={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				onSearchClick={() => setSearchModalOpen(true)}
			/>

			{/* Top bar for mobile */}
			<TopBar
				user={user}
				onMenuClick={() => setSidebarOpen(true)}
				onSearchClick={() => setSearchModalOpen(true)}
			/>

			{/* Main content */}
			<main className="lg:pl-64 pt-16 lg:pt-0">
				<div className="p-4 lg:p-6">{children}</div>
			</main>

			{/* Search modal */}
			<SearchModal
				isOpen={searchModalOpen}
				onClose={() => setSearchModalOpen(false)}
			/>
		</div>
	)
}
