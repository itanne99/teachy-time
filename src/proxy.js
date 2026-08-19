import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/Profile', '/Schedules', '/EditAlarms', '/ViewAlarms']

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/Login']

export async function proxy(request) {
  const { pathname } = request.nextUrl

  // Create Supabase client to check session from cookies
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log(`[Middleware] Path: ${pathname}`)
  console.log(`[Middleware] Cookies count: ${request.cookies.getAll().length}`)
  console.log(`[Middleware] Session found: ${!!session}`)

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    console.log(`[Middleware] Redirecting to / due to missing session for protected route: ${pathname}`)
    const url = request.nextUrl.clone()
    url.pathname = '/'
    // Store the intended destination to redirect back after login
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect to profile if accessing auth routes while logged in
  if (isAuthRoute && session) {
    console.log(`[Middleware] Redirecting to /Profile because user is already authenticated`)
    const url = request.nextUrl.clone()
    url.pathname = '/Profile'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/).*)',
  ],
}
