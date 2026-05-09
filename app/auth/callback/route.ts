import { NextResponse } from 'next/server'
import { createClient } from '@/utils/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // The 'next' param is useful if you want to redirect users back to a specific 
  // page after login (e.g., if they tried to access /settings while logged out)
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalhost = process.env.NODE_ENV === 'development'
      
      // Handle redirects securely, respecting forwarded hosts in production
      if (isLocalhost) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // If there's no code, or the code exchange failed, send them to your custom error page
  return NextResponse.redirect(`${origin}/auth-error?message=Invalid or expired token`)
}