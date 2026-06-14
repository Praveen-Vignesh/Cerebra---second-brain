import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "Cerebra — your second brain for studying",
		template: "%s · Cerebra",
	},
	description:
		"Cerebra is a personal knowledge OS for students: capture rich notes, organize with folders and tags, and turn them into AI study material with spaced repetition.",
	keywords: [
		"Cerebra",
		"note taking",
		"second brain",
		"study app",
		"flashcards",
		"spaced repetition",
		"AI study notes",
		"students",
	],
	openGraph: {
		type: "website",
		url: siteUrl,
		siteName: "Cerebra",
		title: "Cerebra — your second brain for studying",
		description:
			"Capture rich notes, organize them, and turn them into AI flashcards and study guides with spaced review.",
		images: ["/opengraph-image"],
	},
	twitter: {
		card: "summary_large_image",
		title: "Cerebra — your second brain for studying",
		description:
			"Capture rich notes, organize them, and turn them into AI flashcards and study guides with spaced review.",
		images: ["/opengraph-image"],
	},
	robots: { index: true, follow: true },
}

export default function RootLayout({children,}: Readonly<{children: React.ReactNode}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<head>
				{/* Apply the saved (or system) theme before paint, so there's no flash
				    and the theme works on every page regardless of where the toggle lives. */}
				<script
					dangerouslySetInnerHTML={{
						__html: `try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
					}}
				/>
			</head>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
