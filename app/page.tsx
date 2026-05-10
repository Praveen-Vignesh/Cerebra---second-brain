'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/client'
import { useRouter } from 'next/navigation'
import { BookOpen, Zap, Share2, Layers, FolderKanban, BarChart2 } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router, supabase])

  const features = [
    {
      icon: BookOpen,
      title: 'Notes Engine',
      description: 'Write, organize, and connect notes across courses and topics.'
    },
    {
      icon: Zap,
      title: 'Insta Dump',
      description: 'Capture anything instantly. AI organizes it for you.'
    },
    {
      icon: Share2,
      title: 'Graph View',
      description: 'See how your knowledge connects visually.'
    },
    {
      icon: Layers,
      title: 'Flashcards',
      description: 'AI-generated cards with spaced repetition built in.'
    },
    {
      icon: FolderKanban,
      title: 'Project Tracker',
      description: 'Link your projects to your knowledge base.'
    },
    {
      icon: BarChart2,
      title: 'Gap Analysis',
      description: 'Find what you need to learn before you build.'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="px-4 py-20 md:py-32">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <svg width="200" height="200" viewBox="0 0 200 200" className="opacity-20">
              <circle cx="50" cy="50" r="8" fill="currentColor" />
              <circle cx="150" cy="50" r="8" fill="currentColor" />
              <circle cx="100" cy="100" r="8" fill="currentColor" />
              <circle cx="50" cy="150" r="8" fill="currentColor" />
              <circle cx="150" cy="150" r="8" fill="currentColor" />
              <line x1="50" y1="50" x2="100" y2="100" stroke="currentColor" strokeWidth="1" />
              <line x1="100" y1="100" x2="150" y2="50" stroke="currentColor" strokeWidth="1" />
              <line x1="100" y1="100" x2="50" y2="150" stroke="currentColor" strokeWidth="1" />
              <line x1="100" y1="100" x2="150" y2="150" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Your Knowledge, Connected.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Cerebra is a personal knowledge OS for students. Capture notes, track projects, and let AI surface what you&apos;re missing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-accent text-accent-foreground px-8 py-3 font-medium hover:bg-accent/90 transition-colors"
            >
              Get started free
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card text-card-foreground px-8 py-3 font-medium hover:bg-card/80 transition-colors"
            >
              Sign in
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <feature.icon className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-2">Cerebra</h3>
          <p className="text-muted-foreground mb-6">Your personal knowledge operating system</p>
          <div className="flex justify-center gap-6">
            <a href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </a>
            <a href="/signup" className="text-muted-foreground hover:text-foreground transition-colors">
              Get started
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}