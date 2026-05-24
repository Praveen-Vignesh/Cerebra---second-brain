import { NextResponse } from 'next/server'
import { createClient } from '@/utils/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')


  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalhost = process.env.NODE_ENV === 'development'


      if (isLocalhost) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }


  return NextResponse.redirect(`${origin}/auth-error?message=Invalid or expired token`)
}