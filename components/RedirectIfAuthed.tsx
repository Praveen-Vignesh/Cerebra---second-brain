'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/client'
import { useRouter } from 'next/navigation'

// Sends already-signed-in visitors from the public landing page to their
// dashboard. Renders nothing; the marketing markup stays in the server page
// so it's crawlable.
export default function RedirectIfAuthed() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.replace('/dashboard')
    }
    checkUser()
  }, [router, supabase])

  return null
}
