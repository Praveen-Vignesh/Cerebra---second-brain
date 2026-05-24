"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, Layers, FolderKanban } from "lucide-react"
import InstaDump from "@/components/dashboard/InstaDump"
import StatCard from "@/components/dashboard/StatCard"
import NoteCard from "@/components/dashboard/NoteCard"
import ProjectCard from "@/components/dashboard/ProjectCard"

export default function DashboardPage() {
	const [greeting, setGreeting] = useState("")
	const [userName, setUserName] = useState("Student")

	useEffect(() => {
		const hour = new Date().getHours()
		if (hour < 12) {
			setGreeting("Good morning")
		} else if (hour < 18) {
			setGreeting("Good afternoon")
		} else {
			setGreeting("Good evening")
		}
	}, [])

	const recentNotes = [
		{
			topic: "Machine Learning",
			title: "Introduction to Neural Networks",
			excerpt:
				"Neural networks are computing systems inspired by biological neural networks that constitute animal brains...",
			timestamp: "2 hours ago",
		},
		{
			topic: "Web Development",
			title: "React Hooks Best Practices",
			excerpt:
				"Hooks allow you to use state and other React features without writing a class component...",
			timestamp: "5 hours ago",
		},
		{
			topic: "Data Structures",
			title: "Binary Search Trees Implementation",
			excerpt:
				"A binary search tree is a node-based binary tree data structure which has the following properties...",
			timestamp: "1 day ago",
		},
		{
			topic: "Algorithms",
			title: "Dynamic Programming Patterns",
			excerpt:
				"Dynamic programming is a method for solving complex problems by breaking them down into simpler subproblems...",
			timestamp: "2 days ago",
		},
	]

	const activeProjects = [
		{
			name: "E-commerce Mobile App",
			status: "Active",
			techTags: ["React Native", "Node.js", "MongoDB"],
			progress: 65,
			lastActive: "3 hours ago",
		},
		{
			name: "Data Visualization Dashboard",
			status: "Planning",
			techTags: ["D3.js", "Python", "PostgreSQL"],
			progress: 25,
			lastActive: "1 day ago",
		},
	]

	return (
		<div className="space-y-6">

			<div>
				<h1 className="text-3xl font-bold text-foreground">
					{greeting}, {userName}
				</h1>
				<p className="text-muted-foreground mt-1">
					Your knowledge base is ready.
				</p>
			</div>

			<InstaDump />

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					title="Notes this week"
					value={12}
					icon={<FileText className="h-5 w-5" />}
				/>
				<StatCard
					title="Flashcards due"
					value={3}
					icon={<Layers className="h-5 w-5" />}
				/>
				<StatCard
					title="Active projects"
					value={2}
					icon={<FolderKanban className="h-5 w-5" />}
				/>
				<StatCard
					title="Resources saved"
					value={28}
					icon={<FileText className="h-5 w-5" />}
				/>
			</div>

			<div>
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-foreground">
						Recent Notes
					</h2>
					<Link
						href="/notes"
						className="text-sm text-accent hover:text-accent/80 transition-colors"
					>
						View all →
					</Link>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{recentNotes.map((note, index) => (
						<NoteCard key={index} {...note} />
					))}
				</div>
			</div>

			<div>
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-foreground">
						Active Projects
					</h2>
					<Link
						href="/projects"
						className="text-sm text-accent hover:text-accent/80 transition-colors"
					>
						View all →
					</Link>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{activeProjects.map((project, index) => (
						<ProjectCard key={index} {...project} />
					))}
				</div>
			</div>
		</div>
	)
}
