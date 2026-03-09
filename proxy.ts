// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: any }[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() validates the JWT with Supabase — cannot be spoofed
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // ── Public routes (no auth required) ──────────────────────
  const isPublicPath =
    pathname === '/' ||
    pathname === '/pricing' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/parent/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/')

  // ── Admin routes — handled by the page itself, not middleware ──
  // /admin/* pages do their own auth check server-side.
  if (pathname.startsWith('/admin')) {
    return supabaseResponse
  }

  // ── Not authenticated → redirect to login ─────────────────
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // ── Authenticated user on auth pages → dashboard ──────────
  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // ── Subscription gate for /dashboard/* sub-routes ─────────
  if (user && pathname.startsWith('/dashboard/')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('trial_ends_at, subscription_ends_at, subscription')
      .eq('id', user.id)
      .single()

    if (profile) {
      const now        = Date.now()
      const trialEnd   = profile.trial_ends_at ? new Date(profile.trial_ends_at).getTime() : 0
      const subEnd     = profile.subscription_ends_at ? new Date(profile.subscription_ends_at).getTime() : 0
      const isTrialing = trialEnd > now
      const isPaid     = subEnd > now || ['pro', 'school'].includes(profile.subscription ?? '')

      if (!isTrialing && !isPaid) {
        const url = request.nextUrl.clone()
        url.pathname = '/pricing'
        url.searchParams.set('expired', 'true')
        return NextResponse.redirect(url)
      }
    }
  }

  supabaseResponse.headers.set('x-pathname', pathname)
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|icon.svg|apple-touch-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)',
  ],
}
