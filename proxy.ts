import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // the below server client is used to verify the auth token sent by the client in the cookie and to set the new auth token sent by supabase in the cookie as well, this is required to ensure that the user stays logged in on the server side as well and can access protected routes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() }, // This is required to ensure that the cookies are correctly forwarded to Supabase
        setAll(cookiesToSet) { // supabase calls this function by passing the cookie it wat to set , the cookie contains the new auth token, for the server to actually verify it first writes the cookie to the request header
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))// then it sets the cookie in the response header so that the client can update its cookies as well
        },
      },
    }
  )


  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
