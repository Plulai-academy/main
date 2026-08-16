// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── Geo redirect config ────────────────────────────────────
// Only redirect for countries we have a real landing page for. Everyone
// else (including other GCC countries without a dedicated page, like
// Kuwait, Bahrain, Oman) stays on the generic homepage.
const COUNTRY_TO_SLUG: Record<string, string> = {
  QA: 'qatar',
  AE: 'uae',
  SA: 'saudi-arabia',
  TN: 'tunisia',
}
const INTL_COOKIE = 'plulai_intl'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // ── Geo-based homepage redirect ────────────────────────────
  // Runs first and returns early on redirect, before the Supabase client
  // is created — no point spending an auth round-trip on a request that's
  // about to be redirected anyway.
  if (pathname === '/') {
    // Opt-out: someone explicitly asked for the international homepage
    // (the country pages' "Home" links use /?intl=1 for this reason —
    // without it, clicking Home would just redirect them right back).
    if (searchParams.get('intl') === '1') {
      const res = NextResponse.next({ request })
      res.cookies.set(INTL_COOKIE, '1', { maxAge: 60 * 60 * 24 * 30, path: '/' })
      return res
    }

    if (!request.cookies.get(INTL_COOKIE)) {
      // Vercel populates `request.geo` automatically at the edge.
      // On Cloudflare instead, use: request.headers.get('cf-ipcountry')
      const country = request.geo?.country
      const slug = country ? COUNTRY_TO_SLUG[country] : undefined
      if (slug) {
        const url = request.nextUrl.clone()
        url.pathname = `/${slug}`
        return NextResponse.redirect(url)
      }
    }
  }

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

  // ── Public routes (no auth required) ──────────────────────
  const isPublicPath =
    pathname === '/' ||
    pathname === '/pricing' ||
    pathname === '/ar' ||
    pathname === '/privacy' ||
    pathname === '/sharkkid' ||
    pathname === '/schools' ||
    pathname === '/comp' ||
    pathname === '/blog' ||
    pathname === '/blog/[slug]' ||
    // Country SEO landing pages — added alongside the geo-redirect above.
    // Without these, an unauthenticated visitor landing here via redirect
    // (or a direct Google click) would get bounced straight to /auth/login.
    pathname === '/qatar' ||
    pathname === '/uae' ||
    pathname === '/saudi-arabia' ||
    pathname === '/tunisia' ||
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